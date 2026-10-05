/**
 * Magic Scissors - Stylized Salon 3D Environment & Hair-Like Spline Motion
 * Adds architectural backdrop depth, subtle reflections, luxury ambient motes,
 * and elegant organic flowing hair-strand spline curves.
 */

import * as THREE from 'three';

export class SalonEnvironment {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.enableHairMotion = options.enableHairMotion ?? true;
    this.group = new THREE.Group();
    this.group.name = "SalonEnvironmentRoot";
    this.scene.add(this.group);

    this.hairStrands = [];
    this.particles = null;

    // Subtle luxury framing in deep background without blocking floor/content
    this.initArchitecturalArches();
    if (this.enableHairMotion) {
      this.initHairStrandMotion();
    }
    this.initAtmosphericMotes();
  }

  // 1. Stylized luxury salon architectural gold framing in deep depth
  initArchitecturalArches() {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, -0.5, -8);

    const goldTrimMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xb86b49),
      metalness: 0.9,
      roughness: 0.25,
      clearcoat: 0.5,
      transparent: true,
      opacity: 0.35
    });

    // Central elegant arched mirror profile outline
    const outerTorusGeom = new THREE.TorusGeometry(3.6, 0.05, 16, 48, Math.PI);
    const outerArch = new THREE.Mesh(outerTorusGeom, goldTrimMat);
    outerArch.position.set(0, 0, 0);
    archGroup.add(outerArch);

    this.group.add(archGroup);
  }

  // 2. Hair-like 3D Motion (Smooth flowing curves inspired by hair strands, kept subtle in deep background)
  initHairStrandMotion() {
    const strandConfigs = [
      { startX: -5.2, startY: 3.2, depth: -5.5, scale: 0.8, speed: 0.6 },
      { startX: -4.0, startY: 2.8, depth: -6.0, scale: 0.7, speed: 0.8 },
      { startX: 4.2, startY: 2.9, depth: -5.8, scale: 0.75, speed: 0.7 },
      { startX: 5.5, startY: 3.4, depth: -6.2, scale: 0.65, speed: 0.55 }
    ];

    strandConfigs.forEach((cfg, idx) => {
      // Create initial spline control points
      const points = [];
      const numPoints = 6;
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const y = cfg.startY - t * 6.5;
        const x = cfg.startX + Math.sin(t * Math.PI * 1.5 + idx) * 0.5;
        const z = cfg.depth + Math.cos(t * Math.PI) * 0.3;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geom = new THREE.TubeGeometry(curve, 48, 0.012 * cfg.scale, 8, false);

      const hairMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(idx % 2 === 0 ? 0xd49a7e : 0xb86b49),
        roughness: 0.35,
        metalness: 0.6,
        transparent: true,
        opacity: 0.16
      });

      const mesh = new THREE.Mesh(geom, hairMat);
      this.group.add(mesh);

      this.hairStrands.push({
        mesh,
        basePoints: points.map(p => p.clone()),
        speed: cfg.speed,
        phase: idx * 1.3
      });
    });
  }

  // 4. Subtle salon atmosphere motes (Champagne gold air motes)
  initAtmosphericMotes() {
    const count = 35;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = -1 - Math.random() * 5;
      speeds[i] = 0.2 + Math.random() * 0.4;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xf5d9c2,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geom, mat);
    this.particleSpeeds = speeds;
    this.group.add(this.particles);
  }

  update(delta, time) {
    // 1. Animate hair strands with slow organic wave motion
    if (this.hairStrands && this.hairStrands.length > 0) {
      this.hairStrands.forEach((strand) => {
        const positions = strand.mesh.geometry.parameters.path.points;
        for (let i = 1; i < positions.length - 1; i++) {
          const base = strand.basePoints[i];
          const wave = Math.sin(time * strand.speed + strand.phase + i * 0.6) * 0.15;
          const waveZ = Math.cos(time * strand.speed * 0.8 + strand.phase + i * 0.4) * 0.08;
          positions[i].x = base.x + wave;
          positions[i].z = base.z + waveZ;
        }

        // Re-generate tube geometry smoothly
        const newGeom = new THREE.TubeGeometry(
          strand.mesh.geometry.parameters.path,
          48,
          strand.mesh.geometry.parameters.radius,
          8,
          false
        );
        strand.mesh.geometry.dispose();
        strand.mesh.geometry = newGeom;
      });
    }

    // 2. Animate atmospheric motes gently floating
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += this.particleSpeeds[i] * delta * 0.3;
        // Wrap around vertically
        if (pos[i * 3 + 1] > 4.5) {
          pos[i * 3 + 1] = -4.0;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
