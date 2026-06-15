gsap.registerPlugin(ScrollTrigger);

export function runIntro() {
  // ─── Óra ───────────────────────────────────────────────────────────────────
  function startClock() {
    const el = document.getElementById("budapest-time");
    if (!el) return;
    const tick = () => {
      el.textContent = new Date().toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/Budapest",
      });
    };
    tick();
    setInterval(tick, 1000);
  }
  startClock();

  // ─── Elemek ────────────────────────────────────────────────────────────────
  const loader = document.getElementById("loader");
  const dotsEls = Array.from(document.querySelectorAll(".dot"));
  const heroEl = document.getElementById("hero") || document.querySelector(".hero");
  const nameEl = document.getElementById("hero-name"); // h1 vagy h2 a névvel
  const restEls = document.querySelectorAll(".hero-reveal"); // minden más elem

  const N = dotsEls.length;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const DOT_SIZE = 50;

  // ─── Pöttyök kezdő pozíciója ───────────────────────────────────────────────
  gsap.set(dotsEls, {
    position: "fixed",
    top: "50%",
    left: -60,
    yPercent: -50,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: "50%",
    background: "#F8F1FF",
    opacity: 0,
  });

  // Egyenlő elosztás vízszintesen
  const spreadX = Array.from({ length: N }, (_, i) => (vw / (N + 1)) * (i + 1));

  // ─── SplitText a névhez ────────────────────────────────────────────────────
const split = new SplitType(nameEl, {
  types: "chars",
});

const chars = split.chars;

  gsap.set(chars, {
    yPercent: 110,
    opacity: 0,
    rotateX: -40,
    transformOrigin: "center bottom",
    transformPerspective: 800,
  });

  // Többi elem elrejtése
  gsap.set(restEls, { opacity: 0 });
  gsap.set(heroEl, { opacity: 0 });

  // ─── Fő timeline ──────────────────────────────────────────────────────────
  const tl = gsap.timeline();

  // 1) Pöttyök bejönnek balról jobbra
  tl.to(dotsEls, {
    left: (i) => spreadX[i],
    opacity: 1,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.13,
  });

  // 2) Rövid szünet — pöttyök megállnak
  tl.to({}, { duration: 0.35 });

  // 3) Az utolsó pötty teljes képernyőre nő
  const lastDot = dotsEls[N - 1];
  const lastX = spreadX[N - 1];
  const expandSize = Math.max(vw, vh) * 2.6;

  tl.to(lastDot, {
    width: expandSize,
    height: expandSize,
    left: lastX - expandSize / 2,
    top: vh / 2 - expandSize / 2,
    yPercent: 0,
    borderRadius: "50%",
    duration: 0.75,
    ease: "power4.in",
  });

  // 4) Többi pötty elfakul közben
  tl.to(dotsEls.slice(0, N - 1), {
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
  }, "<");

  // 5) Flash — loader eltűnik
  tl.to(loader, {
    opacity: 0,
    duration: 0.18,
    ease: "power1.in",
    onComplete: () => {
      loader.style.display = "none";
    },
  });

  // 6) Hero megjelenik
  tl.to(heroEl, { opacity: 1, duration: 0.01 });

  // 7) Név karakterei feljönnek a láthatatlan fal mögül
  tl.to(chars, {
    yPercent: 0,
    opacity: 1,
    rotateX: 0,
    duration: 1.1,
    ease: "power4.out",
    stagger: {
      each: 0.045,
      from: "start",
    },
  }, "-=0.05");

  // 8) Összes többi elem egyszerre opacity-val megjelenik
  tl.to(restEls, {
    opacity: 1,
    duration: 1,
    ease: "power2.out",
  }, "-=0.6");

}