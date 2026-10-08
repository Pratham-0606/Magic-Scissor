/**
 * Magic Scissors - Procedural Salon Tools (Comb & Styling Brush)
 * Procedural Three.js models representing precision craftsmanship.
 * Drifts at layered depths during the About Craft scene (Scene 02).
 */

import * as THREE from 'three';

export class SalonTools {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "SalonToolsRoot";
    this.group.visible = false;
    this.scene.add(this.group);

    // Visibility / presence weight [0.0 = completely tucked, 1.0 = fully present]
    this.presence = 0;
    this.targetPresence = 0;

    this.initMaterials();
    this.initComb();
    this.initBrush();
  }

  initMaterials() {
    this.materials = [];

    // Warm champagne rose gold metallic
    this.goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xb86b49),
      metalness: 0.85,
      roughness: 0.28,
      envMapIntensity: 1.5
    });
    this.materials.push(this.goldMat);

    // Polished razor steel
    this.steelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xFAF8F5),
      metalness: 0.92,
      roughness: 0.18,
      envMapIntensity: 1.6
    });
    this.materials.push(this.steelMat);

    // Warm luxury tortoiseshell / smoked amber lacquer
    this.amberMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x3E2419),
      roughness: 0.35,
      metalness: 0.3,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2
    });
    this.materials.push(this.amberMat);
  }

  initComb() {
    this.combGroup = new THREE.Group();
    this.combGroup.name = "ProceduralComb";

    // 1. Sleek ergonomic spine
    const spineGeom = new THREE.BoxGeometry(2.4, 0.24, 0.07);
    const spineMesh = new THREE.Mesh(spineGeom, this.goldMat);
    this.combGroup.add(spineMesh);

    // 2. Spine decorative champfer / back ridge
    const ridgeGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 16);
    const ridgeMesh = new THREE.Mesh(ridgeGeom, this.steelMat);
    ridgeMesh.rotation.z = Math.PI / 2;
    ridgeMesh.position.y = 0.12;
    this.combGroup.add(ridgeMesh);

    // 3. Procedural teeth array
    const toothCount = 22;
    const toothSpacing = 2.0 / (toothCount - 1);
    const toothGeom = new THREE.BoxGeometry(0.038, 0.85, 0.045);

    for (let i = 0; i < toothCount; i++) {
      const toothMesh = new THREE.Mesh(toothGeom, this.steelMat);
      toothMesh.position.x = -1.0 + i * toothSpacing;
      toothMesh.position.y = -0.48;
      this.combGroup.add(toothMesh);
    }

    // Default resting transform (right peripheral gutter in About scene)
    this.combBasePos = new THREE.Vector3(3.2, 0.4, -2.4);
    this.combBaseRot = new THREE.Euler(0.2, -0.35, 0.38);
    this.combGroup.position.copy(this.combBasePos);
    this.combGroup.rotation.copy(this.combBaseRot);
    this.combGroup.scale.set(0.001, 0.001, 0.001);

    this.group.add(this.combGroup);
  }

  initBrush() {
    this.brushGroup = new THREE.Group();
    this.brushGroup.name = "ProceduralBrush";

    // 1. Contoured tapered handle
    const handleGeom = new THREE.CylinderGeometry(0.09, 0.065, 1.8, 20);
    const handleMesh = new THREE.Mesh(handleGeom, this.amberMat);
    handleMesh.position.y = -0.9;
    this.brushGroup.add(handleMesh);

    // 2. Rose gold accent ferrule ring
    const ferruleGeom = new THREE.CylinderGeometry(0.12, 0.10, 0.18, 24);
    const ferruleMesh = new THREE.Mesh(ferruleGeom, this.goldMat);
    ferruleMesh.position.y = 0.05;
    this.brushGroup.add(ferruleMesh);

    // 3. Oval paddle head cushion
    const paddleGeom = new THREE.BoxGeometry(0.85, 1.3, 0.22);
    const paddleMesh = new THREE.Mesh(paddleGeom, this.amberMat);
    paddleMesh.position.y = 0.78;
    this.brushGroup.add(paddleMesh);

    // 4. Subtle gold rim around the paddle head
    const rimGeom = new THREE.TorusGeometry(0.55, 0.035, 12, 32);
    const rimMesh = new THREE.Mesh(rimGeom, this.goldMat);
    rimMesh.position.set(0, 0.78, 0.11);
    this.brushGroup.add(rimMesh);

    // 5. Stylized bristle bed (representative pin clusters)
    const pinGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.32, 8);
    const pinRows = 5;
    const pinCols = 4;
    for (let r = 0; r < pinRows; r++) {
      for (let c = 0; c < pinCols; c++) {
        const pin = new THREE.Mesh(pinGeom, this.steelMat);
        pin.position.set(
          -0.26 + c * 0.17,
          0.35 + r * 0.22,
          0.26
        );
        pin.rotation.x = Math.PI / 2;
        this.brushGroup.add(pin);
      }
    }

    // Default resting transform (left lower depth in About scene)
    this.brushBasePos = new THREE.Vector3(-3.0, -1.1, -3.2);
    this.brushBaseRot = new THREE.Euler(-0.25, 0.4, -0.42);
    this.brushGroup.position.copy(this.brushBasePos);
    this.brushGroup.rotation.copy(this.brushBaseRot);
    this.brushGroup.scale.set(0.001, 0.001, 0.001);

    this.group.add(this.brushGroup);
  }

  // Update based on scroll progress: active in Scene 02 (About) and on about.html
  updateScroll(scrollFraction) {
    const isAboutPage = typeof window !== 'undefined' && window.location.pathname.includes('about.html');
    if (isAboutPage) {
      // Present throughout about.html, gently fading near bottom footer
      this.targetPresence = scrollFraction > 0.88 ? Math.max(0, 1.0 - (scrollFraction - 0.88) / 0.1) : 1.0;
      return;
    }

    // In index.html, About is roughly scrollFraction 0.10 - 0.44
    if (scrollFraction >= 0.10 && scrollFraction <= 0.44) {
      if (scrollFraction <= 0.22) {
        // Fade in
        this.targetPresence = (scrollFraction - 0.10) / 0.12;
      } else if (scrollFraction <= 0.34) {
        // Full presence
        this.targetPresence = 1.0;
      } else {
        // Fade out into Services
        this.targetPresence = Math.max(0, 1.0 - (scrollFraction - 0.34) / 0.10);
      }
    } else {
      this.targetPresence = 0;
    }
  }

  // Called in render loop
  update(delta, time, mouse) {
    // Smoothly ease presence weight
    const lerpRate = Math.min(1.0, delta * 3.5);
    this.presence += (this.targetPresence - this.presence) * lerpRate;

    if (this.presence < 0.01) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    // Comb floating motion
    const combBobY = Math.sin(time * 0.85) * 0.12;
    const combBobRot = Math.cos(time * 0.65) * 0.06;
    const combScale = 0.58 * this.presence;

    this.combGroup.scale.set(combScale, combScale, combScale);
    this.combGroup.position.set(
      this.combBasePos.x + (mouse?.x || 0) * 0.25,
      this.combBasePos.y + combBobY - (mouse?.y || 0) * 0.2,
      this.combBasePos.z
    );
    this.combGroup.rotation.z = this.combBaseRot.z + combBobRot;
    this.combGroup.rotation.y = this.combBaseRot.y + (mouse?.x || 0) * 0.12;

    // Brush floating motion (gentle counter-phase)
    const brushBobY = Math.cos(time * 0.75 + 1.2) * 0.14;
    const brushBobRot = Math.sin(time * 0.55 + 0.8) * 0.08;
    const brushScale = 0.55 * this.presence;

    this.brushGroup.scale.set(brushScale, brushScale, brushScale);
    this.brushGroup.position.set(
      this.brushBasePos.x + (mouse?.x || 0) * 0.2,
      this.brushBasePos.y + brushBobY - (mouse?.y || 0) * 0.15,
      this.brushBasePos.z
    );
    this.brushGroup.rotation.z = this.brushBaseRot.z + brushBobRot;
    this.brushGroup.rotation.x = this.brushBaseRot.x + (mouse?.y || 0) * 0.1;
  }

  destroy() {
    if (this.combGroup) {
      this.combGroup.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
        }
      });
    }

    if (this.brushGroup) {
      this.brushGroup.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
        }
      });
    }

    this.materials.forEach((mat) => {
      if (mat && typeof mat.dispose === 'function') {
        mat.dispose();
      }
    });

    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
