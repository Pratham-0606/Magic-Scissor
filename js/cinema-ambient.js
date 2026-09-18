/**
 * MAGIC SCISSORS STUDIO SALONS
 * Cinematic Ambient Lighting, Follow-Spot & Focus-Pull Controller
 */

(function () {
  'use strict';

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Initialize Interactive Studio Follow-Spot
  function initCinemaSpotlight() {
    if (prefersReducedMotion) return;

    // Inject spotlight layer if not present
    if (!document.getElementById('cinemaSpotlightLayer')) {
      const spotlight = document.createElement('div');
      spotlight.id = 'cinemaSpotlightLayer';
      spotlight.className = 'cinema-spotlight-layer';
      document.body.prepend(spotlight);
    }

    let mouseX = 50;
    let mouseY = 30;
    let currentX = 50;
    let currentY = 30;
    let isTracking = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;

      if (!isTracking) {
        isTracking = true;
        requestAnimationFrame(updateSpotlight);
      }
    }, { passive: true });

    function updateSpotlight() {
      // Smooth cinematic camera dampening (interpolation)
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      document.documentElement.style.setProperty('--mouse-x', `${currentX.toFixed(2)}%`);
      document.documentElement.style.setProperty('--mouse-y', `${currentY.toFixed(2)}%`);

      if (Math.abs(mouseX - currentX) > 0.05 || Math.abs(mouseY - currentY) > 0.05) {
        requestAnimationFrame(updateSpotlight);
      } else {
        isTracking = false;
      }
    }
  }

  // 2. Cinematic Focus-Pull Scroll Observer
  function initCinemaFocusPull() {
    const targetSelectors = [
      '.cinema-reveal',
      '.service-card',
      '.glass-card',
      '.testimonial-card',
      '.model-card',
      '.about-feature-box',
      '.section-header',
      '.hero-view-pill',
      '.hero-stats-strip',
      '.inquiry-card'
    ];

    const elements = document.querySelectorAll(targetSelectors.join(','));

    if (prefersReducedMotion) {
      elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    // Add .cinema-reveal to all selected elements if not already applied
    elements.forEach(el => {
      if (!el.classList.contains('cinema-reveal')) {
        el.classList.add('cinema-reveal');
      }
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // 3. Cinematic Viewfinder Framing Decorator (Removed per design update)
  function initViewfinderFraming() {
    // Corner viewfinder framing removed for clean modern layout
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCinemaSpotlight();
      initCinemaFocusPull();
      initViewfinderFraming();
    });
  } else {
    initCinemaSpotlight();
    initCinemaFocusPull();
    initViewfinderFraming();
  }
})();
