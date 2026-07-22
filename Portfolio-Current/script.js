window.addEventListener("load", init);

function init() {
  runLoader(); 
}

/* ======== LOADER ======= */
function runLoader() {
  const loader = document.getElementById("loader");
  const count = document.getElementById("loaderCount");

  let n = 0;
  const tick = setInterval(() => {
    n += Math.floor(Math.random() * 12) + 4;
    if (n >= 100) {
      n = 100;
      clearInterval(tick);
    }
    count.textContent = String(n).padStart(2, "0");
  }, 60);

  setTimeout(() => {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.in",
      onComplete: () => {
        loader.style.display = "none";
        startPage();
      },
    });
  }, 1700);
}

/* ===== START PAGE ====== */
function startPage() {
  setupLenis();
  setupCursor();
  setupNav();
  animateHero();
  setupScrollAnimations();
  setupChapterNav();
  setupCertificates();
  setupTheme();
}

/* ====== LENI ====== */
function setupLenis() {
  if (typeof Lenis === "undefined") return;

  window._lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.4,
  });

  gsap.ticker.add((time) => window._lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window._lenis.on("scroll", () => ScrollTrigger.update());
}

/* ====== CUSTOM CURSOR ======= */
function setupCursor() {
  if (!window.matchMedia("(hover: hover)").matches) return;

  const cursor = document.getElementById("cursor");
  let mx = 0,
    my = 0,
    cx = 0,
    cy = 0;

  document.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true },
  );

  (function loop() {
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;
    cursor.style.transform = `translate(${cx - 22}px, ${cy - 22}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener("mouseover", (e) => {
    if (
      e.target.closest(
        "a, button, .signal-link, .project-row, .edu-card, .skill-pills-row span .credits-left",
      )
    ) {
      cursor.classList.add("hovering");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (
      e.target.closest(
        "a, button, .signal-link, .project-row, .edu-card, .skill-pills-row span .credits-left",
      )
    ) {
      cursor.classList.remove("hovering");
    }
  });

  document.addEventListener("mousedown", () =>
    cursor.classList.add("clicking"),
  );
  document.addEventListener("mouseup", () =>
    cursor.classList.remove("clicking"),
  );
}

/* =======  NAV - scrolled state ===== */
function setupNav() {
  const nav = document.getElementById("nav");
  let lastScrollY = window.scrollY;
  const threshold = 15; 

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 60) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
      nav.classList.remove("nav-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    const diff = currentScrollY - lastScrollY;

    if (Math.abs(diff) >= threshold) {
      if (diff > 0) {
        // Scrolling down -> hide
        nav.classList.add("nav-hidden");
      } else {
        // Scrolling up -> show
        nav.classList.remove("nav-hidden");
      }
      lastScrollY = currentScrollY;
    }
  }, { passive: true });
}

/*===== HERO ANIMATION - ACT I ======= */
function animateHero() {
  const tl = gsap.timeline({ delay: 0.1 });

  tl.to(".title-word", {
    y: "0%",
    duration: 1.1,
    ease: "power4.out",
    stagger: 0.15,
  });
}

/* ===== SCROLL ANIMATIONS ====== */
function setupScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  /* --- ACT II: ORIGIN --- */

  // Heading lines clip reveal
  revealLines("#origin .reveal-line");

  // Paragraphs fade up
  gsap.utils.toArray("#origin .reveal-para").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: i * 0.1,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // Stat number counters
  document.querySelectorAll(".stat-num").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dec = String(end).includes(".") ? 1 : 0;
    const obj = { v: 0 };

    gsap.to(obj, {
      v: end,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate() {
        el.textContent = obj.v.toFixed(dec) + suffix;
      },
    });
  });

  // Education cards
  gsap.utils.toArray(".reveal-card").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: i * 0.15,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* --- ACT III: WORK --- */

  revealLines("#work .reveal-line");

  gsap.utils.toArray(".reveal-block, .reveal-para").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });

  /* --- ACT IV: CRAFT --- */

  revealLines("#craft .reveal-line");

  // Skill bar fills animate on scroll
  document.querySelectorAll(".skill-bar-fill").forEach((bar) => {
    const targetW = bar.dataset.width + "%";
    gsap.to(bar, {
      width: targetW,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: bar, start: "top 88%" },
    });
  });

  /* --- ACT V: SIGNAL --- */

  revealLines("#signal .reveal-line");

  gsap.utils.toArray("#signal .reveal-para").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // Signal links stagger in
  gsap.utils.toArray(".signal-link").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      delay: i * 0.1,
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });

  /* --- PARALLAX on watermark text --- */
  gsap.to(".watermark", {
    y: "-18%",
    ease: "none",
    scrollTrigger: {
      trigger: ".act-open",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  /* --- Parallax on hero content --- */
  gsap.to(".open-content", {
    y: "-12%",
    opacity: 0.3,
    ease: "none",
    scrollTrigger: {
      trigger: ".act-open",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

/* ======= HELPER ======== */
function revealLines(selector) {
  const lines = document.querySelectorAll(selector);
  if (!lines.length) return;

  lines.forEach((line) => {
    if (line.querySelector(".line-inner")) return; // already wrapped
    const inner = document.createElement("span");
    inner.classList.add("line-inner");
    inner.style.cssText = "display:block; transform:translateY(105%);";
    inner.innerHTML = line.innerHTML;
    line.innerHTML = "";
    line.style.overflow = "hidden";
    line.style.display = "block";
    line.appendChild(inner);
  });

  const inners = document.querySelectorAll(selector + " .line-inner");

  gsap.to(inners, {
    y: "0%",
    duration: 1.1,
    ease: "power4.out",
    stagger: 0.12,
    scrollTrigger: {
      trigger: lines[0].closest("h2, h1") || lines[0],
      start: "top 88%",
    },
  });
}

/* ====== CHAPTER NAV ====== */
function setupChapterNav() {
  const chapters = document.querySelectorAll(".nav-chapter");
  const acts = ["open", "origin", "work", "craft", "milestones", "signal"];

  acts.forEach((id, i) => {
    ScrollTrigger.create({
      trigger: "#" + id,
      start: "top center",
      end: "bottom center",
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    });
  });

  function setActive(index) {
    chapters.forEach((c, i) => c.classList.toggle("active", i === index));
  }

  // Click chapter nav to scroll to section
  chapters.forEach((ch, i) => {
    ch.addEventListener("click", () => {
      const target = document.getElementById(acts[i]);
      if (!target) return;
      if (window._lenis) {
        window._lenis.scrollTo(target, { offset: -60, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/* ======= CERTIFICATE MODAL SETUP ======== */
function setupCertificates() {
  const modal = document.getElementById("certModal");
  const iframe = document.getElementById("certIframe");
  const closeBtn = document.getElementById("closeModal");

  const certFiles = {
    git: "certificates/git-certificate.pdf",
    js: "certificates/js-certificate.pdf",
    frontend: "certificates/frontend-certificate.pdf",
    research: "certificates/research-paper-certificate.pdf",
    resume: "certificates/resume.pdf",
    cv: "certificates/Kashish Thakur - CV.pdf"
  };

  // Open modal on link click
  document.querySelectorAll(".cert-link, .nav-cert-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const certKey = link.dataset.cert;
      if (certFiles[certKey]) {
        iframe.src = certFiles[certKey];
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
      }
    });
  });

  // Close modal function
  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      iframe.src = ""; 
    }, 300);
  }

  // Close button click
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Click on overlay to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

/* ===== THEME TOGGLE ====== */
function setupTheme() {
  const toggle = document.getElementById("themeToggle");
  const appContent = document.getElementById("app-content");
  if (!toggle || !appContent) return;

  let isAnimating = false;

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("portfolio-theme", "light");
    } else {
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("portfolio-theme", "dark");
    }
  }

  toggle.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;

    const isCurrentlyLight = document.documentElement.classList.contains("light-theme");
    const targetTheme = isCurrentlyLight ? "dark" : "light";
    const currentScrollY = window.scrollY;

    const clone = appContent.cloneNode(true);
    clone.id = "app-content-clone";
    
    const elementsWithId = clone.querySelectorAll("[id]");
    elementsWithId.forEach((el) => el.removeAttribute("id"));

    const container = document.createElement("div");
    container.id = "theme-clone-container";
    container.className = targetTheme === "light" ? "light-theme" : "dark-theme";

    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.width = "100%";
    clone.style.transform = `translateY(${-currentScrollY}px)`;
    container.appendChild(clone);

    const divider = document.createElement("div");
    divider.className = "film-divider";

    const lightLeak = document.createElement("div");
    lightLeak.className = "light-leak";

    document.body.appendChild(container);
    document.body.appendChild(divider);
    document.body.appendChild(lightLeak);

    // 1. Vintage Projector Jitter Effect on main page content
    gsap.timeline()
      .to(appContent, {
        y: () => Math.random() * 6 - 3,
        x: () => Math.random() * 4 - 2,
        duration: 0.04,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          gsap.set(appContent, { clearProps: "transform" });
        }
      });

    // 2. Projector Light Leak Flash (warm amber flare)
    gsap.timeline()
      .to(lightLeak, { opacity: 0.8, duration: 0.2, ease: "power2.out" })
      .to(lightLeak, { opacity: 0, duration: 0.7, ease: "power2.in", onComplete: () => lightLeak.remove() });

    // 3. Coordinated Film Strip Roll Sweep
    const viewportHeight = window.innerHeight;
    
    gsap.set(container, { clipPath: "inset(0% 0% 100% 0%)" });
    gsap.set(divider, { y: 0 });

    const timeline = gsap.timeline({
      onComplete: () => {
        applyTheme(targetTheme);
        container.remove();
        divider.remove();
        isAnimating = false;
      }
    });

    timeline.to(container, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.25,
      ease: "power3.inOut"
    }, 0);

    timeline.to(divider, {
      y: viewportHeight,
      duration: 1.25,
      ease: "power3.inOut"
    }, 0);
  });
}
