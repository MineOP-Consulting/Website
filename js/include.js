/* ============================================================
   MineOp Consulting — local boot script.

   The shared header/footer are now inlined directly into every
   page, so nothing is fetched at runtime. This just:
   1. Sets the active nav link from <body data-page="...">.
   2. Boots MineOp.init() once the DOM is ready.

   Runs from the local file system — no server required.
   ============================================================ */
(function () {
  "use strict";

  function boot() {
    // ---- active nav state from <body data-page="..."> ----
    var page = document.body.getAttribute("data-page") || "home";
    var file = page === "home" ? "index.html" : page + ".html";
    document.querySelectorAll('nav.main a, .mobile a').forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("/").pop();
      if (href === file) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });

    // ---- boot site behaviours ----
    if (window.MineOp && typeof window.MineOp.init === "function") {
      window.MineOp.init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
