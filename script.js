// Wedding website configuration
// Replace the values below when venue, event timings, music and RSVP destination are final.
const CONFIG = {
  weddingStart: "2026-12-11T09:00:00+05:30",
  googleFormUrl: "", // Paste your published Google Form URL here to collect RSVPs online.
  musicFile: "assets/wedding-music.mp3"
};

// Build a dense, deliberately ordered lighting sequence. Every lamp is anchored
// to a visible architectural edge, ghat tier, or the waterline (never scattered).
const hero = document.querySelector(".temple-hero");
const diyaContainer = document.getElementById("diyas");
const reflectionContainer = document.getElementById("reflections");
const starField = document.getElementById("starField");
const fireworksLayer = document.getElementById("fireworks");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let sceneStarted = false;
let fireworksTimer = null;
let sceneInView = true;

const diyaPoints = [];
const addRow = (name, count, pointAt, reflect = false) => {
  for (let i = 0; i < count; i++) {
    const [x, y] = pointAt(i / Math.max(1, count - 1));
    diyaPoints.push({ x, y, row: name, reflect });
  }
};

// 1) Temple: lamps trace the shikhara, layered roofs, balconies and long arcade.
addRow("temple-spire", 22, t => [10.2 + Math.sin(t * Math.PI) * 2.2, 29.8 + t * 13.8]);
addRow("temple-upper-roof", 42, t => [13 + t * 68, 43.2 + Math.sin(t * Math.PI * 5) * 1.8]);
addRow("temple-mid-roof", 48, t => [5 + t * 88, 48.8 + Math.sin(t * Math.PI * 6) * 1.4]);
addRow("temple-balcony", 54, t => [4 + t * 91, 53.2 + Math.sin(t * Math.PI * 3) * .45]);
addRow("temple-arches", 52, t => [7 + t * 86, 56.8 + Math.sin(t * Math.PI * 2) * .35]);
addRow("temple-base", 48, t => [3 + t * 94, 60.1 + Math.sin(t * Math.PI * 2) * .25], true);

// 2) Ghat: dense, continuous rows follow the curved stepped platforms from far to near.
addRow("ghat-far", 24, t => [82 + t * 18, 64.2 + t * 4.0]);
addRow("ghat-tier-2", 30, t => [74 + t * 26, 69.0 + t * 4.8]);
addRow("ghat-tier-3", 34, t => [64 + t * 36, 74.0 + t * 5.0]);
addRow("ghat-tier-4", 38, t => [53 + t * 47, 79.2 + t * 5.0]);
addRow("ghat-tier-5", 42, t => [42 + t * 58, 84.4 + t * 5.0]);
addRow("ghat-front", 44, t => [29 + t * 71, 90.0 + t * 7.0]);

// 3) A separate, close-spaced procession along the lake edge. These lamps alone
// cast water reflections; ghat and temple lamps glow on their actual surfaces.
addRow("waterline", 52, t => [3 + t * 94, 62.3 + Math.sin(t * Math.PI * 2) * .18], true);

const lampElements = [];
const reflectionElements = [];
const fragment = document.createDocumentFragment();
const reflectionFragment = document.createDocumentFragment();

diyaPoints.forEach(({ x, y, row, reflect }, index) => {
  const diya = document.createElement("span");
  diya.className = `scene-diya ${row}`;
  diya.style.left = `${x}%`;
  diya.style.top = `${y}%`;
  diya.dataset.index = String(index);
  fragment.appendChild(diya);
  lampElements.push(diya);

  if (reflect) {
    const reflection = document.createElement("span");
    reflection.className = "diya-reflection";
    reflection.style.left = `${x}%`;
    reflection.style.top = `${Math.min(98, y + 2.0)}%`;
    reflection.style.setProperty("--reflection-delay", `${(index % 7) * .17}s`);
    reflectionFragment.appendChild(reflection);
    reflectionElements.push({ element: reflection, lampIndex: index });
  }
});
diyaContainer.appendChild(fragment);
reflectionContainer.appendChild(reflectionFragment);

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
  hero.classList.add("is-lit", "lighting-sequence");
  document.getElementById("enterBtn").disabled = true;

  // Ignite every lamp in a steady procession. Dense rows make the whole temple
  // and every visible ghat tier come alive, rather than isolated random points.
  const stagger = reducedMotion ? 0 : 30;
  const reflectionByLamp = new Map(reflectionElements.map(item => [item.lampIndex, item.element]));
  lampElements.forEach((lamp, i) => {
    window.setTimeout(() => {
      lamp.classList.add("lit");
      const reflection = reflectionByLamp.get(i);
      if (reflection) reflection.classList.add("lit");
    }, i * stagger);
  });

  // Architecture brightens in layers as the lamp procession travels across it.
  window.setTimeout(() => hero.classList.add("temple-bright"), 650);
  const sequenceDuration = lampElements.length * stagger;
  window.setTimeout(() => {
    hero.classList.add("all-diyas-lit");
    if (sceneInView) scheduleFireworks();
  }, sequenceDuration + 250);
  window.setTimeout(() => hero.classList.add("names-visible"), sequenceDuration + 900);
  const music = document.getElementById("bgMusic");
  if (music && !music.paused) music.play().catch(() => {});
}
document.getElementById("enterBtn").addEventListener("click", lightScene);

// One or two individual flames briefly brighten at random, like stars on the ghat.
// Keep the living temple scene running only while the opening section remains on screen.
const heroObserver = new IntersectionObserver(entries => {
  sceneInView = entries[0].isIntersecting;
  if (!sceneInView) {
    if (fireworksTimer) clearTimeout(fireworksTimer);
    fireworksTimer = null;
  } else if (sceneInView && sceneStarted) {
    if (!fireworksTimer) scheduleFireworks();
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
