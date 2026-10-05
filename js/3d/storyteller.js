/**
 * Magic Scissors - Scissors as Visual Storyteller & Scroll Director
 * Seamlessly steers the 3D scissors and camera across all website sections:
 * Hero -> About -> Services -> Gallery -> Contact
 */

import * as THREE from 'three';

export class StorytellerDirector {
  constructor(scissorsModel, salonEnv, camera, options = {}) {
    this.scissors = scissorsModel;
    this.env = salonEnv;
    this.camera = camera;
    this.isMobile = options.isMobile ?? false;

    // Current page detection
    const pathName = (typeof window !== 'undefined' && window.location && window.location.pathname)
      ? (window.location.pathname.split("/").pop() || "index.html")
      : "index.html";
    this.currentPage = (pathName === "" || pathName === "/") ? "index.html" : pathName;

    // Current interpolated state
    this.currentTransform = {
      pos: new THREE.Vector3(2.2, 0.2, 0),
      rot: new THREE.Euler(0.1, -0.2, 0.45),
      scale: 1.0,
      cameraZ: 7.2
    };

    // Target state
    this.targetTransform = {
      pos: new THREE.Vector3(2.2, 0.2, 0),
      rot: new THREE.Euler(0.1, -0.2, 0.45),
      scale: 1.0,
      cameraZ: 7.2
    };

    // Story stage definitions
    this.setupStages();
    this.setInitialPageStage();
  }

  setInitialPageStage() {
    let initialStage = this.stages.hero;
    if (this.currentPage === 'about.html') initialStage = this.stages.about;
    else if (this.currentPage === 'services.html') initialStage = this.stages.services;
    else if (this.currentPage === 'gallery.html') initialStage = this.stages.gallery;
    else if (this.currentPage === 'contact.html') initialStage = this.stages.contact;

    this.targetTransform.pos.copy(initialStage.pos);
    this.targetTransform.rot.copy(initialStage.rot);
    this.targetTransform.scale = initialStage.scale;
    this.targetTransform.cameraZ = initialStage.cameraZ;

    this.currentTransform.pos.copy(initialStage.pos);
    this.currentTransform.rot.copy(initialStage.rot);
    this.currentTransform.scale = initialStage.scale;
    this.currentTransform.cameraZ = initialStage.cameraZ;
    if (this.scissors) {
      this.scissors.group.position.copy(initialStage.pos);
      this.scissors.group.rotation.copy(initialStage.rot);
      this.scissors.group.scale.set(initialStage.scale, initialStage.scale, initialStage.scale);
    }
  }

  setupStages() {
    if (this.isMobile) {
      // Mobile-tailored coordinates: deeply recessed in background to never collide with text
      this.stages = {
        hero: {
          pos: new THREE.Vector3(0.0, 1.4, -2.2),
          rot: new THREE.Euler(0.15, -0.1, 0.35),
          scale: 0.52,
          cameraZ: 9.0
        },
        about: {
          pos: new THREE.Vector3(-1.8, 1.2, -3.0),
          rot: new THREE.Euler(-0.2, 0.25, -0.45),
          scale: 0.42,
          cameraZ: 9.2
        },
        services: {
          pos: new THREE.Vector3(1.8, 1.0, -3.0),
          rot: new THREE.Euler(0.18, -0.25, 0.22),
          scale: 0.40,
          cameraZ: 9.2
        },
        gallery: {
          pos: new THREE.Vector3(-2.0, 1.2, -3.5),
          rot: new THREE.Euler(0.1, 0.2, -0.25),
          scale: 0.36,
          cameraZ: 9.5
        },
        contact: {
          pos: new THREE.Vector3(1.8, 0.8, -2.8),
          rot: new THREE.Euler(0.05, -0.1, 0.12),
          scale: 0.44,
          cameraZ: 9.0
        }
      };
    } else {
      // Desktop luxury composition: placed in peripheral margin gutters, never over central text or cards
      this.stages = {
        hero: {
          pos: new THREE.Vector3(1.7, 0.15, 0.1),
          rot: new THREE.Euler(0.12, -0.28, 0.42),
          scale: 1.0,
          cameraZ: 7.2
        },
        about: {
          // Off to the left margin gutter
          pos: new THREE.Vector3(-3.4, -0.2, -1.2),
          rot: new THREE.Euler(-0.25, 0.42, -0.58),
          scale: 0.68,
          cameraZ: 8.0
        },
        services: {
          // Off to the right margin gutter
          pos: new THREE.Vector3(3.6, 0.1, -1.4),
          rot: new THREE.Euler(0.22, -0.32, 0.26),
          scale: 0.65,
          cameraZ: 8.2
        },
        gallery: {
          // Off to the far left margin gutter, recessed in depth behind cards
          pos: new THREE.Vector3(-3.8, 0.3, -2.0),
          rot: new THREE.Euler(0.15, 0.28, -0.35),
          scale: 0.55,
          cameraZ: 8.5
        },
        contact: {
          // Off to the right margin gutter
          pos: new THREE.Vector3(3.5, -0.3, -1.2),
          rot: new THREE.Euler(0.06, -0.18, 0.15),
          scale: 0.70,
          cameraZ: 8.0
        }
      };
    }
  }

  // Update based on total scroll progress [0.0 -> 1.0]
  updateScrollProgress(scrollFraction) {
    if (this.currentPage !== 'index.html') {
      // Subpage dedicated subtle scroll motion
      let baseStage = this.stages.hero;
      if (this.currentPage === 'about.html') baseStage = this.stages.about;
      else if (this.currentPage === 'services.html') baseStage = this.stages.services;
      else if (this.currentPage === 'gallery.html') baseStage = this.stages.gallery;
      else if (this.currentPage === 'contact.html') baseStage = this.stages.contact;

      const deltaY = scrollFraction * 1.2;
      this.targetTransform.pos.set(
        baseStage.pos.x + (this.isMobile ? 0 : Math.sin(scrollFraction * Math.PI) * 0.4),
        baseStage.pos.y - deltaY * 0.8,
        baseStage.pos.z + Math.cos(scrollFraction * Math.PI) * 0.2
      );
      this.targetTransform.rot.x = baseStage.rot.x + scrollFraction * 0.2;
      this.targetTransform.rot.y = baseStage.rot.y - scrollFraction * 0.3;
      this.targetTransform.rot.z = baseStage.rot.z + scrollFraction * 0.15;
      this.targetTransform.scale = baseStage.scale;
      this.targetTransform.cameraZ = baseStage.cameraZ;
      return;
    }

    let sourceStage, targetStage, localT;

    if (scrollFraction <= 0.20) {
      // Hero -> About transition
      localT = scrollFraction / 0.20;
      sourceStage = this.stages.hero;
      targetStage = this.stages.about;
    } else if (scrollFraction <= 0.48) {
      // About -> Services transition
      localT = (scrollFraction - 0.20) / 0.28;
      sourceStage = this.stages.about;
      targetStage = this.stages.services;
    } else if (scrollFraction <= 0.74) {
      // Services -> Gallery transition
      localT = (scrollFraction - 0.48) / 0.26;
      sourceStage = this.stages.services;
      targetStage = this.stages.gallery;
    } else {
      // Gallery -> Contact transition
      localT = Math.min(1.0, (scrollFraction - 0.74) / 0.26);
      sourceStage = this.stages.gallery;
      targetStage = this.stages.contact;
    }

    // Smooth cubic easing for comfortable, non-jarring cinematic motion
    const easedT = localT * localT * (3 - 2 * localT);

    // Interpolate targets
    this.targetTransform.pos.lerpVectors(sourceStage.pos, targetStage.pos, easedT);
    this.targetTransform.rot.x = THREE.MathUtils.lerp(sourceStage.rot.x, targetStage.rot.x, easedT);
    this.targetTransform.rot.y = THREE.MathUtils.lerp(sourceStage.rot.y, targetStage.rot.y, easedT);
    this.targetTransform.rot.z = THREE.MathUtils.lerp(sourceStage.rot.z, targetStage.rot.z, easedT);
    this.targetTransform.scale = THREE.MathUtils.lerp(sourceStage.scale, targetStage.scale, easedT);
    this.targetTransform.cameraZ = THREE.MathUtils.lerp(sourceStage.cameraZ, targetStage.cameraZ, easedT);
  }

  // Called in render loop with delta damping
  update(delta) {
    if (!this.scissors) return;

    const damp = Math.min(1.0, delta * 3.8);

    // Smooth position lerp
    this.scissors.group.position.lerp(this.targetTransform.pos, damp);

    // Smooth rotation lerp
    this.scissors.group.rotation.z += (this.targetTransform.rot.z - this.scissors.group.rotation.z) * damp;

    // Smooth scale lerp
    const currentScale = this.scissors.group.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, this.targetTransform.scale, damp);
    this.scissors.group.scale.set(nextScale, nextScale, nextScale);

    // Smooth camera depth adjustment
    if (this.camera) {
      this.camera.position.z += (this.targetTransform.cameraZ - this.camera.position.z) * damp;
    }
  }
}
