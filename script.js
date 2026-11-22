// Wedding website configuration
// Replace the values below when venue, event timings, music and RSVP destination are final.
const CONFIG = {
  weddingStart: "2026-12-11T09:00:00+05:30",
  googleFormUrl: "", // Paste your published Google Form URL here to collect RSVPs online.
  musicFile: "assets/wedding-music.mp3"
};

// Build the temple-night scene: stars, rows of diyas, water reflections and distant fireworks.
const hero = document.querySelector(".temple-hero");
const diyaContainer = document.getElementById("diyas");
const reflectionContainer = document.getElementById("reflections");
const starField = document.getElementById("starField");
const fireworksLayer = document.getElementById("fireworks");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let sceneStarted = false;
let fireworksTimer = null;
let sceneInView = true;

// Percent coordinates are designed around the vertical temple/lake composition.
const diyaPoints = [];
// A line of lamps along the temple's water edge.
for (let x = 7; x <= 94; x += 4.8) diyaPoints.push([x, 57 + Math.sin(x / 13) * 1.2]);
// Curved tiers of the foreground ghat.
for (let x = 78; x <= 99; x += 3.5) diyaPoints.push([x, 65 + (x - 78) * .42]);
for (let x = 66; x <= 99; x += 3.4) diyaPoints.push([x, 73 + (x - 66) * .36]);
for (let x = 52; x <= 98; x += 3.2) diyaPoints.push([x, 81 + (x - 52) * .28]);
for (let x = 38; x <= 91; x += 3.1) diyaPoints.push([x, 89 + (x - 38) * .18]);
// A few floating lights near the waterline.
for (let x = 8; x <= 49; x += 6.8) diyaPoints.push([x, 88 + Math.sin(x / 8) * 2]);

diyaPoints.forEach(([x, y], index) => {
  const diya = document.createElement("span");
  diya.className = "scene-diya";
  diya.style.left = `${x}%`;
  diya.style.top = `${y}%`;
  diya.dataset.index = String(index);
  diyaContainer.appendChild(diya);
  const reflection = document.createElement("span");
  reflection.className = "diya-reflection";
  reflection.style.left = `${x}%`;
  reflection.style.top = `${Math.min(98, y + (y < 64 ? 3.5 : 2.2))}%`;
  reflection.style.animationDelay = `${Math.random() * 2}s`;
  reflectionContainer.appendChild(reflection);
});

for (let i = 0; i < 75; i++) {
  const star = document.createElement("span");
  star.className = "scene-star";
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 48}%`;
  star.style.setProperty("--twinkle", `${2 + Math.random() * 4}s`);
  star.style.setProperty("--delay", `${Math.random() * 4}s`);
  starField.appendChild(star);
}

function launchFirework() {
  if (!sceneInView || !sceneStarted || reducedMotion) return;
  const burst = document.createElement("span");
  burst.className = "firework";
  burst.style.left = `${12 + Math.random() * 76}%`;
  burst.style.top = `${10 + Math.random() * 34}%`;
  const scale = .65 + Math.random() * .9;
  burst.style.transform = `scale(${scale})`;
  fireworksLayer.appendChild(burst);
  window.setTimeout(() => burst.remove(), 1800);
  // A few celebrations overlap occasionally, like distant festival fireworks.
  if (Math.random() > .72) window.setTimeout(() => {
    if (sceneInView && sceneStarted) launchFirework();
  }, 180 + Math.random() * 380);
}
function scheduleFireworks() {
  if (!sceneInView || !sceneStarted) return;
  launchFirework();
  fireworksTimer = window.setTimeout(scheduleFireworks, 1500 + Math.random() * 2600);
}

function lightScene() {
  if (sceneStarted) return;
  sceneStarted = true;
  hero.classList.add("is-lit");
  document.getElementById("enterBtn").disabled = true;
  const lamps = [...document.querySelectorAll(".scene-diya")];
  const reflections = [...document.querySelectorAll(".diya-reflection")];
  const stagger = reducedMotion ? 0 : 44;
  lamps.forEach((lamp, i) => {
    window.setTimeout(() => {
      lamp.classList.add("lit");
      if (reflections[i]) reflections[i].classList.add("lit");
    }, i * stagger);
  });
  // The temple and ghat glow first; fireworks and the invitation reveal follow.
  window.setTimeout(() => hero.classList.add("temple-bright"), 950);
  window.setTimeout(() => {
    if (sceneInView) {
      scheduleFireworks();
      sparkleRandomDiyas();
    }
  }, 1850);
  window.setTimeout(() => hero.classList.add("names-visible"), Math.max(2600, lamps.length * stagger + 450));
  const music = document.getElementById("bgMusic");
  if (music && !music.paused) music.play().catch(() => {});
}

document.getElementById("enterBtn").addEventListener("click", lightScene);

// One or two individual flames briefly brighten at random, like stars on the ghat.
let sparkleTimer = null;
function sparkleRandomDiyas() {
  if (!sceneStarted || !sceneInView) return;
  const lamps = [...document.querySelectorAll(".scene-diya.lit")];
  if (lamps.length) {
    const lamp = lamps[Math.floor(Math.random() * lamps.length)];
    lamp.classList.add("sparkle");
    window.setTimeout(() => lamp.classList.remove("sparkle"), 1150);
  }
  sparkleTimer = window.setTimeout(sparkleRandomDiyas, 380 + Math.random() * 900);
}

// Keep the living temple scene running only while the opening section remains on screen.
const heroObserver = new IntersectionObserver(entries => {
  sceneInView = entries[0].isIntersecting;
  if (!sceneInView) {
    if (fireworksTimer) clearTimeout(fireworksTimer);
    if (sparkleTimer) clearTimeout(sparkleTimer);
    fireworksTimer = null;
    sparkleTimer = null;
  } else if (sceneInView && sceneStarted) {
    if (!fireworksTimer) scheduleFireworks();
    if (!sparkleTimer) sparkleRandomDiyas();
  }
}, { threshold: 0.12 });
heroObserver.observe(hero);

function updateCountdown() {
  const distance = new Date(CONFIG.weddingStart).getTime() - Date.now();
  if (distance <= 0) {
    document.getElementById("countdown").innerHTML = "<p>The celebrations have begun! શુભ લગ્ન!</p>";
    return;
  }
  const units = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000)
  };
  Object.entries(units).forEach(([id, value]) => document.getElementById(id).textContent = String(value).padStart(2, "0"));
}
updateCountdown();
setInterval(updateCountdown, 1000);

let gujarati = false;
document.getElementById("langToggle").addEventListener("click", () => {
  gujarati = !gujarati;
  document.documentElement.lang = gujarati ? "gu" : "en";
  document.body.classList.toggle("gujarati", gujarati);
  document.querySelectorAll("[data-en][data-gu]").forEach(el => {
    el.textContent = gujarati ? el.dataset.gu : el.dataset.en;
  });
  document.getElementById("langToggle").textContent = gujarati ? "English" : "ગુજરાતી";
});

document.getElementById("printBtn").addEventListener("click", () => window.print());

const music = document.getElementById("bgMusic");
document.getElementById("musicBtn").addEventListener("click", async () => {
  const btn = document.getElementById("musicBtn");
  if (music.paused) {
    try {
      await music.play();
      btn.textContent = "♫ Pause music";
      btn.setAttribute("aria-pressed", "true");
    } catch {
      alert("Add your MP3 file as assets/wedding-music.mp3, then try again.");
    }
  } else {
    music.pause();
    btn.textContent = "♫ Play music";
    btn.setAttribute("aria-pressed", "false");
  }
});

document.getElementById("rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const response = {
    name: data.get("name"),
    guests: data.get("guests"),
    attendance: data.get("attendance"),
    message: data.get("message")
  };
  if (CONFIG.googleFormUrl) {
    // Google Forms uses entry IDs rather than generic field names.
    // For reliable collection, use the Google Form's own embed/link or map entry IDs here.
    window.open(CONFIG.googleFormUrl, "_blank", "noopener");
    document.getElementById("formNote").textContent = "Your RSVP form has opened. Please submit your response there.";
  } else {
    const subject = encodeURIComponent("Wedding RSVP – " + response.name);
    const body = encodeURIComponent(
      `Name: ${response.name}\nGuests: ${response.guests}\nAttendance: ${response.attendance}\nMessage: ${response.message}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    document.getElementById("formNote").textContent = "Your email app should open with the RSVP details. Add a Google Form URL in script.js for online collection.";
  }
});
