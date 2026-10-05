/**
 * Magic Scissors - 3D Salon Art Exhibition Gallery
 * Enhances salon views with museum-grade physical frames, wall depth,
 * interactive 3D focus push-in, and smooth return transition with lightbox.
 */

export class ThreeDimensionalGallery {
  constructor() {
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.activeCard = null;
    this.init();
  }

  init() {
    this.bindGalleryCards();

    // Re-bind when tabs filter the gallery
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
      const observer = new MutationObserver(() => {
        this.bindGalleryCards();
      });
      observer.observe(galleryGrid, { childList: true });
    }

    // Intercept lightbox close to return card smoothly
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) {
      const resetActiveCard = () => {
        if (this.activeCard) {
          this.activeCard.classList.remove('gallery-focus-active');
          this.activeCard.style.transform = '';
          this.activeCard = null;
        }
      };

      const closeBtn = lightbox.querySelector('.lightbox-close');
      if (closeBtn) closeBtn.addEventListener('click', resetActiveCard);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) resetActiveCard();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') resetActiveCard();
      });
    }
  }

  bindGalleryCards() {
    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach(card => {
      if (card.dataset.threeGalleryBound) return;
      card.dataset.threeGalleryBound = "true";
      card.classList.add('gallery-art-exhibition-card');

      if (!this.prefersReducedMotion) {
        this.attachExhibitionParallax(card);
      }

      card.addEventListener('click', () => {
        this.activeCard = card;
        card.classList.add('gallery-focus-active');
      });
    });
  }

  attachExhibitionParallax(card) {
    let bounds;
    let isHovering = false;
    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseEnter = () => {
      if (card.classList.contains('gallery-focus-active')) return;
      bounds = card.getBoundingClientRect();
      isHovering = true;
      animate();
    };

    const onMouseMove = (e) => {
      if (!bounds || card.classList.contains('gallery-focus-active')) return;
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      targetX = (mouseX / bounds.width) - 0.5;
      targetY = (mouseY / bounds.height) - 0.5;
    };

    const animate = () => {
      if (!isHovering || card.classList.contains('gallery-focus-active')) return;

      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      const rotX = (-currentY * 6).toFixed(2);
      const rotY = (currentX * 6).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(14px)`;

      const img = card.querySelector('.gallery-img');
      if (img) {
        img.style.transform = `scale(1.06) translate(${(-currentX * 12).toFixed(1)}px, ${(-currentY * 12).toFixed(1)}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    const onMouseLeave = () => {
      isHovering = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (!card.classList.contains('gallery-focus-active')) {
        card.style.transform = '';
        const img = card.querySelector('.gallery-img');
        if (img) {
          img.style.transform = '';
        }
      }
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  }
}
