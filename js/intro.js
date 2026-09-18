/**
 * Magic Scissors - Theatrical Intro Controller
 * Handles character fade-up, scissor snipping action, chair roll, and curtain parting
 */

class TheatricalIntro {
  constructor() {
    this.overlay = document.getElementById("theatricalIntroOverlay");
    this.titleContainer = document.getElementById("introTitleText");
    this.scissorsContainer = document.getElementById("introScissorsContainer");
    this.getStartedBtn = document.getElementById("btnGetStarted");
    this.chairTrack = document.getElementById("salonChairTrack");

    this.audioContext = null;
    this.hasInteracted = false;
    this.prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Disabled globally per user design: once entered, cannot replay without browser refresh
    window.replaySalonIntro = () => { };

    this.init();
  }

  init() {
    // Check if current load is an explicit browser reload/refresh (F5, Ctrl+R, or browser button)
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

    // Always attach smooth scroll behavior to Home/Logo links on index.html
    this.attachHomeSmoothScroll();

    if (!this.overlay) return;

    // Check if user has already entered the site during this session
    let hasEntered = false;
    try {
      hasEntered = sessionStorage.getItem("magic_scissors_intro_entered") === "true";
    } catch (e) { }

    if (hasEntered) {
      this.overlay.classList.add("intro-bypassed", "intro-completed", "curtain-open");
      this.overlay.style.display = "none";
      if (this.chairTrack) {
        this.chairTrack.style.display = "none";
      }
      document.body.style.overflow = "auto";
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // First visit or fresh reload: Lock scroll while intro is visible
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

    // 4. Attach event listeners
    if (this.getStartedBtn) {
      this.getStartedBtn.addEventListener("click", () => this.triggerEntrance());
    }

    // Keyboard support: Escape or Enter to enter salon
    document.addEventListener("keydown", (e) => {
      if (!this.overlay || this.overlay.classList.contains("intro-completed")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.instantEnter();
      } else if (e.key === "Enter" && (document.activeElement === this.getStartedBtn || document.activeElement === document.body)) {
        e.preventDefault();
        this.triggerEntrance();
      }
    });

    // Interactive scissor click snip
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
          <!-- Finger loop -->
          <ellipse cx="22" cy="74" rx="14" ry="11" transform="rotate(-30 22 74)" stroke="url(#artisanRing)" stroke-width="4.5" fill="none"/>
          <!-- Shank -->
          <path d="M30 66 L46 47" stroke="url(#artisanRing)" stroke-width="5" stroke-linecap="round"/>
          <!-- Sharp Blade -->
          <path d="M46 47 Q 68 32 88 18 Q 65 37 46 47 Z" fill="url(#artisanBlade)"/>
        </g>

        <!-- Bottom Blade Group (Pivoting) -->
        <g class="scissor-blade-bottom">
          <!-- Thumb loop -->
          <ellipse cx="22" cy="26" rx="14" ry="11" transform="rotate(30 22 26)" stroke="url(#artisanRing)" stroke-width="4.5" fill="none"/>
          <!-- Shank -->
          <path d="M30 34 L46 53" stroke="url(#artisanRing)" stroke-width="5" stroke-linecap="round"/>
          <!-- Sharp Blade -->
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
          <!-- Stitch details -->
          <path d="M60 44 L58 94 M80 42 L80 96 M100 44 L102 94" stroke="#C86D4A" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>

          <!-- Armrests (Terracotta Chrome with leather padding) -->
          <path d="M38 65 Q 35 90 48 95" stroke="url(#chromeAccent)" stroke-width="5" stroke-linecap="round"/>
          <path d="M122 65 Q 125 90 112 95" stroke="url(#chromeAccent)" stroke-width="5" stroke-linecap="round"/>
          <rect x="33" y="62" width="22" height="7" rx="3.5" fill="#181820" stroke="url(#chromeAccent)" stroke-width="1.2"/>
          <rect x="105" y="62" width="22" height="7" rx="3.5" fill="#181820" stroke="url(#chromeAccent)" stroke-width="1.2"/>

          <!-- Thick Leather Seat Cushion -->
          <rect x="42" y="98" width="76" height="20" rx="9" fill="url(#leatherGrad)" stroke="url(#chromeAccent)" stroke-width="2.5"/>

          <!-- Footrest Lever & Bracket -->
          <path d="M52 118 L40 148 L65 148" stroke="url(#chromeAccent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="35" y="146" width="36" height="6" rx="3" fill="#111" stroke="url(#chromeAccent)" stroke-width="1.5"/>

          <!-- Central Heavy Hydraulic Pump Column -->
          <rect x="74" y="118" width="12" height="38" fill="url(#chromeAccent)"/>
          <rect x="71" y="142" width="18" height="6" rx="2" fill="url(#chromeAccent)"/>
          <!-- Pump foot pedal -->
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

  // Pure Web Audio API Sound Synthesizer for Scissor Snip & Luxury Chime
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

      // Snip metallic friction noise
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(3200, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Graceful fallback if audio blocked by browser policy
    }
  }

  playGrandChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      const now = this.audioContext.currentTime;

      // Warm golden chord (E major harmonic: E4, G#4, B4, E5)
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

  burstParticles() {
    const sparkles = this.scissorsContainer?.querySelectorAll(".snip-sparkle");
    if (sparkles) {
      sparkles.forEach(s => {
        s.style.animation = "none";
        s.offsetHeight; /* trigger reflow */
        s.style.animation = "sparkleFlash 0.6s ease-out forwards";
      });
    }
  }

  // The Grand Entrance Trigger
  triggerEntrance() {
    if (this.hasInteracted) return;
    this.hasInteracted = true;
    try {
      sessionStorage.setItem("magic_scissors_intro_entered", "true");
    } catch (e) { }

    // Fast reduced motion path
    if (this.prefersReducedMotion) {
      this.instantEnter();
      return;
    }

    // 1. Play sound
    this.playSnipSound();
    setTimeout(() => this.playGrandChime(), 250);

    // 2. Launch high speed salon chair across screen from right to left
    if (this.chairTrack) {
      this.chairTrack.classList.add("active-roll");
    }

    // 3. Part the velvet stage curtains
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.classList.add("curtain-open");
      }
    }, 380);

    // 4. Complete transition and unlock site
    setTimeout(() => {
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
      // Keep scroll position strictly at top=0; do not auto-scroll down to buttons
      const brandLogo = document.querySelector(".site-logo") || document.querySelector(".brand-logo");
      if (brandLogo && typeof brandLogo.focus === "function") {
        brandLogo.focus({ preventScroll: true });
      }
    }, 1550);
  }

  instantEnter() {
    this.hasInteracted = true;
    try {
      sessionStorage.setItem("magic_scissors_intro_entered", "true");
    } catch (e) { }
    if (this.overlay) {
      this.overlay.classList.add("curtain-open", "intro-completed", "intro-bypassed");
      this.overlay.style.display = "none";
    }
    if (this.chairTrack) {
      this.chairTrack.classList.remove("active-roll");
      this.chairTrack.style.display = "none";
    }
    document.body.style.overflow = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const brandLogo = document.querySelector(".site-logo") || document.querySelector(".brand-logo");
    if (brandLogo && typeof brandLogo.focus === "function") {
      brandLogo.focus({ preventScroll: true });
    }
  }

  replayIntro() {
    // Replay is disabled by design per user requirement
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
