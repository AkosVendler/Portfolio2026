import Lenis from "https://esm.sh/lenis@1.1.14";
import { doodleSVG } from "../media/doodle.js"
import hu from "./translations/hu.js";
import en from "./translations/en.js";

const translations = { hu, en };

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  function initTextAnimations() {
    document.querySelectorAll("[text-split]").forEach((el) => {
      new SplitType(el, { types: "words, chars", tagName: "span" });
    });

    function createScrollTrigger(tl, start = "bottom+=400px 100%") {
      const triggerEl = document.querySelector(".about-section");

      ScrollTrigger.create({
        trigger: triggerEl,
        start: start,
        once: true,
        onEnter: () => tl.play(),
      });
    }

    document.querySelectorAll("[words-slide-up]").forEach((el) => {
      const tl = gsap.timeline({ paused: true });
      tl.from(el.querySelectorAll(".word"), {
        opacity: 0,
        yPercent: 100,
        duration: 0.5,
        ease: "power4.inOut",
        stagger: { amount: 0.5 },
      });
      createScrollTrigger(tl);
    });

    document.querySelectorAll("[letters-slide-up]").forEach((el) => {
      const tl = gsap.timeline({ paused: true });
      const chars = el.querySelectorAll(".char");
      tl.from(chars, {
        yPercent: 100,
        duration: 0.35,
        ease: "power1.out",
        stagger: { amount: 0.6 },
      });
      createScrollTrigger(tl, "bottom-=200px 80%");
    });
  }

  initTextAnimations();

  class PskdReveal {
    constructor(element, options = {}) {
      this.element = element;
      this.config = {
        animateOnScroll: options.animateOnScroll !== false,
        delay: options.delay || 0,
        blockColor: options.blockColor || '#000',
        stagger: options.stagger || 0.15,
        duration: options.duration || 0.75
      };

      this.splits = [];
      this.lines = [];
      this.blocks = [];
      this.isRevealed = false;

      this.init();
      this.setupResizeHandler();
    }

    init() {
      if (!this.element) return;

      const targets = this.getTargets();
      targets.forEach(target => this.processElement(target));

      this.setupInitialState();
      this.animate();
    }

    getTargets() {
      const children = Array.from(this.element.children);

      if (children.length === 0) return [this.element];

      const blockChildren = children.filter(child => {
        const display = window.getComputedStyle(child).display;
        return ['block', 'flex', 'grid', 'table', 'list-item'].includes(display);
      });

      return blockChildren.length > 0 ? blockChildren : [this.element];
    }

    processElement(element) {
      const split = new SplitType(element, {
        type: 'words',
        wordsClass: 'pskd-word++',
        reduceWhiteSpace: false
      });

      this.splits.push(split);

      const words = split.words;
      const chunkSize = 2;

      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize);

        const wrapper = this.createWrapper();
        chunk[0].parentNode.insertBefore(wrapper, chunk[0]);

        chunk.forEach((word, idx) => {
          wrapper.appendChild(word);
          if (idx < chunk.length - 1) {
            wrapper.appendChild(document.createTextNode(' '));
          }
        });

        const block = this.createBlock();
        wrapper.appendChild(block);

        this.lines.push(wrapper);
        this.blocks.push(block);
      }
    }

    createWrapper() {
      const wrapper = document.createElement('span');
      wrapper.className = 'pskd-line-wrap';
      wrapper.style.display = 'inline-block';
      return wrapper;
    }

    createBlock() {
      const block = document.createElement('span');
      block.className = 'pskd-line-block';
      block.style.backgroundColor = this.config.blockColor;
      block.style.display = 'inline-block';
      return block;
    }

    setupInitialState() {
      gsap.set(this.lines, { opacity: 0 });
      gsap.set(this.blocks, {
        scaleX: 0,
        transformOrigin: 'left center'
      });
    }

    createTimeline(block, line, index) {
      const tl = gsap.timeline({
        delay: this.config.delay + (index * this.config.stagger)
      });

      tl.to(block, {
        scaleX: 1,
        duration: this.config.duration,
        ease: 'power4.inOut'
      });
      tl.set(line, { opacity: 1 });
      tl.set(block, { transformOrigin: 'right center' });
      tl.to(block, {
        scaleX: 0,
        duration: this.config.duration,
        ease: 'power4.inOut'
      });

      return tl;
    }

    animate() {
      if (this.config.animateOnScroll) {
        this.animateOnScroll();
      } else {
        this.animateImmediate();
      }
    }

    animateOnScroll() {
      this.blocks.forEach((block, index) => {
        const tl = this.createTimeline(block, this.lines[index], index);
        tl.pause();

        ScrollTrigger.create({
          trigger: this.element,
          start: 'center+=200px center',
          once: true,
          onEnter: () => {
            tl.play();
            this.isRevealed = true;
          }
        });
      });
    }

    animateImmediate() {
      this.blocks.forEach((block, index) => {
        this.createTimeline(block, this.lines[index], index);
      });
      this.isRevealed = true;
    }

    setupResizeHandler() {
      let resizeTimer;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.handleResize(), 250);
      };

      window.addEventListener('resize', handleResize);

      this.cleanup = () => {
        window.removeEventListener('resize', handleResize);
        this.destroy();
      };
    }

    handleResize() {
      const wasRevealed = this.isRevealed;

      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === this.element) st.kill();
      });

      this.destroyContent();
      this.splits = [];
      this.lines = [];
      this.blocks = [];

      const targets = this.getTargets();
      targets.forEach(target => this.processElement(target));

      if (wasRevealed) {
        gsap.set(this.lines, { opacity: 1 });
        gsap.set(this.blocks, { scaleX: 0 });
        this.isRevealed = true;
      } else {
        this.setupInitialState();
        this.animate();
      }
    }

    destroyContent() {
      this.splits.forEach(split => {
        if (split && split.revert) split.revert();
      });

      const wrappers = this.element.querySelectorAll('.pskd-line-wrap');
      wrappers.forEach(wrapper => {
        if (wrapper.parentNode && wrapper.firstChild) {
          const clone = wrapper.firstChild.cloneNode(true);
          wrapper.parentNode.insertBefore(clone, wrapper);
          wrapper.remove();
        }
      });
    }

    destroy() {
      this.destroyContent();
      this.splits = [];
      this.lines = [];
      this.blocks = [];
    }
  }

  class PskdRevealManager {
    constructor() {
      this.instances = [];
      this.init();
    }

    init() {
      const elements = document.querySelectorAll('.pskd-reveal');

      elements.forEach(element => {
        const config = {
          blockColor: element.getAttribute('data-pskd-color') || '#000',
          animateOnScroll: element.getAttribute('data-pskd-scroll') !== 'false',
          delay: parseFloat(element.getAttribute('data-pskd-delay')) || 0,
          stagger: parseFloat(element.getAttribute('data-pskd-stagger')) || 0.15,
          duration: parseFloat(element.getAttribute('data-pskd-duration')) || 0.75
        };

        this.instances.push(new PskdReveal(element, config));
      });
    }

    destroy() {
      this.instances.forEach(instance => {
        if (instance.cleanup) instance.cleanup();
      });
      this.instances = [];
    }
  }

  let pskdManager;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      pskdManager = new PskdRevealManager();
    });
  } else {
    pskdManager = new PskdRevealManager();
  }

  window.PskdReveal = PskdReveal;
  window.PskdRevealManager = PskdRevealManager;

  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

  const isMobile = window.innerWidth < 1000;

  const settings = {
    lensImageURL: "../media/work1.png",
    glaresPerLens: 2,
    finalZoomScale: 22,
    zoomFocusPoint: window.innerWidth < 1000
      ? "35% 19.5%"
      : "35% 19%",
  };

  document.querySelector(".svg-container").innerHTML = doodleSVG;

  const svg = document.querySelector("svg");
  const defs = document.createElementNS(SVG_NAMESPACE, "defs");
  svg.insertBefore(defs, svg.firstChild);

  const glareBands = [];
  const lensImages = [];

  const glarePaths = [...svg.querySelectorAll("path")].filter((path) => {
    return parseFloat(getComputedStyle(path).opacity) === 0.6;
  });

  glarePaths.forEach((glarePaths, lensIndex) => {
    const lensShape = glarePaths.previousElementSibling;
    if (!lensShape) return;

    const lensBounds = lensShape.getBBox();

    const clipId = `lens-clip-${lensIndex}`;
    const clipPath = document.createElementNS(SVG_NAMESPACE, "clipPath");
    clipPath.setAttribute("id", clipId);
    clipPath.appendChild(lensShape.cloneNode(true));
    defs.appendChild(clipPath);

    const lensGroup = document.createElementNS(SVG_NAMESPACE, "g");
    lensGroup.setAttribute("clip-path", `url(#${clipId})`);

    const lensImage = document.createElementNS(SVG_NAMESPACE, "image");
    lensImage.setAttribute("href", settings.lensImageURL);
    lensImage.setAttributeNS(
      XLINK_NAMESPACE,
      "xlink:href",
      settings.lensImageURL
    );
    lensImage.setAttribute("x", lensBounds.x);
    lensImage.setAttribute("y", lensBounds.y);
    lensImage.setAttribute("width", lensBounds.width);
    lensImage.setAttribute("height", lensBounds.height);
    lensImage.setAttribute("preserveAspectRatio", "xMidYMid slice");
    lensImage.setAttribute("opacity", "0");
    lensGroup.appendChild(lensImage);
    lensImages.push(lensImage);

    const bandWidth = lensBounds.width * 0.22;
    const sweepDistance = lensBounds.width + bandWidth * 2;
    const spacingBetweenBands = sweepDistance / settings.glaresPerLens;

    for (let i = 0; i < settings.glaresPerLens; i++) {
      const band = document.createElementNS(SVG_NAMESPACE, "rect");
      band.setAttribute("x", lensBounds.x + lensBounds.width * 0.3 - i * spacingBetweenBands);
      band.setAttribute("y", lensBounds.y - lensBounds.height * 0.25);
      band.setAttribute("width", bandWidth);
      band.setAttribute("height", lensBounds.height * 1.5);
      band.setAttribute("fill", "#ffffff");
      band.setAttribute("opacity", "0.6");
      lensGroup.appendChild(band);
      glareBands.push({ band, sweepDistance });
    }

    glarePaths.parentNode.insertBefore(lensGroup, glarePaths);
    glarePaths.remove();
  });

  const spotlightHeader = document.querySelector(".spotlight-header h1");
  let headerSplit = null;
  if (spotlightHeader) {
    headerSplit = new SplitType(spotlightHeader, {
      types: "words",
      wordClass: "spotlight-word",
    });
    gsap.set(headerSplit.words, { opacity: 0 });
  }

  gsap.set(svg, {
    transformOrigin: settings.zoomFocusPoint,
    transformBox: "fill-box",
  });

  const spotlightSection = document.querySelector(".spotlight");

  ScrollTrigger.create({
    trigger: spotlightSection,
    start: "top top",
    end: () => "+=" + window.innerHeight,
    pin: true,
    pinSpacing: true,
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;

      const glareProgress = Math.min(progress / 0.75, 1);
      glareBands.forEach(({ band, sweepDistance }) => {
        gsap.set(band, { x: glareProgress * sweepDistance });
      });

      const scale = 1 + progress * 2 * (settings.finalZoomScale - 1);
      gsap.set(svg, { scale });

      if (progress >= 0.5) {
        const fadeProgress = (progress - 0.5) / 0.5;
        lensImages.forEach((image) =>
          gsap.set(image, { opacity: fadeProgress }),
        );
      } else {
        lensImages.forEach((image) => gsap.set(image, { opacity: 0 }));
      }
    },
  });
});

function getMarqueeWords(lang) {
  // A translation kulcsok amiket a marquee-ban akarsz mutatni
  const keys = ['uxui', 'branding', 'webdev', 'logo', 'wireframe'];
  return keys.map(k => translations[lang][k]);
}

function buildMarqueeContent(words) {
  return words.map(word =>
    `<span class="marquee__word">${word}</span><span class="marquee__dot">·</span>`
  ).join('');
}

const init = () => {
  const marquees = document.querySelectorAll('.marquee');
  if (!marquees.length) return;

  const lang = localStorage.getItem('lang') || 'hu';
  const words = getMarqueeWords(lang);
  const contentHTML = buildMarqueeContent(words);

  marquees.forEach(item => {
    const marqueeInner = item.querySelector('.marquee__inner');
    const marqueeContent = marqueeInner.querySelector('.marquee__content');

    const duration = item.getAttribute('data-marquee-duration');

    // Tartalom beállítása
    marqueeContent.innerHTML = contentHTML;

    // Klón
    const marqueeContentClone = marqueeContent.cloneNode(true);
    marqueeInner.append(marqueeContentClone);

    // Animáció
    const marqueeContentAll = marqueeInner.querySelectorAll('.marquee__content');
    marqueeContentAll.forEach(element => {
      gsap.to(element, {
        x: "-101%",
        repeat: -1,
        duration: duration,
        ease: 'linear'
      });
    });
  });
};

document.addEventListener('DOMContentLoaded', init);


function splitChars() {
  document.querySelectorAll(".social-link").forEach(link => {
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

const music = document.querySelector(".apple-music");

if (window.innerWidth < 1000) {
  music.setAttribute("height", "1200");
} else {
  music.setAttribute("height", "450");
}

