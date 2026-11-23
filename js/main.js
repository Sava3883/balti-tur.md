(function () {
  // Элементы страницы
  var root = document.documentElement;
  var header = document.querySelector(".header");
  var nav = document.getElementById("nav");
  var burger = document.querySelector(".burger");
  var langButtons = document.querySelectorAll("[data-lang]");
  var chips = document.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll(".card[data-cat]");
  var titles = {
    ru: "Digital Bălți — туристический портал Бэлць",
    ro: "Digital Bălți — portalul turistic al orașului Bălți",
    en: "Digital Bălți — Bălți tourist portal"
  };

  // Языки RU / RO / EN
  function readLang() {
    try {
      return localStorage.getItem("db-lang");
    } catch (e) {
      return null;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem("db-lang", lang);
    } catch (e) {}
  }

  function setLang(lang) {
    if (!titles[lang]) {
      lang = "ru";
    }
    root.setAttribute("lang", lang);
    document.title = titles[lang];
    langButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("[data-alt-ru]").forEach(function (img) {
      img.setAttribute("alt", img.getAttribute("data-alt-" + lang) || "");
    });
    updateBurgerLabel();
    document.querySelectorAll(".fab-top, .header__actions .theme-btn").forEach(function (el) {
      var label = el.getAttribute("data-label-" + lang);
      if (label) {
        el.setAttribute("aria-label", label);
      }
    });
    saveLang(lang);
  }

  // Меню (телефон, планшет)
  function updateBurgerLabel() {
    if (!burger) {
      return;
    }
    var lang = root.getAttribute("lang");
    var open = burger.getAttribute("aria-expanded") === "true";
    var closeLabels = { ru: "Закрыть меню", ro: "Închide meniul", en: "Close menu" };
    var label = open ? closeLabels[lang] : burger.getAttribute("data-label-" + lang);
    burger.setAttribute("aria-label", label);
  }

  function toggleMenu(force) {
    var open = typeof force === "boolean" ? force : !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    updateBurgerLabel();
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-lang"));
    });
  });

  if (burger && nav) {
    burger.addEventListener("click", function () {
      toggleMenu();
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggleMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggleMenu(false);
        burger.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !burger.contains(e.target)) {
        toggleMenu(false);
      }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (mq) {
      if (mq.matches) {
        toggleMenu(false);
      }
    });
  }

  // Фильтр мест
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", active ? "true" : "false");
      });
      cards.forEach(function (card) {
        card.hidden = filter !== "all" && card.getAttribute("data-cat") !== filter;
      });
    });
  });

  // Тень шапки при прокрутке
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Год в подвале
  var year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  setLang(readLang() || "ru");

  // Кнопка «Наверх» — после прокрутки
  var fab = document.querySelector(".fab-top");
  function onFab() {
    if (fab) {
      fab.classList.toggle("is-visible", window.scrollY > 600);
    }
  }
  window.addEventListener("scroll", onFab, { passive: true });
  onFab();

  // Анимации появления блоков
  var revealItems = document.querySelectorAll(".section__head, .card, .video, .stay__col, .info-card, .timeline li, .fact, .event, .history__figure, .events__figure");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add("is-in");
          observer.unobserve(el);
          setTimeout(function () {
            el.classList.remove("reveal", "is-in");
            el.style.removeProperty("--d");
          }, 1100);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach(function (el) {
      var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(siblings, 6) * 0.06 + "s");
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  // Видео: YouTube загружается по нажатию
  document.querySelectorAll(".video__play[data-yt]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (location.protocol === "file:") {
        return;
      }
      event.preventDefault();
      var id = link.getAttribute("data-yt");
      var frame = document.createElement("div");
      frame.className = "video__frame";
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      iframe.title = link.closest(".video").querySelector(".video__title").textContent;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      frame.appendChild(iframe);
      link.replaceWith(frame);
    });
  });

  // Списки жилья и еды: затухание внизу
  document.querySelectorAll(".venues--scroll").forEach(function (list) {
    function onListScroll() {
      list.classList.toggle("is-end", list.scrollTop + list.clientHeight >= list.scrollHeight - 4);
    }
    list.addEventListener("scroll", onListScroll, { passive: true });
    onListScroll();
  });

  // Светлая / тёмная тема
  var themeButtons = document.querySelectorAll(".theme-btn");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#0E1726" : "#0D2552");
    }
    try {
      localStorage.setItem("db-theme", theme);
    } catch (e) {}
  }
  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem("db-theme");
  } catch (e) {}
  setTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  });

  // Форма партнёров
  var form = document.querySelector(".partner-form");
  var formTexts = {
    ru: { subject: "Digital Bălți — заявка партнёра", copied: "Текст скопирован. Отправьте его команде проекта.", needed: "Заполните название и контакт.", opened: "Открывается почтовая программа.", noMail: "Скопируйте текст и отправьте его команде проекта.", labels: ["Название", "Тип", "Адрес", "Контакт", "Сообщение"] },
    ro: { subject: "Digital Bălți — cerere de parteneriat", copied: "Textul a fost copiat. Trimiteți-l echipei proiectului.", needed: "Completați denumirea și contactul.", opened: "Se deschide aplicația de e-mail.", noMail: "Copiați textul și trimiteți-l echipei proiectului.", labels: ["Denumirea", "Tipul", "Adresa", "Contact", "Mesaj"] },
    en: { subject: "Digital Bălți — partner request", copied: "Text copied. Send it to the project team.", needed: "Please fill in the name and contact.", opened: "Opening your e-mail app.", noMail: "Copy the text and send it to the project team.", labels: ["Name", "Type", "Address", "Contact", "Message"] }
  };
  function currentLang() {
    return formTexts[root.getAttribute("lang")] ? root.getAttribute("lang") : "ru";
  }
  function translateOptions() {
    if (!form) {
      return;
    }
    var lang = currentLang();
    form.querySelectorAll("option").forEach(function (opt) {
      opt.textContent = opt.getAttribute("data-" + lang);
    });
  }
  function formMessage() {
    var t = formTexts[currentLang()];
    var select = form.elements.type;
    var values = [form.elements.name.value, select.options[select.selectedIndex].textContent, form.elements.address.value, form.elements.contact.value, form.elements.message.value];
    return values.map(function (v, i) {
      return t.labels[i] + ": " + v.trim();
    }).join("\n");
  }
  function formValid() {
    var ok = true;
    ["name", "contact"].forEach(function (n) {
      var field = form.elements[n];
      var bad = !field.value.trim();
      field.closest(".field").classList.toggle("is-invalid", bad);
      if (bad) {
        ok = false;
      }
    });
    return ok;
  }
  if (form) {
    var statusEl = form.querySelector(".partner-form__status");
    var mailBtn = form.querySelector(".partner-form__mail");
    var to = form.getAttribute("data-to");
    if (!to) {
      mailBtn.hidden = true;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = formTexts[currentLang()];
      if (!formValid()) {
        statusEl.textContent = t.needed;
        return;
      }
      if (!to) {
        statusEl.textContent = t.noMail;
        return;
      }
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(t.subject) + "&body=" + encodeURIComponent(formMessage());
      statusEl.textContent = t.opened;
    });
    form.querySelector(".partner-form__copy").addEventListener("click", function () {
      var t = formTexts[currentLang()];
      if (!formValid()) {
        statusEl.textContent = t.needed;
        return;
      }
      var text = t.subject + "\n" + formMessage();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          statusEl.textContent = t.copied;
        }, function () {
          statusEl.textContent = text;
        });
      } else {
        statusEl.textContent = text;
      }
    });
    translateOptions();
    langButtons.forEach(function (btn) {
      btn.addEventListener("click", translateOptions);
    });
  }
})();
