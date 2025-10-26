// mobile-menu-fix.js
(function () {
  const toggleCheckbox = document.getElementById("menu-toggle-form"); // existing checkbox in markup
  const menu = document.getElementById("menu"); // your #menu element
  // ensure wrapper for inner content to apply padding
  if (menu && !menu.querySelector(".menu-inner")) {
    const inner = document.createElement("div");
    inner.className = "menu-inner";
    // move existing children into inner (preserve structure)
    while (menu.firstChild) inner.appendChild(menu.firstChild);
    menu.appendChild(inner);
  }

  // create overlay
  let overlay = document.querySelector(".mobile-menu-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "mobile-menu-overlay";
    document.body.appendChild(overlay);
  }

  // create close button if not exists
  if (menu && !document.querySelector(".mobile-menu-close")) {
    const btn = document.createElement("button");
    btn.className = "mobile-menu-close";
    btn.setAttribute("aria-label", "Close menu");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    menu.appendChild(btn);
    btn.addEventListener("click", closeMenu);
  }

  function openMenu() {
    if (menu) menu.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("menu-open");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (menu) menu.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
    if (toggleCheckbox) toggleCheckbox.checked = false;
  }

  if (toggleCheckbox) {
    toggleCheckbox.addEventListener("change", function (e) {
      if (e.target.checked) openMenu();
      else closeMenu();
    });
  } else {
    // fallback: if your toggle is a button instead of checkbox, wire that here
    const menuButton = document.querySelector(".ttm-menu-toggle-block");
    if (menuButton) {
      menuButton.addEventListener("click", function () {
        if (menu.classList.contains("open")) closeMenu();
        else {
          // set this state so CSS + overlay work
          if (menu) openMenu();
        }
      });
    }
  }

  overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();
