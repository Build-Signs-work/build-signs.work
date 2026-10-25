// Google Analytics (gtag.js) for the hub's own GA property. Every page loads
// this one file, so the measurement ID lives only here; empty disables the tag.
(() => {
  const GA_ID = "G-VLE7377M97";
  if (!GA_ID) return;
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(tag);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
})();
