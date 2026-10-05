/**
 * Magic Scissors - Three.js Resource Disposal
 * Recursively cleans geometries, materials, textures, render targets and listeners to prevent memory leaks.
 */

export function disposeObject(obj) {
  if (!obj) return;

  if (obj.geometry) {
    obj.geometry.dispose();
  }

  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(m => disposeMaterial(m));
    } else {
      disposeMaterial(obj.material);
    }
  }

  if (obj.children && obj.children.length > 0) {
    for (let i = obj.children.length - 1; i >= 0; i--) {
      disposeObject(obj.children[i]);
    }
  }
}

function disposeMaterial(mat) {
  if (!mat) return;
  
  // Dispose all associated textures
  const textureProperties = [
    'map', 'normalMap', 'roughnessMap', 'metalnessMap', 
    'aoMap', 'alphaMap', 'emissiveMap', 'envMap', 'lightMap'
  ];

  textureProperties.forEach(prop => {
    if (mat[prop] && typeof mat[prop].dispose === 'function') {
      mat[prop].dispose();
    }
  });

  if (typeof mat.dispose === 'function') {
    mat.dispose();
  }
}

export function disposeScene(scene, renderer) {
  if (scene) {
    while (scene.children.length > 0) {
      const child = scene.children[0];
      disposeObject(child);
      scene.remove(child);
    }
  }

  if (renderer) {
    if (typeof renderer.dispose === 'function') {
      renderer.dispose();
    }
    if (typeof renderer.forceContextLoss === 'function') {
      try {
        renderer.forceContextLoss();
      } catch (e) { }
    }
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
}
