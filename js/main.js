document.addEventListener("DOMContentLoaded", () => {
  const steps = [...document.querySelectorAll(".step")];
  const stageImg = document.getElementById("stage-img");
  const stageCap = document.getElementById("stage-cap");
  const progressBar = document.getElementById("progress-bar");

  let activeIndex = 0;

  function setActiveStep(index) {
    activeIndex = index;

    steps.forEach((s, i) => s.classList.toggle("is-active", i === index));

    const step = steps[index];
    const img = step.dataset.img;
    const cap = step.dataset.cap;

    // nice transition: fade out -> swap -> fade in + small drop
    stageImg.style.opacity = 0;
    stageImg.style.transform = "translateY(12px) scale(0.98)";

    setTimeout(() => {
      stageImg.src = `assets/${img}`;
      stageCap.textContent = cap;

      stageImg.onload = () => {
        stageImg.style.opacity = 1;
        stageImg.style.transform = "translateY(0) scale(1)";
      };
    }, 220);

    // progress
    const p = ((index + 1) / steps.length) * 100;
    progressBar.style.width = `${p}%`;
  }

  // Observe steps for scene switching
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = steps.indexOf(entry.target);
          if (index !== activeIndex) setActiveStep(index);
        }
      });
    },
    { threshold: 0.55 }
  );

  steps.forEach(step => observer.observe(step));
  setActiveStep(0);

  // lightweight parallax on stage image based on scroll within viewport
  window.addEventListener("scroll", () => {
    const rect = steps[activeIndex].getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = 1 - Math.min(Math.max(rect.top / vh, 0), 1);
    const translate = (progress - 0.5) * 20; // -10..+10px
    stageImg.style.transform = `translateY(${translate}px) scale(1)`;
  }, { passive: true });
});