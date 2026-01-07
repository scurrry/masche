document.addEventListener("DOMContentLoaded", () => {
  const intro = document.querySelector(".intro-screen");
  const steps = Array.from(document.querySelectorAll("#story .step"));
  if (!steps.length) return;
  document.body.classList.add("intro-active");

  // ----------------------------
  // AUDIO (WebAudio Crossfades) (test)
  // ----------------------------
  const elRain = document.getElementById("audRain");
  const elMusic = document.getElementById("audMusic");
  const elCash = document.getElementById("audCash");

  let audioCtx = null;
  let gainRain, gainMusic;
  let unlocked = false;
  let currentBed = null; // "rain" | "music" | null
  let soundEnabled = false; // <<< TOGGLE STATE

  const ensureAudio = async () => {
    if (unlocked) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const srcRain = audioCtx.createMediaElementSource(elRain);
    const srcMusic = audioCtx.createMediaElementSource(elMusic);

    gainRain = audioCtx.createGain();
    gainMusic = audioCtx.createGain();

    // start silent
    gainRain.gain.value = 0;
    gainMusic.gain.value = 0;

    srcRain.connect(gainRain).connect(audioCtx.destination);
    srcMusic.connect(gainMusic).connect(audioCtx.destination);

    if (audioCtx.state === "suspended") await audioCtx.resume();

    unlocked = true;
  };

  const ramp = (gainNode, to, ms = 900) => {
    if (!gainNode || !audioCtx) return;
    const t = audioCtx.currentTime;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.linearRampToValueAtTime(to, t + ms / 1000);
  };

  const crossfadeBedTo = async (next, ms = 900) => {
    await ensureAudio();
    if (next === currentBed) return;

    if (next === "rain") {
      try { await elRain.play(); } catch (_) {}
      ramp(gainRain, 1, ms);
      ramp(gainMusic, 0, ms);
      window.setTimeout(() => { if (currentBed === "music") elMusic.pause(); }, ms + 50);
    }

    if (next === "music") {
      try { await elMusic.play(); } catch (_) {}
      ramp(gainMusic, 1, ms);
      ramp(gainRain, 0, ms);
      window.setTimeout(() => { if (currentBed === "rain") elRain.pause(); }, ms + 50);
    }

    currentBed = next;
  };

  const playCash = async () => {
    try {
      elCash.currentTime = 0;
      await elCash.play();
    } catch (_) {}
  };

  const stopAllAudio = (ms = 600) => {
    if (!unlocked) return;

    ramp(gainRain, 0, ms);
    ramp(gainMusic, 0, ms);

    window.setTimeout(() => {
      try { elRain.pause(); } catch (_) {}
      try { elMusic.pause(); } catch (_) {}
      try { elCash.pause(); } catch (_) {}
      elCash.currentTime = 0;
    }, ms + 50);

    currentBed = null;
  };

  const setAudioForStep = async (stepIndex) => {
    // Wenn Sound aus ist: nichts machen
    if (!soundEnabled) return;

    // Capitolo 1–6
    if (stepIndex <= 5) {
      await crossfadeBedTo("rain", 1100);
      return;
    }

    // Capitolo 7
    if (stepIndex === 6) {
      await crossfadeBedTo("rain", 700);
      playCash();
      return;
    }

    // Capitolo 8–12
    await crossfadeBedTo("music", 1200);
  };

  // ----------------------------
  // STEP NAV (NO SCROLL)
  // ----------------------------
  let current = 0;
  let locked = false;
  const LOCK_MS = 900;

  steps.forEach((s) => s.classList.remove("is-visible"));
  steps[0].classList.add("is-visible");

  const show = (i) => {
    const nextIndex = Math.max(0, Math.min(i, steps.length - 1));
    if (nextIndex === current || locked) return;

    steps[current].classList.remove("is-visible");
    steps[nextIndex].classList.add("is-visible");
    current = nextIndex;

    // AUDIO HOOK (nur wenn Sound an)
    setAudioForStep(current);

    locked = true;
    setTimeout(() => (locked = false), LOCK_MS);
  };

  const next = () => show(current + 1);
  const prev = () => show(current - 1);

  let wheelAccum = 0;
  const WHEEL_THRESHOLD = 70;

  const onWheel = (e) => {
    e.preventDefault();

    // kein Auto-Start wenn Sound aus
    if (!unlocked && soundEnabled) ensureAudio().then(() => setAudioForStep(current));

    if (locked) return;
    wheelAccum += e.deltaY;

    if (wheelAccum > WHEEL_THRESHOLD) { wheelAccum = 0; next(); }
    else if (wheelAccum < -WHEEL_THRESHOLD) { wheelAccum = 0; prev(); }
  };

  const onKeyDown = (e) => {
    if (!unlocked && soundEnabled) ensureAudio().then(() => setAudioForStep(current));

    if (locked) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); next(); }
    if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); prev(); }
  };

  let touchStartY = null;
  const SWIPE_THRESHOLD = 35;

  const onTouchStart = (e) => {
    if (!unlocked && soundEnabled) ensureAudio().then(() => setAudioForStep(current));
    touchStartY = e.touches?.[0]?.clientY ?? null;
  };
  const onTouchMove = (e) => e.preventDefault();
  const onTouchEnd = (e) => {
    if (locked || touchStartY == null) return;
    const endY = e.changedTouches?.[0]?.clientY;
    if (endY == null) return;

    const diff = touchStartY - endY;
    touchStartY = null;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    diff > 0 ? next() : prev();
  };

  const start = () => {
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
  };

 if (intro) {
  intro.addEventListener("animationend", (event) => {
    if (event.animationName === "intro-fade-out") {
      document.body.classList.remove("intro-active");
      start();
    }
  });
}

 // ----------------------------
// SOUND TOGGLE BUTTON (SVG)
// ----------------------------
const soundBtn = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");

const ICON_ON = "assets/illustrationen/sound-on.svg";
const ICON_OFF = "assets/illustrationen/sound-off.svg";

const updateIcon = () => {
  if (!soundIcon) return;
  soundIcon.src = soundEnabled ? ICON_ON : ICON_OFF;
  soundIcon.alt = soundEnabled ? "Sound an" : "Sound aus";
  soundBtn?.setAttribute("aria-label", soundEnabled ? "Sound ausschalten" : "Sound einschalten");
};

if (soundBtn) {
  // Startzustand: aus
  soundEnabled = false;
  updateIcon();

  soundBtn.addEventListener("click", async () => {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
      await ensureAudio();
      await setAudioForStep(current);
    } else {
      stopAllAudio(700);
    }

    updateIcon();
  });
  }
});