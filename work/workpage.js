gsap.registerPlugin(ScrollTrigger);

const track = document.querySelector(".top-layer");
const wrapper = document.querySelector(".top-layer-wrapper");

let horizontalScroll;


function setAbsolutePosition() {

    const rect = wrapper.getBoundingClientRect();

    wrapper.style.position = "absolute";
    wrapper.style.top = `${window.scrollY + rect.top}px`;
    wrapper.style.left = `${rect.left}px`;
    wrapper.style.bottom = "auto";
}


function setFixedPosition() {

    wrapper.style.position = "fixed";
    wrapper.style.top = "0";
    wrapper.style.left = "60%";
    wrapper.style.bottom = "auto";
}


function initHorizontalGallery() {

    if (window.innerWidth <= 900) {

        if (horizontalScroll) {
            horizontalScroll.kill();
        }

        ScrollTrigger.getAll().forEach(t => t.kill());

        wrapper.style.position = "relative";
        wrapper.style.left = "0";
        wrapper.style.top = "auto";
        wrapper.style.width = "100%";
        wrapper.style.height = "auto";

        gsap.set(track, {
            x: 0
        });

        return;
    }


    function getScrollAmount() {
        return track.scrollWidth - wrapper.clientWidth;
    }


    horizontalScroll = gsap.to(track, {

        x: () => -getScrollAmount(),

        ease: "none",

        scrollTrigger: {

            trigger: ".back-layer",

            start: "top top",

            end: () => "+=" + getScrollAmount(),

            pin: true,

            scrub: true,

            invalidateOnRefresh: true,


            onEnter: () => {
                setFixedPosition();
            },


            onLeave: () => {
                setAbsolutePosition();
            },


            onEnterBack: () => {
                setFixedPosition();
            },


            onLeaveBack: () => {
                setAbsolutePosition();
            }

        }

    });

}


initHorizontalGallery();


window.addEventListener("resize", () => {

    if (horizontalScroll) {
        horizontalScroll.kill();
    }

    ScrollTrigger.getAll().forEach(t => t.kill());

    initHorizontalGallery();

});


document.addEventListener("DOMContentLoaded", () => {
  const norrisLink = document.querySelectorAll("a.norris");

  norrisLink.forEach((link) => {
    const text = link.textContent;
    const segmenter = new Intl.Segmenter("it", { granularity: "grapheme" });
    const chars = Array.from(segmenter.segment(text), (s) => s.segment);
    link.innerHTML = chars
      .map((char) => `<span data-char="${char}">${char}</span>`)
      .join("");
  });

});
