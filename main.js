
/* ================= TYPED TEXT EFFECT ================= */

if (typeof Typed !== "undefined" && document.querySelector(".text")) {
    var typed = new Typed(".text", {
        strings: [
            "Application Developer",
            "Web Developer",
            "Python Developer",
            "Data Analyst"
        ],
        typeSpeed: 100,
        backSpeed: 70,
        backDelay: 1000,
        loop: true
    });
}


/* ================= FALLING SNOW EFFECT ================= */

if (!document.getElementById("snow-canvas")) {
    const snowCanvas = document.createElement("canvas");
    snowCanvas.id = "snow-canvas";
    document.body.appendChild(snowCanvas);

    const snowCtx = snowCanvas.getContext("2d");
    let snowflakes = [];

    const snowSettings = {
        count: 100,
        minSize: 0.3,
        maxSize: 1.2,
        speed: 1.2,
        glow: 3,
        opacity: 0.7
    };

    function resizeSnowCanvas() {
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;
    }

    snowCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
    `;

    resizeSnowCanvas();
    window.addEventListener("resize", resizeSnowCanvas);

    function createSnowflake(initial = false) {
        return {
            x: Math.random() * snowCanvas.width,
            y: initial ? Math.random() * snowCanvas.height : -10,
            size: Math.random() *
                (snowSettings.maxSize - snowSettings.minSize)
                + snowSettings.minSize,
            speed: Math.random() * snowSettings.speed + 0.3,
            drift: Math.random() * 0.8 - 0.4,
            opacity: Math.random() * snowSettings.opacity + 0.2
        };
    }

    for (let i = 0; i < snowSettings.count; i++) {
        snowflakes.push(createSnowflake(true));
    }

    function animateSnow() {
        snowCtx.clearRect(
            0, 0, snowCanvas.width, snowCanvas.height
        );

        snowflakes.forEach((snow, index) => {
            snow.y += snow.speed;
            snow.x += snow.drift;

            if (snow.y > snowCanvas.height + 10) {
                snowflakes[index] = createSnowflake();
            }

            if (snow.x > snowCanvas.width + 10) {
                snow.x = -10;
            }

            if (snow.x < -10) {
                snow.x = snowCanvas.width + 10;
            }

            snowCtx.beginPath();
            snowCtx.arc(
                snow.x, snow.y, snow.size, 0, Math.PI * 2
            );

            snowCtx.fillStyle =
                `rgba(255, 255, 255, ${snow.opacity})`;

            snowCtx.shadowBlur = snowSettings.glow;
            snowCtx.shadowColor = "#ffffff";
            snowCtx.fill();
        });

        snowCtx.shadowBlur = 0;
        requestAnimationFrame(animateSnow);
    }

    animateSnow();
}


/* ================= ANIMATED CYAN CURSOR ================= */

if (
    window.matchMedia("(pointer: fine)").matches &&
    !document.getElementById("custom-cursor")
) {
    const cursor = document.createElement("div");
    cursor.id = "custom-cursor";

    const trail = document.createElement("div");
    trail.id = "cursor-trail";

    document.body.appendChild(trail);
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    document.addEventListener("mousemove", function (event) {
        mouseX = event.clientX;
        mouseY = event.clientY;

        cursor.style.left = mouseX + "px";
        cursor.style.top = mouseY + "px";
    });

    function animateTrail() {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;

        trail.style.left = trailX + "px";
        trail.style.top = trailY + "px";

        requestAnimationFrame(animateTrail);
    }

    animateTrail();

    document.querySelectorAll(
        "a, button, input, textarea, select, .row, .close-popup"
    ).forEach(function (element) {
        element.addEventListener("mouseenter", function () {
            trail.classList.add("cursor-hover");
        });

        element.addEventListener("mouseleave", function () {
            trail.classList.remove("cursor-hover");
        });
    });
}


/* ================= PORTFOLIO GUIDE ================= */

function setupPortfolioGuide() {
    const guide = document.getElementById("portfolioGuide");
    const video = document.getElementById("guideCharacter");
    const audioButton = document.getElementById("guideAudio");
    const guideClose = document.getElementById("guideClose");
    const guideBubble = document.getElementById("guideBubble");

    if (guideBubble) {
        guideBubble.textContent = "Hi! Welcome to my portfolio 👋";
        guideBubble.style.display = "block";
        guideBubble.style.visibility = "visible";
        guideBubble.style.opacity = "1";
    }


   
        const launcher = document.getElementById("guideLauncher");

        // Close character and show floating icon
        if (guide && guideClose && launcher) {
            guideClose.addEventListener("click", function () {
                guide.style.display = "none";
                launcher.classList.add("agent-visible");

                if (video) {
                    video.pause();
                }
            });

            // Click floating icon to reopen character
            launcher.addEventListener("click", function () {
                guide.style.display = "flex";
                launcher.classList.remove("agent-visible");

                if (video) {
                    video.play().catch(function (error) {
                        console.log("Video playback:", error);
                    });
                }
            });
        }


    // Audio and Picture-in-Picture settings
    if (!video || !audioButton) {
        console.error(
            "Guide video or audio button not found. Check the HTML IDs."
        );
        return;
    }

    // Disable Picture-in-Picture
    video.disablePictureInPicture = true;
    video.setAttribute("disablepictureinpicture", "");
    video.removeAttribute("controls");

    // Start muted: required for reliable autoplay
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 1;

    audioButton.textContent = "🔇";
    audioButton.title = "Turn sound on";
    audioButton.setAttribute("aria-label", "Turn sound on");

    // Prevent duplicate click listeners
    if (audioButton.dataset.audioReady === "true") {
        return;
    }
    audioButton.dataset.audioReady = "true";

    audioButton.addEventListener("click", async function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (video.muted) {
            // User clicked to enable sound
            video.muted = false;
            video.volume = 1;

            try {
                await video.play();

                audioButton.textContent = "🔊";
                audioButton.title = "Mute sound";
                audioButton.setAttribute("aria-label", "Mute sound");

                console.log("Guide audio enabled.");
            } catch (error) {
                video.muted = true;

                audioButton.textContent = "🔇";
                audioButton.title = "Turn sound on";
                audioButton.setAttribute(
                    "aria-label",
                    "Turn sound on"
                );

                console.error("Could not play guide audio:", error);
            }
        } else {
            // User clicked to mute sound
            video.muted = true;

            audioButton.textContent = "🔇";
            audioButton.title = "Turn sound on";
            audioButton.setAttribute(
                "aria-label",
                "Turn sound on"
            );
        }
    });

    // Keep PiP disabled if video metadata loads later
    video.addEventListener("loadedmetadata", function () {
        video.disablePictureInPicture = true;
    });
}

// Works whether main.js loads before or after DOMContentLoaded
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        setupPortfolioGuide,
        { once: true }
    );
} else {
    setupPortfolioGuide();
}

