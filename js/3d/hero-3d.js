/**
 * Magic Scissors - Hero 3D & Global Experience Controller
 * Orchestrates the Three.js viewport, lighting, scissors model, salon environment,
 * and storyteller scroll director.
 */

import * as THREE from 'three';
import { deviceCapability } from './device-detection.js';
import { SceneLighting } from './scene-lighting.js';
import { ScissorsModel } from './scissors-model.js';
import { SalonEnvironment } from './salon-environment.js';
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

    if (deviceCapability.isWebGLAvailable) {
      this.init();
    } else {
      console.warn("WebGL not supported; continuing in 2D fallback mode.");
    }
  }

  init() {
    // 3D background scissors and arch disabled as requested
    return;
    if (!this.container) {
      const heroHost = document.getElementById('hero') || document.querySelector('.page-hero-banner');
      this.container = document.createElement('div');
      this.container.id = 'three3dExperienceLayer';
      this.container.className = 'three-3d-experience-layer';
      this.container.setAttribute('aria-hidden', 'true');
      if (heroHost) {
        heroHost.appendChild(this.container);
      } else {
        document.body.prepend(this.container);
      }
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
    this.container.appendChild(this.canvas);

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

    // Initial positioning
    this.onScroll();

    // Start render loop
    this.isRunning = true;
    this.clock.start();
    this.animate();
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
  }

  onClick(e) {
    // When clicking in upper or hero viewport, trigger a crisp scissors snip
    if (this.scissors && (!e.target || !e.target.closest('a, button, input, textarea, select'))) {
      this.scissors.triggerSnip();
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

    const delta = Math.min(0.1, this.clock.getDelta());
    const time = this.clock.getElapsedTime();

    // Smooth mouse interpolation
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.06;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.06;

    // Update scissors
    if (this.scissors) {
      this.scissors.update(delta, time, this.mouse);
    }

    // Update storyteller scroll transitions
    if (this.storyteller) {
      this.storyteller.update(delta);
    }

    // Update environment (hair strands & motes)
    if (this.environment) {
      this.environment.update(delta, time);
    }

    // Render
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

    disposeScene(this.scene, this.renderer);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
