/* inMetamorfosi Websites — pagina per i clienti */
(function () {
  "use strict";

  var WA = "393888174824";
  var MAIL = "info@inmetamorfosi.com";

  /* ---------- anno corrente nel footer ---------- */
  var yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- sticky CTA mobile (appare dopo l'hero, sparisce sui contatti) ---------- */
  var sticky = document.getElementById("sticky-cta");
  var hero = document.querySelector(".hero");
  var formSec = document.getElementById("contatti");
  if (sticky && hero && formSec) {
    window.addEventListener("scroll", function () {
      var pastHero = window.scrollY > hero.offsetHeight;
      var formTop = formSec.getBoundingClientRect().top;
      sticky.classList.toggle("visible", pastHero && formTop > window.innerHeight * 0.6);
    }, { passive: true });
  }

  /* ---------- approfondimenti che si aprono con un pulsante (e-commerce, FAQ) ---------- */
  document.querySelectorAll(".pc-more").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      btn.textContent = btn.getAttribute(open ? "data-open" : "data-close");
      panel.hidden = open;
      if (!open) {
        panel.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- tracking CTA ---------- */
  function track(name) {
    if (window.dataLayer) window.dataLayer.push({ event: "cta_click", cta: name, page: "websites" });
    if (window.fbq) window.fbq("trackCustom", "CTAClick", { cta: name, page: "websites" });
  }
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () { track(el.getAttribute("data-cta")); });
  });

  /* ---------- configuratore preventivo (listino IVA esclusa) ---------- */
  var PRICE = { one: 1100, full: 2200, shop: 2500 };
  var NAME = { one: "Sito One-Page", full: "Sito Completo", shop: "E-commerce" };
  var EXTRA_PAGE = 150;
  var IVA = 0.22;

  var pagesWrap = document.getElementById("c-pages-wrap"),
      pages = document.getElementById("c-pages"),
      pagesOut = document.getElementById("c-pages-out"),
      modGroups = document.querySelectorAll(".mod-checks[data-for]"),
      itemsWrap = document.getElementById("c-items-wrap"),
      items = document.getElementById("c-items"),
      hasDom = document.getElementById("c-hasdom"),
      outNet = document.getElementById("c-net"),
      outGross = document.getElementById("c-gross"),
      outRate = document.getElementById("c-rate"),
      outHost = document.getElementById("c-host"),
      sendBtn = document.getElementById("c-send");

  // formato italiano: punto per le migliaia, virgola per i decimali (solo se servono)
  function eur(v) {
    var cents = Math.round(v * 100);
    var int = Math.floor(cents / 100), dec = cents % 100;
    var s = String(int).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (dec) s += "," + (dec < 10 ? "0" : "") + dec;
    return s + " €";
  }

  var summary = "";

  function calc() {
    var prod = document.querySelector('input[name="c-prod"]:checked').value;
    var net = PRICE[prod];
    var group = prod === "shop" ? "shop" : "site";
    var lines = [];
    pagesWrap.hidden = prod !== "full";
    itemsWrap.hidden = prod !== "shop";
    pagesOut.textContent = pages.value;

    var head = NAME[prod];
    if (prod === "full") {
      var p = parseInt(pages.value, 10);
      net += (p - 5) * EXTRA_PAGE;
      head += ", " + p + " pagine";
    }
    if (prod === "shop") {
      net += parseFloat(items.value);
      head += ", " + items.options[items.selectedIndex].getAttribute("data-label");
    }
    lines.push(head);

    // solo i moduli del formato scelto: quelli dell'altro gruppo si nascondono e si azzerano
    modGroups.forEach(function (g) {
      var on = g.getAttribute("data-for") === group;
      g.hidden = !on;
      g.querySelectorAll(".c-mod").forEach(function (m) {
        if (!on) m.checked = false;
        else if (m.checked) { net += parseFloat(m.value); lines.push("+ " + m.getAttribute("data-label")); }
      });
    });

    var gross = net * (1 + IVA);
    outNet.textContent = eur(net) + " + IVA";
    outGross.textContent = "Totale con IVA 22%: " + eur(gross);
    outRate.textContent = "oppure 3 rate da circa " + eur(Math.round(gross / 3)) + " con carta o Klarna";

    var own = hasDom && hasDom.checked;
    if (prod === "shop") {
      outHost.textContent = (own ? "Dominio ed email: li hai già, non paghi l'abbonamento." : "Dominio ed email: 60 € + IVA il primo anno, poi rinnovo annuale a 90 € + IVA.")
        + " Più Shopify, indicativamente 39 € al mese.";
    } else {
      outHost.textContent = own
        ? "Niente: mettiamo il sito sul tuo spazio e l'abbonamento non lo paghi."
        : "Dominio, hosting ed email: 60 € + IVA il primo anno, poi rinnovo annuale a 90 € + IVA";
    }
    if (own) lines.push("Ho già dominio e hosting");

    summary = "Il mio preventivo: " + lines.join(", ") + ". Totale " + eur(net) + " + IVA.";
    return prod;
  }

  if (outNet && pages && items) {
    document.querySelectorAll("#calc input, #calc select").forEach(function (el) {
      el.addEventListener("input", calc);
      el.addEventListener("change", calc);
    });
    calc();
  }

  /* "Mandaci questo preventivo": precompila il modulo contatti */
  var fProd = document.getElementById("f-prod"),
      fMsg = document.getElementById("f-msg");
  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      var prod = calc();
      if (fProd) fProd.value = NAME[prod];
      if (fMsg && fMsg.value.indexOf("Il mio preventivo:") === -1) {
        fMsg.value = summary + (fMsg.value ? "\n" + fMsg.value : "");
      } else if (fMsg) {
        fMsg.value = fMsg.value.replace(/Il mio preventivo:[^\n]*/, summary);
      }
      setTimeout(function () { var n = document.getElementById("f-nome"); if (n) n.focus({ preventScroll: true }); }, 600);
    });
  }

  /* ---------- modulo contatti: apre WhatsApp o l'email con il messaggio già scritto ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;
  var msg = document.getElementById("form-msg");

  function compose() {
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (f) {
      var ok = f.value.trim() !== "";
      f.classList.toggle("error", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      msg.textContent = "Compila i campi con l'asterisco: nome, attività, telefono e città.";
      msg.className = "form-msg err";
      return null;
    }
    msg.textContent = "";
    msg.className = "form-msg";
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var text = "Ciao, sono " + v("f-nome") + " (" + v("f-attivita") + ", " + v("f-citta") + ").\n"
      + "Mi interessa: " + v("f-prod") + ".\n"
      + (v("f-msg") ? v("f-msg") + "\n" : "")
      + "Il mio telefono: " + v("f-tel");
    if (window.dataLayer) window.dataLayer.push({ event: "lead_submit", form: "websites" });
    if (window.fbq) window.fbq("track", "Lead", { content_name: "websites" });
    return text;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var text = compose();
    if (!text) return;
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  });

  var mailBtn = document.getElementById("submit-mail");
  if (mailBtn) {
    mailBtn.addEventListener("click", function () {
      var text = compose();
      if (!text) return;
      window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Il mio sito") + "&body=" + encodeURIComponent(text);
    });
  }
})();
