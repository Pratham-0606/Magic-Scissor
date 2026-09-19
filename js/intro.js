/**
 * Magic Scissors - Theatrical Intro Controller
 * 
 * Flow:
 * Phase 1: Opening Animation
 * - Closed heavy velvet curtains
 * - Spotlight breathe effect & crown banner
 * - "MAGIC SCISSORS" character-by-character fade-up with terracotta-gold gradient
 * - Subtitle & mechanical animated snipping scissors
 * - Luxury "Enter Salon" button with pulsing ring
 * 
 * Phase 2: When "Enter Salon" is tapped:
 * - 0.0s: Stage text cleanly fades out; rolling salon chair shoots across from right to left
 * - 1.5s: Chair completely exits out of frame
 * - 1.6s: Cinematic pause (0.2s still anticipation)
 * - 1.8s: Velvet curtains begin opening smoothly from center (1.4s duration)
 * - 2.5s: Soft warm light bloom swells from behind curtains
 * - 3.2s: Curtains fully open, revealing luxury salon interior
 * - 3.3s: Cinematic camera push-in toward salon interior
 * - 3.8s: Magic Scissors logo reveals (soft blur -> perfectly crisp & sharp, scale 96% -> 100%)
 * - 4.8s: Clean hold on the sharp logo & salon atmosphere
 * - 5.0s: Slower, cinematic fade dissolve begins (gracefully cross-fades into website over 1.3s)
 * - 6.3s: Main website revealed seamlessly & interactive
 */

class TheatricalIntro {
  constructor() {
    this.overlay = document.getElementById("theatricalIntroOverlay");
    this.introStage = document.getElementById("introStage");
    this.titleContainer = document.getElementById("introTitleText");
    this.scissorsContainer = document.getElementById("introScissorsContainer");
    this.getStartedBtn = document.getElementById("btnGetStarted");
    this.chairTrack = document.getElementById("salonChairTrack");

    this.audioContext = null;
    this.hasInteracted = false;
    this.timers = [];
    this.prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.init();
  }

  schedule(fn, delayMs) {
    const id = setTimeout(fn, delayMs);
    this.timers.push(id);
    return id;
  }

  clearAllTimers() {
    this.timers.forEach(id => clearTimeout(id));
    this.timers = [];
  }

  init() {
    // Check if current load is an explicit browser reload/refresh (F5, Ctrl+R)
    let isReload = false;
    try {
      const navEntries = window.performance && window.performance.getEntriesByType && window.performance.getEntriesByType("navigation");
      const navEntry = navEntries && navEntries[0];
      isReload = navEntry ? (navEntry.type === "reload") : (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
    } catch (e) { }

    if (isReload) {
      try {
        sessionStorage.removeItem("magic_scissors_intro_entered");
      } catch (e) { }
    }

    if ('scrollRestoration' in history) {
      try {
        history.scrollRestoration = 'manual';
      } catch (e) { }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Smooth scroll for site logo / home navigation
    this.attachHomeSmoothScroll();

    if (!this.overlay) return;

    // Check if user has already entered the site during this session
    let hasEntered = false;
    try {
      hasEntered = sessionStorage.getItem("magic_scissors_intro_entered") === "true";
    } catch (e) { }

    if (hasEntered || this.prefersReducedMotion) {
      this.instantEnter();
      return;
    }

    // Lock scroll while intro is visible
    document.body.style.overflow = "hidden";

    // Setup accessible dialog attributes
    this.overlay.setAttribute("role", "dialog");
    this.overlay.setAttribute("aria-modal", "true");
    this.overlay.setAttribute("aria-label", "Magic Scissors Theatrical Studio Entrance");

    // 1. Build character fade-up spans for "MAGIC SCISSORS"
    this.renderCharacters("MAGIC SCISSORS");

    // 2. Inject high fidelity mechanical Scissor SVG
    this.renderScissorSVG();

    // 3. Inject luxury Salon Chair SVG
    this.renderChairSVG();

    // 4. Attach click listener on "Enter Salon" button
    if (this.getStartedBtn) {
      this.getStartedBtn.addEventListener("click", () => this.triggerEntrance());
    }

    // Keyboard support: Escape skips directly, Enter triggers entrance
    document.addEventListener("keydown", (e) => {
      if (!this.overlay || this.overlay.classList.contains("intro-completed")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.instantEnter();
      } else if (e.key === "Enter" && !this.hasInteracted) {
        e.preventDefault();
        this.triggerEntrance();
      }
    });

    // Interactive scissor click snip on stage
    if (this.scissorsContainer) {
      this.scissorsContainer.addEventListener("click", () => {
        this.playSnipSound();
        this.burstParticles();
      });
    }
  }

  renderCharacters(text) {
    if (!this.titleContainer) return;
    this.titleContainer.innerHTML = "";

    const words = text.split(" ");
    let totalCharIndex = 0;

    words.forEach(word => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";

      for (let i = 0; i < word.length; i++) {
        const charSpan = document.createElement("span");
        charSpan.className = "char";
        charSpan.textContent = word[i];
        charSpan.style.setProperty("--char-index", totalCharIndex);
        wordSpan.appendChild(charSpan);
        totalCharIndex++;
      }

      this.titleContainer.appendChild(wordSpan);
    });
  }

  renderScissorSVG() {
    if (!this.scissorsContainer) return;
    this.scissorsContainer.innerHTML = `
      <svg class="scissor-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="artisanBlade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="40%" stop-color="#E08564"/>
            <stop offset="100%" stop-color="#A95333"/>
          </linearGradient>
          <linearGradient id="artisanRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A95333"/>
            <stop offset="50%" stop-color="#E08564"/>
            <stop offset="100%" stop-color="#C86D4A"/>
          </linearGradient>
        </defs>

        <!-- Top Blade Group (Pivoting) -->
        <g class="scissor-blade-top">
          <ellipse cx="22" cy="74" rx="14" ry="11" transform="rotate(-30 22 74)" stroke="url(#artisanRing)" stroke-width="4.5" fill="none"/>
          <path d="M30 66 L46 47" stroke="url(#artisanRing)" stroke-width="5" stroke-linecap="round"/>
          <path d="M46 47 Q 68 32 88 18 Q 65 37 46 47 Z" fill="url(#artisanBlade)"/>
        </g>

        <!-- Bottom Blade Group (Pivoting) -->
        <g class="scissor-blade-bottom">
          <ellipse cx="22" cy="26" rx="14" ry="11" transform="rotate(30 22 26)" stroke="url(#artisanRing)" stroke-width="4.5" fill="none"/>
          <path d="M30 34 L46 53" stroke="url(#artisanRing)" stroke-width="5" stroke-linecap="round"/>
          <path d="M46 53 Q 68 68 88 82 Q 65 63 46 53 Z" fill="url(#artisanBlade)"/>
        </g>

        <!-- Artisan Pivot Center Screw -->
        <circle cx="47" cy="50" r="5" fill="#F5EFEA" stroke="#A95333" stroke-width="1.5"/>
        <circle cx="47" cy="50" r="2.2" fill="#C86D4A"/>
      </svg>
      <div class="snip-sparkles">
        <span class="snip-sparkle"></span>
        <span class="snip-sparkle"></span>
        <span class="snip-sparkle"></span>
      </div>
    `;
  }

  renderChairSVG() {
    if (!this.chairTrack) return;
    this.chairTrack.innerHTML = `
      <div class="rolling-salon-chair">
        <div class="chair-speed-streaks"></div>
        <svg viewBox="0 0 160 200" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2a2a34"/>
              <stop offset="50%" stop-color="#15151c"/>
              <stop offset="100%" stop-color="#0a0a0e"/>
            </linearGradient>
            <linearGradient id="chromeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="35%" stop-color="#E08564"/>
              <stop offset="70%" stop-color="#C86D4A"/>
              <stop offset="100%" stop-color="#8C4025"/>
            </linearGradient>
          </defs>

          <!-- Headrest -->
          <rect x="62" y="10" width="36" height="18" rx="8" fill="url(#leatherGrad)" stroke="url(#chromeAccent)" stroke-width="2"/>
          <path d="M74 28 L74 38 M86 28 L86 38" stroke="url(#chromeAccent)" stroke-width="3"/>

          <!-- Curved Backrest with Stitched Panels -->
          <path d="M48 38 C48 38, 80 34, 112 38 C118 42, 115 95, 110 100 C95 103, 65 103, 50 100 C45 95, 42 42, 48 38 Z" 
                fill="url(#leatherGrad)" stroke="url(#chromeAccent)" stroke-width="2.5"/>
          <path d="M60 44 L58 94 M80 42 L80 96 M100 44 L102 94" stroke="#C86D4A" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>

          <!-- Armrests -->
          <path d="M38 65 Q 35 90 48 95" stroke="url(#chromeAccent)" stroke-width="5" stroke-linecap="round"/>
          <path d="M122 65 Q 125 90 112 95" stroke="url(#chromeAccent)" stroke-width="5" stroke-linecap="round"/>
          <rect x="33" y="62" width="22" height="7" rx="3.5" fill="#181820" stroke="url(#chromeAccent)" stroke-width="1.2"/>
          <rect x="105" y="62" width="22" height="7" rx="3.5" fill="#181820" stroke="url(#chromeAccent)" stroke-width="1.2"/>

          <!-- Seat Cushion -->
          <rect x="42" y="98" width="76" height="20" rx="9" fill="url(#leatherGrad)" stroke="url(#chromeAccent)" stroke-width="2.5"/>

          <!-- Footrest Lever & Bracket -->
          <path d="M52 118 L40 148 L65 148" stroke="url(#chromeAccent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="35" y="146" width="36" height="6" rx="3" fill="#111" stroke="url(#chromeAccent)" stroke-width="1.5"/>

          <!-- Central Hydraulic Pump Column -->
          <rect x="74" y="118" width="12" height="38" fill="url(#chromeAccent)"/>
          <rect x="71" y="142" width="18" height="6" rx="2" fill="url(#chromeAccent)"/>
          <path d="M86 138 L104 144" stroke="url(#chromeAccent)" stroke-width="3" stroke-linecap="round"/>

          <!-- Heavy Circular Disc Base -->
          <ellipse cx="80" cy="168" rx="46" ry="11" fill="url(#chromeAccent)"/>
          <ellipse cx="80" cy="168" rx="41" ry="8" fill="#15151c"/>

          <!-- Wheels / Swivel Castors -->
          <g class="chair-wheel">
            <circle cx="45" cy="184" r="7" fill="#1a1a24" stroke="url(#chromeAccent)" stroke-width="2"/>
            <line x1="45" y1="177" x2="45" y2="191" stroke="#C86D4A" stroke-width="1.5"/>
          </g>
          <g class="chair-wheel">
            <circle cx="80" cy="186" r="7" fill="#1a1a24" stroke="url(#chromeAccent)" stroke-width="2"/>
            <line x1="80" y1="179" x2="80" y2="193" stroke="#C86D4A" stroke-width="1.5"/>
          </g>
          <g class="chair-wheel">
            <circle cx="115" cy="184" r="7" fill="#1a1a24" stroke="url(#chromeAccent)" stroke-width="2"/>
            <line x1="115" y1="177" x2="115" y2="191" stroke="#C86D4A" stroke-width="1.5"/>
          </g>
        </svg>
      </div>
    `;
  }

  burstParticles() {
    const sparkles = this.scissorsContainer?.querySelectorAll(".snip-sparkle");
    if (sparkles) {
      sparkles.forEach(s => {
        s.style.animation = "none";
        s.offsetHeight;
        s.style.animation = "sparkleFlash 0.6s ease-out forwards";
      });
    }
  }

  // Triggered when user clicks "Enter Salon"
  triggerEntrance() {
    if (this.hasInteracted) return;
    this.hasInteracted = true;

    // Fast reduced motion path
    if (this.prefersReducedMotion) {
      this.instantEnter();
      return;
    }

    // Play initial snip sound & chime
    this.playSnipSound();
    setTimeout(() => this.playGrandChime(), 200);

    // Fade out stage text & Enter button
    if (this.overlay) {
      this.overlay.classList.add("stage-exited");
    }

    // Launch the cinematic brand sequence
    this.startCinematicSequence();
  }

  startCinematicSequence() {
    // 0.0s — CHAIR ANIMATION: starts rolling smoothly across screen
    if (this.chairTrack) {
      this.chairTrack.style.display = "block";
      this.chairTrack.classList.add("active-roll");
    }

    // 1.5s — CHAIR COMPLETELY EXITS: finishes moving completely out of main composition
    this.schedule(() => {
      if (this.chairTrack) {
        this.chairTrack.classList.remove("active-roll");
        this.chairTrack.style.display = "none";
      }
    }, 1500);

    // 1.6s — CINEMATIC PAUSE: 0.2s pause, still atmosphere before the reveal
    // (Anticipatory stillness occurs naturally between 1.5s and 1.8s)

    // 1.8s — CURTAIN BEGINS OPENING: smooth parting from center (1.4s duration)
    this.schedule(() => {
      if (this.overlay) {
        this.overlay.classList.add("curtain-opening");
      }
    }, 1800);

    // 2.5s — WARM LIGHT APPEARS: soft warm light gradually increases behind curtains
    this.schedule(() => {
      if (this.overlay) {
        this.overlay.classList.add("warm-light-active");
      }
    }, 2500);

    // 3.2s — CURTAIN FULLY OPENS: curtains fully open, salon interior revealed
    this.schedule(() => {
      if (this.overlay) {
        this.overlay.classList.add("curtain-fully-open");
      }
    }, 3200);

    // 3.3s — CINEMATIC CAMERA PUSH-IN: subtle camera push-in toward salon interior
    this.schedule(() => {
      if (this.overlay) {
        this.overlay.classList.add("camera-push-active");
      }
    }, 3300);

    // 3.8s — MAGIC SCISSORS LOGO REVEAL: soft blur -> perfectly crisp & sharp (96% -> 100%)
    this.schedule(() => {
      if (this.overlay) {
        this.overlay.classList.add("logo-reveal-active");
      }
    }, 3800);

    // 5.0s — SLOWER FADE DISSOLVE ANIMATION:
    // Seamless cross-dissolve into the website over 1.3s with soft cinematic depth
    this.schedule(() => {
      if (this.overlay) {
        this.overlay.classList.add("fade-dissolve-active");
      }
    }, 5000);

    // 6.3s — MAIN WEBSITE REVEALED: complete transition, unlock website
    this.schedule(() => {
      this.finishIntro();
    }, 6300);
  }

  finishIntro() {
    this.clearAllTimers();
    if (this.overlay) {
      this.overlay.classList.add("intro-completed", "intro-bypassed");
      this.overlay.style.display = "none";
    }
    if (this.chairTrack) {
      this.chairTrack.classList.remove("active-roll");
      this.chairTrack.style.display = "none";
    }
    document.body.style.overflow = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    try {
      sessionStorage.setItem("magic_scissors_intro_entered", "true");
    } catch (e) { }

    const brandLogo = document.querySelector(".site-logo") || document.querySelector(".brand-logo");
    if (brandLogo && typeof brandLogo.focus === "function") {
      brandLogo.focus({ preventScroll: true });
    }
  }

  instantEnter() {
    this.finishIntro();
  }

  // Synthesized metallic snip sound for scissors
  playSnipSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(3400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      filter.type = "highpass";
      filter.frequency.setValueAtTime(1000, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) { }
  }

  playGrandChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      const now = this.audioContext.currentTime;
      const freqs = [329.63, 415.30, 493.88, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + 2.2);
      });
    } catch (e) { }
  }

  attachHomeSmoothScroll() {
    const rawPath = window.location.pathname.split("/").pop() || "index.html";
    const isHomePage = (rawPath === "" || rawPath === "/" || rawPath === "index.html");
    if (isHomePage) {
      document.querySelectorAll('a[href="index.html"], a[href="#hero"], .site-logo, .brand-logo').forEach(link => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href") || "";
          if (href === "index.html" || href === "#hero" || href === "/" || href.endsWith("/index.html")) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            const navMenu = document.getElementById("navMenu");
            const backdrop = document.getElementById("navDrawerBackdrop");
            if (navMenu && navMenu.classList.contains("open")) {
              navMenu.classList.remove("open");
              if (backdrop) backdrop.classList.remove("active");
            }
          }
        });
      });
    }
  }
}

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.theatricalIntroInstance = new TheatricalIntro();
});
