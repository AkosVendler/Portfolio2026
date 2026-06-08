import hu from "./translations/hu.js";
import en from "./translations/en.js";

const themeBtn = document.getElementById("theme-toggle");

const translations = { hu, en };


const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

function updateThemeButton(theme) {
  const lang = localStorage.getItem("lang") || "hu";
  themeBtn.innerHTML = theme === "dark"
    ? translations[lang]["light-mode"]
    : translations[lang]["dark-mode"];
}

themeBtn.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';

  const btnRect = themeBtn.getBoundingClientRect();
  const ox = btnRect.left + btnRect.width / 2;
  const oy = btnRect.top + btnRect.height / 2;
  const rMax = Math.hypot(
    Math.max(ox, innerWidth - ox),
    Math.max(oy, innerHeight - oy)
  );

  const expandColor = isDark ? '#0F0A0A' : '#F8F1FF';
  const shrinkColor = isDark ? '#F8F1FF' : '#0F0A0A';

  const state = { r: 0, blend: 0 };

  function drawCircle(color) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(ox, oy, state.r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function lerpColor(a, b, t) {
    const ah = a.replace('#','');
    const bh = b.replace('#','');
    const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
    const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const b2 = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${b2})`;
  }

  gsap.timeline()
    .to(state, {
      r: rMax,
      duration: 0.6,
      ease: 'power3.inOut',
      onUpdate() {
        drawCircle(expandColor);
      },
      onComplete() {
        setTheme(newTheme);
        updateThemeButton(newTheme);
      }
    })
    .to(state, {
      blend: 1,
      duration: 0.25,
      ease: 'power1.inOut',
      onUpdate() {
        drawCircle(lerpColor(expandColor, shrinkColor, state.blend));
      }
    })
    .to(state, {
      r: 0,
      duration: 0.6,
      ease: 'power3.inOut',
      onUpdate() {
        drawCircle(shrinkColor);
      },
      onComplete() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
});


const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);
updateThemeButton(savedTheme);