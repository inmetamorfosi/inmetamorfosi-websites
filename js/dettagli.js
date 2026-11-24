/* inMetamorfosi Websites — pagina dei dettagli: il referente nei contatti */
(function () {
  "use strict";
  var who = { ref: "", tel: "" };
  try { who = Object.assign(who, JSON.parse(localStorage.getItem("imw-cliente") || "{}")); } catch (e) {}
  var qs = new URLSearchParams(location.search);
  ["ref", "tel"].forEach(function (k) { if (qs.get(k)) who[k] = qs.get(k).trim(); });
  var d = (who.tel || "").replace(/\D/g, "");
  if (d.indexOf("00") === 0) d = d.slice(2);
  if (d.charAt(0) === "3" && d.length <= 10) d = "39" + d;
  var num = d.length >= 10 ? d : "", name = who.ref || "";
  var refName = document.getElementById("ref-name");
  if (refName && name) refName.textContent = name;
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.setAttribute("href", "https://wa.me/" + (num || "393888174824") + "?text=" + encodeURIComponent("Ciao, vorrei informazioni per il mio sito"));
    a.textContent = (num && name ? "Scrivi a " + name + " su WhatsApp" : "Scrivici su WhatsApp") + " →";
  });
  var tel = document.getElementById("ref-tel");
  if (tel && num) { tel.hidden = false; tel.setAttribute("href", "tel:+" + num); tel.textContent = name ? "Chiama " + name : "Chiama"; }
  /* comparsa morbida mentre si scorre */
  var RV = ".head, .pack, .included, .xcols > div, .own-head, .own-list > div, .steps li, .when, .pledge, .faq, .close > *";
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; rio.unobserve(el); el.classList.add("in");
        setTimeout(function () { el.classList.remove("rv"); el.style.removeProperty("--d"); }, 1500);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(RV).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      var sib = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.matches(RV); });
      el.style.setProperty("--d", Math.min(sib.indexOf(el), 4) * 0.08 + "s");
      el.classList.add("rv"); rio.observe(el);
    });
  }

  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (window.dataLayer) window.dataLayer.push({ event: "cta_click", cta: el.getAttribute("data-cta"), page: "websites-dettagli" });
    });
  });
})();
