document.addEventListener('DOMContentLoaded', () => {
  const intro = document.querySelector('.intro-screen');
  const frau = document.querySelector('.frau');
  const steps = document.querySelectorAll('.step');

  /* Frau animieren, wenn Intro fertig */
  if (intro && frau) {
    intro.addEventListener('animationend', (event) => {
      if (event.animationName === 'intro-fade-out') {
        frau.classList.add('frau--animate');
      }
    });
  }

  /* Scrollytelling Fade/Slide */
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
if (entry.isIntersecting) {
  steps.forEach(step => {
    if (step !== entry.target) {
      step.classList.remove('is-visible');
    }
  });
  entry.target.classList.add('is-visible');
} else {
  entry.target.classList.remove('is-visible');

    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -5% 0px'
});

steps.forEach(step => stepObserver.observe(step));
});
