document.addEventListener("DOMContentLoaded", () => {
  const steps = [...document.querySelectorAll(".step")];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("is-active", entry.isIntersecting);
    });
  }, { threshold: 0.6 });

  steps.forEach(s => observer.observe(s));
});