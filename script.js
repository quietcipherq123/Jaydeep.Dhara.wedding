// Wedding website configuration
// Replace the values below when venue, event timings, music and RSVP destination are final.
const CONFIG = {
  weddingStart: "2026-12-11T09:00:00+05:30",
  googleFormUrl: "", // Paste your published Google Form URL here to collect RSVPs online.
  musicFile: "assets/wedding-music.mp3"
};

const diyaContainer = document.getElementById("diyas");
for (let i = 0; i < 42; i++) {
  const diya = document.createElement("span");
  diya.className = "diya";
  diya.style.animationDelay = `${(i % 9) * 0.17}s`;
  diya.style.transform = `scale(${0.65 + (i % 4) * 0.12})`;
  diyaContainer.appendChild(diya);
}

document.getElementById("enterBtn").addEventListener("click", () => {
  document.getElementById("story").scrollIntoView({ behavior: "smooth" });
  const music = document.getElementById("bgMusic");
  if (music.querySelector("source").getAttribute("src") && music.querySelector("source").getAttribute("src") !== CONFIG.musicFile) {
    music.querySelector("source").src = CONFIG.musicFile;
    music.load();
  }
  if (music.paused) music.play().then(() => {
    document.getElementById("musicBtn").textContent = "♫ Pause music";
    document.getElementById("musicBtn").setAttribute("aria-pressed", "true");
  }).catch(() => {});
});

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
