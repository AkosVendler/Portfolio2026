const transition = document.getElementById("page-transition");
const nav = document.getElementById("main-nav");

/* állítsd be ezt a nav anim időhöz */
const NAV_CLOSE_DURATION = 600;
const TRANSITION_DURATION = 900;

function isInternalLink(link) {
    return (
        link &&
        link.href &&
        link.target !== "_blank" &&
        link.href.startsWith(window.location.origin)
    );
}

/* NAV CLOSE LOGIC (ha nincs külön, itt kezeli) */
function closeNav() {
    return new Promise((resolve) => {
        if (!nav) {
            resolve();
            return;
        }

        // 👉 itt illeszd a saját nav close classodat
        nav.classList.remove("is-open");
        nav.classList.add("is-closing");

        setTimeout(() => {
            nav.classList.remove("is-closing");
            resolve();
        }, 1000);
    });
}

document.addEventListener("click", async (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    if (!link.href || link.target === "_blank") return;
    if (!link.href.startsWith(window.location.origin)) return;

    e.preventDefault();

    const href = link.href;

    document.documentElement.classList.add("is-transitioning");

    gsap.set(transition, {
        y: "100%"
    });


    await closeNav();

    // 🔥 EZ A LÉNYEG
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    await gsap.to(transition, {
        yPercent: 0,
        duration: 0.9,
        ease: "power4.inOut"
    });

    // 🔥 extra frame biztosítás
    await new Promise(requestAnimationFrame);

    // 🔥 csak most navigálunk
    window.location.assign(href);
});

/* PAGE LOAD RESET */
window.addEventListener("pageshow", () => {

    gsap.set("#page-transition", {
        y: "100%"
    });
    transition.classList.remove("enter");
    transition.classList.add("exit");

    setTimeout(() => {
        transition.classList.remove("exit");
    }, TRANSITION_DURATION);
});

function waitForNextPageLoad() {
    const onLoad = () => {
        // biztosítjuk hogy az új page renderelt
        requestAnimationFrame(() => {
            // 🔥 transition csak akkor megy vissza
            gsap.to(transition, {
                yPercent: -100,
                duration: 0.8,
                ease: "power4.inOut",
                onComplete: () => {
                    document.documentElement.classList.remove("is-transitioning");

                    gsap.set(transition, {
                        yPercent: 100
                    });
                }
            });
        });

        window.removeEventListener("load", onLoad);
    };

    window.addEventListener("load", onLoad);
}