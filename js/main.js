import hu from "./translations/hu.js";
import en from "./translations/en.js";
import { blockDefs } from "./servicesSection.js";

import { runIntro } from './introAnimation.js';


window.addEventListener("load", () => {
  if (document.querySelector("#loader")) {
    runIntro();
  }
});


const translations = { hu, en };

// --- Nav elem --- (ez kell a splitChars-nak)
const nav = document.getElementById("main-nav");
const closeBtn = document.querySelector(".nav-close");


function updateBlocks(lang) {
  blockDefs.forEach(def => {
    if (def._el) {
      def._el.textContent = translations[lang][def.key];
    }
  });
}

// --- i18n ---
function setLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {

    const key = el.dataset.i18n;

    if (translations[lang][key]) {

      // ha a nagy cím SplitType-os, először visszaállítjuk
      if (el.classList.contains("contact-title") && window.titleSplit) {
        window.titleSplit.revert();
      }

      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  updateBlocks(lang);


  // újraméretezés a nagy címekhez nyelvváltás után
  requestAnimationFrame(() => {
    if (window.fitText) {
      window.fitText();
    }
  });


  localStorage.setItem("lang", lang);

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  if (nav.classList.contains("is-open")) {
    replayEntrance();
  } else {
    splitChars();
  }


  // cím újraanimálás nyelvváltás után
  requestAnimationFrame(() => {
    if (window.initTitleAnimation) {
      window.initTitleAnimation();
    }
  });
}

const savedLang = localStorage.getItem("lang") || "hu";
setLanguage(savedLang);

document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

// --- Betűkre bontás ---
function splitChars() {
  document.querySelectorAll(".nav-link").forEach(link => {
    const text = link.textContent.trim();
    link.innerHTML = text
      .split("")
      .map(ch => ch === " " ? " " : `<span class="char">${ch}</span>`)
      .join("");

    link.style.transition = "none";
    link.style.transform = "translateY(110%)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        link.style.transition = "";
        link.style.transform = "";
      });
    });
  });
}
splitChars();

function replayEntrance() {
  document.querySelectorAll(".nav-link").forEach(link => {
    const text = link.textContent.trim();
    link.innerHTML = text
      .split("")
      .map(ch => ch === " " ? " " : `<span class="char">${ch}</span>`)
      .join("");

    // Visszarántjuk a fal mögé azonnal
    link.style.transition = "none";
    link.style.transform = "translateY(110%)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Visszaadjuk a CSS-nek — az is-open szabályok veszik át
        link.style.transition = "";
        link.style.transform = "";
      });
    });
  });
}

const NAV_CLOSE_DURATION = 1000;

// --- Scroll lock (mobilon is működik) ---
let scrollY = 0;

function lockScroll() {
  scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

function unlockScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.documentElement.style.overflow = "";
  window.scrollTo(0, scrollY);
}

export function openNav() {
  nav.classList.remove("is-closing");
  nav.classList.add("is-open");

  lockScroll();
}

export function closeNav() {
  if (!nav) return Promise.resolve();

  nav.classList.add("is-closing");
  nav.classList.remove("is-open");

  unlockScroll();

  return new Promise((resolve) => {
    const onTransitionEnd = (e) => {
      if (e.propertyName === "clip-path" && nav.classList.contains("is-closing")) {
        nav.removeEventListener("transitionend", onTransitionEnd);
        resolve();
      }
    };

    nav.addEventListener("transitionend", onTransitionEnd);

    setTimeout(() => {
      nav.removeEventListener("transitionend", onTransitionEnd);
      if (nav.classList.contains("is-closing")) {
        nav.classList.remove("is-closing");
      }
      resolve();
    }, NAV_CLOSE_DURATION);
  });
}

closeBtn.addEventListener("click", () => {
  closeNav();
});

nav.addEventListener("transitionend", (e) => {
  if (e.propertyName === "clip-path" && nav.classList.contains("is-closing")) {
    nav.classList.remove("is-closing");
  }
});

const menuOpenBtn = document.getElementById("menu-open");
menuOpenBtn.addEventListener("click", openNav);

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

document.querySelectorAll('textarea').forEach(el => {
  el.addEventListener('input', () => autoResize(el));
});



function fitText() {
    const title = document.querySelector(".featured-work-title");

    if (!title) return;

    let size = 500;
    title.style.fontSize = size + "px";

    const targetWidth = window.innerWidth * 0.96;

    while (title.getBoundingClientRect().width < targetWidth && size < 800) {
        size += 1;
        title.style.fontSize = size + "px";
    }

    while (title.getBoundingClientRect().width > targetWidth) {
        size -= 1;
        title.style.fontSize = size + "px";
    }
}


function fitTextPageTitle() {
    const title = document.querySelector(".page-title");

    if (!title) return;

    let size = 500;
    title.style.fontSize = size + "px";

    const targetWidth = window.innerWidth * 0.96;

    while (title.getBoundingClientRect().width < targetWidth && size < 800) {
        size += 1;
        title.style.fontSize = size + "px";
    }

    while (title.getBoundingClientRect().width > targetWidth) {
        size -= 1;
        title.style.fontSize = size + "px";
    }
}


// külön néven exportáljuk mindkettőt
window.fitText = fitText;
window.fitTextPageTitle = fitTextPageTitle;


window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
        fitText();
        fitTextPageTitle();
    });
});


// első betöltésnél is fusson
window.addEventListener("load", () => {
    fitText();
    fitTextPageTitle();
});