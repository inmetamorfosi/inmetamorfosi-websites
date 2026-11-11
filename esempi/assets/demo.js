/* Siti dimostrativi inMetamorfosi: animazioni, pulsanti "cosa c'è dentro", piccole interazioni */
(function () {
  "use strict";

  if (/[?&]clean/.test(location.search)) document.documentElement.classList.add("clean");
  /* ?embed: sito mostrato dentro la pagina inMetamorfosi Websites, senza barra demo, pulsanti e cookie.
     Resta attivo anche sulle pagine interne, finché si naviga dentro la cornice. */
  try {
    if (/[?&]embed/.test(location.search)) sessionStorage.setItem("imw-embed", "1");
    if (window.self !== window.top && sessionStorage.getItem("imw-embed")) document.documentElement.classList.add("embed");
  } catch (e) {
    if (/[?&]embed/.test(location.search)) document.documentElement.classList.add("embed");
  }

  /* ---------- animazioni allo scorrimento ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  /* ---------- titoli che entrano parola per parola ---------- */
  document.querySelectorAll(".split-words").forEach(function (h) {
    if (!h.dataset.it) h.dataset.it = h.innerHTML; // per tornare all'italiano dalla seconda lingua
    h.querySelectorAll(".w > span").forEach(function (sp, i) { sp.style.transitionDelay = (0.15 + i * 0.07) + "s"; });
    setTimeout(function () { h.classList.add("go"); }, 80);
  });

  /* ---------- foto che si muovono allo scorrimento ---------- */
  var px = document.querySelectorAll(".parallax");
  if (px.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var tick = false;
    var move = function () {
      px.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        var k = parseFloat(el.dataset.speed || "0.12");
        el.style.transform = "translate3d(0," + (-(r.top) * k).toFixed(1) + "px,0) scale(" + (el.dataset.scale || 1) + ")";
      });
      tick = false;
    };
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* ---------- numeri che contano da soli ---------- */
  var cIo = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length, t0 = null;
      var step = function (t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1400), v = to * (1 - Math.pow(1 - k, 3));
        el.textContent = (dec ? v.toFixed(dec).replace(".", ",") : Math.round(v).toLocaleString("it-IT")) + (el.dataset.suffix || "");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cIo.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cIo.observe(el); });

  /* ---------- pulsanti che pulsano sopra le sezioni ----------
     data-hs="incluso|extra|page" data-hs-title="..." data-hs-desc="..." data-hs-price="..." data-hs-pos="left up" */
  var KIND = { incluso: "Incluso nel pacchetto", extra: "Modulo extra", page: "Pagina in più" };
  var hsEls = document.querySelectorAll("[data-hs]");
  hsEls.forEach(function (el) {
    var kind = el.getAttribute("data-hs");
    var price = el.getAttribute("data-hs-price");
    var hs = document.createElement("div");
    hs.className = "hs " + kind + " " + (el.getAttribute("data-hs-pos") || "");
    hs.innerHTML =
      '<button type="button" class="hs-dot" aria-label="Cosa c\'è in questa sezione">' + (kind === "incluso" ? "✓" : "+") + "</button>" +
      '<div class="hs-tip" role="tooltip"><span class="hs-tag">' + KIND[kind] + (price ? " · " + price : "") + "</span>" +
      "<strong>" + el.getAttribute("data-hs-title") + "</strong>" +
      "<p>" + (el.getAttribute("data-hs-desc") || "") + "</p></div>";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(hs);
    hs.querySelector(".hs-dot").addEventListener("click", function (ev) {
      ev.stopPropagation();
      var open = hs.classList.contains("open");
      document.querySelectorAll(".hs.open").forEach(function (o) { o.classList.remove("open"); });
      if (!open) hs.classList.add("open");
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".hs.open").forEach(function (o) { o.classList.remove("open"); });
  });
  // compaiono mentre si scorre, uno dopo l'altro
  var hsIo = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        var h = e.target.querySelector(":scope > .hs");
        if (h) setTimeout(function () { h.classList.add("show"); }, 250);
        hsIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  hsEls.forEach(function (el) { hsIo.observe(el); });
  // fissi (WhatsApp, cookie): subito visibili
  document.querySelectorAll(".wa > .hs").forEach(function (h) { setTimeout(function () { h.classList.add("show"); }, 900); });

  // interruttore nella barra demo (ricordato tra le pagine)
  var sw = document.getElementById("hs-toggle");
  function setHs(on) {
    document.documentElement.classList.toggle("hs-off", !on);
    if (sw) sw.checked = on;
    try { localStorage.setItem("demo-hs", on ? "1" : "0"); } catch (e) {}
  }
  var saved = "1";
  try { saved = localStorage.getItem("demo-hs") || "1"; } catch (e) {}
  setHs(saved === "1");
  if (sw) sw.addEventListener("change", function () { setHs(sw.checked); });

  /* ---------- confronto prima/dopo ---------- */
  document.querySelectorAll(".ba input").forEach(function (r) {
    var set = function () { r.parentElement.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", set); set();
  });

  /* ---------- filtri dei lavori (pagine senza negozio) ---------- */
  if (!window.SHOP) document.querySelectorAll(".cats button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".cats button").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      var c = b.dataset.cat;
      document.querySelectorAll("[data-cat]").forEach(function (p) { if (p.tagName !== "BUTTON") p.style.display = (!c || p.dataset.cat === c) ? "" : "none"; });
    });
  });

  /* ---------- menu su telefono ---------- */
  var burger = document.querySelector(".burger"), nav = document.querySelector(".nav");
  if (burger && nav) burger.addEventListener("click", function () { nav.classList.toggle("open"); });

  /* ---------- banner dei consensi (dimostrativo, nessun cookie) ---------- */
  var ck = document.querySelector(".cookie");
  if (ck) {
    var seen = false;
    try { seen = sessionStorage.getItem("demo-ck") === "1"; } catch (e) {}
    if (seen) ck.remove();
    else setTimeout(function () {
      ck.classList.add("show");
      var h = ck.querySelector(":scope > .hs");
      if (h) setTimeout(function () { h.classList.add("show"); }, 400);
    }, 2500); // compare dopo che si è iniziato a guardare la pagina
    ck.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { try { sessionStorage.setItem("demo-ck", "1"); } catch (e) {} ck.remove(); });
    });
  }

  /* ---------- seconda lingua ---------- */
  var langBtns = document.querySelectorAll(".lang button");
  function setLang(l) {
    document.querySelectorAll("[data-" + l + "]").forEach(function (el) {
      if (!el.dataset.it) el.dataset.it = el.innerHTML;
      el.innerHTML = el.getAttribute("data-" + l);
    });
    if (l === "it") document.querySelectorAll("[data-it]").forEach(function (el) { el.innerHTML = el.dataset.it; });
    langBtns.forEach(function (b) { b.classList.toggle("on", b.dataset.l === l); });
    try { localStorage.setItem("demo-lang-" + location.pathname.split("/").slice(-2, -1)[0], l); } catch (e) {}
  }
  langBtns.forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.l); }); });
  try {
    var sl = localStorage.getItem("demo-lang-" + location.pathname.split("/").slice(-2, -1)[0]);
    if (sl && sl !== "it") setLang(sl);
  } catch (e) {}

  /* ---------- prenotazione online (dimostrativa) ---------- */
  document.querySelectorAll(".booking").forEach(function (bk) {
    var pick = function (sel) {
      bk.querySelectorAll(sel).forEach(function (b) {
        b.addEventListener("click", function () {
          bk.querySelectorAll(sel).forEach(function (x) { x.classList.remove("on"); });
          b.classList.add("on");
        });
      });
    };
    pick(".days button"); pick(".slots button");
    var go = bk.querySelector(".book-go"), ok = bk.querySelector(".booking-ok");
    if (go && ok) go.addEventListener("click", function () {
      var d = bk.querySelector(".days button.on"), s = bk.querySelector(".slots button.on");
      ok.textContent = (d && s) ? "✓ Prenotazione confermata: " + d.textContent.trim().replace(/\s+/, " ") + " alle " + s.textContent + ". Ti arriva una email e un promemoria il giorno prima." : "Scegli un giorno e un orario.";
      ok.style.display = "block";
    });
  });

  /* ---------- moduli di contatto dimostrativi ---------- */
  document.querySelectorAll("form.form").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var btn = f.querySelector("button[type=submit]");
      if (btn) { btn.textContent = f.getAttribute("data-ok") || "✓ Richiesta inviata"; btn.disabled = true; }
    });
  });

  /* ---------- negozio: filtri, scheda prodotto, carrello ---------- */
  var SHOP = window.SHOP;
  if (!SHOP) return;
  var KEY = "demo-cart-" + SHOP.slug;
  function cart() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} badge(); }
  function eur(n) { return n.toFixed(2).replace(".", ",") + " €"; }
  function badge() {
    var n = cart().reduce(function (a, i) { return a + i.q; }, 0);
    document.querySelectorAll(".cart-count").forEach(function (b) { b.textContent = n; b.style.display = n ? "" : "none"; });
  }
  badge();

  // filtri categoria
  document.querySelectorAll(".cats button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".cats button").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      var c = b.dataset.cat;
      document.querySelectorAll(".products .product").forEach(function (p) { p.style.display = (!c || p.dataset.cat === c) ? "" : "none"; });
    });
  });

  // scheda prodotto
  var pdp = document.getElementById("pdp");
  if (pdp) {
    var id = new URLSearchParams(location.search).get("id") || SHOP.products[0].id;
    var p = SHOP.products.find(function (x) { return x.id === id; }) || SHOP.products[0];
    pdp.querySelector("img").src = p.img;
    pdp.querySelector("img").alt = p.name;
    pdp.querySelector("h1").textContent = p.name;
    pdp.querySelector(".pr").textContent = eur(p.price);
    pdp.querySelector(".desc").textContent = p.desc;
    document.title = p.name + " · " + SHOP.name;
    var q = 1, qs = pdp.querySelector(".qty span");
    pdp.querySelectorAll(".qty button").forEach(function (b) {
      b.addEventListener("click", function () { q = Math.max(1, q + (b.textContent === "+" ? 1 : -1)); qs.textContent = q; });
    });
    pdp.querySelector(".add").addEventListener("click", function () {
      var c = cart(), it = c.find(function (i) { return i.id === p.id; });
      if (it) it.q += q; else c.push({ id: p.id, q: q });
      save(c);
      this.textContent = "✓ Aggiunto al carrello";
    });
  }

  // carrello
  var ct = document.getElementById("cart");
  if (ct) {
    var render = function () {
      var c = cart();
      var body = ct.querySelector("tbody");
      if (!c.length) {
        ct.querySelector(".cart-items").innerHTML = '<div class="empty">Il carrello è vuoto. <a href="negozio.html">Vai al negozio →</a></div>';
      } else {
        body.innerHTML = c.map(function (i) {
          var p = SHOP.products.find(function (x) { return x.id === i.id; });
          return "<tr><td><img src='" + p.img + "' alt=''></td><td><b>" + p.name + "</b><br><small>" + eur(p.price) + "</small></td><td>× " + i.q + "</td><td style='text-align:right'><b>" + eur(p.price * i.q) + "</b></td></tr>";
        }).join("");
      }
      var sub = c.reduce(function (a, i) { var p = SHOP.products.find(function (x) { return x.id === i.id; }); return a + p.price * i.q; }, 0);
      var ship = sub === 0 ? 0 : (sub >= SHOP.freeShip ? 0 : SHOP.ship);
      ct.querySelector(".sub").textContent = eur(sub);
      ct.querySelector(".ship").textContent = ship ? eur(ship) : "gratis";
      ct.querySelector(".tot b").textContent = eur(sub + ship);
    };
    render();
    var dc = ct.querySelector(".discount button");
    if (dc) dc.addEventListener("click", function () { dc.textContent = "✓ Codice applicato"; });
  }
})();
