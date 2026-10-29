/* ASMR detailing studio. Ванильный JS: плиты и укладка плёнки на кадр, меню, якоря, язык, счётчики, форма в WhatsApp. */
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
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var VW = W.innerWidth, VH = W.innerHeight;

  /* ---------- WhatsApp: один номер, текст по ключу кнопки ---------- */
  var PHONE = "77470550465";
  var WA = {
    ru: {
      "default": "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу забронировать кузов плёнкой. Автомобиль: ",
      hero: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу рассчитать стоимость бронирования. Автомобиль: ",
      menu: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу рассчитать стоимость бронирования. Автомобиль: ",
      sticky: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу рассчитать стоимость бронирования. Автомобиль: ",
      kontakty: "Здравствуйте! Пишу с сайта ASMR detailing studio. Хочу записать автомобиль на оклейку. Автомобиль: ",
      lux: "Здравствуйте! Интересует Люкс пакет (защита передней части). Подскажите стоимость и ближайший день. Автомобиль: ",
      ultra: "Здравствуйте! Интересует Ultra пакет (передняя часть и четыре двери). Подскажите стоимость и ближайший день. Автомобиль: ",
      vkrug: "Здравствуйте! Интересует оклейка в круг. Подскажите стоимость и ближайший день. Автомобиль: ",
      cvet: "Здравствуйте! Интересует замена цвета с защитой кузова (оклейка в круг). Кузов: {m}. Цвет: {c}. Подскажите стоимость. Автомобиль: "
    }
  };
  var FORM_LABELS = {
    ru: { head: "Заявка с сайта ASMR detailing studio", name: "Имя", phone: "Телефон", car: "Автомобиль", pkg: "Пакет", lux: "Люкс пакет", ultra: "Ultra пакет", vkrug: "Оклейка в круг", cvet: "Замена цвета", any: "Нужна консультация" }
  };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var dict = WA[LANG] || WA.ru;
    var text = dict[key] || WA.ru[key] || WA.ru["default"];
    text = text.replace("{c}", a.getAttribute("data-wa-c") || "").replace("{m}", a.getAttribute("data-wa-m") || "");
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
  /* ---------- Пакеты: одна плита, вкладки; якоря #lux #ultra #vkrug открывают свою вкладку ---------- */
  var PK = { lux: 1, ultra: 1, vkrug: 1 };
  function selectPk(id, focus) {
    [].forEach.call(doc.querySelectorAll(".pk-tab"), function (b) {
      var on = b.getAttribute("data-pk") === id;
      b.classList.toggle("is-on", on); b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    [].forEach.call(doc.querySelectorAll(".pk-panel, .pk-media"), function (p) { p.hidden = p.getAttribute("data-pk") !== id; });
  }
  [].forEach.call(doc.querySelectorAll(".pk-tab"), function (b, i, all) {
    b.tabIndex = b.classList.contains("is-on") ? 0 : -1;
    b.addEventListener("click", function () { selectPk(b.getAttribute("data-pk")); });
    b.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      selectPk(all[(i + d + all.length) % all.length].getAttribute("data-pk"), true);
    });
  });
  function goTo(id, instant) {
    if (PK[id]) { selectPk(id); id = "pakety"; }
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
      var t = PK[id] ? doc.getElementById("t-" + id) : doc.getElementById(id);
      if (t) { if (!t.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) t.setAttribute("tabindex", "-1"); try { t.focus({ preventScroll: true }); } catch (err2) {} }
    }
  });

  /* ---------- Плиты: enter / stay / exit и укладка плёнки --open ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false;
  var st = pws.map(function () { return { open: -1, out: {} }; });
  var lastTs = 0;
  function put(el, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; el.style.setProperty(k, v); } }
  function markDone(phs, done) { for (var p = 0; p < phs.length; p++) phs[p].classList.toggle("done", done); }
  function update(ts) {
    ticking = false;
    var now = typeof ts === "number" ? ts : performance.now();
    var dt = lastTs ? Math.min(64, now - lastTs) : 16.7; lastTs = now;
    var k = 1 - Math.pow(1 - 0.15, dt / 16.7);
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
      var open;
      if (isHero) open = REDUCED ? 1 : smooth(INTRO);
      else open = REDUCED ? 1 : (flow ? smooth((enter - 0.18) / 0.5) : smooth((enter - 0.3) / 0.58));
      if (s.open < 0 || REDUCED || isHero) s.open = open;
      else {
        s.open += (open - s.open) * k;
        if (Math.abs(open - s.open) > 0.002) moving = true; else s.open = open;
      }
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", (isHero ? easeOut(stay) : stay).toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      put(pw, s, "--open", s.open.toFixed(4));
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1 && !flow);
      if (!s.phs) s.phs = pw.querySelectorAll(".ph");
      var done = s.open >= 0.999;
      if (s.done !== done) { s.done = done; markDone(s.phs, done); }
      if (!s.txts) s.txts = pw.querySelectorAll(".txt, .hero-txt");
      var on = isHero ? INTRO > 0.1 : (flow ? enter > 0.22 : enter > 0.58);
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
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; fitAll(); }
    else if (!TOUCH) { VH = W.innerHeight; }
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart) / 1600);
    update(ts);
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Кадры каталожных секций: плёнка ложится при появлении ---------- */
  var secPh = [].slice.call(doc.querySelectorAll(".sec .ph"));
  secPh.forEach(function (ph) { if (REDUCED) { ph.style.setProperty("--open", "1"); ph.classList.add("done"); } else ph.style.setProperty("--open", "0"); });
  function layPh(ph) {
    if (ph.getAttribute("data-done")) return;
    ph.setAttribute("data-done", "1");
    var t0 = 0;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = smooth((ts - t0) / 1100);
      ph.style.setProperty("--open", p.toFixed(4));
      if (p < 1) requestAnimationFrame(step); else ph.classList.add("done");
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
    if (getComputedStyle(el).whiteSpace !== "nowrap") return;
    var base = parseFloat(getComputedStyle(el).fontSize), size = base, guard = 0;
    while (el.scrollWidth > el.clientWidth + 1 && guard < 12) { size *= 0.95; el.style.fontSize = size.toFixed(1) + "px"; guard++; }
  }
  function fitAll() { fits.forEach(fitOne); }

  /* ---------- Бегущая лента героя: вторая копия для бесшовного цикла ---------- */
  var bandT = doc.getElementById("bandT");
  if (bandT) bandT.innerHTML += bandT.innerHTML;

  var cvSync = null; /* блок «Замена цвета», задаётся ниже */

  /* ---------- Язык: RU в разметке, KZ подгружается отдельным файлом по кнопке ---------- */
  var I18N = { ru: {} };
  var RU = I18N.ru;
  var iEls = [].slice.call(doc.querySelectorAll("[data-i]"));
  var phEls = [].slice.call(doc.querySelectorAll("[data-i-ph]"));
  var ariaEls = [].slice.call(doc.querySelectorAll("[data-i-aria]"));
  var altEls = [].slice.call(doc.querySelectorAll("[data-i-alt]"));
  var titleEls = [].slice.call(doc.querySelectorAll("[data-i-title]"));
  var metaDesc = doc.querySelector('meta[name="description"]');
  iEls.forEach(function (el) { var k = el.getAttribute("data-i"); if (RU[k] == null) RU[k] = el.innerHTML; });
  phEls.forEach(function (el) { RU[el.getAttribute("data-i-ph")] = el.getAttribute("placeholder"); });
  ariaEls.forEach(function (el) { RU[el.getAttribute("data-i-aria")] = el.getAttribute("aria-label"); });
  altEls.forEach(function (el) { RU[el.getAttribute("data-i-alt")] = el.getAttribute("alt"); });
  titleEls.forEach(function (el) { RU[el.getAttribute("data-i-title")] = el.getAttribute("title"); });
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
    titleEls.forEach(function (el) { var v = t(el.getAttribute("data-i-title")); if (v != null) el.setAttribute("title", v); });
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
    if (cvSync) cvSync();
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
    [].forEach.call(el.querySelectorAll(".ph"), layPh);
    if (el.classList.contains("ph")) layPh(el);
    runCounters(el);
  }
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (!x.isIntersecting) return; showRv(x.target); io.unobserve(x.target); });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) showRv(el); }); }, 1500);
  } else { rv.forEach(function (el) { el.classList.add("in"); runCounters(el); }); secPh.forEach(function (ph) { ph.style.setProperty("--open", "1"); ph.classList.add("done"); }); }

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
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitAll(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  /* Замена цвета: тип кузова и образец плёнки выбирают кадр, кадры меняются растворением */
  (function () {
    var stage = doc.querySelector(".cv-stage");
    if (!stage) return;
    var imgs = stage.querySelectorAll(".cv-img"), sws = [].slice.call(doc.querySelectorAll(".cv-sw"));
    var tabs = [].slice.call(doc.querySelectorAll(".cv-tab"));
    var cur = doc.querySelector(".cv-cur"), btn = doc.querySelector('a[data-wa="cvet"]');
    var ver = (imgs[0].getAttribute("src").match(/\?v=[^&]+/) || [""])[0];
    var front = 0, key = sws[0].getAttribute("data-c"), model = tabs.length ? tabs[0].getAttribute("data-m") : "sedan";
    var want = model + "-" + key;
    function src(f) { return "assets/cvet/" + f + ".webp" + ver; }
    cvSync = function () {
      var n = t("cv.c." + key), m = t("cv.m." + model);
      cur.textContent = n;
      if (btn) { btn.setAttribute("data-wa-c", n); btn.setAttribute("data-wa-m", m); }
      imgs[front].alt = m + ". " + t("cv.alt") + ", " + t("cv.lbl").toLowerCase() + ": " + n;
      imgs[1 - front].alt = "";
    };
    function check(list, attr, v, focus) {
      list.forEach(function (b) {
        var on = b.getAttribute(attr) === v;
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
    }
    function show() {
      var f = model + "-" + key;
      if (f === want) return;
      want = f;
      var back = imgs[1 - front], was = imgs[front];
      function swap() {
        if (want !== f) return;
        back.classList.add("is-on"); was.classList.remove("is-on");
        back.removeAttribute("aria-hidden"); was.setAttribute("aria-hidden", "true");
        front = 1 - front; cvSync();
      }
      if (back.getAttribute("src") === src(f) && back.complete) swap();
      else { back.onload = swap; back.src = src(f); }
      cvSync();
    }
    function pick(k, focus) { check(sws, "data-c", k, focus); key = k; show(); }
    function pickModel(m, focus) { check(tabs, "data-m", m, focus); model = m; show(); preload(); }
    function keys(list, attr, fn) {
      list.forEach(function (b, i) {
        b.addEventListener("click", function () { fn(b.getAttribute(attr)); });
        b.addEventListener("keydown", function (e) {
          var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
          if (!d) return;
          e.preventDefault();
          fn(list[(i + d + list.length) % list.length].getAttribute(attr), true);
        });
      });
    }
    keys(sws, "data-c", pick);
    keys(tabs, "data-m", pickModel);
    /* цвета выбранного кузова грузим заранее, когда блок близко к экрану */
    var near = false, done = {};
    function preload() {
      if (!near || done[model]) return;
      done[model] = 1;
      sws.forEach(function (b) { var im = new Image(); im.src = src(model + "-" + b.getAttribute("data-c")); });
    }
    if ("IntersectionObserver" in W) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        near = true; preload();
      }, { rootMargin: "600px 0px" });
      io.observe(stage);
    }
    cvSync();
  })();

  update();
})();

/* Схема пакета: наведение на пункт расшифровки подсвечивает номер на фото (в пределах своей карточки) */
document.querySelectorAll('.zcard').forEach(function (pw) {
  function mark(n, on) {
    pw.querySelectorAll('[data-n="' + n + '"]').forEach(function (el) { el.classList.toggle('on', on); });
  }
  pw.querySelectorAll('.zc-leg li[data-n]').forEach(function (li) {
    li.addEventListener('mouseenter', function () { mark(li.dataset.n, true); });
    li.addEventListener('mouseleave', function () { mark(li.dataset.n, false); });
  });
});
