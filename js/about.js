import Lenis from "https://esm.sh/lenis@1.1.14";
import { doodleSVG } from "../media/doodle.js"
import hu from "./translations/hu.js";
import en from "./translations/en.js";

const translations = { hu, en };

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

    document.body.classList.remove("dark");
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

    const isMobile = window.innerWidth < 1000;

    const settings = {
        lensImageURL: "../media/work1.png",
        glaresPerLens: 2,
        finalZoomScale: 22,
        zoomFocusPoint: window.innerWidth < 1000
            ? "35% 18%"
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

            const scale = 1 + progress * 2 * (settings.finalZoomScale -1);
            gsap.set(svg, { scale });

            if (progress >= 0.5) {
                const fadeProgress = (progress - 0.5) / 0.5;
                lensImages.forEach((image) => 
                    gsap.set(image, { opacity: fadeProgress }),
                );
            } else {
                lensImages.forEach((image) => gsap.set(image, { opacity: 0}));
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