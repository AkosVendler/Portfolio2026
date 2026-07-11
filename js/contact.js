window.titleSplit = null;
window.titleTimeline = null;

function initTitleAnimation() {

    const title = document.querySelector(".contact-title");

    if (!title) return;


    // régi animáció törlése
    if (titleTimeline) {
        titleTimeline.kill();
    }


    // régi SplitType visszaállítása
    if (window.titleSplit) {
        window.titleSplit.revert();
    }


    // új SplitType
    window.titleSplit = new SplitType(title, {
        types: "chars"
    });


    const chars = titleSplit.chars;


    gsap.set(chars, {
        display: "inline-block"
    });


    requestAnimationFrame(() => {
        fitText();
    });


    const o = chars[1];
    const rest = chars[2];


    titleTimeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        repeatDelay: 2
    });


    titleTimeline
        .to(o, {
            scaleX: 1.2,
            transformOrigin: "left center",
            duration: 1.4,
            ease: "power4.inOut"
        })
        .to(rest, {
            scaleX: 0.8,
            transformOrigin: "right center",
            duration: 1.4,
            ease: "power4.inOut"
        }, "<");

}
function fitText() {

    const title = document.querySelector(".contact-title");

    if (!title) return;


    let size = 500;

    title.style.fontSize = size + "px";


    const targetWidth = window.innerWidth * 0.962;


    while (title.getBoundingClientRect().width < targetWidth && size < 800) {
        size += 1;
        title.style.fontSize = size + "px";
    }


    while (title.getBoundingClientRect().width > targetWidth) {
        size -= 1;
        title.style.fontSize = size + "px";
    }

}

window.fitText = fitText;
window.initTitleAnimation = initTitleAnimation;


window.addEventListener("load", () => {
    initTitleAnimation();
});

window.addEventListener("resize", () => {

    requestAnimationFrame(() => {
        fitText();
    });

});



document.addEventListener("DOMContentLoaded", () => {
  const norrisLink = document.querySelectorAll("a.contact");

  norrisLink.forEach((link) => {
    const text = link.textContent;
    const segmenter = new Intl.Segmenter("it", { granularity: "grapheme" });
    const chars = Array.from(segmenter.segment(text), (s) => s.segment);
    link.innerHTML = chars
      .map((char) => `<span data-char="${char}">${char}</span>`)
      .join("");
  });

});