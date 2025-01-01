const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Configuration
let particles = [];
let rockets = [];
let stars = [];
let leaves = [];
let fireNumber = 10; // 15
let range = 80; // 100
let launchInterval = 2000; //old value 1500
let lastLaunch = 0;

// Palette de couleurs modernes pour les feux d'artifice
const colorPalettes = [
    // Palette violette/rose
    ["hsla(280, 100%, 60%, alpha)", "hsla(320, 100%, 60%, alpha)", "hsla(300, 100%, 70%, alpha)"],
    // Palette bleue/cyan
    ["hsla(200, 100%, 60%, alpha)", "hsla(180, 100%, 50%, alpha)", "hsla(220, 100%, 70%, alpha)"],
    // Palette or/ambre
    ["hsla(45, 100%, 50%, alpha)", "hsla(30, 100%, 50%, alpha)", "hsla(40, 100%, 60%, alpha)"],
    // Palette verte émeraude
    ["hsla(160, 100%, 50%, alpha)", "hsla(140, 100%, 45%, alpha)", "hsla(170, 100%, 60%, alpha)"]
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
    createLeaves();
}

function createStars() {
    stars = [];
    const numberOfStars = Math.floor((canvas.width * canvas.height) / 800);
    for (let i = 0; i < numberOfStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 0.8 + 0.1,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            brightness: Math.random() * 0.3 + 0.7
        });
    }
}

function createLeaves() {
    leaves = [];
    const numberOfLeaves = 40;
    for (let i = 0; i < numberOfLeaves; i++) {
        leaves.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.4,
            size: Math.random() * 15 + 8,
            angle: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.015 + 0.005,
            swayAmount: Math.random() * 25 + 8,
        });
    }
}

function getRandomColorPalette() {
    return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
}

function makeFullCircleFirework(fire) {
    const palette = getRandomColorPalette();
    let velocity = Math.random() * 8 + 6;
    let particleCount = fireNumber * 15;

    for (let i = 0; i < particleCount; i++) {
        let rad = (i * Math.PI * 2) / particleCount;
        let variation = Math.random() * 2 - 1;
        let color = palette[Math.floor(Math.random() * palette.length)];

        let firework = {
            x: fire.x,
            y: fire.y,
            size: Math.random() * 2.5 + 0.5,
            fill: color,
            vx: Math.cos(rad) * (velocity + variation),
            vy: Math.sin(rad) * (velocity + variation),
            ay: 0.06,
            alpha: 1,
            life: Math.round(Math.random() * range) + range/2,
            trail: [],
            brightness: Math.random() * 0.3 + 0.7
        };
        particles.push(firework);
    }
}

function createRocket() {
    let startX = canvas.width * (0.2 + Math.random() * 0.6);
    let startY = canvas.height;
    let targetX = startX + (Math.random() * 300 - 150);
    let targetY = canvas.height * (0.15 + Math.random() * 0.3);
    let speed = 7 + Math.random() * 3;
    let angle = Math.atan2(targetY - startY, targetX - startX);

    rockets.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        targetX: targetX,
        targetY: targetY,
        trail: [],
    });
}

function drawStars() {
    stars.forEach((star) => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed);
        ctx.globalAlpha = (0.4 + twinkle * 0.2) * star.brightness;
        ctx.fillStyle = `rgba(255, 255, 255, ${ctx.globalAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawLeaves() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.01)";
    leaves.forEach((leaf) => {
        ctx.save();
        const sway = Math.sin(Date.now() * leaf.swaySpeed) * leaf.swayAmount;
        ctx.translate(leaf.x + sway, leaf.y);
        ctx.rotate(leaf.angle);

        ctx.beginPath();
        ctx.moveTo(0, -leaf.size / 2);
        ctx.quadraticCurveTo(leaf.size / 2, 0, 0, leaf.size / 2);
        ctx.quadraticCurveTo(-leaf.size / 2, 0, 0, -leaf.size / 2);
        ctx.fill();

        ctx.restore();
    });
}

function animate(timestamp) {
    ctx.fillStyle = "rgba(10, 11, 31, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawLeaves();

    if (!lastLaunch || timestamp - lastLaunch > launchInterval) {
        createRocket();
        lastLaunch = timestamp;
    }

    // Gestion des fusées
    for (let i = rockets.length - 1; i >= 0; i--) {
        let r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;

        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 20) r.trail.shift();

        r.trail.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 180, ${index/r.trail.length * 0.8})`;
            ctx.fill();
        });

        let dist = Math.hypot(r.targetX - r.x, r.targetY - r.y);
        if (dist < 10) {
            makeFullCircleFirework(r);
            rockets.splice(i, 1);
        }
    }

    // Gestion des particules
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.ay;
        p.alpha -= 0.003;
        p.life--;

        p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
        if (p.trail.length > 6) p.trail.shift();

        p.trail.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, p.size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = p.fill.replace("alpha", `${point.alpha * 0.6 * p.brightness}`);
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.fill.replace("alpha", `${p.alpha * p.brightness}`);
        ctx.fill();

        if (p.life <= 0 || p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener("load", () => {
    setTimeout(() => {
        const message = document.getElementById("new-year-message");
        message.style.display = "block";
    }, 8000);
});

function showMessage() {
    const messageDiv = document.createElement("div");
    messageDiv.id = "happy-new-year";
    messageDiv.innerText = "WELCOME 2025";
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.style.opacity = 0;
            setTimeout(() => messageDiv.parentNode.removeChild(messageDiv), 1000);
        }
    }, 4000);
}

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("click", createRocket);

resizeCanvas();
createStars();
createLeaves();
requestAnimationFrame(animate);
setTimeout(showMessage, 200);
