(function () {
  const WORKER_URL = "https://reverie.ashesh-devnath.workers.dev";
  const SITE_VERSION = "with_chatbot"; // change to "without_chatbot" only in the copied repo, later

  function getSessionId() {
  let id = sessionStorage.getItem("cb_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("cb_session_id", id);
  }
  return id;
}

  const sessionId = getSessionId();
  const page = document.title || location.pathname;
  const device = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
  const loadTime = Date.now();
  let maxScroll = 0;

  function send(payload) {
    fetch(WORKER_URL + "/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ siteVersion: SITE_VERSION, type: "page_view" }, payload)),
      keepalive: true,
    }).catch(() => {});
  }

  send({ eventName: "page_view", sessionId, page, device, referrer: document.referrer });

  window.addEventListener("scroll", function () {
    const pct = Math.round(((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100);
    if (pct > maxScroll) maxScroll = Math.min(pct, 100);
  });

    document.addEventListener("click", function (e) {
    const el = e.target.closest("a, button");
    if (!el || el.closest("#cb-chat-widget")) return;
    send({
      eventName: "click",
      sessionId, page, device,
      clickTarget: (el.textContent || el.id || el.href || "").trim().slice(0, 50),
    });
  });

  window.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      send({
        eventName: "page_exit",
        sessionId, page, device,
        timeOnPageMs: Date.now() - loadTime,
        scrollDepth: maxScroll,
      });
    }
  });
})();
