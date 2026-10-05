"use client";

import React, { useEffect, useRef, useState, useCallback, useId } from "react";
import ReactDOM from "react-dom/client";

export interface MoltenGalleryItem {
  image: string;
  title: string;
  category?: string;
  year?: string;
  description?: string;
  link?: string;
}

export interface MoltenGalleryProps {
  items?: MoltenGalleryItem[];
  className?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  initialIndex?: number;
  autoRotate?: boolean;
  onItemChange?: (index: number, item: MoltenGalleryItem) => void;
}

export const DEFAULT_MAGIC_SCISSORS_GALLERY_ITEMS: MoltenGalleryItem[] = [
  {
    image: "assets/images/salon_hair_styling.jpg",
    title: "Signature Scissor Craft",
    category: "Hair Craft · Editorial",
    year: "2026",
    description: "Handcrafted precision shears tailored to facial symmetry, individual lifestyle, and natural hair movement.",
    link: "services.html"
  },
  {
    image: "assets/images/salon_styling_arena.jpg",
    title: "Main Styling Arena",
    category: "Interior · Styling Floor",
    year: "2026",
    description: "Arched illuminated stations and bespoke Italian leather styling chairs engineered for effortless luxury.",
    link: "gallery.html"
  },
  {
    image: "assets/images/salon_wash_suite.jpg",
    title: "Hydro-Therapy Wash Spa",
    category: "Wash Suite · Restorative",
    year: "2026",
    description: "Ergonomic wash loungers designed for calming scalp rituals, micro-mist hydration, and Olaplex repair.",
    link: "services.html"
  },
  {
    image: "assets/images/salon_vip_bridal.jpg",
    title: "Private VIP Bridal Suite",
    category: "Bridal · Haute Makeover",
    year: "2026",
    description: "A secluded sanctuary for camera-ready HD bridal makeup, luxury hairstyling, and bridal entourage comfort.",
    link: "services.html"
  },
  {
    image: "assets/images/salon_reception_foyer.jpg",
    title: "Reception & Ambient Lounge",
    category: "Hospitality · Welcome",
    year: "2026",
    description: "Warm alabaster silk tones, fresh artisanal espresso, and an unhurried atmosphere before your appointment.",
    link: "about.html"
  },
  {
    image: "assets/images/salon_men_grooming.jpg",
    title: "Classic Barber Suite",
    category: "Men's Grooming · Classic",
    year: "2026",
    description: "Traditional hot towel compresses, straight-razor precision edging, and botanical beard architecture.",
    link: "services.html"
  },
  {
    image: "assets/images/salon_nails.jpg",
    title: "Russian Gel Atelier",
    category: "Nails & Art · Studio Craft",
    year: "2026",
    description: "Diamond hardware cuticle purification, rubber base apex balancing, and bespoke French chrome art.",
    link: "services.html"
  },
  {
    image: "assets/images/salon_pedicure_spa.jpg",
    title: "Pedicure Sanctuary",
    category: "Wellness Spa · Reflexology",
    year: "2026",
    description: "Ceramic hydro-massage foot baths, Himalayan salt scrubs, and deep pressure point reflexology.",
    link: "services.html"
  }
];

/* --------------------------------------------------------------------------
   WebGL2 GLSL ES 3.00 Shaders
   -------------------------------------------------------------------------- */
const VERTEX_SHADER_SRC = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_offset;
uniform vec2 u_mouse;
uniform float u_mouse_hover;
uniform float u_entry;
uniform float u_reduced_motion;
uniform int u_count;

uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;
uniform sampler2D u_tex5;
uniform sampler2D u_tex6;
uniform sampler2D u_tex7;

// Polynomial Smooth Minimum for organic liquid card fusion
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// 2D Rounded Box SDF
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec4 sampleCardTexture(int index, vec2 uv) {
  uv = clamp(uv, 0.002, 0.998);
  switch(index) {
    case 0: return texture(u_tex0, uv);
    case 1: return texture(u_tex1, uv);
    case 2: return texture(u_tex2, uv);
    case 3: return texture(u_tex3, uv);
    case 4: return texture(u_tex4, uv);
    case 5: return texture(u_tex5, uv);
    case 6: return texture(u_tex6, uv);
    case 7: return texture(u_tex7, uv);
    default: return vec4(0.08, 0.08, 0.11, 1.0);
  }
}

void main() {
  vec2 res = u_resolution;
  vec2 fragCoord = gl_FragCoord.xy;
  
  // Normalized aspect-corrected space [-aspect, aspect] x [-1, 1]
  vec2 p = (fragCoord * 2.0 - res) / min(res.x, res.y);
  float isMobile = step(res.x, 768.0);
  
  // Luxury background: Obsidian Noir with Champagne Terracotta Vignette
  vec3 bgCol = mix(vec3(0.05, 0.05, 0.07), vec3(0.025, 0.025, 0.035), length(p) * 0.65);
  // Center spotlight behind active card
  bgCol += vec3(0.72, 0.42, 0.28) * exp(-length(p - vec2(0.0, -0.05)) * 2.2) * 0.18;
  
  // Base parameters
  float N = float(u_count);
  float angleStep = 0.48;
  float ringRadius = mix(2.65, 1.80, isMobile);
  vec2 ringCenter = vec2(0.0, 0.0);
  float activeY = mix(0.08, 0.28, isMobile);
  
  // Optical Glass Band near top and bottom
  float opticalDistort = sin(p.y * 3.5 + u_time * 0.4) * 0.008 * (1.0 - u_reduced_motion);
  p.x += opticalDistort;

  // Track closest card and overall fused distance field
  float fusedD = 1e5;
  int closestIdx = -1;
  float closestDist = 1e5;
  
  vec2 cardCenters[8];
  float cardRotations[8];
  vec2 cardHalfSizes[8];
  float cardDepths[8];
  float cardSDFs[8];
  vec2 cardLocalUVs[8];

  float baseW = mix(0.88, 0.80, isMobile);
  float baseH = mix(1.22, 1.05, isMobile);
  float cornerR = mix(0.125, 0.135, isMobile);
  float kBlend = mix(0.14, 0.07, u_reduced_motion); // liquid fusion viscosity

  // Calculate geometry for each card along the molten ring
  for (int i = 0; i < 8; i++) {
    if (i >= u_count) break;
    
    float fi = float(i);
    float diff = mod(fi - u_offset + N * 0.5, N) - N * 0.5;
    float theta = diff * angleStep;
    
    // Cylindrical ring projection with graceful arch
    float x = ringCenter.x + ringRadius * sin(theta);
    float archDrop = (1.0 - cos(theta)) * mix(0.42, 0.28, isMobile);
    float y = activeY - ringRadius * archDrop;
    float z = cos(theta);
    float scale = 0.80 + 0.32 * max(0.0, z);
    float rot = -theta * 0.55;
    
    // Entry animation: cards burst outward from a central molten droplet
    vec2 clusterPos = vec2(sin(fi * 1.5) * 0.14, activeY + cos(fi * 1.5) * 0.09);
    x = mix(clusterPos.x, x, u_entry);
    y = mix(clusterPos.y, y, u_entry);
    scale = mix(0.45, scale, u_entry);
    
    // Cursor influence (tactile lean & gentle repulsion)
    if (u_mouse_hover > 0.0 && u_reduced_motion < 0.5) {
      vec2 toMouse = u_mouse - vec2(x, y);
      float distM = length(toMouse);
      float mouseInfluence = clamp(1.0 - distM / 0.85, 0.0, 1.0);
      x += toMouse.x * mouseInfluence * 0.06;
      y += toMouse.y * mouseInfluence * 0.06;
      scale *= (1.0 + mouseInfluence * 0.08);
    }
    
    cardCenters[i] = vec2(x, y);
    cardRotations[i] = rot;
    cardHalfSizes[i] = vec2(baseW, baseH) * scale * 0.5;
    cardDepths[i] = z;
    
    // Local coordinates inside card
    vec2 pRel = p - cardCenters[i];
    float cosR = cos(-rot);
    float sinR = sin(-rot);
    vec2 pRot = vec2(pRel.x * cosR - pRel.y * sinR, pRel.x * sinR + pRel.y * cosR);
    
    float d = sdRoundedBox(pRot, cardHalfSizes[i], cornerR);
    cardSDFs[i] = d;
    cardLocalUVs[i] = pRot / (cardHalfSizes[i] * 2.0) + 0.5;
    
    // Fuse into collective molten glass field
    fusedD = (i == 0) ? d : smin(fusedD, d, kBlend);
    
    if (d < closestDist) {
      closestDist = d;
      closestIdx = i;
    }
  }

  // Cursor wake ripple
  if (u_mouse_hover > 0.0 && u_reduced_motion < 0.5) {
    float dMouse = length(p - u_mouse);
    float wake = sin(dMouse * 22.0 - u_time * 5.0) * exp(-dMouse * 3.8) * 0.015;
    fusedD += wake;
  }

  // If outside the liquid molten glass contour, render background & subtle glass shadow
  if (fusedD > 0.06) {
    // Soft ambient glass drop shadow
    float shadow = exp(-fusedD * 6.5) * 0.45;
    vec3 col = mix(bgCol, vec3(0.01, 0.01, 0.02), shadow);
    fragColor = vec4(col, 1.0);
    return;
  }

  // Crystal-clear artwork texture sampling (zero interior distortion or partition seams)
  vec2 cardUV = cardLocalUVs[closestIdx];
  vec4 baseSample = sampleCardTexture(closestIdx, cardUV);

  // Depth attenuation (active card is bright; receding cards gently fade into warm noir)
  float depthVal = cardDepths[closestIdx];
  float cardBrightness = mix(0.55, 1.0, pow(max(0.0, depthVal), 1.8));
  vec3 artColor = baseSample.rgb * cardBrightness;

  // Liquid fusion edge blend: if in bridge zone between cards, add pearl amber viscosity
  float blendWeight = clamp(-fusedD / kBlend, 0.0, 1.0);
  vec3 pearlBronze = vec3(0.85, 0.62, 0.48);
  
  // Specular Fresnel glass rim highlight along molten perimeter
  float rim = exp(-fusedD * fusedD * 1200.0);
  vec3 rimColor = mix(vec3(0.98, 0.94, 0.88), pearlBronze, 0.4) * rim * 1.35;

  // Subtle ambient glass sheen sweep
  float sheen = pow(max(0.0, sin(p.x * 1.5 + p.y * 1.0 - u_time * 0.5)), 12.0) * 0.06;
  
  // Subtle vignette on each card edge
  float edgeVignette = smoothstep(0.0, -0.05, fusedD);
  artColor = mix(artColor * 0.70, artColor, edgeVignette);

  // Combine pristine art + specular glass rim + sheen
  vec3 finalColor = artColor + rimColor + sheen * vec3(0.95, 0.92, 0.88);

  // Anti-aliased outer edge mask
  float edgeAlpha = 1.0 - smoothstep(0.0, 0.018, fusedD);
  vec3 blended = mix(bgCol, finalColor, edgeAlpha);

  fragColor = vec4(blended, 1.0);
}
`;

export const MoltenGallery: React.FC<MoltenGalleryProps> = ({
  items = DEFAULT_MAGIC_SCISSORS_GALLERY_ITEMS,
  className = "",
  title = "The Molten Ambience Atelier",
  subtitle = "An interactive liquid glass exhibition of Magic Scissors hair craft, private suites, and architectural elegance.",
  initialIndex = 0,
  autoRotate = false,
  onItemChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carouselId = useId();

  // Active artwork index
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  // WebGL & Animation state held outside React render loop
  const stateRef = useRef({
    gl: null as WebGL2RenderingContext | null,
    program: null as WebGLProgram | null,
    textures: [] as WebGLTexture[],
    imagesLoaded: 0,
    offset: initialIndex,
    targetOffset: initialIndex,
    velocity: 0,
    isDragging: false,
    isTouchPending: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartOffset: 0,
    lastDragX: 0,
    lastDragTime: 0,
    mouseX: 0,
    mouseY: 0,
    mouseHover: 0,
    entryProgress: 0,
    startTime: performance.now(),
    lastFrameTime: performance.now(),
    rafId: 0,
    uniforms: {} as Record<string, WebGLUniformLocation | null>,
    reducedMotion: false,
    itemCount: items.length
  });

  // Keep stateRef itemCount updated
  useEffect(() => {
    stateRef.current.itemCount = items.length;
  }, [items.length]);

  // Reduced motion query
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reducedMotion = mq.matches;
    if (mq.matches) {
      stateRef.current.entryProgress = 1.0;
    }
    const handleChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
      if (e.matches) stateRef.current.entryProgress = 1.0;
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Sync active index change to parent
  const handleIndexChange = useCallback(
    (idx: number) => {
      setActiveIndex(idx);
      if (onItemChange) {
        onItemChange(idx, items[idx]);
      }
    },
    [items, onItemChange]
  );

  // Direct programmatic navigation
  const navigateTo = useCallback(
    (targetIdx: number) => {
      const count = items.length;
      const normalizedTarget = ((targetIdx % count) + count) % count;
      const current = stateRef.current.offset;
      // Find shortest angular path
      let diff = normalizedTarget - (current % count);
      if (diff > count / 2) diff -= count;
      if (diff < -count / 2) diff += count;
      stateRef.current.targetOffset = current + diff;
      handleIndexChange(normalizedTarget);
    },
    [items.length, handleIndexChange]
  );

  const nextItem = useCallback(() => {
    navigateTo(activeIndex + 1);
  }, [activeIndex, navigateTo]);

  const prevItem = useCallback(() => {
    navigateTo(activeIndex - 1);
  }, [activeIndex, navigateTo]);

  // --------------------------------------------------------------------------
  // WebGL2 Initialization & Animation Loop
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL2
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false
    });

    if (!gl) {
      console.warn("WebGL2 not available. Falling back to luxury accessible carousel.");
      setIsWebGLSupported(false);
      return;
    }

    stateRef.current.gl = gl;

    // Helper: Compile Shader
    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) {
      setIsWebGLSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setIsWebGLSupported(false);
      return;
    }

    stateRef.current.program = program;
    gl.useProgram(program);

    // Full-screen Quad buffer
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Cache Uniform Locations
    const uniforms: Record<string, WebGLUniformLocation | null> = {
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_offset: gl.getUniformLocation(program, "u_offset"),
      u_mouse: gl.getUniformLocation(program, "u_mouse"),
      u_mouse_hover: gl.getUniformLocation(program, "u_mouse_hover"),
      u_entry: gl.getUniformLocation(program, "u_entry"),
      u_reduced_motion: gl.getUniformLocation(program, "u_reduced_motion"),
      u_count: gl.getUniformLocation(program, "u_count")
    };

    for (let i = 0; i < 8; i++) {
      uniforms[`u_tex${i}`] = gl.getUniformLocation(program, `u_tex${i}`);
    }
    stateRef.current.uniforms = uniforms;

    // Load Image Textures
    const textures: WebGLTexture[] = [];
    const maxItems = Math.min(items.length, 8);

    for (let i = 0; i < maxItems; i++) {
      const tex = gl.createTexture();
      if (!tex) continue;
      textures.push(tex);
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);

      // Temporary 1x1 placeholder texture (warm dark bronze)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([28, 22, 20, 255])
      );

      // Texture parameters
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Assign sampler unit
      gl.uniform1i(uniforms[`u_tex${i}`], i);

      // Async Image Loader
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = items[i].image;
      img.onload = () => {
        if (!stateRef.current.gl) return;
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        stateRef.current.imagesLoaded++;
      };
      img.onerror = () => {
        console.warn(`Could not load molten image ${items[i].image}, using fallback swatch`);
      };
    }
    stateRef.current.textures = textures;

    // Canvas Resize Handling with Device Pixel Ratio cap (2.0 max for high performance)
    const handleResize = () => {
      if (!canvas || !gl) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    // ------------------------------------------------------------------------
    // Animation Render Loop
    // ------------------------------------------------------------------------
    const render = (now: number) => {
      const s = stateRef.current;
      if (!s.gl || !s.program) return;

      const dt = Math.min((now - s.lastFrameTime) / 1000, 0.1);
      s.lastFrameTime = now;
      const elapsed = (now - s.startTime) / 1000;

      // 1. Entry Animation (2.4s cinematic liquid mass expansion)
      if (s.reducedMotion) {
        s.entryProgress = 1.0;
      } else if (s.entryProgress < 1.0) {
        s.entryProgress = Math.min(1.0, elapsed / 2.4);
      }

      // 2. Physics: Dragging vs Inertia Momentum vs Spring Snap
      if (!s.isDragging) {
        // Apply momentum damping
        s.velocity *= 0.92;
        s.offset += s.velocity * dt;

        // When velocity drops, smoothly snap to target offset
        const targetDiff = s.targetOffset - s.offset;
        s.offset += targetDiff * Math.min(1.0, dt * 7.5);

        // Update active index based on settled offset
        const count = items.length;
        const normalized = ((Math.round(s.offset) % count) + count) % count;
        if (normalized !== activeIndex && Math.abs(targetDiff) < 0.25) {
          handleIndexChange(normalized);
        }
      }

      // Auto-rotation (optional slow ambient spin if idle)
      if (autoRotate && !s.isDragging && Math.abs(s.velocity) < 0.01) {
        s.targetOffset += dt * 0.12;
      }

      // 3. Bind Uniforms
      gl.useProgram(s.program);
      gl.uniform2f(s.uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(s.uniforms.u_time, elapsed);
      gl.uniform1f(s.uniforms.u_offset, s.offset);
      gl.uniform2f(s.uniforms.u_mouse, s.mouseX, s.mouseY);
      gl.uniform1f(s.uniforms.u_mouse_hover, s.mouseHover);
      gl.uniform1f(s.uniforms.u_entry, s.entryProgress);
      gl.uniform1f(s.uniforms.u_reduced_motion, s.reducedMotion ? 1.0 : 0.0);
      gl.uniform1i(s.uniforms.u_count, maxItems);

      // 4. Draw Quad
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      s.rafId = requestAnimationFrame(render);
    };

    stateRef.current.rafId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(stateRef.current.rafId);
      resizeObserver.disconnect();
      if (gl) {
        textures.forEach((t) => gl.deleteTexture(t));
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(quadBuffer);
      }
    };
  }, [items, autoRotate, activeIndex, handleIndexChange]);

  // --------------------------------------------------------------------------
  // Pointer Drag, Touch Swipe & Momentum Physics (No scroll trap!)
  // --------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    const s = stateRef.current;
    s.dragStartX = e.clientX;
    s.dragStartY = e.clientY;
    s.lastDragX = e.clientX;
    s.lastDragTime = performance.now();
    s.dragStartOffset = s.offset;
    s.velocity = 0;
    s.isTouchPending = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update mouse coords in shader space [-aspect, aspect] x [-1, 1]
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    const aspect = rect.width / rect.height;
    s.mouseX = nx * (aspect > 1 ? aspect : 1.0);
    s.mouseY = ny * (aspect <= 1 ? 1.0 / aspect : 1.0);
    s.mouseHover = 1.0;

    const dx = e.clientX - s.dragStartX;
    const dy = e.clientY - s.dragStartY;

    // Detect intent: horizontal carousel swipe vs vertical page scroll
    if (s.isTouchPending && !s.isDragging) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        s.isDragging = true;
        s.isTouchPending = false;
        setIsInteracting(true);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch (_) {}
      } else if (Math.abs(dy) > 6) {
        // Vertical movement: user is scrolling the page! Let native scroll happen
        s.isTouchPending = false;
        return;
      }
    }

    if (!s.isDragging) return;

    const sensitivity = rect.width < 768 ? 0.0035 : 0.0022;
    s.offset = s.dragStartOffset - dx * sensitivity;
    s.targetOffset = s.offset;

    // Track drag velocity
    const now = performance.now();
    const dt = Math.max((now - s.lastDragTime) / 1000, 0.001);
    const deltaX = e.clientX - s.lastDragX;
    s.velocity = -(deltaX * sensitivity) / dt;
    s.lastDragX = e.clientX;
    s.lastDragTime = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const s = stateRef.current;
    s.isTouchPending = false;
    if (!s.isDragging) return;
    s.isDragging = false;
    setIsInteracting(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Apply snap to nearest item based on current offset & projected velocity
    const projected = s.offset + s.velocity * 0.22;
    const snapIdx = Math.round(projected);
    s.targetOffset = snapIdx;
  };

  const handlePointerLeave = () => {
    stateRef.current.mouseHover = 0.0;
  };

  // Wheel interaction: Only scroll ring on horizontal trackpad swipe or Shift+Wheel
  // DO NOT trap normal vertical page scrolling!
  const handleWheel = (e: React.WheelEvent) => {
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (isHorizontal || e.shiftKey) {
      const delta = isHorizontal ? e.deltaX : e.deltaY;
      stateRef.current.targetOffset += delta * 0.0025;
      e.preventDefault();
    }
  };

  // Click on canvas to center clicked artwork
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // If user clicked left third, navigate prev; if right third, navigate next
    if (clickX < width * 0.28) {
      prevItem();
    } else if (clickX > width * 0.72) {
      nextItem();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      prevItem();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextItem();
    } else if (e.key === "Home") {
      e.preventDefault();
      navigateTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      navigateTo(items.length - 1);
    }
  };

  const currentItem = items[activeIndex] || items[0];

  return (
    <section
      ref={containerRef}
      className={`molten-gallery-section ${className}`}
      aria-label="Magic Scissors Interactive Molten Gallery"
      aria-labelledby={`${carouselId}-title`}
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Editorial Header */}
      <div className="molten-gallery-header">
        <h2 id={`${carouselId}-title`} className="molten-gallery-title">
          {title.split(" ").slice(0, 2).join(" ")}{" "}
          <span className="accent-gold">{title.split(" ").slice(2).join(" ")}</span>
        </h2>
        <p className="molten-gallery-subtitle">{subtitle}</p>
      </div>

      {/* Screen Reader Announcements */}
      <div className="molten-sr-only" aria-live="polite" aria-atomic="true">
        Showing item {activeIndex + 1} of {items.length}: {currentItem.title} (
        {currentItem.category || "Gallery Artwork"})
      </div>

      {/* Hidden DOM List for Complete Keyboard & Assistive Technology Accessibility */}
      <ul className="molten-sr-only">
        {items.map((item, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => navigateTo(idx)}
              aria-current={idx === activeIndex ? "true" : undefined}
            >
              {item.title} — {item.category}
            </button>
          </li>
        ))}
      </ul>

      {/* Primary WebGL2 Interactive Liquid Glass Viewport */}
      {isWebGLSupported ? (
        <div
          className="molten-gallery-viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          style={{ cursor: isInteracting ? "grabbing" : "grab" }}
        >
          {/* WebGL2 Canvas */}
          <canvas ref={canvasRef} className="molten-gallery-canvas" />

          {/* Optical Glass Distortion Vignettes */}
          <div className="molten-optical-band-top" aria-hidden="true" />
          <div className="molten-optical-band-bottom" aria-hidden="true" />

          {/* Floating Editorial HUD Overlay */}
          <div className="molten-hud-overlay">
            {/* Top HUD: Studio Brand & Dynamic Ring Counter */}
            <div className="molten-hud-top">
              <div className="molten-hud-brand">
                <div className="molten-hud-logo-mark" aria-hidden="true">
                  ✂
                </div>
                <div className="molten-hud-brand-text">
                  <span className="molten-hud-brand-name">MAGIC SCISSORS</span>
                  <span className="molten-hud-brand-sub">STUDIO EXHIBITION</span>
                </div>
              </div>

              <div
                className="molten-hud-counter"
                aria-label={`Artwork ${activeIndex + 1} of ${items.length}`}
              >
                <span className="molten-hud-curr-num">
                  {(activeIndex + 1).toString().padStart(2, "0")}
                </span>
                <span className="molten-hud-sep">/</span>
                <span className="molten-hud-total-num">
                  {items.length.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Bottom HUD: Active Artwork Information (Editorial Fashion) */}
            <div className="molten-hud-bottom">
              <div className="molten-active-info-panel">
                <div className="molten-active-category-row">
                  <span className="molten-active-category">
                    {currentItem.category || "Magic Scissors Exclusive"}
                  </span>
                  <span className="molten-active-year">
                    {currentItem.year || "2026"}
                  </span>
                </div>
                <h3 className="molten-active-title">{currentItem.title}</h3>
                {currentItem.description && (
                  <p className="molten-active-desc">{currentItem.description}</p>
                )}

                <div className="molten-active-cta-row">
                  <a
                    href={currentItem.link || "contact.html"}
                    className="molten-active-link-btn"
                  >
                    <span>Reserve Studio Ritual</span>
                    <span aria-hidden="true">→</span>
                  </a>

                  <div className="molten-nav-buttons">
                    <button
                      type="button"
                      className="molten-nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevItem();
                      }}
                      aria-label="Previous salon artwork"
                      title="Previous"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="molten-nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextItem();
                      }}
                      aria-label="Next salon artwork"
                      title="Next"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Graceful Accessible Fallback Carousel (when WebGL2 unavailable) */
        <div className="molten-fallback-container">
          <div className="molten-fallback-track">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`molten-fallback-card ${
                  idx === activeIndex ? "active" : ""
                }`}
                onClick={() => navigateTo(idx)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="molten-fallback-img"
                  loading="lazy"
                />
                <div className="molten-fallback-info">
                  <div className="molten-active-category-row">
                    <span className="molten-active-category">
                      {item.category || "Salon Ambience"}
                    </span>
                    <span className="molten-active-year">{item.year || "2026"}</span>
                  </div>
                  <h3 className="molten-active-title">{item.title}</h3>
                  <p className="molten-active-desc">{item.description}</p>
                  <a
                    href={item.link || "contact.html"}
                    className="molten-active-link-btn"
                  >
                    <span>Book Service</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Progress Strip */}
      <div
        className="molten-progress-strip"
        role="tablist"
        aria-label="Artwork selection"
      >
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === activeIndex}
            aria-label={`Jump to artwork ${idx + 1}`}
            className={`molten-progress-dot ${idx === activeIndex ? "active" : ""}`}
            onClick={() => navigateTo(idx)}
          />
        ))}
      </div>
    </section>
  );
};

export default MoltenGallery;

/**
 * Universal mounting helper for vanilla HTML / multi-page apps
 */
export function initMoltenGallery(
  container: HTMLElement | string,
  props?: MoltenGalleryProps
) {
  const targetElement =
    typeof container === "string"
      ? document.getElementById(container)
      : container;

  if (!targetElement) {
    console.warn(`[MoltenGallery] Target container '${container}' not found.`);
    return null;
  }

  const root = ReactDOM.createRoot(targetElement);
  root.render(<MoltenGallery {...props} />);
  return root;
}
