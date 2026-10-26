/* ASMR detailing studio. Ванильный JS: плиты и самозатягивание царапин, меню, якоря, язык, счётчики, форма в WhatsApp. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");
  var ASSET_V = ((doc.currentScript && doc.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";
  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var smooth = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  var LANG = "ru";
  var MOBILE = W.matchMedia("(max-width:760px)").matches;
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var VW = W.innerWidth, VH = W.innerHeight;

  /* ---------- WhatsApp: один номер, текст по ключу кнопки ---------- */
  var PHONE = "77470550465";
  var WA = {
    ru: {
      "default": "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу забронировать кузов плёнкой. Машина: ",
      hero: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу рассчитать стоимость оклейки. Машина: ",
      menu: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу рассчитать стоимость оклейки. Машина: ",
      sticky: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу рассчитать стоимость оклейки. Машина: ",
      kontakty: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу записать машину на оклейку. Машина: ",
      lux: "Здравствуйте! Интересует Люкс пакет (оклейка передней части). Подскажите цену и ближайший день. Машина: ",
      vkrug: "Здравствуйте! Интересует оклейка в круг. Подскажите цену и ближайший день. Машина: "
    }
  };
  var FORM_LABELS = {
    ru: { head: "Заявка с сайта ASMR detailing studio", name: "Имя", phone: "Телефон", car: "Машина", pkg: "Пакет", lux: "Люкс пакет", vkrug: "В круг", any: "Пока не выбрал" }
  };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var dict = WA[LANG] || WA.ru;
    var text = dict[key] || WA.ru[key] || WA.ru["default"];
    a.setAttribute("href", "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text));
  }, true);

  /* ---------- Конверсии Google Ads: gtag подключается на этапе деплоя, здесь только вызовы ---------- */
  function fireConv(key) {
    if (typeof W.gtag_report_conversion !== "function" || !W.AW_CONV) return;
    var sendTo = W.AW_CONV[key];
    if (sendTo) W.gtag_report_conversion(undefined, sendTo);
  }
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"], a[href*="wa.me"], a[href^="mailto:"]') : null;
    if (!a) return;
    fireConv(a.getAttribute("href").indexOf("tel:") === 0 ? "phone" : "contact");
  }, true);

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.querySelector(".foot"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    if (open === was) return;
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("open"); });
      setTimeout(function () { var first = menu.querySelector("a"); if (first) first.focus({ preventScroll: true }); }, 60);
    } else {
      menu.classList.remove("open");
      setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 340);
      if (returnFocus) burger.focus({ preventScroll: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 72; };
  function flowPlate(pw) {
    var plate = pw.firstElementChild;
    return !plate || getComputedStyle(plate).position !== "sticky";
  }
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.classList.contains("pw")) return flowPlate(el) ? r - HDR() : r;
    if (el.classList.contains("sec")) return r - HDR();
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
      var t = doc.getElementById(id);
      if (t) { if (!t.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) t.setAttribute("tabindex", "-1"); try { t.focus({ preventScroll: true }); } catch (err2) {} }
    }
  });

  /* ---------- Царапины: сетка коротких штрихов, каждый затягивается к своей середине ---------- */
  var SVG_NS = "http://www.w3.org/2000/svg";
  function seeded(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  var scrs = [].slice.call(doc.querySelectorAll(".scr"));
  scrs.forEach(function (svg, idx) {
    var rnd = seeded(97 + idx * 131);
    var n = svg.closest(".ph-hero") ? 54 : 38;
    var frag = doc.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var x = rnd() * 100, y = rnd() * 100;
      var len = 3 + rnd() * 11;
      var ang = (rnd() < 0.55 ? -38 : 32) + (rnd() - 0.5) * 50;
      var rad = ang * Math.PI / 180;
      var dx = Math.cos(rad) * len / 2, dy = Math.sin(rad) * len / 2;
      var l = doc.createElementNS(SVG_NS, "line");
      l.setAttribute("x1", (x - dx).toFixed(2)); l.setAttribute("y1", (y - dy).toFixed(2));
      l.setAttribute("x2", (x + dx).toFixed(2)); l.setAttribute("y2", (y + dy).toFixed(2));
      l.setAttribute("pathLength", "1");
      /* задержка по диагонали: тёплое пятно идёт из левого верхнего угла */
      var d = ((x + y) / 200) * 0.5 + rnd() * 0.12;
      l.style.setProperty("--d", d.toFixed(3));
      frag.appendChild(l);
    }
    svg.appendChild(frag);
  });

  /* ---------- Плиты: enter / stay / exit, самозатягивание --heal ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false;
  var st = pws.map(function () { return { heal: -1, out: {} }; });
  var lastTs = 0;
  function put(el, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; el.style.setProperty(k, v); } }
  function update(ts) {
    ticking = false;
    var now = typeof ts === "number" ? ts : performance.now();
    var dt = lastTs ? Math.min(64, now - lastTs) : 16.7; lastTs = now;
    var k = 1 - Math.pow(1 - 0.16, dt / 16.7);
    var H = VH;
    var pageY = W.pageYOffset;
    var kontTop = kont ? kont.getBoundingClientRect().top : null;
    var rects = [], nxtTops = [], i;
    for (i = 0; i < pws.length; i++) {
      rects.push(pws[i].getBoundingClientRect());
      var nx = pws[i].nextElementSibling;
      nxtTops.push(nx ? nx.getBoundingClientRect().top : null);
    }
    var moving = false;
    for (i = 0; i < pws.length; i++) {
      var pw = pws[i], r = rects[i], s = st[i];
      var near = r.bottom > -H * 0.5 && r.top < H * 1.5;
      if (!near && s.out["--enter"] !== undefined && !s.reset) { s.reset = true; } else if (near) s.reset = false;
      if (!near && s.reset) continue;
      var flow = flowPlate(pw);
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H ? clamp(-r.top / (r.height - H)) : 0;
      var exit = (nxtTops[i] !== null && !flow) ? clamp(1 - nxtTops[i] / H) : 0;
      var isHero = pw.classList.contains("pw-hero");
      var heal;
      if (isHero) heal = REDUCED ? 1 : smooth(INTRO);
      else heal = REDUCED ? 1 : (flow ? smooth((enter - 0.22) / 0.5) : smooth((enter - 0.28) / 0.6));
      if (s.heal < 0 || REDUCED || isHero) s.heal = heal;
      else {
        s.heal += (heal - s.heal) * k;
        if (Math.abs(heal - s.heal) > 0.002) moving = true; else s.heal = heal;
      }
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", (isHero ? easeOut(stay) : stay).toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      put(pw, s, "--heal", s.heal.toFixed(4));
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1 && !flow);
      if (!s.phs) s.phs = pw.querySelectorAll(".ph");
      var healed = s.heal >= 0.999;
      if (s.healed !== healed) { s.healed = healed; for (var p = 0; p < s.phs.length; p++) s.phs[p].classList.toggle("healed", healed); }
      if (!s.txts) s.txts = pw.querySelectorAll(".txt, .hero-txt");
      var on = isHero ? INTRO > 0.12 : (flow ? enter > 0.25 : enter > 0.6);
      if (s.on !== on) { s.on = on; for (var t = 0; t < s.txts.length; t++) s.txts[t].classList.toggle("on", on); }
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (kontTop !== null && kontTop < H * 0.5) show = false;
      sticky.classList.toggle("show", show);
    }
    if (hdr) hdr.classList.toggle("scrolled", pageY > 12);
    if (moving) onScroll();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    /* на телефоне смена только высоты - это адресная строка: раскладку не пересчитываем */
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; MOBILE = W.matchMedia("(max-width:760px)").matches; fitAll(); }
    else if (!TOUCH) { VH = W.innerHeight; }
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart) / 1700);
    update(ts);
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Кадры каталожных секций: затягивание при появлении ---------- */
  var secPh = [].slice.call(doc.querySelectorAll(".sec .ph"));
  secPh.forEach(function (ph) { ph.style.setProperty("--heal", REDUCED ? "1" : "0"); if (REDUCED) ph.classList.add("healed"); });
  function healPh(ph) {
    if (ph.getAttribute("data-done")) return;
    ph.setAttribute("data-done", "1");
    var t0 = 0;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = smooth((ts - t0) / 1500);
      ph.style.setProperty("--heal", p.toFixed(4));
      if (p < 1) requestAnimationFrame(step); else ph.classList.add("healed");
    }
    requestAnimationFrame(step);
  }

  /* ---------- Счётчики ---------- */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function runCounters(scope) {
    [].forEach.call(scope.querySelectorAll(".cnt[data-count]"), function (el) {
      if (el.getAttribute("data-done")) return;
      el.setAttribute("data-done", "1");
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      if (REDUCED) { el.textContent = fmt(target); return; }
      var t0 = 0;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = easeOut(clamp((ts - t0) / 1600));
        el.textContent = fmt(target * p);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Подгонка дисплейных заголовков: кегль вниз шагом 5%, пока не влезает ---------- */
  var fits = [].slice.call(doc.querySelectorAll(".fit"));
  function fitOne(el) {
    el.style.fontSize = "";
    var base = parseFloat(getComputedStyle(el).fontSize), size = base, guard = 0;
    while (el.scrollWidth > el.clientWidth + 1 && guard < 12) { size *= 0.95; el.style.fontSize = size.toFixed(1) + "px"; guard++; }
  }
  function fitAll() { fits.forEach(fitOne); }

  /* ---------- Видео героя: только десктоп, после загрузки страницы, без экономии трафика ---------- */
  var heroVideo = doc.querySelector(".hero-video"), heroPh = doc.querySelector(".ph-hero");
  function startHeroVideo() {
    if (!heroVideo || MOBILE || REDUCED) return;
    var conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))) return;
    heroVideo.addEventListener("playing", function () { if (heroPh) heroPh.classList.add("is-live"); });
    heroVideo.src = "assets/hero.mp4" + (ASSET_V ? "?v=" + ASSET_V : "");
    var p = heroVideo.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* ---------- Бегущая лента героя: вторая копия для бесшовного цикла ---------- */
  var bandT = doc.getElementById("bandT");
  if (bandT) bandT.innerHTML += bandT.innerHTML;

  /* ---------- Язык: RU в разметке, KZ подгружается отдельным файлом по кнопке ---------- */
  var I18N = { ru: {} };
  var RU = I18N.ru;
  var iEls = [].slice.call(doc.querySelectorAll("[data-i]"));
  var phEls = [].slice.call(doc.querySelectorAll("[data-i-ph]"));
  var ariaEls = [].slice.call(doc.querySelectorAll("[data-i-aria]"));
  var altEls = [].slice.call(doc.querySelectorAll("[data-i-alt]"));
  var metaDesc = doc.querySelector('meta[name="description"]');
  iEls.forEach(function (el) { var k = el.getAttribute("data-i"); if (RU[k] == null) RU[k] = el.innerHTML; });
  phEls.forEach(function (el) { RU[el.getAttribute("data-i-ph")] = el.getAttribute("placeholder"); });
  ariaEls.forEach(function (el) { RU[el.getAttribute("data-i-aria")] = el.getAttribute("aria-label"); });
  altEls.forEach(function (el) { RU[el.getAttribute("data-i-alt")] = el.getAttribute("alt"); });
  RU["meta.title"] = doc.title;
  RU["meta.desc"] = metaDesc ? metaDesc.getAttribute("content") : "";
  function t(key) { var d = I18N[LANG] || RU; return d[key] != null ? d[key] : RU[key]; }
  function applyLang(lang) {
    if (!I18N[lang]) lang = "ru";
    LANG = lang;
    iEls.forEach(function (el) { var v = t(el.getAttribute("data-i")); if (v != null) el.innerHTML = v; });
    phEls.forEach(function (el) { var v = t(el.getAttribute("data-i-ph")); if (v != null) el.setAttribute("placeholder", v); });
    ariaEls.forEach(function (el) { var v = t(el.getAttribute("data-i-aria")); if (v != null) el.setAttribute("aria-label", v); });
    altEls.forEach(function (el) { var v = t(el.getAttribute("data-i-alt")); if (v != null) el.setAttribute("alt", v); });
    doc.title = t("meta.title");
    if (metaDesc) metaDesc.setAttribute("content", t("meta.desc"));
    root.setAttribute("lang", lang);
    [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (bandT && bandT.children.length) { var half = bandT.children.length / 2; while (bandT.children.length > half) bandT.removeChild(bandT.lastElementChild); bandT.innerHTML += bandT.innerHTML; }
    try { localStorage.setItem("asmr-lang", lang); } catch (e) {}
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitAll); else fitAll();
  }
  function loadLang(lang, done) {
    if (I18N[lang] || lang !== "kk") return done();
    var s = doc.createElement("script");
    s.src = "assets/lang/kk.js" + (ASSET_V ? "?v=" + ASSET_V : "");
    s.onload = function () {
      if (W.SITE_KK) {
        I18N.kk = W.SITE_KK;
        if (W.SITE_KK_WA) WA.kk = W.SITE_KK_WA;
        if (W.SITE_KK_FORM) FORM_LABELS.kk = W.SITE_KK_FORM;
      }
      done();
    };
    s.onerror = function () { done(); };
    doc.head.appendChild(s);
  }
  function setLang(lang) { loadLang(lang, function () { applyLang(lang); }); }
  [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  (function initLang() {
    /* ?lang= в адресе главнее сохранённого выбора: реклама ведёт на ?lang=ru */
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem("asmr-lang"); } catch (e) {}
    var lang = forced || saved || "ru";
    if (lang !== "ru") setLang(lang);
  })();

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  function showRv(el) {
    el.classList.add("in");
    [].forEach.call(el.querySelectorAll(".ph"), healPh);
    runCounters(el);
  }
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (!x.isIntersecting) return; showRv(x.target); io.unobserve(x.target); });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) showRv(el); }); }, 1500);
  } else { rv.forEach(function (el) { el.classList.add("in"); runCounters(el); }); secPh.forEach(function (ph) { ph.style.setProperty("--heal", "1"); ph.classList.add("healed"); }); }

  /* ---------- Форма -> WhatsApp ---------- */
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) { form.hidden = true; if (thanks) thanks.hidden = false; return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badPhone = phone.replace(/\D/g, "").length < 10;
      f.phone.classList.toggle("bad", badPhone);
      f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badPhone) { if (ferr) ferr.hidden = false; f.phone.focus(); return; }
      if (ferr) ferr.hidden = true;
      var L = FORM_LABELS[LANG] || FORM_LABELS.ru;
      var lines = [L.head];
      var pkg = (form.querySelector('input[name="pkg"]:checked') || {}).value || "any";
      lines.push(L.pkg + ": " + (L[pkg] || L.any));
      if (name) lines.push(L.name + ": " + name);
      lines.push(L.phone + ": " + phone);
      var car = f.car.value.trim();
      if (car) lines.push(L.car + ": " + car);
      var url = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(lines.join("\n"));
      fireConv("form");
      W.open(url, "_blank", "noopener");
      if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
      form.reset();
    });
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  function start() {
    fitAll();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      goTo(id, true);
      setTimeout(function () { goTo(id, true); update(); }, 60);
      setTimeout(function () { goTo(id, true); update(); }, 500);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
    setTimeout(startHeroVideo, 900);
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitAll(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  update();
})();
