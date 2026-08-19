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
  setupPillHover();
}

/* ====== PILL ===== */
function spawnRipple(el, clientX, clientY) {
  const rect = el.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const size = Math.max(rect.width, rect.height) * 2.4;

  const ripple = document.createElement("span");
  ripple.classList.add("glass-ripple");
  ripple.style.setProperty("--ripple-x", x + "px");
  ripple.style.setProperty("--ripple-y", y + "px");
  ripple.style.setProperty("--ripple-size", size + "px");
  el.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), {
    once: true,
  });
}

function setupPillHover() {
  const nav = document.getElementById("mobilePillNav");
  const indicator = document.getElementById("pillIndicator");
  if (!nav || !indicator) return;

  const items = Array.from(nav.querySelectorAll(".pill-item"));
  if (!items.length) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentIdx = 0;
  let navRect = null;
  let itemRects = [];
  let didAction = false;

  function refreshRects() {
    navRect = nav.getBoundingClientRect();
    itemRects = items.map((el) => el.getBoundingClientRect());
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function idxAtX(clientX) {
    if (!navRect) return 0;
    const rx = clientX - navRect.left;

    for (let i = 0; i < itemRects.length; i++) {
      const r = itemRects[i];
      if (rx >= r.left - navRect.left && rx <= r.right - navRect.left) return i;
    }

    return clientX < navRect.left + navRect.width / 2 ? 0 : items.length - 1;
  }

  function placeIndicator(idx, smooth) {
    if (!navRect || !itemRects[idx]) return;
    const r = itemRects[idx];
    const scale = navRect.width / nav.offsetWidth || 1;
    const x = (r.left - navRect.left) / scale;
    const w = r.width / scale;

    if (smooth) {
      indicator.classList.add("is-snapping");
    } else {
      indicator.classList.remove("is-snapping");
    }
    indicator.style.transform = `translateX(${x}px)`;
    indicator.style.width = w + "px";
  }

  function slideTo(idx) {
    currentIdx = idx;
    refreshRects();
    placeIndicator(idx, true);
    setTimeout(() => indicator.classList.remove("is-snapping"), 600);
  }

  function pressItem(idx) {
    items.forEach((item, i) => {
      item.classList.remove("is-pressed", "is-bouncing");
      if (i === idx) item.classList.add("is-pressed");
    });
  }

  function bounceItem(idx) {
    items.forEach((item) => item.classList.remove("is-pressed", "is-bouncing"));
    const el = items[idx];
    el.classList.add("is-bouncing");
    el.addEventListener(
      "animationend",
      () => el.classList.remove("is-bouncing"),
      { once: true },
    );
  }

  function triggerItem(idx, touch) {
    if (didAction) return;
    didAction = true;

    const item = items[idx];
    bounceItem(idx);
    spawnRipple(item, touch.clientX, touch.clientY);

    if (item.tagName === "BUTTON") {
      item.click();
    } else if (item.tagName === "A") {
      const href = item.getAttribute("href");
      const target = item.getAttribute("target");
      if (href && href !== "#") {
        if (target === "_blank") {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = href;
        }
      }
    }
  }

  nav.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.changedTouches[0];
      refreshRects();
      startX = touch.clientX;
      startY = touch.clientY;
      isDragging = true;
      didAction = false;
      currentIdx = idxAtX(touch.clientX);

      placeIndicator(currentIdx, false);
      indicator.classList.add("is-active");
      pressItem(currentIdx);
      spawnRipple(items[currentIdx], touch.clientX, touch.clientY);
    },
    { passive: true },
  );

  nav.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const touch = e.changedTouches[0];
      const newIdx = idxAtX(touch.clientX);

      placeIndicator(newIdx, false);

      if (newIdx !== currentIdx) {
        currentIdx = newIdx;
        pressItem(currentIdx);
      }
    },
    { passive: true },
  );

  nav.addEventListener(
    "touchend",
    (e) => {
      if (!isDragging) return;
      isDragging = false;

      const touch = e.changedTouches[0];

      // KEY FIX: only act if finger lifted INSIDE the pill nav
      const inside =
        touch.clientX >= navRect.left &&
        touch.clientX <= navRect.right &&
        touch.clientY >= navRect.top &&
        touch.clientY <= navRect.bottom;

      if (!inside) {
        // Finger slid out -cancel everything, no action
        items.forEach((item) =>
          item.classList.remove("is-pressed", "is-bouncing"),
        );
        indicator.classList.remove("is-active", "is-snapping");
        return;
      }

      const finalIdx = idxAtX(touch.clientX);
      currentIdx = finalIdx;

      placeIndicator(finalIdx, true);

      setTimeout(
        () => indicator.classList.remove("is-active", "is-snapping"),
        600,
      );

      triggerItem(finalIdx, touch);
    },
    { passive: true },
  );

  nav.addEventListener(
    "touchcancel",
    () => {
      isDragging = false;
      items.forEach((item) =>
        item.classList.remove("is-pressed", "is-bouncing"),
      );
      indicator.classList.remove("is-active", "is-snapping");
    },
    { passive: true },
  );
  nav.addEventListener("mousedown", (e) => {
    const target = e.target.closest(".pill-item");
    if (!target) return;
    refreshRects();
    const idx = items.indexOf(target);
    if (idx < 0) return;
    placeIndicator(idx, false);
    indicator.classList.add("is-active");
    pressItem(idx);
    spawnRipple(target, e.clientX, e.clientY);

    const onUp = () => {
      placeIndicator(idx, true);
      setTimeout(
        () => indicator.classList.remove("is-active", "is-snapping"),
        600,
      );
      bounceItem(idx);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mouseup", onUp);
  });
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
        "a, button, .signal-link, .project-row, .edu-card, .skill-pills-row span, .credits-left",
      )
    ) {
      cursor.classList.add("hovering");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (
      e.target.closest(
        "a, button, .signal-link, .project-row, .edu-card, .skill-pills-row span, .credits-left",
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
  const pillNav = document.getElementById("mobilePillNav");
  let lastScrollY = window.scrollY;
  const threshold = 15;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 60) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
        nav.classList.remove("nav-hidden");
        lastScrollY = currentScrollY;
        }
      
    if (pillNav) {
      if (currentScrollY > 60) {
        pillNav.classList.add("scrolled");
      } else {
        pillNav.classList.remove("scrolled");
      }
    }

    if (currentScrollY <= 60) {
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
    },
    { passive: true },
  );
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
    cv: "certificates/Kashish Thakur - CV.pdf",
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
  const mobileToggle = document.getElementById("mobileThemeToggle");
  const appContent = document.getElementById("app-content");
  if (!appContent) return;
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

  function handleThemeToggle() {
    if (isAnimating) return;
    isAnimating = true;

    const isCurrentlyLight =
      document.documentElement.classList.contains("light-theme");
    const targetTheme = isCurrentlyLight ? "dark" : "light";
    const currentScrollY = window.scrollY;

    const clone = appContent.cloneNode(true);
    clone.id = "app-content-clone";

    const elementsWithId = clone.querySelectorAll("[id]");
    elementsWithId.forEach((el) => el.removeAttribute("id"));

    const container = document.createElement("div");
    container.id = "theme-clone-container";
    container.className =
      targetTheme === "light" ? "light-theme" : "dark-theme";

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
    gsap.timeline().to(appContent, {
      y: () => Math.random() * 6 - 3,
      x: () => Math.random() * 4 - 2,
      duration: 0.04,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        gsap.set(appContent, { clearProps: "transform" });
      },
    });

    // 2. Projector Light Leak Flash (warm amber flare)
    gsap
      .timeline()
      .to(lightLeak, { opacity: 0.8, duration: 0.2, ease: "power2.out" })
      .to(lightLeak, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.in",
        onComplete: () => lightLeak.remove(),
      });

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
      },
    });

    timeline.to(
      container,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.25,
        ease: "power3.inOut",
      },
      0,
    );

    timeline.to(
      divider,
      {
        y: viewportHeight,
        duration: 1.25,
        ease: "power3.inOut",
      },
      0,
    );
  }

  if (toggle) toggle.addEventListener("click", handleThemeToggle);
  if (mobileToggle) mobileToggle.addEventListener("click", handleThemeToggle);
}
