(function () {
  const WORKER_URL = "https://reverie.ashesh-devnath.workers.dev";
  const BOT_NAME = "Neela";
  const TOGGLE_LABEL = "Explore with " + BOT_NAME;
  const MAX_HISTORY_TURNS = 6;

  const container = document.createElement("div");
  container.id = "cb-chat-widget";
  container.innerHTML = `
    <button id="cb-chat-toggle" aria-label="Open chat">
      <span class="cb-toggle-icon">💬</span>
      <span class="cb-toggle-label">${TOGGLE_LABEL}</span>
    </button>
    <div id="cb-chat-window" hidden>
      <div id="cb-chat-header">
        <span class="cb-header-identity">
        <img src="images/neela-avatar.png" alt="Neela" class="cb-header-avatar" />
        <span class="cb-header-text">
        <span class="cb-header-name">${BOT_NAME}<span class="cb-online-dot"></span></span>
        <span class="cb-header-sub">AI Assistant</span>
        </span>
        </span>
        <div id="cb-chat-header-actions">
          <button id="cb-chat-expand" type="button" aria-label="Expand chat">⤢</button>
          <button id="cb-chat-minimize" type="button" aria-label="Minimize chat">–</button>
          <button id="cb-chat-close" type="button" aria-label="Close chat">✕</button>
        </div>
      </div>
      <div id="cb-chat-messages"></div>
      <div id="cb-close-confirm" hidden>
        <span>End this conversation? Your history will be cleared.</span>
        <div class="cb-close-confirm-actions">
          <button id="cb-confirm-yes" type="button">Yes, close</button>
          <button id="cb-confirm-no" type="button">Keep chatting</button>
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
  const closeConfirm = document.getElementById("cb-close-confirm");
  const confirmYes = document.getElementById("cb-confirm-yes");
  const confirmNo = document.getElementById("cb-confirm-no");

  const BOT_AVATAR = '<span class="cb-avatar cb-avatar-bot"><img src="images/neela-avatar.png" alt="Neela" width="26" height="26" style="border-radius:50%;object-fit:cover;width:26px;height:26px;" /></span>';
  const USER_AVATAR = '<span class="cb-avatar cb-avatar-user"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg></span>';
  const WELCOME_TEXT = "Hi, Welcome to Cox's Bazar!\nI'm " + BOT_NAME + ", here to help you discover the longest natural beach in Asia.\n\nI'm an AI, so I might occasionally get a detail wrong — for anything important like visas, ferry schedules, or bookings, it's always worth double-checking before you go.\n\nWhat would you like to know?";

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatBotText(text) {
    let safe = escapeHtml(text);
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*\*/g, "");
    safe = safe.replace(/\n/g, "<br>");
    return safe;
  }

  const state = loadState();

  function loadState() {
    try {
      const raw = sessionStorage.getItem("cb_chat_state");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { history: [], open: false, started: false, expanded: false, sessionId: null };
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

  function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    return path === "/" || path.endsWith("/index.html") || path.split("/").pop() === "";
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

  function performClose() {
    win.hidden = true;
    state.open = false;
    state.history = [];
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
    if (!win.hidden) {
      minimizeWindow();
      return;
    }
    closeConfirm.hidden = true;
    if (state.history.length === 0) {
      state.started = true;
      openWindow();
      addMessage(WELCOME_TEXT, "bot");
    } else {
      openWindow();
    }
  });

  minimizeBtn.addEventListener("click", minimizeWindow);
  expandBtn.addEventListener("click", toggleExpand);
  closeBtn.addEventListener("click", function () { closeConfirm.hidden = false; });
  confirmNo.addEventListener("click", function () { closeConfirm.hidden = true; });
  confirmYes.addEventListener("click", function () { closeConfirm.hidden = true; performClose(); });

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
  } else if (isHomePage()) {
    setTimeout(function () {
      state.started = true;
      openWindow();
      addMessage(WELCOME_TEXT, "bot");
    }, 1500);
  }
})();