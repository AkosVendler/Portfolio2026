import hu from "./translations/hu.js";
import en from "./translations/en.js";
import { blockDefs } from "./servicesSection.js";

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
      el.textContent = translations[lang][key];
    }
  });

  updateBlocks(lang);

  localStorage.setItem("lang", lang);

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  if (nav.classList.contains("is-open")) {
    replayEntrance();
  } else {
    splitChars();
  }
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

// --- Nav nyitás/zárás ---
export function openNav() {
  nav.classList.remove("is-closing");
  nav.classList.add("is-open");
}

function closeNav() {
  nav.classList.add("is-closing");
  nav.classList.remove("is-open");
}

closeBtn.addEventListener("click", closeNav);

nav.addEventListener("transitionend", (e) => {
  if (e.propertyName === "clip-path" && nav.classList.contains("is-closing")) {
    nav.classList.remove("is-closing");
  }
});

const menuOpenBtn = document.getElementById("menu-open");
menuOpenBtn.addEventListener("click", openNav);