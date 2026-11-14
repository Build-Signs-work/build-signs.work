// The hub's contact form (contact/index.html) — a no-build copy of the sign
// sites' <ContactForm> (`ContactForm.tsx` / `lib/contactForm.ts` there):
// same fields, limits, opt-in wording and behaviour. POSTs to the shared
// backend's /api/contact, which needs https://build-signs.work in its
// CORS_ORIGIN. Nothing is emailed to the visitor.
(function () {
  "use strict";
  var API = "https://www.api-signs.work/api/contact";
  var TURNSTILE_SITE_KEY = "0x4AAAAAAGAdi_LDa2Na0lUM";
  var MESSAGE_MIN = 10;
  var MESSAGE_MAX = 2000;
  var NAME_MAX = 100;
  var PHONE_MAX = 32;
  var EMAIL_MAX = 254;
  var FIELDS = ["firstName", "lastName", "email", "phone", "topic", "message", "turnstile"];

  var form = document.getElementById("contact-form");
  if (!form) return;
  var done = document.getElementById("contact-done");
  var button = form.querySelector("button[type=submit]");
  var count = document.getElementById("cf-message-count");
  var formError = document.getElementById("cf-form-error");
  var widgetError = document.getElementById("cf-widget-error");
  var token = null;
  var widgetId = null;

  // Same-site page they came from (path only).
  var fromPage = null;
  try {
    var ref = new URL(document.referrer);
    if (ref.origin === location.origin && ref.pathname !== location.pathname) fromPage = ref.pathname.slice(0, 200);
  } catch (e) {}

  function setError(field, text) {
    var el = document.getElementById("cf-" + field + "-error");
    var input = document.getElementById("cf-" + field);
    if (el) {
      el.textContent = text || "";
      el.hidden = !text;
    }
    if (input) {
      if (text) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }
  function clearErrors() {
    FIELDS.forEach(function (f) { setError(f, ""); });
    formError.hidden = true;
    formError.textContent = "";
  }
  function showFormError(text) {
    formError.textContent = text;
    formError.hidden = false;
  }

  var message = document.getElementById("cf-message");
  function updateCount() {
    var left = MESSAGE_MAX - message.value.trim().length;
    count.textContent = left < 200 ? Math.max(0, left) + " characters left" : "Up to 2,000 characters";
  }
  message.addEventListener("input", updateCount);
  updateCount();

  // Turnstile (explicit render; the script tag is in the page).
  window.onContactTurnstileLoad = function () {
    if (!window.turnstile) return;
    widgetId = window.turnstile.render("#cf-widget", {
      sitekey: TURNSTILE_SITE_KEY,
      action: "contact",
      theme: "auto",
      size: "flexible",
      callback: function (t) { token = t; setError("turnstile", ""); },
      "expired-callback": function () { token = null; },
      "error-callback": function () { token = null; widgetError.hidden = false; },
    });
  };
  if (window.turnstile) window.onContactTurnstileLoad();
  setTimeout(function () { if (!window.turnstile) widgetError.hidden = false; }, 8000);

  function problem(first, last, email, phone, sms, msg) {
    if (first.length > NAME_MAX) return ["firstName", "Keep your first name under " + NAME_MAX + " characters."];
    if (last.length > NAME_MAX) return ["lastName", "Keep your last name under " + NAME_MAX + " characters."];
    if (!email || email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return ["email", "Enter a valid email address."];
    var digits = phone.replace(/\D/g, "");
    if (phone && (phone.length > PHONE_MAX || !/^\+?[\d\s().-]+$/.test(phone) || digits.length < 8 || digits.length > 15)) return ["phone", "Enter a phone number with its country code, like +1 555 123 4567."];
    if (sms && !phone) return ["phone", "Add your phone number to get texts, or untick the text box."];
    if (msg.length < MESSAGE_MIN) return ["message", "Write a little more — at least a sentence."];
    if (msg.length > MESSAGE_MAX) return ["message", "Keep your message under " + MESSAGE_MAX + " characters."];
    return null;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (button.disabled) return;
    clearErrors();
    var first = form.elements.firstName.value.trim();
    var last = form.elements.lastName.value.trim();
    var email = form.elements.email.value.trim();
    var phone = form.elements.phone.value.trim();
    var sms = form.elements.smsOptIn.checked === true;
    var p = problem(first, last, email, phone, sms, message.value.trim());
    if (p) {
      setError(p[0], p[1]);
      var bad = document.getElementById("cf-" + p[0]);
      if (bad) bad.focus();
      return;
    }
    if (!token) {
      setError("turnstile", "Please complete the “I’m human” check first.");
      return;
    }
    button.disabled = true;
    button.textContent = "Sending…";
    var body = {
      firstName: first,
      lastName: last,
      email: email,
      phone: phone,
      topic: form.elements.topic.value,
      message: message.value,
      page: fromPage,
      optIn: form.elements.optIn.checked === true,
      smsOptIn: sms && phone !== "",
      // The hub is English-only.
      language: "en",
      browserLanguage: navigator.language || "",
      turnstile: token,
      website: form.elements.website.value,
    };
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" })
      .then(function (res) {
        if (res.ok) return { ok: true };
        if (res.status === 429) return { ok: false, error: "That’s a lot of messages. Please wait a few minutes and try again." };
        return res.json().catch(function () { return null; }).then(function (data) {
          if (res.status === 400 && data && data.error) return { ok: false, error: data.error, field: data.field };
          return { ok: false, error: "Your message couldn’t be sent. Please try again in a few minutes." };
        });
      }, function () {
        return { ok: false, error: "Couldn’t reach the server. Check your connection and try again." };
      })
      .then(function (r) {
        button.disabled = false;
        button.textContent = "Send message";
        if (r.ok) {
          form.hidden = true;
          done.hidden = false;
          done.focus();
          return;
        }
        token = null; // single-use
        if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
        if (r.field && FIELDS.indexOf(r.field) >= 0) {
          setError(r.field, r.error);
          var el = document.getElementById("cf-" + r.field);
          if (el && r.field !== "turnstile") el.focus();
        } else {
          showFormError(r.error);
        }
      });
  });

  document.getElementById("contact-again").addEventListener("click", function () {
    message.value = "";
    updateCount();
    done.hidden = true;
    form.hidden = false;
    token = null;
    if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
    message.focus();
  });
})();
