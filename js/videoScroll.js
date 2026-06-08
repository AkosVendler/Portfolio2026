gsap.registerPlugin(ScrollTrigger);
import Lenis from "https://esm.sh/lenis@1.1.14";

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

if (window.innerWidth > 900) {
    const hero = document.querySelector(".hero");
    const videoWrapper = document.querySelector(".video-wrapper");
    const title = document.querySelector(".title");
    const heroTitle = document.querySelector(".hero-title");
    const timezones = document.querySelector(".timezones");

    function getScales() {
        const heroStyle = window.getComputedStyle(hero);
        const paddingLeft = parseFloat(heroStyle.paddingLeft);
        const paddingRight = parseFloat(heroStyle.paddingRight);

        const heroRect = hero.getBoundingClientRect();
        const videoRect = videoWrapper.getBoundingClientRect();

        const innerW = heroRect.width - paddingLeft - paddingRight;

        // Csak szélességre skálázunk, arány megtartva
        const scale = innerW / videoRect.width;

        const videoCenterX = videoRect.left + videoRect.width / 2;
        const videoCenterY = videoRect.top + videoRect.height / 2;
        const heroCenterX = heroRect.left + heroRect.width / 2;
        const heroCenterY = heroRect.top + heroRect.height / 2;

        return {
            scale,
            offsetX: heroCenterX - videoCenterX,
            offsetY: heroCenterY - videoCenterY,
        };
    }

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: hero,
            start: "bottom bottom",
            end: "+=600",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
        }
    });

    tl.to(title, { opacity: 0, y: -30, duration: 0.3 }, 0)
        .to(heroTitle, { opacity: 0, duration: 0.3 }, 0)
        .to(timezones, { opacity: 0, duration: 0.3 }, 0)
    tl.to(videoWrapper, {
        scale: () => getScales().scale,
        x: () => getScales().offsetX,
        y: () => getScales().offsetY,
        transformOrigin: "center center",
        duration: 1,
        ease: "none",
    }, 0.1);


}