/* inMetamorfosi Websites — pagina per i clienti */
(function () {
  "use strict";

  /* ---------- personalizzazione: nome, settore, città ---------- */
  var KEY = "imw-cliente";
  var who = { nome: "", settore: "", citta: "" };
  try { who = Object.assign(who, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  var qs = new URLSearchParams(location.search);
  ["nome", "settore", "citta"].forEach(function (k) { if (qs.get(k)) who[k] = qs.get(k).trim(); });
  if (qs.get("settore")) who.settore = who.settore.toLowerCase();

  function save() { try { localStorage.setItem(KEY, JSON.stringify(who)); } catch (e) {} }
  function sector() { return who.settore || "parrucchiere"; }
  function query() { return who.citta ? sector() + " " + who.citta : sector() + " vicino a me"; }
  function slug(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "").slice(0, 24) || "iltuosito";
  }

  function applyWho() {
    document.querySelectorAll('[data-fill="per"]').forEach(function (el) { el.textContent = who.nome ? "Per " + who.nome : "Siti web su misura"; });
    document.querySelectorAll('[data-fill="nome"]').forEach(function (el) { el.textContent = who.nome || (el.tagName === "B" && el.closest(".bub") ? "il tuo nome" : "Il tuo nome"); });
    document.querySelectorAll('[data-fill="ask"]').forEach(function (el) {
      el.textContent = "Chi mi consigli come " + sector() + (who.citta ? " a " + who.citta : " qui vicino") + "?";
    });
    var url = document.getElementById("sd-url");
    if (url) url.textContent = (who.nome ? slug(who.nome) : "iltuosito") + ".it";
    // l'esempio dello stesso settore va per primo, con l'etichetta "Simile al tuo"
    var pick = null, s = (who.settore || "").toLowerCase(), grid = document.getElementById("demos");
    if (grid) {
      grid.querySelectorAll(".dcard").forEach(function (t) {
        t.classList.remove("match");
        if (s && !pick && t.getAttribute("data-sector").split(" ").some(function (w) { return s.indexOf(w) > -1 || w.indexOf(s) > -1; })) pick = t;
      });
      // ordine originale, poi il simile in testa
      Array.prototype.slice.call(grid.querySelectorAll(".dcard"))
        .sort(function (a, b) { return (+a.getAttribute("data-i")) - (+b.getAttribute("data-i")); })
        .forEach(function (c) { grid.appendChild(c); });
      if (pick) { pick.classList.add("match"); grid.insertBefore(pick, grid.firstChild); }
    }
    playSearch(true);
  }

  /* ---------- apertura: la ricerca si scrive da sola e il cliente sale in cima ---------- */
  var demo = document.getElementById("search-demo"), q = document.getElementById("sd-q"), timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function playSearch(restart) {
    if (!demo) return;
    timers.forEach(clearTimeout); timers = [];
    demo.classList.remove("results", "rise");
    q.textContent = "";
    var text = query(), i = 0;
    later(function step() {
      q.textContent = text.slice(0, ++i);
      if (i < text.length) later(step, 65);
      else {
        later(function () { demo.classList.add("results"); }, 350);
        later(function () { demo.classList.add("rise"); }, 1700);
      }
    }, restart ? 300 : 900);
  }

  /* ---------- barra delle sezioni: evidenzia dove sei ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".secnav-links a"));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function onScroll() {
    var y = window.scrollY + window.innerHeight * 0.35, cur = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) {
      var on = i === cur;
      if (on !== a.classList.contains("on")) {
        a.classList.toggle("on", on);
        // porta in vista il pulsante attivo solo dentro la barra, senza toccare lo scorrimento della pagina
        if (on) { var bar = a.parentNode; bar.scrollTo({ left: a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2, behavior: "smooth" }); }
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- entrate leggere ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.25 });
  document.querySelectorAll(".why-card, .swap, .rv").forEach(function (el) { io.observe(el); });

  /* ---------- 01: la domanda ---------- */
  var askBtn = document.getElementById("ask-btn");
  if (askBtn) askBtn.addEventListener("click", function () {
    askBtn.setAttribute("aria-expanded", "true");
    document.getElementById("ask-a").hidden = false;
  });

  /* ---------- 02: griglia degli esempi e sito a tutto schermo ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".dcard"));
  cards.forEach(function (c, i) { c.setAttribute("data-i", i); });
  var lb = document.getElementById("lb"), lbFrame = document.getElementById("lb-frame"), lbScreen = document.getElementById("lb-screen"),
      lbName = document.getElementById("lb-name"), lbChips = document.getElementById("lb-chips"), lbExt = document.getElementById("lb-ext"),
      viewBtns = document.querySelectorAll(".lb-seg button"), current = null, lastFocus = null;
  var DESK = 1280, PHONE = 390;

  function isMobile() { return lb.classList.contains("is-mobile"); }
  // il sito dentro la cornice: sul computer a larghezza vera (o rimpicciolito se lo schermo è stretto), sul telefono a 390 px
  function fit() {
    if (lb.hidden) return;
    var w = lbScreen.clientWidth, h = lbScreen.clientHeight;
    if (!w || !h) return;
    var base = isMobile() ? PHONE : Math.max(w, Math.min(DESK, 1180));
    if (!isMobile() && w >= 1180) base = w;
    var k = w / base;
    lbFrame.style.width = base + "px";
    lbFrame.style.height = Math.ceil(h / k) + "px";
    lbFrame.style.transform = k === 1 ? "none" : "scale(" + k + ")";
  }
  window.addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(lbScreen);

  /* pallini "incluso / modulo extra / pagina in più" dentro il sito; lo stato resta salvato */
  var hsSwitch = document.getElementById("hs-switch"), hsLegend = document.getElementById("hs-legend");
  try { hsSwitch.checked = (localStorage.getItem("demo-hs") || "1") === "1"; } catch (e) {}
  function applyHs() {
    var on = hsSwitch.checked;
    try { localStorage.setItem("demo-hs", on ? "1" : "0"); } catch (e) {}
    hsLegend.classList.toggle("off", !on);
    try { lbFrame.contentDocument.documentElement.classList.toggle("hs-off", !on); } catch (e) {}
  }
  hsSwitch.addEventListener("change", applyHs);
  lbFrame.addEventListener("load", applyHs);
  lbFrame.addEventListener("load", fit);

  function setView(v) {
    lb.classList.toggle("is-mobile", v === "mobile");
    viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === v)); });
    requestAnimationFrame(fit);
    setTimeout(fit, 80);
    if (window.dataLayer) window.dataLayer.push({ event: "esempio_vista", vista: v });
  }
  viewBtns.forEach(function (b) { b.addEventListener("click", function () { setView(b.getAttribute("data-view")); }); });

  function show(card) {
    current = card;
    var site = card.getAttribute("data-site");
    lbName.textContent = card.getAttribute("data-name");
    lbChips.innerHTML = "";
    var base = document.createElement("span"); base.className = "base"; base.textContent = card.getAttribute("data-kind"); lbChips.appendChild(base);
    card.getAttribute("data-mods").split("|").forEach(function (m) { var c = document.createElement("span"); c.textContent = "+ " + m; lbChips.appendChild(c); });
    lbExt.setAttribute("href", "esempi/" + site + "/index.html");
    lbFrame.setAttribute("src", "esempi/" + site + "/index.html?embed=1");
    if (window.dataLayer) window.dataLayer.push({ event: "esempio", sito: site });
  }
  function open(card) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("lb-open");
    show(card);
    if (window.innerWidth < 680) setView("mobile"); // sul telefono si vede già com'è sul telefono
    requestAnimationFrame(fit);
    setTimeout(fit, 80);
    document.getElementById("lb-close").focus();
  }
  function close() {
    lb.hidden = true;
    document.body.classList.remove("lb-open");
    lbFrame.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }
  function step(d) {
    var list = Array.prototype.slice.call(document.querySelectorAll(".dcard"));
    var i = list.indexOf(current);
    show(list[(i + d + list.length) % list.length]);
  }
  cards.forEach(function (c) { c.addEventListener("click", function () { open(c); }); });
  document.getElementById("lb-close").addEventListener("click", close);
  document.getElementById("lb-prev").addEventListener("click", function () { step(-1); });
  document.getElementById("lb-next").addEventListener("click", function () { step(1); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight" && e.target === document.body) step(1);
    if (e.key === "ArrowLeft" && e.target === document.body) step(-1);
  });

  /* ---------- 05: il preventivo (listino IVA esclusa) ---------- */
  var PRICE = { one: 1100, full: 2200, shop: 2500 }, EXTRA_PAGE = 150, IVA = 0.22, pages = 5, last = null;
  var pagesOut = document.getElementById("pages"), pagesRow = document.getElementById("pages-row"),
      itemsRow = document.getElementById("items-row"), items = document.getElementById("items"),
      rNet = document.getElementById("r-net"), rGross = document.getElementById("r-gross"),
      rRate = document.getElementById("r-rate"), rHost = document.getElementById("r-host");
  function eur(v) {
    var cents = Math.round(v * 100), int = Math.floor(cents / 100), dec = cents % 100;
    var s = String(int).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (dec) s += "," + (dec < 10 ? "0" : "") + dec;
    return s + " €";
  }
  function calc() {
    var fmt = document.querySelector('input[name="fmt"]:checked').value;
    var group = fmt === "shop" ? "shop" : "site", net = PRICE[fmt];
    pagesRow.hidden = fmt !== "full";
    itemsRow.hidden = fmt !== "shop";
    if (fmt === "full") net += (pages - 5) * EXTRA_PAGE;
    if (fmt === "shop") net += parseFloat(items.value);
    document.querySelectorAll(".needs[data-for]").forEach(function (g) {
      var on = g.getAttribute("data-for") === group;
      g.hidden = !on;
      g.querySelectorAll("input").forEach(function (m) { if (!on) m.checked = false; else if (m.checked) net += parseFloat(m.value); });
    });
    var gross = net * (1 + IVA);
    rNet.textContent = eur(net);
    rGross.textContent = eur(gross) + " con l'IVA";
    rRate.textContent = "oppure 3 rate da circa " + eur(Math.round(gross / 3));
    rHost.textContent = fmt === "shop"
      ? "Poi dominio ed email: 60 € + IVA il primo anno, 90 € dal secondo. Più Shopify, circa 39 € al mese."
      : "Poi solo dominio e hosting: 60 € + IVA il primo anno, 90 € dal secondo.";
    if (last !== null && last !== net) { var t = rNet.parentNode; t.classList.remove("bump"); void t.offsetWidth; t.classList.add("bump"); }
    last = net;
  }
  document.querySelectorAll('#prezzi input, #prezzi select').forEach(function (el) { el.addEventListener("change", calc); });
  document.querySelectorAll("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      pages = Math.max(5, Math.min(10, pages + parseInt(b.getAttribute("data-step"), 10)));
      pagesOut.textContent = pages; calc();
    });
  });
  calc();

  /* ---------- 06: le domande ---------- */
  var answers = document.getElementById("answers").content.querySelectorAll("p");
  var ans = document.getElementById("qa-answer");
  var chipsQ = document.querySelectorAll(".qchip");
  function showQ(i) {
    chipsQ.forEach(function (c, k) { c.setAttribute("aria-selected", String(k === i)); });
    ans.innerHTML = ""; ans.appendChild(answers[i].cloneNode(true));
  }
  chipsQ.forEach(function (c, i) { c.addEventListener("click", function () { showQ(i); }); });
  showQ(0);

  /* ---------- pannello del venditore ---------- */
  var seller = document.getElementById("seller"), form = document.getElementById("seller-form");
  document.getElementById("seller-open").addEventListener("click", function () {
    form.nome.value = who.nome; form.settore.value = who.settore; form.citta.value = who.citta;
    seller.hidden = false;
    setTimeout(function () { form.nome.focus(); }, 50);
  });
  document.getElementById("seller-close").addEventListener("click", function () { seller.hidden = true; });
  seller.addEventListener("click", function (e) { if (e.target === seller) seller.hidden = true; });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    who = { nome: form.nome.value.trim(), settore: form.settore.value.trim().toLowerCase(), citta: form.citta.value.trim() };
    save(); seller.hidden = true; window.scrollTo({ top: 0, behavior: "smooth" }); applyWho();
  });
  document.getElementById("seller-reset").addEventListener("click", function () {
    who = { nome: "", settore: "", citta: "" }; form.reset(); save(); applyWho();
  });

  applyWho();

  /* ---------- modalità foto (?shot=1): tutto già acceso, per gli screenshot ---------- */
  if (qs.get("shot")) {
    timers.forEach(clearTimeout);
    q.textContent = query();
    demo.classList.add("results", "rise");
    document.querySelectorAll(".why-card, .swap, .rv").forEach(function (el) { el.classList.add("in"); });
    document.documentElement.classList.add("shot");
  }

  /* ---------- link diretto a un esempio: ?apri=ceramiche (&vista=mobile) ---------- */
  if (qs.get("apri")) {
    var dc = document.querySelector('.dcard[data-site="' + qs.get("apri").replace(/[^a-z-]/g, "") + '"]');
    if (dc) { open(dc); if (qs.get("vista") === "mobile") setView("mobile"); }
  }

  /* ---------- tracking ---------- */
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      var name = el.getAttribute("data-cta");
      if (window.dataLayer) window.dataLayer.push({ event: "cta_click", cta: name, page: "websites" });
      if (window.fbq) window.fbq("trackCustom", "CTAClick", { cta: name, page: "websites" });
    });
  });
})();
