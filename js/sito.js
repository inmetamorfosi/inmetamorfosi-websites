/* inMetamorfosi Websites — pagina per i clienti */
(function () {
  "use strict";

  /* ---------- personalizzazione: nome, settore, città ---------- */
  var KEY = "imw-cliente";
  var who = { nome: "", settore: "", citta: "", ref: "", tel: "" };
  try { who = Object.assign(who, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  var qs = new URLSearchParams(location.search);
  ["nome", "settore", "citta", "ref", "tel"].forEach(function (k) { if (qs.get(k)) who[k] = qs.get(k).trim(); });
  if (qs.get("settore")) who.settore = who.settore.toLowerCase();

  function save() { try { localStorage.setItem(KEY, JSON.stringify(who)); } catch (e) {} }
  function sector() { return who.settore || "parrucchiere"; }
  function query() { return who.citta ? sector() + " " + who.citta : sector() + " vicino a me"; }
  function slug(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "").slice(0, 24) || "iltuosito";
  }

  function applyWho() {
    document.querySelectorAll('[data-fill="per"]').forEach(function (el) { el.textContent = who.nome ? "Per " + who.nome : "Siti web su misura per attività e professionisti"; });
    // la prova parte già con il settore e la città del cliente
    var tw = document.getElementById("try-what"), tc = document.getElementById("try-where");
    if (tw && who.settore) tw.value = who.settore;
    if (tc && who.citta) tc.value = who.citta;
    document.querySelectorAll('[data-fill="nome"]').forEach(function (el) { el.textContent = who.nome || (el.tagName === "B" && el.closest(".bub") ? "il tuo nome" : "Il tuo nome"); });
    document.querySelectorAll('[data-fill="ask"]').forEach(function (el) {
      el.textContent = "Chi mi consigli come " + sector() + (who.citta ? " a " + who.citta : " qui vicino") + "?";
    });
    document.querySelectorAll('[data-fill="search"]').forEach(function (el) { el.textContent = query(); });
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
      // l'apertura mostra l'esempio più vicino all'attività del cliente
      var first = pick || grid.querySelector(".dcard");
      var pk = document.getElementById("peek");
      if (pk && first) {
        pk.setAttribute("data-site", first.getAttribute("data-site"));
        var site = first.getAttribute("data-site"), pd = document.getElementById("peek-desk"), pm = document.getElementById("peek-mob");
        if (pd.getAttribute("src").indexOf("alto-" + site + ".") < 0) { pd.setAttribute("src", "media/esempi/alto-" + site + ".jpg"); pm.setAttribute("src", "media/esempi/tel-" + site + ".jpg"); }
        document.getElementById("peek-name").textContent = first.getAttribute("data-name");
        document.getElementById("peek-url").textContent = slug(first.getAttribute("data-name")) + ".it";
      }
    }
    applyRef();
  }

  /* ---------- il referente: nome e WhatsApp nei contatti ---------- */
  var STUDIO_WA = "393888174824", WA_TEXT = "Ciao, vorrei informazioni per il mio sito";
  function waNumber(t) {
    var d = (t || "").replace(/\D/g, "");
    if (d.length < 8) return "";
    if (d.indexOf("00") === 0) d = d.slice(2);
    if (d.charAt(0) === "3" && d.length <= 10) d = "39" + d; // cellulare italiano senza prefisso
    return d;
  }
  function applyRef() {
    var num = waNumber(who.tel), name = who.ref;
    var refName = document.getElementById("ref-name");
    if (refName) refName.textContent = name || "Una persona sola";
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      a.setAttribute("href", "https://wa.me/" + (num || STUDIO_WA) + "?text=" + encodeURIComponent(WA_TEXT));
      var label = num && name ? "Scrivi a " + name + " su WhatsApp" : "Scrivici su WhatsApp";
      a.textContent = label + (a.hasAttribute("data-wa-arrow") ? " →" : "");
    });
    var sf = document.getElementById("send");
    if (sf) { if (who.nome) sf.elements.nome.value = who.nome; if (who.ref) sf.elements.ref.value = who.ref; }
    var tel = document.getElementById("ref-tel");
    if (tel) {
      tel.hidden = !num;
      if (num) { tel.setAttribute("href", "tel:+" + num); tel.textContent = name ? "Chiama " + name : "Chiama"; }
    }
  }

  /* ---------- barra delle sezioni: evidenzia dove sei ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
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

  /* ---------- comparsa morbida mentre si scorre ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.25 });
  document.querySelectorAll(".swap").forEach(function (el) { io.observe(el); });

  var RV = ".head, .why-card, .try, .dcard, .steps li, .when, .pledge, .own-head, .own-list > div, .fmt, .builder, .included, .qa, .studio, .g-score, .quotes figure, .close > *, .packs .pack, .xcols > div, .faqs .faq";
  if ("IntersectionObserver" in window && !qs.get("shot") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        rio.unobserve(el);
        el.classList.add("in");
        // a comparsa finita l'elemento torna "normale", così i movimenti al passaggio del mouse restano i suoi
        setTimeout(function () { el.classList.remove("rv"); el.style.removeProperty("--d"); }, 1500);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(RV).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) return; // quello che è già a schermo resta com'è
      var sib = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.matches(RV); });
      el.style.setProperty("--d", Math.min(sib.indexOf(el), 4) * 0.08 + "s");
      el.classList.add("rv");
      rio.observe(el);
    });
  }

  /* ---------- la prova: cerchiamo insieme su Google e su ChatGPT ---------- */
  var tryForm = document.getElementById("try");
  function tryText() {
    var w = (document.getElementById("try-what").value || "").trim(), d = (document.getElementById("try-where").value || "").trim();
    return { w: w || sector(), d: d };
  }
  if (tryForm) {
    tryForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = tryText();
      window.open("https://www.google.com/search?q=" + encodeURIComponent(t.w + (t.d ? " " + t.d : " vicino a me")), "_blank", "noopener");
    });
    document.getElementById("try-ai").addEventListener("click", function () {
      var t = tryText();
      var ask = "Chi mi consigli come " + t.w + (t.d ? " a " + t.d : " qui vicino") + "?";
      window.open("https://chatgpt.com/?q=" + encodeURIComponent(ask), "_blank", "noopener");
    });
  }

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
  var peek = document.getElementById("peek");
  if (peek) peek.addEventListener("click", function () {
    var c = document.querySelector('.dcard[data-site="' + peek.getAttribute("data-site") + '"]') || cards[0];
    if (c) open(c);
  });
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
  var quote = null;
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
      ? "Poi indirizzo ed email: qualche decina di euro l'anno. Più l'abbonamento a Shopify, circa 39 € al mese."
      : "Poi solo indirizzo e spazio online: qualche decina di euro l'anno.";
    // riepilogo nella chiusura: è quello che il referente conferma con il cliente
    var what = { one: "Sito monopagina", full: "Sito completo, " + pages + " pagine", shop: "Negozio online, " + (items.value === "0" ? "fino a 20 prodotti" : items.options[items.selectedIndex].text.split(" · ")[0] + " prodotti") }[fmt];
    var ex = [];
    document.querySelectorAll('.needs:not([hidden]) input:checked').forEach(function (m) { ex.push(m.getAttribute("data-n")); });
    var cW = document.getElementById("c-what"), cE = document.getElementById("c-extra"), cN = document.getElementById("c-net");
    quote = { what: what, ex: ex, net: net, gross: gross, rate: Math.round(gross / 3) };
    if (cW) { cW.textContent = what; cE.textContent = ex.length ? "Con " + (ex.length > 1 ? ex.slice(0, -1).join(", ") + " e " + ex[ex.length - 1] : ex[0]) : "Senza extra"; cN.textContent = eur(net); }
    if (last !== null && last !== net) { var t = rNet.parentNode; t.classList.remove("bump"); void t.offsetWidth; t.classList.add("bump"); }
    last = net;
  }
  function markOn() {
    document.querySelectorAll("#prezzi .fmt, #prezzi .need").forEach(function (l) { l.classList.toggle("on", l.querySelector("input").checked); });
  }
  document.querySelectorAll('#prezzi input, #prezzi select').forEach(function (el) { el.addEventListener("change", function () { calc(); markOn(); }); });
  document.querySelectorAll("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      pages = Math.max(5, Math.min(10, pages + parseInt(b.getAttribute("data-step"), 10)));
      pagesOut.textContent = pages; calc();
    });
  });
  calc(); markOn();

  /* ---------- riepilogo allo studio: apre l'email del tablet già scritta ---------- */
  var STUDIO_MAIL = "info@inmetamorfosi.com";
  var sendF = document.getElementById("send");
  if (sendF) {
    sendF.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = sendF.elements.nome.value.trim(), ref = sendF.elements.ref.value.trim(), note = sendF.elements.note.value.trim();
      sendF.elements.nome.classList.toggle("need-it", !nome);
      if (!nome) { sendF.elements.nome.focus(); return; }
      // resta salvato sul tablet, come dal pannello Personalizza
      who.nome = nome; if (ref) who.ref = ref; save();
      var q = quote, L = [];
      L.push("Nuovo sito da preparare");
      L.push("");
      L.push("Cliente: " + nome + (who.settore ? ", " + who.settore : "") + (who.citta ? ", " + who.citta : ""));
      L.push("Referente: " + (ref || "non indicato") + (who.tel ? " (" + who.tel + ")" : ""));
      L.push("");
      L.push("Tipo di sito: " + q.what);
      L.push("Extra: " + (q.ex.length ? q.ex.join(", ") : "nessuno"));
      L.push("Prezzo: " + eur(q.net) + " + IVA (" + eur(q.gross) + " con l'IVA, oppure 3 rate da circa " + eur(q.rate) + ")");
      if (note) { L.push(""); L.push("Note: " + note); }
      L.push("");
      L.push("Inviato dalla pagina clienti il " + new Date().toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) + ".");
      L.push("Il referente vi chiama per completare i dettagli.");
      var subj = "Nuovo sito: " + nome + (ref ? " (referente " + ref + ")" : "");
      var url = "mailto:" + STUDIO_MAIL + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(L.join("\r\n"));
      sendF.setAttribute("data-mail", url);
      location.href = url;
      document.getElementById("send-ok").hidden = false;
    });
    sendF.elements.nome.addEventListener("input", function () { this.classList.remove("need-it"); });
  }

  /* ---------- 06: le domande ---------- */
  var answers = document.getElementById("answers").content.querySelectorAll("p");
  var ans = document.getElementById("qa-answer");
  var chipsQ = document.querySelectorAll(".qchip");
  var qaWrap = document.querySelector(".qa");
  function showQ(i) {
    chipsQ.forEach(function (c, k) { c.setAttribute("aria-selected", String(k === i)); });
    ans.innerHTML = ""; ans.appendChild(answers[i].cloneNode(true));
    // su tablet verticale e telefono la risposta compare subito sotto la domanda toccata
    if (window.innerWidth <= 900) chipsQ[i].insertAdjacentElement("afterend", ans);
    else if (ans.parentNode !== qaWrap) qaWrap.appendChild(ans);
  }
  chipsQ.forEach(function (c, i) { c.addEventListener("click", function () { showQ(i); }); });
  showQ(0);

  /* ---------- pannello del venditore ---------- */
  var seller = document.getElementById("seller"), form = document.getElementById("seller-form");
  document.getElementById("seller-open").addEventListener("click", function () {
    form.nome.value = who.nome; form.settore.value = who.settore; form.citta.value = who.citta; form.ref.value = who.ref; form.tel.value = who.tel;
    seller.hidden = false;
    setTimeout(function () { form.nome.focus(); }, 50);
  });
  document.getElementById("seller-close").addEventListener("click", function () { seller.hidden = true; });
  seller.addEventListener("click", function (e) { if (e.target === seller) seller.hidden = true; });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    who = { nome: form.nome.value.trim(), settore: form.settore.value.trim().toLowerCase(), citta: form.citta.value.trim(), ref: form.ref.value.trim(), tel: form.tel.value.trim() };
    save(); seller.hidden = true; window.scrollTo({ top: 0, behavior: "smooth" }); applyWho();
  });
  document.getElementById("seller-reset").addEventListener("click", function () {
    who = { nome: "", settore: "", citta: "", ref: "", tel: "" }; form.reset(); save(); applyWho();
  });

  applyWho();

  /* ---------- modalità foto (?shot=1): tutto già acceso, per gli screenshot ---------- */
  if (qs.get("shot")) {
    document.querySelectorAll(".swap").forEach(function (el) { el.classList.add("in"); });
    document.documentElement.classList.add("shot");
  }

  /* ---------- link diretto a un esempio: ?apri=ceramiche (&vista=mobile) ---------- */
  if (qs.get("apri")) {
    var dc = document.querySelector('.dcard[data-site="' + qs.get("apri").replace(/[^a-z-]/g, "") + '"]');
    if (dc) { open(dc); if (qs.get("vista") === "mobile") setView("mobile"); }
  }

  /* ---------- pulsante WhatsApp fisso su telefono ---------- */
  var mcta = document.getElementById("mcta"), heroEl = document.getElementById("inizio"), closeEl = document.getElementById("contatti");
  if (mcta && heroEl && closeEl) {
    var mUpdate = function () {
      var past = window.scrollY > heroEl.offsetHeight * 0.8;
      var atClose = closeEl.getBoundingClientRect().top < window.innerHeight * 0.85;
      mcta.classList.toggle("on", past && !atClose);
    };
    window.addEventListener("scroll", mUpdate, { passive: true });
    mUpdate();
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
