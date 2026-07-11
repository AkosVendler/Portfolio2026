let transition = document.getElementById("page-transition");
const nav = document.getElementById("main-nav");

function ensureTransitionElement() {
    if (transition && document.body.contains(transition)) {
        return transition;
    }

    const el = document.createElement("div");
    el.id = "page-transition";

    el.style.position = "fixed";
    el.style.inset = "0";
    el.style.background =
        getComputedStyle(document.documentElement)
            .getPropertyValue("--bg");

    el.style.zIndex = "999999";
    el.style.willChange = "transform";
    el.style.backfaceVisibility = "hidden";
    el.style.pointerEvents = "none";

    document.body.appendChild(el);

    transition = el;

    return transition;
}


const NAV_CLOSE_DURATION = 1000;
const TRANSITION_DURATION = 900;


function closeNav() {

    return new Promise((resolve) => {

        if (!nav) {
            resolve();
            return;
        }

        nav.classList.remove("is-open");
        nav.classList.add("is-closing");


        setTimeout(() => {

            nav.classList.remove("is-closing");

            resolve();

        }, NAV_CLOSE_DURATION);

    });

}



document.addEventListener("click", async (e) => {


    const link = e.target.closest("a");

    if (!link) return;


    if (!link.href || link.target === "_blank") return;


    if (!link.href.startsWith(window.location.origin)) return;



    e.preventDefault();


    const href = link.href;


    const url = new URL(href);

    const isMainPage =
        url.pathname === "/" ||
        url.pathname.endsWith("index.html");



    document.documentElement.classList.add(
        "is-transitioning"
    );



    try {


        const el = ensureTransitionElement();



        // mindig alulról induljon

        gsap.set(el, {
            yPercent: 100
        });



        el.getBoundingClientRect();



        // főoldal esetén nincs transition

        if (isMainPage) {

            // 1. NAV BEZÁR
            await closeNav();


            // 2. overlay beállítása
            const currentBg = getComputedStyle(document.documentElement)
                .getPropertyValue("--bg");


            gsap.set(el, {
                yPercent: 100,
                backgroundColor: currentBg
            });


            // 3. overlay feljön alulról
            await new Promise((resolve) => {

                gsap.to(el, {
                    yPercent: 0,
                    duration: TRANSITION_DURATION / 1000,
                    ease: "power4.inOut",
                    onComplete: resolve
                });

            });


            // 4. navigáció
            window.location.assign(href);

            return;
        }




        // 1. NAV ZÁRÓDIK

        await closeNav();





        // 2. OVERLAY FELJÖN ALULRÓL

        await new Promise((resolve) => {


            gsap.to(el, {

                yPercent: 0,

                duration:
                    TRANSITION_DURATION / 1000,

                ease:
                    "power4.inOut",

                onComplete: resolve

            });


        });





        await new Promise(requestAnimationFrame);




        // 3. OLDALVÁLTÁS

        window.location.assign(href);



    } catch (err) {


        console.error(
            "pageTransition error",
            err
        );


        await closeNav();

        window.location.assign(href);


    }


});





/* ===========================
   ÚJ OLDAL BETÖLTÉSE
=========================== */


window.addEventListener("pageshow", () => {


    const el = ensureTransitionElement();



    const loader = document.getElementById("loader");


    const loaderVisible =
        loader &&
        window.getComputedStyle(loader).display !== "none" &&
        loader.offsetParent !== null;




    if (loaderVisible) {


        gsap.set(el, {
            yPercent: 100
        });


        return;

    }




    // oldal betöltésekor teljes takarás

    gsap.set(el, {
        yPercent: 0
    });





    requestAnimationFrame(() => {


        // overlay lefelé kimegy

        gsap.to(el, {

            yPercent: 100,

            duration:
                TRANSITION_DURATION / 1000,


            ease:
                "power4.inOut",


            onComplete: () => {


                document.documentElement.classList.remove(
                    "is-transitioning"
                );


                gsap.set(el, {
                    yPercent: 100
                });


            }


        });



    });



});