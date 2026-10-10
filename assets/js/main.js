(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* header state + back-to-top */
  var header = $(".site-header"), toTop = $("#to-top");
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* mobile nav */
  var toggle = $("#nav-toggle"), links = $("#nav-links");
  function setNav(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.firstElementChild.className = "bi " + (open ? "bi-x" : "bi-list");
  }
  toggle.addEventListener("click", function () { setNav(!links.classList.contains("open")); });
  $$("a", links).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });

  /* active nav link */
  var sections = $$("main section[id]");
  var navMap = {};
  $$("a", links).forEach(function (a) { navMap[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && navMap[en.target.id]) {
          $$("a", links).forEach(function (a) { a.classList.remove("active"); });
          navMap[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });

    /* reveal on scroll */
    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { rv.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* count-up for hero numbers */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1100, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          el.textContent = v + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .6 });
    $$("[data-count]").forEach(function (el) { co.observe(el); });
  }

  /* project filters */
  var fbtns = $$(".filters button"), cards = $$("#proj-grid .proj");
  fbtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.filter;
      fbtns.forEach(function (x) { x.classList.toggle("on", x === b); });
      cards.forEach(function (c) {
        var show = f === "all" || c.dataset.cat.split(" ").indexOf(f) > -1;
        c.classList.toggle("hide", !show);
        if (show) c.classList.add("in");
      });
    });
  });

  /* lightbox */
  var lb = $("#lightbox"), lbImg = $("img", lb), lastFocus = null;
  function openLb(src, alt) {
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = alt || "";
    lb.classList.add("open"); document.body.style.overflow = "hidden";
    $("button", lb).focus();
  }
  function closeLb() {
    lb.classList.remove("open"); lbImg.removeAttribute("src"); document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-zoom]");
    if (t) { var im = $("img", t); openLb(t.dataset.zoom, im ? im.alt : ""); }
  });
  lb.addEventListener("click", closeLb);
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { if (lb.classList.contains("open")) closeLb(); setNav(false); }
  });

  /* contact form: opens the visitor's email client with the message filled in */
  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var body = "Name: " + d.get("name") + "\nEmail: " + d.get("email") + "\n\n" + d.get("message");
      window.location.href = "mailto:hassan@digitalwasfa.com?subject=" + encodeURIComponent(d.get("subject")) + "&body=" + encodeURIComponent(body);
    });
  }

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
})();
