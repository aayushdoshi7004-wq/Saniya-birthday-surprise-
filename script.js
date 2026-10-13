const photos = ["Images/photo1.jpg", "Images/photo2.jpg", "Images/photo3.jpg", "Images/photo4.jpg"];
const ALLOWED_NAME = "SANIYA";

function goToScene(id) {
    document.querySelectorAll(".scene").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

/* ============================================================
   SCENE 1: RAIN + LETTER-BY-LETTER UNLOCK
============================================================= */

const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");
const rippleCanvas = document.getElementById("rippleCanvas");
const rctx = rippleCanvas.getContext("2d");

let drops = [];
let rainActive = true;
let rainIntensity = 1;
let frozenDropIndex = -1;
let ripples = [];

function resizeCanvases() {
    [canvas, rippleCanvas].forEach(c => {
        c.width = window.innerWidth * 0.75;
        c.height = window.innerHeight * 0.75;
        c.style.width = "100%";
        c.style.height = "100%";
    });
}
window.addEventListener("resize", resizeCanvases);
resizeCanvases();

function initDrops() {
    drops = [];
    for (let i = 0; i < 150; i++) {
        drops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            len: 10 + Math.random() * 20,
            speed: 6 + Math.random() * 10,
            opacity: 0.2 + Math.random() * 0.5,
            frozen: false
        });
    }
}
initDrops();

function drawRain() {
    if (!rainActive) {
        requestAnimationFrame(drawRain);
        return;
    }

    ctx.fillStyle = "rgba(8,10,16,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(180,210,255,0.55)";
    ctx.lineWidth = 1;

    drops.forEach((d, i) => {
        ctx.globalAlpha = d.opacity * rainIntensity;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 3, d.y + d.len);
        ctx.stroke();

        if (!d.frozen) {
            d.x -= 1.2 * rainIntensity;
            d.y += d.speed * rainIntensity;
            if (d.y > canvas.height) {
                d.y = -d.len;
                d.x = Math.random() * canvas.width;
            }
        }
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(drawRain);
}
drawRain();

function drawRipples() {
    rctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        rctx.globalAlpha = r.alpha;
        rctx.strokeStyle = "rgba(180,220,255,0.8)";
        rctx.lineWidth = 2;
        rctx.beginPath();
        rctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        rctx.stroke();
        r.radius += 2.5;
        r.alpha -= 0.012;
        if (r.alpha <= 0) ripples.splice(i, 1);
    }
    requestAnimationFrame(drawRipples);
}
drawRipples();

function spawnRipple() {
    ripples.push({ x: rippleCanvas.width / 2, y: rippleCanvas.height / 2, radius: 5, alpha: 0.8 });
}

function flashLightning() {
    const el = document.getElementById("lightning");
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
}

function freezeOneDrop() {
    const unfrozen = drops.filter(d => !d.frozen);
    if (unfrozen.length) {
        const d = unfrozen[Math.floor(Math.random() * unfrozen.length)];
        d.frozen = true;
        d.opacity = 1;
    }
}

function brightenBackground() {
    document.getElementById("rainDim").style.background = "rgba(60,70,90,0.05)";
}

/* Letter-by-letter reactions as the user types S A N I Y A */
const letterEffects = {
    1: () => freezeOneDrop(),              // S
    2: () => spawnRipple(),                // A
    3: () => flashLightning(),             // N
    4: () => brightenBackground(),         // I
    5: () => { rainIntensity = 0.35; },    // Y
    6: () => {                             // A (final)
        rainIntensity = 0;
        rainActive = false;
    }
};

let lastHandledLength = 0;

const nameInput = document.getElementById("nameInput");

nameInput.addEventListener("input", () => {
    const val = nameInput.value.toUpperCase();
    nameInput.value = val;

    // trigger effect for each newly typed letter (not on deletion)
    if (val.length > lastHandledLength) {
        const effect = letterEffects[val.length];
        if (effect) effect();
    }
    lastHandledLength = val.length;

    if (val === ALLOWED_NAME) {
        setTimeout(unlockSequence, 500);
    }
});

function unlockSequence() {
  const music = document.getElementById("bgMusic");
music.volume = 0.5;
music.play();
    document.getElementById("unlockBox").style.display = "none";

    const spaced = document.getElementById("spacedName");
    spaced.innerText = ALLOWED_NAME.split("").join(" ");
    spaced.style.display = "block";
    spaced.style.opacity = "0";
    spaced.style.animation = "fadeIn 1s ease forwards";

    setTimeout(() => {
        const granted = document.getElementById("accessGranted");
        granted.innerText = "ACCESS GRANTED";
        granted.style.display = "block";
        granted.style.opacity = "0";
        granted.style.animation = "fadeIn 1s ease forwards";

        setTimeout(() => {
            goToScene("scenePuddle");
        }, 2200);
    }, 1400);
}

/* ============================================================
   SCENE 2: PUDDLE REFLECTION
============================================================= */

document.getElementById("puddle").addEventListener("click", () => {
    document.getElementById("puddleHint").style.display = "none";
    goToScene("scenePhoto1");
    startPhoto1Reveal();
});

/* ============================================================
   PHOTO 1 — RIPPLE REVEAL
============================================================= */

function startPhoto1Reveal() {
    const rCanvas = document.getElementById("rippleRevealCanvas");
    rCanvas.width = window.innerWidth;
    rCanvas.height = window.innerHeight;
    const rc = rCanvas.getContext("2d");

    let waveRadius = 0;
    const cx = rCanvas.width / 2;
    const cy = rCanvas.height / 2;

    function waveLoop() {
        rc.clearRect(0, 0, rCanvas.width, rCanvas.height);
        if (waveRadius < 260) {
            rc.strokeStyle = "rgba(180,220,255,0.5)";
            rc.lineWidth = 2;
            rc.beginPath();
            rc.arc(cx, cy, waveRadius, 0, Math.PI * 2);
            rc.stroke();
            waveRadius += 6;
            requestAnimationFrame(waveLoop);
        }
    }
    waveLoop();

    setTimeout(() => {
        document.getElementById("photo1Img").classList.add("revealed");
    }, 300);
}

document.getElementById("continue1").addEventListener("click", () => {
    goToScene("scenePhoto2");
});

/* ============================================================
   PHOTO 2 — PROJECTOR (mostly CSS auto-plays on scene entry)
============================================================= */

document.getElementById("continue2").addEventListener("click", () => {
    goToScene("scenePhoto3");
    startConstellationReveal();
});

/* ============================================================
   PHOTO 3 — CONSTELLATION REVEAL
============================================================= */

function startConstellationReveal() {
    const cCanvas = document.getElementById("constCanvas");
    cCanvas.width = window.innerWidth;
    cCanvas.height = window.innerHeight;
    const cc = cCanvas.getContext("2d");

    const cx = cCanvas.width / 2;
    const cy = cCanvas.height / 2;
    const points = [];
    const totalPoints = 18;

    for (let i = 0; i < totalPoints; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 160;
        points.push({ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, on: false });
    }

    let revealed = 0;

    function revealNextPoint() {
        if (revealed >= points.length) {
            setTimeout(() => {
                document.getElementById("photo3Img").classList.add("revealed");
            }, 400);
            return;
        }
        points[revealed].on = true;
        revealed++;
        drawConstellation();
        setTimeout(revealNextPoint, 120);
    }

    function drawConstellation() {
        cc.clearRect(0, 0, cCanvas.width, cCanvas.height);
        const onPoints = points.filter(p => p.on);

        cc.strokeStyle = "rgba(180,210,255,0.35)";
        cc.lineWidth = 1;
        for (let i = 0; i < onPoints.length; i++) {
            for (let j = i + 1; j < onPoints.length; j++) {
                const dx = onPoints[i].x - onPoints[j].x;
                const dy = onPoints[i].y - onPoints[j].y;
                if (Math.sqrt(dx * dx + dy * dy) < 100) {
                    cc.beginPath();
                    cc.moveTo(onPoints[i].x, onPoints[i].y);
                    cc.lineTo(onPoints[j].x, onPoints[j].y);
                    cc.stroke();
                }
            }
        }

        cc.fillStyle = "#ffffff";
        onPoints.forEach(p => {
            cc.beginPath();
            cc.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            cc.fill();
        });
    }

    revealNextPoint();
}

document.getElementById("continue3").addEventListener("click", () => {
    goToScene("scenePhoto4");
    startBlurReveal();
});

/* ============================================================
   PHOTO 4 — TOUCH TO SHARPEN
============================================================= */

function startBlurReveal() {
    const img = document.getElementById("photo4Img");
    img.style.filter = "blur(22px)";

    let lastX = null, lastY = null, totalMove = 0;
    const neededMove = 900; // total px of movement to fully sharpen

    function handleMove(x, y) {
        if (lastX !== null) {
            totalMove += Math.hypot(x - lastX, y - lastY);
        }
        lastX = x;
        lastY = y;

        const progress = Math.min(totalMove / neededMove, 1);
        const blurAmount = 22 * (1 - progress);
        img.style.filter = `blur(${blurAmount}px)`;

        if (progress >= 1) {
            document.getElementById("blurHint").style.display = "none";
            document.getElementById("caption4").style.opacity = "1";
            document.getElementById("continue4").style.display = "inline-block";
            window.removeEventListener("pointermove", pointerHandler);
            window.removeEventListener("touchmove", touchHandler);
        }
    }

    function pointerHandler(e) { handleMove(e.clientX, e.clientY); }
    function touchHandler(e) {
        if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    window.addEventListener("pointermove", pointerHandler);
    window.addEventListener("touchmove", touchHandler, { passive: true });
}

document.getElementById("continue4").addEventListener("click", () => {
    goToScene("sceneMystery");
    startMystery();
});

/* ============================================================
   SCENE 4 — MYSTERY / MISSING MEMORY
============================================================= */

function startMystery() {
    const slots = document.getElementById("memorySlots");
    slots.innerHTML = "";

    photos.forEach((src, i) => {
        const s = document.createElement("div");
        s.className = "memSlot";
        s.style.animationDelay = (0.3 + i * 0.2) + "s";
        s.innerHTML = `<img src="${src}">`;
        slots.appendChild(s);
    });

    const empty = document.createElement("div");
    empty.className = "memSlot empty";
    empty.style.animationDelay = "1.1s";
    empty.innerText = "?";
    slots.appendChild(empty);

    setTimeout(() => {
        document.getElementById("mysteryLine3").style.display = "block";
        document.getElementById("mysteryLine3").style.animation = "fadeIn 1.2s ease forwards";
        document.getElementById("continueMystery").style.display = "inline-block";
    }, 2600);
}

document.getElementById("continueMystery").addEventListener("click", () => {
    goToScene("sceneClock");
    startClockFreeze();
});

/* ============================================================
   SCENE 5 — TIME FREEZE
============================================================= */

function startClockFreeze() {
    const display = document.getElementById("clockDisplay");
    const seq = ["11:59:57", "11:59:58", "11:59:59"];
    let i = 0;

    display.innerText = seq[0];

    const timer = setInterval(() => {
        i++;
        if (i < seq.length) {
            display.innerText = seq[i];
        } else {
            clearInterval(timer);
            setTimeout(() => {
                const line = document.getElementById("freezeLine");
                line.innerText = "For a moment, let everything stop.";
                line.style.animation = "fadeIn 1.5s ease forwards";

                // Continue into the extended cinematic ending
                setTimeout(() => {
                    goToScene("sceneLastDrop");
                    startLastDropSequence();
                }, 2800);
            }, 600);
        }
    }, 900);
}

/* ============================================================
   SCENE 6 — THE LAST RAINDROP
============================================================= */

function startLastDropSequence() {
    const drop = document.getElementById("lastDrop");
    const thumbs = document.getElementById("dropThumbs");

    thumbs.innerHTML = photos.map(src => `<img src="${src}">`).join("");

    // Zoom toward the frozen drop
    setTimeout(() => {
        drop.classList.add("zoomed");
        thumbs.classList.add("show");
    }, 400);

    // It begins glowing golden
    setTimeout(() => {
        drop.classList.add("golden");
        thumbs.classList.remove("show");
    }, 3200);

    // Falls into the puddle
    setTimeout(() => {
        drop.classList.add("falling");
    }, 4200);

    // Impact — ripples with words
    setTimeout(() => {
        drop.classList.add("vanished");
        startDropRipples();
    }, 5500);
}

function startDropRipples() {
    const rCanvas = document.getElementById("dropRippleCanvas");
    rCanvas.width = window.innerWidth;
    rCanvas.height = window.innerHeight;
    const rc = rCanvas.getContext("2d");

    const words = ["THANKS", "SANIYA", "FOR", "EVERYTHING"];
    const wordEl = document.getElementById("rippleWord");
    const cx = rCanvas.width / 2;
    const cy = rCanvas.height * 0.46;

    let ripples = [];

    function animateRipples() {
        rc.clearRect(0, 0, rCanvas.width, rCanvas.height);
        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            rc.globalAlpha = r.alpha;
            rc.strokeStyle = "rgba(255,217,122,0.7)";
            rc.lineWidth = 2;
            rc.beginPath();
            rc.arc(cx, cy, r.radius, 0, Math.PI * 2);
            rc.stroke();
            r.radius += 3;
            r.alpha -= 0.012;
            if (r.alpha <= 0) ripples.splice(i, 1);
        }
        rc.globalAlpha = 1;
        requestAnimationFrame(animateRipples);
    }
    animateRipples();

    let wIndex = 0;
    function nextWord() {
        if (wIndex >= words.length) {
            setTimeout(() => {
                const line = document.getElementById("dropLine");
                line.innerText = "Every drop brought us here.";
                line.classList.add("show");
                setTimeout(() => {
                    goToScene("sceneMemories");
                    startMemoriesSequence();
                }, 2600);
            }, 400);
            return;
        }
        ripples.push({ radius: 5, alpha: 0.8 });
        wordEl.innerText = words[wIndex];
        wordEl.style.left = (cx - 60) + "px";
        wordEl.style.top = (cy - 12) + "px";
        wordEl.classList.remove("show");
        void wordEl.offsetWidth;
        wordEl.classList.add("show");
        wIndex++;
        setTimeout(nextWord, 1100);
    }
    nextWord();
}

/* ============================================================
   SCENE 7 — FOUR MEMORIES AWAKEN
============================================================= */

function startMemoriesSequence() {

    // Frame 1 — ripple reveal
    setTimeout(() => {
        const c = document.getElementById("memCanvas1");
        c.width = 110; c.height = 150;
        const cx2 = c.getContext("2d");
        let radius = 0;
        function wave() {
            cx2.clearRect(0, 0, c.width, c.height);
            if (radius < 90) {
                cx2.strokeStyle = "rgba(180,220,255,0.6)";
                cx2.lineWidth = 2;
                cx2.beginPath();
                cx2.arc(c.width / 2, c.height / 2, radius, 0, Math.PI * 2);
                cx2.stroke();
                radius += 5;
                requestAnimationFrame(wave);
            }
        }
        wave();
        document.getElementById("memImg1").classList.add("revealed");
    }, 300);

    // Frame 2 — projector flicker
    setTimeout(() => {
        document.getElementById("memImg2").classList.add("play");
    }, 900);

    // Frame 3 — particle materialize
    setTimeout(() => {
        const c = document.getElementById("memCanvas3");
        c.width = 110; c.height = 150;
        const cx3 = c.getContext("2d");
        const pts = [];
        for (let i = 0; i < 14; i++) {
            pts.push({ x: Math.random() * c.width, y: Math.random() * c.height, on: false });
        }
        let revealed = 0;
        function revealNext() {
            if (revealed >= pts.length) {
                document.getElementById("memImg3").classList.add("revealed");
                return;
            }
            pts[revealed].on = true;
            revealed++;
            cx3.clearRect(0, 0, c.width, c.height);
            cx3.fillStyle = "#fff";
            pts.filter(p => p.on).forEach(p => {
                cx3.beginPath();
                cx3.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
                cx3.fill();
            });
            setTimeout(revealNext, 90);
        }
        revealNext();
    }, 1500);

    // Frame 4 — blur to sharp (automatic)
    setTimeout(() => {
        document.getElementById("memImg4").classList.add("sharp");
    }, 2100);

    // Golden beams converge toward center
    setTimeout(() => {
        drawConvergingBeams();
    }, 3600);

    // Caption + advance
    setTimeout(() => {
        const line = document.getElementById("memLine");
        line.innerText = "Four moments. One person who makes them special.";
        line.classList.add("show");

        setTimeout(() => {
            goToScene("sceneCake");
            startCakeSequence();
        }, 2800);
    }, 4600);
}

function drawConvergingBeams() {
    const canvas = document.getElementById("beamCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const bc = canvas.getContext("2d");

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const frameEls = ["memFrame1", "memFrame2", "memFrame3", "memFrame4"].map(id => {
        const r = document.getElementById(id).getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    let progress = 0;
    function animateBeams() {
        bc.clearRect(0, 0, canvas.width, canvas.height);
        bc.strokeStyle = "rgba(255,217,122,0.5)";
        bc.lineWidth = 1.5;

        frameEls.forEach(f => {
            const ex = f.x + (cx - f.x) * progress;
            const ey = f.y + (cy - f.y) * progress;
            bc.beginPath();
            bc.moveTo(f.x, f.y);
            bc.lineTo(ex, ey);
            bc.stroke();
        });

        if (progress < 1) {
            progress += 0.02;
            requestAnimationFrame(animateBeams);
        }
    }
    animateBeams();
}

/* ============================================================
   SCENE 8 — CAKE MATERIALIZATION
============================================================= */

function startCakeSequence() {
    const sphere = document.getElementById("glowSphere");
    const cakeWrap = document.getElementById("cakeWrap");

    startGlowParticles();

    setTimeout(() => {
        const flames = document.querySelectorAll("#candleRow .flame");
        flames.forEach((f, i) => {
            setTimeout(() => f.classList.add("lit"), i * 500);
        });

        setTimeout(() => {
            goToScene("sceneFinal");
            startFinalSequence();
        }, flames.length * 500 + 1400);
    }, 3200);
}

function startGlowParticles() {
    const canvas = document.getElementById("cakeGlowCanvas");
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    const gc = canvas.getContext("2d");

    const particles = [];
    for (let i = 0; i < 35; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 1 + Math.random() * 2,
            speed: 0.3 + Math.random() * 0.5,
            alpha: 0.2 + Math.random() * 0.5
        });
    }

    function loop() {
        if (!document.getElementById("sceneCake").classList.contains("active")) return;
        gc.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            gc.globalAlpha = p.alpha;
            gc.fillStyle = "#ffd97a";
            gc.beginPath();
            gc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            gc.fill();
            p.y -= p.speed;
            if (p.y < 0) p.y = canvas.height;
        });
        gc.globalAlpha = 1;
        requestAnimationFrame(loop);
    }
    loop();
}

/* ============================================================
   SCENE 9 — FINAL BIRTHDAY REVEAL
============================================================= */

function startFinalSequence() {

    startGoldRain();

    setTimeout(() => {
        document.getElementById("sweepLine1").classList.add("show");
    }, 300);

    setTimeout(() => {
        document.getElementById("sweepLine2").classList.add("show");
        goldenConfettiBurst(45);
        fadeInMusic();
    }, 1300);

    setTimeout(() => {
        const u = document.getElementById("universeLine");
        u.innerText = "Tonight, the universe celebrates you.";
        u.style.animation = "fadeIn 1.4s ease forwards";
    }, 2600);

    setTimeout(() => {
        const d = document.getElementById("finalDate");
        d.innerText = "14 • 10 • 2026";
        d.style.animation = "fadeIn 1.2s ease forwards";
    }, 4000);

    setTimeout(() => {
        const s = document.getElementById("finalSign");
        s.innerText = "Made specially for Saniya ❤️";
        s.style.animation = "fadeIn 1.2s ease forwards";
    }, 5000);
}

function fadeInMusic() {
    const music = document.getElementById("bgMusic");
    music.volume = 0;
    music.play().catch(() => {});
    let vol = 0;
    const fade = setInterval(() => {
        vol += 0.05;
        if (vol >= 0.6) {
            vol = 0.6;
            clearInterval(fade);
        }
        music.volume = vol;
    }, 200);
}

function goldenConfettiBurst(count) {
    const colors = ["#ffd97a", "#ffb648", "#fff3d0", "#ffecb3"];
    for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");
        piece.style.position = "fixed";
        piece.style.top = "-20px";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.width = piece.style.height = (5 + Math.random() * 6) + "px";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
        piece.style.zIndex = "9999";
        piece.style.pointerEvents = "none";
        piece.style.opacity = "0.95";
        piece.style.transition = `transform ${2 + Math.random() * 1.5}s linear, opacity ${2 + Math.random() * 1.5}s linear`;
        document.body.appendChild(piece);

        requestAnimationFrame(() => {
            piece.style.transform = `translateY(${window.innerHeight + 40}px) rotate(${360 + Math.random() * 300}deg)`;
            piece.style.opacity = "0.2";
        });

        setTimeout(() => piece.remove(), 4000);
    }
}

function startGoldRain() {
    const canvas = document.getElementById("goldRainCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gc = canvas.getContext("2d");

    const drops = [];
    for (let i = 0; i < 70; i++) {
        drops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            len: 8 + Math.random() * 14,
            speed: 2 + Math.random() * 4,
            opacity: 0.2 + Math.random() * 0.4
        });
    }

    function loop() {
        if (!document.getElementById("sceneFinal").classList.contains("active")) return;
        gc.fillStyle = "rgba(10,5,21,0.18)";
        gc.fillRect(0, 0, canvas.width, canvas.height);
        gc.strokeStyle = "rgba(255,217,122,0.5)";
        gc.lineWidth = 1;

        drops.forEach(d => {
            gc.globalAlpha = d.opacity;
            gc.beginPath();
            gc.moveTo(d.x, d.y);
            gc.lineTo(d.x - 1.5, d.y + d.len);
            gc.stroke();
            d.y += d.speed;
            if (d.y > canvas.height) {
                d.y = -d.len;
                d.x = Math.random() * canvas.width;
            }
        });
        gc.globalAlpha = 1;
        requestAnimationFrame(loop);
    }
    loop();
}
