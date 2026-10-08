/**
 * Magic Scissors - 3D Physical Cards Controller (Bento, Services, Features)
 * Adds multi-plane physical depth, dynamic mouse tilt, realistic layered shadows,
 * specular light sheen, and image parallax without spinning 360 degrees.
 */

export class ThreeDimensionalCards {
  constructor() {
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.cards = [];
    this.init();
  }

  init() {
    if (this.prefersReducedMotion || this.isTouch) {
      // Touch and reduced-motion fallback: pure subtle CSS elevation
      document.documentElement.classList.add('cards-touch-subtle');
      return;
    }

    this.bindCardSelectors();

    // Re-bind when dynamic grids change (e.g. services tab filter or gallery render)
    const observer = new MutationObserver(() => {
      this.bindCardSelectors();
    });

    const servicesGrid = document.getElementById('servicesGrid');
    if (servicesGrid) observer.observe(servicesGrid, { childList: true });

    const testimonialsGrid = document.getElementById('testimonialsGrid');
    if (testimonialsGrid) observer.observe(testimonialsGrid, { childList: true });
  }

  bindCardSelectors() {
    const selectors = [
      '.service-card',
      '.about-feature-box',
      '.stat-item',
      '.testimonial-card',
      '.instagram-banner-box',
      '.insta-tile',
      '.footer-hours-card',
      '.footer-concierge-card'
    ];

    const elements = document.querySelectorAll(selectors.join(','));
    elements.forEach(card => {
      if (card.dataset.threeCardBound) return;
      card.dataset.threeCardBound = "true";
      card.classList.add('card-3d-interactive');

      // Inject specular glare layer if absent
      if (!card.querySelector('.card-specular-sheen')) {
        const sheen = document.createElement('div');
        sheen.className = 'card-specular-sheen';
        sheen.setAttribute('aria-hidden', 'true');
        card.appendChild(sheen);
      }

      this.attachTiltListeners(card);
    });
  }

  attachTiltListeners(card) {
    let bounds;
    let isHovering = false;
    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Review cards and instagram tiles use ultra-subtle tilt
    const isSubtleTilt = card.classList.contains('testimonial-card') || card.classList.contains('insta-tile');
    const tiltMultiplier = isSubtleTilt ? 3.8 : 6.0;
    const transZ = isSubtleTilt ? 6 : 10;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      isHovering = true;
      card.classList.add('card-hovered');
      animate();
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      // Normalized coordinates (-0.5 to 0.5)
      targetX = (mouseX / bounds.width) - 0.5;
      targetY = (mouseY / bounds.height) - 0.5;

      // Update glare position in percentage
      const glareX = (mouseX / bounds.width) * 100;
      const glareY = (mouseY / bounds.height) * 100;
      card.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
    };

    const animate = () => {
      if (!isHovering) return;

      // Smooth dampening
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      // Subtle rotations (max ~3.8 degrees for subtle luxury feel)
      const rotX = (-currentY * tiltMultiplier).toFixed(2);
      const rotY = (currentX * tiltMultiplier).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${transZ}px)`;

      // Subtle internal image parallax opposite to card tilt
      const internalImg = card.querySelector('img');
      if (internalImg) {
        const imgX = (-currentX * 10).toFixed(1);
        const imgY = (-currentY * 10).toFixed(1);
        internalImg.style.transform = `scale(1.05) translate(${imgX}px, ${imgY}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    const onMouseLeave = () => {
      isHovering = false;
      if (rafId) cancelAnimationFrame(rafId);
      card.classList.remove('card-hovered');
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';

      const internalImg = card.querySelector('img');
      if (internalImg) {
        internalImg.style.transform = 'scale(1.0) translate(0px, 0px)';
      }
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  }
}
