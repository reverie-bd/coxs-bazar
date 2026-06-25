(function () {
  const WORKER_URL = "https://reverie.ashesh-devnath.workers.dev";
  const BOT_NAME = "Neel";
  const TOGGLE_LABEL = "Chat with " + BOT_NAME;
  const MAX_HISTORY_TURNS = 4;

  const container = document.createElement("div");
  container.id = "cb-chat-widget";
  container.innerHTML = `
    <button id="cb-chat-toggle" aria-label="Open chat">
      <span class="cb-toggle-icon">💬</span>
      <span class="cb-toggle-label">${TOGGLE_LABEL}</span>
    </button>
    <div id="cb-chat-window" hidden>
      <div id="cb-chat-header">
        <span>${BOT_NAME} — Cox's Bazar Assistant</span>
        <div id="cb-chat-header-actions">
          <button id="cb-chat-expand" type="button" aria-label="Expand chat">⤢</button>
          <button id="cb-chat-minimize" type="button" aria-label="Minimize chat">–</button>
          <button id="cb-chat-close" type="button" aria-label="Close chat">✕</button>
        </div>
      </div>
      <div id="cb-chat-messages"></div>
  <div id="cb-close-confirm" style="display:none;flex-direction:column;gap:10px;padding:14px 16px;background:#fff3cd;border-top:2px solid #E8A838;font-size:0.82rem;color:#3D4F5E;flex-shrink:0;">
    <span style="font-weight:600;line-height:1.4;">End this conversation? Your history will be cleared.</span>
    <div style="display:flex;gap:8px;">
      <button id="cb-confirm-yes" style="flex:1;padding:8px 0;background:#163C4D;color:#fff;border:none;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;">Yes, close</button>
      <button id="cb-confirm-no" style="flex:1;padding:8px 0;background:transparent;color:#163C4D;border:1.5px solid #163C4D;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;">Keep chatting</button>
    </div>
  </div>
      <form id="cb-chat-form">
        <input id="cb-chat-input" type="text" placeholder="Ask a question…" autocomplete="off" />
        <button type="submit" aria-label="Send">→</button>
      </form>
    </div>
  `;
  document.body.appendChild(container);

  const toggle = document.getElementById("cb-chat-toggle");
  const win = document.getElementById("cb-chat-window");
  const expandBtn = document.getElementById("cb-chat-expand");
  const minimizeBtn = document.getElementById("cb-chat-minimize");
  const closeBtn = document.getElementById("cb-chat-close");
  const messages = document.getElementById("cb-chat-messages");
  const form = document.getElementById("cb-chat-form");
  const input = document.getElementById("cb-chat-input");

  const BOT_AVATAR = '<span class="cb-avatar cb-avatar-bot"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 11c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg></span>';
  const USER_AVATAR = '<span class="cb-avatar cb-avatar-user"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg></span>';

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatBotText(text) {
    let safe = escapeHtml(text);
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*\*/g, ""); // clean up any stray unpaired markers
    safe = safe.replace(/\n/g, "<br>");
    return safe;
  }

  const state = loadState();

  function loadState() {
    try {
      const raw = sessionStorage.getItem("cb_chat_state");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { history: [], open: false, started: false, expanded: false };
  }

  function saveState() {
    try {
      state.history = state.history.slice(-MAX_HISTORY_TURNS * 2);
      sessionStorage.setItem("cb_chat_state", JSON.stringify(state));
    } catch (e) {}
  }

  const DEVICE_TYPE = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

  function getSessionId() {
    if (!state.sessionId) {
      state.sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      saveState();
    }
    return state.sessionId;
  }

  function addMessage(text, sender, save) {
    const row = document.createElement("div");
    row.className = "cb-row cb-row-" + sender;
    const bubble = document.createElement("div");
    bubble.className = "cb-msg cb-msg-" + sender;
    if (sender === "bot") {
      bubble.innerHTML = formatBotText(text);
    } else {
      bubble.textContent = text;
    }
    row.innerHTML = sender === "bot" ? BOT_AVATAR : USER_AVATAR;
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    if (save !== false) {
      state.history.push({ role: sender === "bot" ? "model" : "user", text: text });
      saveState();
    }
  }

  function clearSuggestionRows() {
    messages.querySelectorAll(".cb-suggestion-row").forEach(function (el) { el.remove(); });
  }

  function renderSuggestions(list) {
    clearSuggestionRows();
    if (!list || !list.length) return;
    const row = document.createElement("div");
    row.className = "cb-suggestion-row";
    list.forEach(function (q) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "cb-suggestion-chip";
      chip.textContent = q;
      chip.addEventListener("click", function () {
        input.value = q;
        sendMessage();
      });
      row.appendChild(chip);
    });
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function showThinking() {
    const row = document.createElement("div");
    row.className = "cb-row cb-row-bot";
    row.id = "cb-thinking-row";
    row.innerHTML = BOT_AVATAR + '<div class="cb-msg cb-msg-bot cb-thinking">' + BOT_NAME + ' is thinking<span class="cb-dots"><span></span><span></span><span></span></span></div>';
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeThinking() {
    const row = document.getElementById("cb-thinking-row");
    if (row) row.remove();
  }

  function openWindow() {
    win.hidden = false;
    state.open = true;
    saveState();
    input.focus();
  }

  function minimizeWindow() {
    win.hidden = true;
    state.open = false;
    saveState();
  }

  function closeChat() {
    if (!window.confirm("Exit chat? This will clear your conversation.")) return;
    win.hidden = true;
    state.open = false;
    state.history = [];
    state.started = false;
    state.expanded = false;
    state.sessionId = null;
    win.classList.remove("cb-expanded");
    messages.innerHTML = "";
    saveState();
  }

  function toggleExpand() {
    state.expanded = !state.expanded;
    win.classList.toggle("cb-expanded", state.expanded);
    saveState();
  }

  toggle.addEventListener("click", function () {
    if (win.hidden) openWindow();
    else minimizeWindow();
  });
  minimizeBtn.addEventListener("click", minimizeWindow);
  closeBtn.addEventListener("click", closeChat);
  expandBtn.addEventListener("click", toggleExpand);

  async function sendMessage() {
    const question = input.value.trim();
    if (!question) return;
    clearSuggestionRows();
    addMessage(question, "user");
    input.value = "";
    showThinking();

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history: state.history.slice(0, -1),
          sessionId: getSessionId(),
          page: document.title,
          device: DEVICE_TYPE,
        }),
      });
      const data = await res.json();
      removeThinking();
      addMessage(data.answer || "Sorry, something went wrong — please try again.", "bot");
      renderSuggestions(data.suggestions);
    } catch (err) {
      removeThinking();
      addMessage("Sorry, I couldn't reach the server — please try again.", "bot");
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage();
  });

  if (state.expanded) win.classList.add("cb-expanded");

  if (state.started) {
    state.history.forEach(function (h) {
      addMessage(h.text, h.role === "user" ? "user" : "bot", false);
    });
    if (state.open) win.hidden = false;
  } else {
    setTimeout(function () {
      state.started = true;
      openWindow();
      addMessage(
        "Hi! I'm " + BOT_NAME + ", here to help with anything about visiting Cox's Bazar — the beach, getting here, food, activities, and more.\nI'm an AI, so I might occasionally get a detail wrong — for anything important like visas, ferry schedules, or bookings, it's always worth double-checking before you go.\nWhat would you like to know?",
        "bot"
      );
    }, 2500);
  }
})();