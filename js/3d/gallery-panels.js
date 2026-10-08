/**
 * Magic Scissors - Floating 3D Salon Gallery Photo Panels
 * Staged at staggered depths in the Three.js scene during the Gallery section (Scene 04).
 * Camera drifts between them on scroll, and clicking a panel opens the lightbox.
 */

import * as THREE from 'three';

export class Gallery3DPanels {
  constructor(scene, camera, options = {}) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = "Gallery3DPanelsRoot";
    this.group.visible = false;
    this.scene.add(this.group);

    this.presence = 0;
    this.targetPresence = 0;
    this.panels = [];
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();

    this.initPanels();
  }

  initPanels() {
    const textureLoader = new THREE.TextureLoader();

    const panelConfigs = [
      {
        img: 'assets/images/salon_styling_arena.jpg',
        title: 'Main Styling Arena',
        desc: 'Spacious styling floor with arched backlit mirrors and italian leather chairs.',
        basePos: new THREE.Vector3(-3.8, 0.4, -3.2),
        baseRot: new THREE.Euler(0.08, 0.32, -0.05),
        aspect: 1.4
      },
      {
        img: 'assets/images/salon_reception_foyer.jpg',
        title: 'Reception & Waiting Lounge',
        desc: 'Welcoming reception foyer and quiet lounge for arriving guests.',
        basePos: new THREE.Vector3(3.9, -0.2, -3.6),
        baseRot: new THREE.Euler(-0.06, -0.28, 0.04),
        aspect: 1.4
      },
      {
        img: 'assets/images/salon_wash_suite.jpg',
        title: 'Wash & Head Spa Suite',
        desc: 'Ergonomic wash loungers designed for calming scalp rituals and micro-mist care.',
        basePos: new THREE.Vector3(-3.4, -1.2, -4.5),
        baseRot: new THREE.Euler(0.05, 0.22, -0.04),
        aspect: 1.4
      },
      {
        img: 'assets/images/salon_vip_bridal.jpg',
        title: 'VIP Bridal Suite',
        desc: 'A secluded sanctuary for HD bridal makeup, couture styling, and entourage comfort.',
        basePos: new THREE.Vector3(3.6, 1.0, -4.8),
        baseRot: new THREE.Euler(-0.04, -0.22, 0.03),
        aspect: 1.4
      }
    ];

    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xb86b49),
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.65
    });

    panelConfigs.forEach((cfg, idx) => {
      const panelGroup = new THREE.Group();
      panelGroup.name = `GalleryPanel_${idx}`;

      const width = 1.9;
      const height = width / cfg.aspect;

      // 1. Picture plane
      const planeGeom = new THREE.PlaneGeometry(width, height);
      const texture = textureLoader.load(cfg.img, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
      });

      const photoMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide
      });

      const planeMesh = new THREE.Mesh(planeGeom, photoMat);
      planeMesh.userData = {
        isGalleryPanel: true,
        img: cfg.img,
        title: cfg.title,
        desc: cfg.desc
      };
      panelGroup.add(planeMesh);

      // 2. Luxury champagne rose-gold border frame
      const frameGeom = new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.04);
      const frameMesh = new THREE.Mesh(frameGeom, frameMat);
      frameMesh.position.z = -0.025;
      panelGroup.add(frameMesh);

      // Position
      panelGroup.position.copy(cfg.basePos);
      panelGroup.rotation.copy(cfg.baseRot);
      panelGroup.scale.set(0.001, 0.001, 0.001);

      this.group.add(panelGroup);

      this.panels.push({
        group: panelGroup,
        basePos: cfg.basePos.clone(),
        baseRot: cfg.baseRot.clone(),
        planeMesh,
        texture,
        photoMat,
        frameMat,
        planeGeom,
        frameGeom,
        index: idx
      });
    });
  }

  updateScroll(scrollFraction) {
    const isGalleryPage = typeof window !== 'undefined' && window.location.pathname.includes('gallery.html');
    if (isGalleryPage) {
      // Present throughout gallery.html, gently fading near bottom footer
      this.targetPresence = scrollFraction > 0.88 ? Math.max(0, 1.0 - (scrollFraction - 0.88) / 0.1) : 1.0;
      this.scrollProgress = scrollFraction;
      return;
    }

    // Gallery scene on homepage is roughly scrollFraction 0.44 to 0.78
    if (scrollFraction >= 0.44 && scrollFraction <= 0.78) {
      if (scrollFraction <= 0.54) {
        this.targetPresence = (scrollFraction - 0.44) / 0.10;
      } else if (scrollFraction <= 0.68) {
        this.targetPresence = 1.0;
      } else {
        this.targetPresence = Math.max(0, 1.0 - (scrollFraction - 0.68) / 0.10);
      }
    } else {
      this.targetPresence = 0;
    }

    this.scrollProgress = scrollFraction;
  }

  update(delta, time, mouse) {
    const lerpRate = Math.min(1.0, delta * 3.6);
    this.presence += (this.targetPresence - this.presence) * lerpRate;

    if (this.presence < 0.01) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    // Gentle camera depth shift and panels parallax floating
    this.panels.forEach((p, idx) => {
      const scale = 0.82 * this.presence;
      p.group.scale.set(scale, scale, scale);

      // Alternating float bob
      const bobY = Math.sin(time * 0.75 + idx * 1.4) * 0.1;
      const bobRotZ = Math.cos(time * 0.6 + idx) * 0.03;

      // Mouse parallax shift
      const mouseX = (mouse?.x || 0) * 0.25;
      const mouseY = (mouse?.y || 0) * 0.18;

      p.group.position.set(
        p.basePos.x + mouseX,
        p.basePos.y + bobY - mouseY,
        p.basePos.z + (idx % 2 === 0 ? Math.sin(time * 0.5) * 0.15 : -Math.sin(time * 0.5) * 0.15)
      );

      p.group.rotation.z = p.baseRot.z + bobRotZ;
      p.group.rotation.y = p.baseRot.y + mouseX * 0.1;

      // Update material opacities
      if (p.photoMat) p.photoMat.opacity = 0.92 * this.presence;
      if (p.frameMat) p.frameMat.opacity = 0.65 * this.presence;
    });
  }

  // Handle raycast click to trigger lightbox
  handleClick(e) {
    if (this.presence < 0.1 || !this.camera) return;

    this.mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseVec, this.camera);
    const meshes = this.panels.map(p => p.planeMesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData && hit.userData.isGalleryPanel) {
        if (window.magicScissorsApp && typeof window.magicScissorsApp.openLightbox === 'function') {
          window.magicScissorsApp.openLightbox(hit.userData.img, hit.userData.title, hit.userData.desc);
        }
      }
    }
  }

  destroy() {
    this.panels.forEach((p) => {
      if (p.planeGeom) p.planeGeom.dispose();
      if (p.frameGeom) p.frameGeom.dispose();
      if (p.photoMat) p.photoMat.dispose();
      if (p.frameMat) p.frameMat.dispose();
      if (p.texture) p.texture.dispose();
    });

    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
