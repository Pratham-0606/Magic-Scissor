/**
 * Magic Scissors - Hero 3D & Global Experience Controller
 * Orchestrates the Three.js viewport, lighting, scissors model, salon environment,
 * and storyteller scroll director.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { deviceCapability } from './device-detection.js';
import { SceneLighting } from './scene-lighting.js';
import { ScissorsModel } from './scissors-model.js';
import { SalonEnvironment } from './salon-environment.js';
import { SalonTools } from './salon-tools.js';
import { Gallery3DPanels } from './gallery-panels.js';
import { StorytellerDirector } from './storyteller.js';
import { disposeScene } from './dispose-scene.js';

export class Hero3DExperience {
  constructor(containerEl) {
    this.container = containerEl || document.getElementById('three3dExperienceLayer');
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();

    this.lighting = null;
    this.scissors = null;
    this.environment = null;
    this.storyteller = null;

    this.isRunning = false;
    this.animationFrameId = null;

    // Mouse interaction states
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.scrollFraction = 0;

    // Bound listeners for clean disposal
    this.handleResize = this.onResize.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleScroll = this.onScroll.bind(this);
    this.handleClick = this.onClick.bind(this);

    if (deviceCapability.isWebGLAvailable && !deviceCapability.prefersReducedMotion) {
      try {
        this.init();
      } catch (err) {
        console.warn("Hero3DExperience init failed, falling back to 2D:", err);
      }
    } else {
      console.warn("WebGL not supported or reduced motion preferred; continuing in 2D fallback mode.");
    }
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'three3dExperienceLayer';
      this.container.className = 'three-3d-experience-layer';
      this.container.setAttribute('aria-hidden', 'true');
      this.container.setAttribute('role', 'presentation');
      document.body.prepend(this.container);
    } else {
      this.container.setAttribute('aria-hidden', 'true');
      this.container.setAttribute('role', 'presentation');
    }

    // 1. Scene with clean transparent background
    this.scene = new THREE.Scene();

    // 2. Camera
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 0.2, 7.2);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: deviceCapability.tier !== 'mobile',
      alpha: true,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(deviceCapability.getPixelRatio());
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    if (deviceCapability.shouldEnableShadows()) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.canvas = this.renderer.domElement;
    this.canvas.id = 'threeHeroCanvas';
    this.canvas.className = 'three-hero-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.setAttribute('tabindex', '-1');
    this.canvas.setAttribute('role', 'presentation');
    this.container.appendChild(this.canvas);

    // 3.5. RoomEnvironment & PMREM for metallic reflection highlights
    try {
      this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.pmremGenerator.compileEquirectangularShader();
      this.roomEnv = new RoomEnvironment();
      this.envTexture = this.pmremGenerator.fromScene(this.roomEnv, 0.04).texture;
      this.scene.environment = this.envTexture;
    } catch (err) {
      console.warn("Could not setup RoomEnvironment PMREM:", err);
    }

    // 4. Studio Lighting
    this.lighting = new SceneLighting(this.scene, {
      enableShadows: deviceCapability.shouldEnableShadows()
    });

    // 5. Stylized Salon Environment
    this.environment = new SalonEnvironment(this.scene, {
      enableHairMotion: deviceCapability.shouldEnableHairMotion()
    });

    // 6. Luxury 3D Scissors Model
    this.scissors = new ScissorsModel({
      castShadow: deviceCapability.shouldEnableShadows(),
      receiveShadow: deviceCapability.shouldEnableShadows()
    });
    this.scene.add(this.scissors.group);

    // 6.5. Procedural Salon Tools (Comb & Brush for Scene 02 About)
    this.salonTools = new SalonTools(this.scene);

    // 6.8. Floating 3D Salon Gallery Photo Panels (Scene 04 Gallery)
    this.galleryPanels = new Gallery3DPanels(this.scene, this.camera);

    // 7. Visual Storyteller Director (Scroll synchronizer)
    this.storyteller = new StorytellerDirector(
      this.scissors,
      this.environment,
      this.camera,
      { isMobile: deviceCapability.isMobile }
    );

    // 8. Attach event listeners
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    if (!deviceCapability.isMobile) {
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    }
    window.addEventListener('click', this.handleClick, { passive: true });

    // 9. IntersectionObserver on #booking: pause rendering when scrolled fully into solid booking section
    this.isAtBooking = false;
    const bookingSection = document.getElementById('booking');
    if (bookingSection && typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isAtBooking = entry.isIntersecting && entry.intersectionRatio >= 0.85;
        });
      }, { threshold: [0, 0.5, 0.85, 1.0] });
      this.intersectionObserver.observe(bookingSection);
    }

    // 10. Pause rendering when browser tab is hidden
    this.isTabHidden = false;
    this.handleVisibilityChange = () => {
      this.isTabHidden = document.hidden;
      if (!this.isTabHidden && this.isRunning) {
        this.clock.getDelta(); // reset delta to prevent sudden jump
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 11. Dynamic prefers-reduced-motion listener
    if (window.matchMedia) {
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.handleMotionChange = (e) => {
        if (e.matches) {
          this.pause();
          if (this.container) this.container.style.display = 'none';
        } else {
          if (this.container) this.container.style.display = '';
          this.start();
        }
      };
      this.motionQuery.addEventListener('change', this.handleMotionChange);
    }

    // Initial positioning
    this.onScroll();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.animate();

    // Initial crisp snip when scene begins post-intro
    setTimeout(() => {
      this.triggerSnip();
    }, 450);
  }

  pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    const width = (this.container && this.container.clientWidth) || window.innerWidth;
    const height = (this.container && this.container.clientHeight) || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(deviceCapability.getPixelRatio());

    // Update storyteller mobile/desktop parameters on screen size switch
    const wasMobile = this.storyteller.isMobile;
    const nowMobile = width < 768;
    if (wasMobile !== nowMobile) {
      this.storyteller.isMobile = nowMobile;
      this.storyteller.setupStages();
      this.storyteller.updateScrollProgress(this.scrollFraction);
    }
  }

  onMouseMove(e) {
    // Normalized mouse (-1 to 1)
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;

    this.targetMouse.x = normX;
    this.targetMouse.y = normY;

    if (this.lighting) {
      this.lighting.updateCursor(normX, normY);
    }
  }

  onScroll() {
    const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    const currentScroll = window.scrollY || window.pageYOffset || 0;
    this.scrollFraction = Math.max(0, Math.min(1.0, currentScroll / maxScroll));

    if (this.storyteller) {
      this.storyteller.updateScrollProgress(this.scrollFraction);
    }
    if (this.salonTools) {
      this.salonTools.updateScroll(this.scrollFraction);
    }
    if (this.galleryPanels) {
      this.galleryPanels.updateScroll(this.scrollFraction);
    }
  }

  onClick(e) {
    // When clicking in upper or hero viewport, trigger a crisp scissors snip
    if (this.scissors && (!e.target || !e.target.closest('a, button, input, textarea, select'))) {
      this.scissors.triggerSnip();
    }
    // Check if a 3D gallery panel was clicked
    if (this.galleryPanels) {
      this.galleryPanels.handleClick(e);
    }
  }

  triggerSnip() {
    if (this.scissors) {
      this.scissors.triggerSnip();
    }
  }

  // Smooth cinematic push-in when curtains open
  playCurtainPushIn() {
    if (!this.camera || !this.scissors) return;
    // Briefly pull camera back and ease in smoothly
    this.camera.position.z = 9.5;
    this.scissors.setSnip(0.24);
    setTimeout(() => {
      this.triggerSnip();
    }, 400);
  }

  animate() {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // Pause rendering when browser tab is hidden or when scrolled all the way into solid flat booking
    if (this.isTabHidden || this.isAtBooking) return;

    const delta = Math.min(0.08, this.clock.getDelta());
    const time = this.clock.getElapsedTime();

    // Smooth mouse interpolation
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.06;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.06;

    // Update scissors
    if (this.scissors) {
      this.scissors.update(delta, time, this.mouse);
    }

    // Update procedural salon tools (comb & brush in Scene 02 About)
    if (this.salonTools) {
      this.salonTools.update(delta, time, this.mouse);
    }

    // Update floating 3D gallery panels (Scene 04 Gallery)
    if (this.galleryPanels) {
      this.galleryPanels.update(delta, time, this.mouse);
    }

    // Update storyteller scroll transitions
    if (this.storyteller) {
      this.storyteller.update(delta);
    }

    // Update environment (hair strands & motes)
    if (this.environment) {
      this.environment.update(delta, time);
    }

    // Direct hardware rendering with tone-mapped physical shading
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);

    if (this.handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (this.motionQuery && this.handleMotionChange) {
      this.motionQuery.removeEventListener('change', this.handleMotionChange);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    if (this.salonTools) {
      this.salonTools.destroy();
      this.salonTools = null;
    }

    if (this.galleryPanels) {
      this.galleryPanels.destroy();
      this.galleryPanels = null;
    }

    if (this.envTexture) {
      this.envTexture.dispose();
      this.envTexture = null;
    }
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = null;
    }
    if (this.roomEnv && typeof this.roomEnv.dispose === 'function') {
      this.roomEnv.dispose();
      this.roomEnv = null;
    }

    disposeScene(this.scene, this.renderer);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
