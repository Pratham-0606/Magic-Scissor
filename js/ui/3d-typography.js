/**
 * Magic Scissors - 3D Dimensional Typography
 * Subtle multi-layered depth, warm bronze bevel shadows and gentle scroll parallax
 * applied specifically to major headings.
 */

export class ThreeDimensionalTypography {
  constructor() {
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.headings = [];
    this.init();
  }

  init() {
    const targetHeadings = [
      document.querySelector('.hero-headline'),
      document.querySelector('.page-hero-title'),
      document.querySelector('#services .section-title'),
      document.querySelector('#gallery .section-title'),
      document.querySelector('#about .section-title'),
      document.querySelector('#booking .section-title'),
      document.querySelector('#contact .section-title')
    ].filter(Boolean);

    targetHeadings.forEach(heading => {
      heading.classList.add('heading-3d-dimensional');
      this.headings.push(heading);
    });

    if (!this.prefersReducedMotion && this.headings.length > 0) {
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }
  }

  onScroll() {
    const viewportHeight = window.innerHeight;

    this.headings.forEach(h => {
      const rect = h.getBoundingClientRect();
      // Check if near viewport
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const centerDistance = (rect.top + rect.height / 2) - (viewportHeight / 2);
        const parallaxOffset = (-centerDistance * 0.035).toFixed(1);
        h.style.transform = `translateY(${parallaxOffset}px)`;
      }
    });
  }
}
