// "Sign Builders" slide-in menu (same pattern as road-signs.work's Sign
// Choices panel): the toggle opens it; Escape, the backdrop or × closes it.
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.getElementById("site-menu");
  const overlay = document.querySelector(".menu-overlay");
  if (!toggle || !panel || !overlay) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    overlay.classList.toggle("is-open", open);
    panel.inert = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) panel.focus();
    else toggle.focus();
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
  });
})();
