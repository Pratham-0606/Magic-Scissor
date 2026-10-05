/**
 * Magic Scissors - Cinematic Salon Lighting System
 * Warm key light, soft ambient fill, subtle terracotta-bronze rim light and cursor highlight.
 */

import * as THREE from 'three';

export class SceneLighting {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.enableShadows = options.enableShadows ?? true;
    this.lights = {};
    this.init();
  }

  init() {
    // 1. Soft Ambient & Hemisphere Light (warm ceiling sky, deep salon floor)
    const hemiLight = new THREE.HemisphereLight(0xfff3e8, 0x16141a, 1.25);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    this.lights.hemi = hemiLight;

    // 2. Warm Key Light (Studio spotlight angled toward the shears)
    const keyLight = new THREE.DirectionalLight(0xffedd8, 2.6);
    keyLight.position.set(5, 7, 6);
    if (this.enableShadows) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
    }
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    // 3. Brand Terracotta / Bronze Rim Light (glancing angle for metallic edge gleam)
    const rimLight = new THREE.DirectionalLight(0xd49a7e, 3.2);
    rimLight.position.set(-6, -2, -4);
    this.scene.add(rimLight);
    this.lights.rim = rimLight;

    // 4. Subtle Top Accent Light (Champagne Gold)
    const topAccent = new THREE.PointLight(0xf5d8bf, 1.6, 14);
    topAccent.position.set(0, 4, 3);
    this.scene.add(topAccent);
    this.lights.topAccent = topAccent;

    // 5. Cursor Interactive Follow Light (Subtle specular shine on metal)
    const cursorGleam = new THREE.PointLight(0xffead0, 1.2, 10);
    cursorGleam.position.set(2, 1, 4);
    this.scene.add(cursorGleam);
    this.lights.cursorGleam = cursorGleam;
  }

  updateCursor(normalizedX, normalizedY) {
    if (this.lights.cursorGleam) {
      // Smoothly offset light based on mouse (-1 to 1)
      this.lights.cursorGleam.position.x = normalizedX * 4 + 1.5;
      this.lights.cursorGleam.position.y = -normalizedY * 3 + 1.0;
    }
  }

  setIntensityMultiplier(mult) {
    if (this.lights.key) this.lights.key.intensity = 2.6 * mult;
    if (this.lights.rim) this.lights.rim.intensity = 3.2 * mult;
    if (this.lights.hemi) this.lights.hemi.intensity = 1.25 * mult;
  }
}
