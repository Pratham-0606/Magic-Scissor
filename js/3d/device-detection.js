/**
 * Magic Scissors - 3D Device & Capability Detection
 * Handles WebGL availability, mobile/tablet detection, pixel ratio scaling, and reduced motion.
 */

export class DeviceCapability {
  constructor() {
    this.isWebGLAvailable = this.checkWebGLSupport();
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth < 768);
    this.isTablet = (window.innerWidth >= 768 && window.innerWidth <= 1024) || (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Performance tier
    this.tier = this.determineTier();
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  determineTier() {
    if (!this.isWebGLAvailable) return 'fallback';
    if (this.isMobile) return 'mobile';
    if (this.isTablet) return 'tablet';
    return 'desktop';
  }

  getPixelRatio() {
    const rawRatio = window.devicePixelRatio || 1;
    if (this.tier === 'mobile') return Math.min(rawRatio, 1.25);
    if (this.tier === 'tablet') return Math.min(rawRatio, 1.5);
    return Math.min(rawRatio, 2.0);
  }

  shouldEnableShadows() {
    return this.tier === 'desktop' && !this.prefersReducedMotion;
  }

  shouldEnableHairMotion() {
    return !this.prefersReducedMotion && (this.tier === 'desktop' || this.tier === 'tablet');
  }

  shouldEnableParallax() {
    return !this.prefersReducedMotion && !this.isMobile;
  }
}

export const deviceCapability = new DeviceCapability();
