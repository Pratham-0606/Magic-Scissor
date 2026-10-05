/**
 * Magic Scissors - High Precision 3D Salon Shears Model
 * Modular component supporting both procedural luxury shears & GLTF/GLB loader.
 * Features realistic pivot articulation, ergonomic rings, tang finger rest, and champagne forged steel materials.
 */

import * as THREE from 'three';

export class ScissorsModel {
  constructor(options = {}) {
    this.castShadow = options.castShadow ?? true;
    this.receiveShadow = options.receiveShadow ?? true;

    // Master container
    this.group = new THREE.Group();
    this.group.name = "ScissorsRoot";

    // Pivot hierarchy
    this.pivotGroup = new THREE.Group();
    this.pivotGroup.name = "ScissorsPivotCenter";
    this.group.add(this.pivotGroup);

    this.bladeAGroup = new THREE.Group();
    this.bladeAGroup.name = "BladeA_Assembly";

    this.bladeBGroup = new THREE.Group();
    this.bladeBGroup.name = "BladeB_Assembly";

    this.pivotGroup.add(this.bladeAGroup);
    this.pivotGroup.add(this.bladeBGroup);

    // Animation & snip states
    this.currentSnipAngle = 0.04;
    this.targetSnipAngle = 0.04;
    this.isSnipActive = false;
    this.snipPhase = 0;
    this.snipTimer = 0;

    // Build the high-detail procedural model
    this.buildProceduralModel();

    // Check if external GLB is configured
    if (options.glbPath) {
      this.loadGLB(options.glbPath);
    }
  }

  buildProceduralModel() {
    // 1. Luxury Metallic Materials
    const champagneSteelMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd6a894),
      metalness: 0.94,
      roughness: 0.16,
      clearcoat: 0.75,
      clearcoatRoughness: 0.12,
      reflectivity: 0.92,
      side: THREE.DoubleSide
    });

    const razorEdgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xfcf8f2),
      metalness: 0.98,
      roughness: 0.08,
      side: THREE.DoubleSide
    });

    const goldAccentMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd4af37),
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.18
    });

    const rubberSilencerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a191f),
      roughness: 0.85,
      metalness: 0.1
    });

    // 2. Helper to create a tapered precision salon blade with bevel cutting edge
    const createBladeShape = (isMirrored = false) => {
      const shape = new THREE.Shape();
      const mirror = isMirrored ? -1 : 1;

      // Start at pivot base
      shape.moveTo(0, 0);
      // Outer spine with elegant convex salon curvature tapering to fine point
      shape.bezierCurveTo(
        mirror * 0.35, 1.2,
        mirror * 0.28, 2.6,
        mirror * 0.04, 3.8
      );
      // Sharp needle tip
      shape.lineTo(0, 3.85);
      // Razor-sharp cutting edge with slight Japanese convex radius
      shape.bezierCurveTo(
        mirror * -0.06, 2.5,
        mirror * -0.12, 1.2,
        0, 0
      );

      return shape;
    };

    const extrudeSettings = {
      steps: 2,
      depth: 0.045,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.025,
      bevelOffset: 0,
      bevelSegments: 3
    };

    // ----------------------------------------------------
    // BLADE A ASSEMBLY (Top cutting blade + Thumb Handle)
    // ----------------------------------------------------
    const bladeAShape = createBladeShape(false);
    const bladeAGeom = new THREE.ExtrudeGeometry(bladeAShape, extrudeSettings);
    bladeAGeom.center();
    // Offset so pivot point is at origin (0, 0, 0)
    bladeAGeom.translate(0.08, 1.9, 0.025);

    const bladeAMesh = new THREE.Mesh(bladeAGeom, champagneSteelMat);
    bladeAMesh.castShadow = this.castShadow;
    bladeAMesh.receiveShadow = this.receiveShadow;
    this.bladeAGroup.add(bladeAMesh);

    // Micro cutting edge strip
    const edgeACurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.05, 0.04),
      new THREE.Vector3(-0.06, 1.3, 0.04),
      new THREE.Vector3(-0.04, 2.6, 0.04),
      new THREE.Vector3(0, 3.82, 0.04)
    );
    const edgeAGeom = new THREE.TubeGeometry(edgeACurve, 32, 0.012, 6, false);
    const edgeAMesh = new THREE.Mesh(edgeAGeom, razorEdgeMat);
    this.bladeAGroup.add(edgeAMesh);

    // Shank A (connecting pivot to thumb ring)
    const shankACurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0.02),
      new THREE.Vector3(0.12, -0.6, 0.02),
      new THREE.Vector3(0.24, -1.2, 0.02),
      new THREE.Vector3(0.42, -1.75, 0.02)
    );
    const shankAGeom = new THREE.TubeGeometry(shankACurve, 24, 0.052, 10, false);
    const shankAMesh = new THREE.Mesh(shankAGeom, champagneSteelMat);
    shankAMesh.castShadow = this.castShadow;
    this.bladeAGroup.add(shankAMesh);

    // Ergonomic Thumb Ring
    const ringAGeom = new THREE.TorusGeometry(0.36, 0.065, 16, 36);
    const ringAMesh = new THREE.Mesh(ringAGeom, champagneSteelMat);
    ringAMesh.position.set(0.64, -2.02, 0.02);
    ringAMesh.rotation.set(0.12, 0.15, -0.32);
    ringAMesh.scale.set(1.0, 1.15, 0.9); // Ergonomic oval shaping
    ringAMesh.castShadow = this.castShadow;
    this.bladeAGroup.add(ringAMesh);

    // Rubber Silencer Bumper
    const bumperGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12);
    const bumperMesh = new THREE.Mesh(bumperGeom, rubberSilencerMat);
    bumperMesh.position.set(0.26, -1.75, 0.02);
    bumperMesh.rotation.z = Math.PI / 2;
    this.bladeAGroup.add(bumperMesh);


    // ----------------------------------------------------
    // BLADE B ASSEMBLY (Opposite cutting blade + Finger Ring + Tang)
    // ----------------------------------------------------
    const bladeBShape = createBladeShape(true);
    const bladeBGeom = new THREE.ExtrudeGeometry(bladeBShape, extrudeSettings);
    bladeBGeom.center();
    bladeBGeom.translate(-0.08, 1.9, -0.025);

    const bladeBMesh = new THREE.Mesh(bladeBGeom, champagneSteelMat);
    bladeBMesh.castShadow = this.castShadow;
    bladeBMesh.receiveShadow = this.receiveShadow;
    this.bladeBGroup.add(bladeBMesh);

    // Micro cutting edge strip B
    const edgeBCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.05, -0.04),
      new THREE.Vector3(0.06, 1.3, -0.04),
      new THREE.Vector3(0.04, 2.6, -0.04),
      new THREE.Vector3(0, 3.82, -0.04)
    );
    const edgeBGeom = new THREE.TubeGeometry(edgeBCurve, 32, 0.012, 6, false);
    const edgeBMesh = new THREE.Mesh(edgeBGeom, razorEdgeMat);
    this.bladeBGroup.add(edgeBMesh);

    // Shank B
    const shankBCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, -0.02),
      new THREE.Vector3(-0.12, -0.6, -0.02),
      new THREE.Vector3(-0.25, -1.2, -0.02),
      new THREE.Vector3(-0.44, -1.75, -0.02)
    );
    const shankBGeom = new THREE.TubeGeometry(shankBCurve, 24, 0.052, 10, false);
    const shankBMesh = new THREE.Mesh(shankBGeom, champagneSteelMat);
    shankBMesh.castShadow = this.castShadow;
    this.bladeBGroup.add(shankBMesh);

    // Ergonomic Finger Ring B
    const ringBGeom = new THREE.TorusGeometry(0.38, 0.065, 16, 36);
    const ringBMesh = new THREE.Mesh(ringBGeom, champagneSteelMat);
    ringBMesh.position.set(-0.66, -2.04, -0.02);
    ringBMesh.rotation.set(-0.12, -0.15, 0.32);
    ringBMesh.scale.set(1.0, 1.2, 0.9);
    ringBMesh.castShadow = this.castShadow;
    this.bladeBGroup.add(ringBMesh);

    // Precision Stylist's Tang (Finger Rest for pinky finger)
    const tangCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.88, -2.3, -0.02),
      new THREE.Vector3(-1.12, -2.6, -0.02),
      new THREE.Vector3(-1.24, -2.85, 0.02),
      new THREE.Vector3(-1.22, -3.02, 0.05)
    );
    const tangGeom = new THREE.TubeGeometry(tangCurve, 20, 0.04, 10, false);
    const tangMesh = new THREE.Mesh(tangGeom, goldAccentMat);
    tangMesh.castShadow = this.castShadow;
    this.bladeBGroup.add(tangMesh);

    // Tang Accent Sphere Ball
    const tangBallGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const tangBallMesh = new THREE.Mesh(tangBallGeom, goldAccentMat);
    tangBallMesh.position.set(-1.22, -3.02, 0.05);
    this.bladeBGroup.add(tangBallMesh);


    // ----------------------------------------------------
    // CENTRAL PIVOT SCREW & MONOGRAM DIAL (Jeweled tension dial)
    // ----------------------------------------------------
    const pivotAssembly = new THREE.Group();
    pivotAssembly.name = "PivotScrewDial";

    // Outer gold tension ring
    const screwCapGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 28);
    const screwCapMesh = new THREE.Mesh(screwCapGeom, goldAccentMat);
    screwCapMesh.rotation.x = Math.PI / 2;
    screwCapMesh.castShadow = this.castShadow;
    pivotAssembly.add(screwCapMesh);

    // Inner knurled bezel
    const innerDialGeom = new THREE.CylinderGeometry(0.13, 0.13, 0.16, 20);
    const innerDialMesh = new THREE.Mesh(innerDialGeom, champagneSteelMat);
    innerDialMesh.rotation.x = Math.PI / 2;
    pivotAssembly.add(innerDialMesh);

    // Center decorative monogram jewel
    const jewelGeom = new THREE.SphereGeometry(0.065, 16, 16);
    const jewelMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xb86b49),
      metalness: 0.3,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 0.4
    });
    const jewelMesh = new THREE.Mesh(jewelGeom, jewelMat);
    jewelMesh.position.z = 0.085;
    pivotAssembly.add(jewelMesh);

    this.pivotGroup.add(pivotAssembly);

    // Center initial placement
    this.group.scale.set(0.9, 0.9, 0.9);
  }

  // Set opening angle in radians (0 = closed, ~0.25 = wide open)
  setSnip(angle) {
    this.targetSnipAngle = Math.max(0, Math.min(0.35, angle));
  }

  // Triggers an intentional snappy mechanical double-cut
  triggerSnip() {
    this.isSnipActive = true;
    this.snipPhase = 0;
    this.snipTimer = 0;
  }

  // Update loop: smooth snip interpolation, idle float and cursor reaction
  update(delta, time, mouseOffset = { x: 0, y: 0 }) {
    // 1. Active Snip Animation Sequence
    if (this.isSnipActive) {
      this.snipTimer += delta * 6;
      if (this.snipTimer < 1.0) {
        // First cut: open fast, snap shut
        this.targetSnipAngle = Math.sin(this.snipTimer * Math.PI) * 0.22;
      } else if (this.snipTimer < 2.0) {
        // Second crisp snip
        this.targetSnipAngle = Math.sin((this.snipTimer - 1.0) * Math.PI) * 0.18;
      } else {
        this.isSnipActive = false;
        this.targetSnipAngle = 0.04;
      }
    } else {
      // Gentle idle breathing snip
      const idleBreathing = 0.035 + Math.sin(time * 1.4) * 0.025;
      this.targetSnipAngle = idleBreathing;
    }

    // Smooth lerp to target angle
    this.currentSnipAngle += (this.targetSnipAngle - this.currentSnipAngle) * 0.15;
    this.bladeAGroup.rotation.z = -this.currentSnipAngle;
    this.bladeBGroup.rotation.z = this.currentSnipAngle;

    // 2. Gentle organic levitation floating
    this.group.position.y += Math.sin(time * 1.8) * 0.0018;

    // 3. Subtle response to mouse cursor
    const targetRotX = mouseOffset.y * 0.18;
    const targetRotY = mouseOffset.x * 0.22;
    this.group.rotation.x += (targetRotX - this.group.rotation.x) * 0.08;
    this.group.rotation.y += (targetRotY - this.group.rotation.y) * 0.08;
  }

  async loadGLB(path) {
    try {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(path, (gltf) => {
        // If an external GLB is loaded successfully, replace the procedural mesh
        while (this.pivotGroup.children.length > 0) {
          this.pivotGroup.remove(this.pivotGroup.children[0]);
        }
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = this.castShadow;
            child.receiveShadow = this.receiveShadow;
          }
        });
        this.pivotGroup.add(model);
      }, undefined, (err) => {
        // Fallback remains active seamlessly
        console.warn("Using procedural luxury shears (GLB fallback active)");
      });
    } catch (e) {
      // Procedural model remains active
    }
  }
}
