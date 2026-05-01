/**
 * TonyDev Portfolio — main.js
 * Modules:
 *  1. Theme toggle
 *  2. Nav scroll + active link tracking
 *  3. Hamburger mobile menu
 *  4. Custom cursor
 *  5. Typewriter
 *  6. Scroll reveal
 *  7. Carousel (shared — skills + projects)
 *  8. Contact form + toast
 */

"use strict";

/* ── 1. THEME ─────────────────────────────────────────────── */
const html = document.documentElement;
const themeBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(t) {
  html.setAttribute("data-theme", t);
  localStorage.setItem("td-theme", t);
  themeIcon.className = t === "dark" ? "fas fa-moon" : "fas fa-sun";
}

applyTheme(localStorage.getItem("td-theme") || "dark");
themeBtn.addEventListener("click", () => {
  applyTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* ── 2. NAV SCROLL + ACTIVE LINK ─────────────────────────── */
const nav = document.getElementById("nav");
window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  },
  { passive: true },
);

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav__link");

const sectionObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        const active = document.querySelector(
          `.nav__link[href="#${e.target.id}"]`,
        );
        if (active) active.classList.add("active");
      }
    });
  },
  { threshold: 0.4 },
);

sections.forEach((s) => sectionObs.observe(s));

/* ── 3. HAMBURGER ────────────────────────────────────────── */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

hamburger.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  hamburger.classList.toggle("active", open);
  hamburger.setAttribute("aria-expanded", open);
  document.body.classList.toggle("no-scroll", open);
});

document.querySelectorAll("[data-mobile-link]").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  });
});

/* ── 4. CUSTOM CURSOR ────────────────────────────────────── */
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

document.addEventListener(
  "mousemove",
  (e) => {
    mx = e.clientX;
    my = e.clientY;
  },
  { passive: true },
);

(function animateCursor() {
  dot.style.left = mx + "px";
  dot.style.top = my + "px";
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + "px";
  ring.style.top = ry + "px";
  requestAnimationFrame(animateCursor);
})();

document
  .querySelectorAll(
    "a, button, .project-card, .skill-group, .service-card, .social-link",
  )
  .forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
  });

/* ── 5. TYPEWRITER ───────────────────────────────────────── */
const roles = [
  "Full-Stack Developer",
  "UI/UX Designer",
  "Product Builder",
  "SaaS Creator",
];

let ri = 0,
  ci = 0,
  deleting = false;
const tw = document.getElementById("typewriter");

function type() {
  const current = roles[ri];
  if (!deleting) {
    tw.textContent = current.slice(0, ++ci);
    if (ci === current.length) {
      deleting = true;
      setTimeout(type, 2000);
      return;
    }
  } else {
    tw.textContent = current.slice(0, --ci);
    if (ci === 0) {
      deleting = false;
      ri = (ri + 1) % roles.length;
    }
  }
  setTimeout(type, deleting ? 50 : 90);
}

setTimeout(type, 800);

/* ── 6. SCROLL REVEAL ────────────────────────────────────── */
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

/* ── 7. CAROUSEL (shared factory) ───────────────────────── */

/**
 * createCarousel(config)
 *
 * config = {
 *   trackId:   string  — id of the .carousel-track element
 *   prevId:    string  — id of the prev button
 *   nextId:    string  — id of the next button
 *   dotsId:    string  — id of the dots container
 *   itemSelector: string — CSS selector for child items
 * }
 *
 * HOW THE ANIMATION WORKS:
 * - We calculate how many items fit (visibleCount) based on viewport
 * - On next: we set a CSS class on the newly visible cards so they
 *   animate in from the right (cardSlideIn keyframe)
 * - On prev: cards animate in from the left (cardSlideInLeft)
 * - The track translates via transform:translateX() — smooth CSS transition
 * - Dots update to reflect current page
 */
function createCarousel({ trackId, prevId, nextId, dotsId, itemSelector }) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const dotsEl = document.getElementById(dotsId);

  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let direction = "right"; // tracks last move direction for animation

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 1024) return 2;
    return 3;
  }

  function getItems() {
    return Array.from(track.querySelectorAll(itemSelector));
  }

  function getGapPx() {
    // Read gap from CSS variable (--sp-6 = 1.5rem = 24px)
    return (
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--sp-6"),
      ) * 16 || 24
    );
  }

  function getItemWidth() {
    const items = getItems();
    if (!items.length) return 0;
    return items[0].getBoundingClientRect().width;
  }

  function totalPages() {
    const items = getItems();
    const vis = getVisibleCount();
    return Math.max(1, items.length - vis + 1);
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    const pages = totalPages();
    for (let i = 0; i < pages; i++) {
      const d = document.createElement("button");
      d.className = "carousel-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", `Go to page ${i + 1}`);
      d.addEventListener("click", () =>
        goTo(i, i > currentIndex ? "right" : "left"),
      );
      dotsEl.appendChild(d);
    }
  }

  function updateDots() {
    if (!dotsEl) return;
    dotsEl.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("active", i === currentIndex);
    });
  }

  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalPages() - 1;
  }

  function animateNewCards(dir) {
    const items = getItems();
    const vis = getVisibleCount();
    const start = currentIndex;
    const end = Math.min(start + vis, items.length);
    const cls = dir === "right" ? "card-entering-right" : "card-entering-left";

    // Only animate the newly revealed card(s)
    const newStart = dir === "right" ? end - 1 : start;
    const newEnd = dir === "right" ? end : start + 1;

    for (let i = newStart; i < newEnd; i++) {
      const card = items[i];
      if (!card) continue;
      card.classList.remove("card-entering-right", "card-entering-left");
      // Force reflow so animation restarts
      void card.offsetWidth;
      card.classList.add(cls);
      card.addEventListener(
        "animationend",
        () => {
          card.classList.remove(cls);
        },
        { once: true },
      );
    }
  }

  function goTo(index, dir = "right") {
    direction = dir;
    currentIndex = Math.max(0, Math.min(index, totalPages() - 1));

    const itemW = getItemWidth();
    const gap = getGapPx();
    const offset = currentIndex * (itemW + gap);

    track.style.transform = `translateX(-${offset}px)`;

    animateNewCards(dir);
    updateDots();
    updateButtons();
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) goTo(currentIndex - 1, "left");
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < totalPages() - 1) goTo(currentIndex + 1, "right");
  });

  // Keyboard navigation
  [prevBtn, nextBtn].forEach((btn) => {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) goTo(currentIndex - 1, "left");
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < totalPages() - 1) goTo(currentIndex + 1, "right");
      }
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && currentIndex < totalPages() - 1)
        goTo(currentIndex + 1, "right");
      if (diff < 0 && currentIndex > 0) goTo(currentIndex - 1, "left");
    }
  });

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      // Clamp index to new totalPages
      currentIndex = Math.min(currentIndex, totalPages() - 1);
      goTo(currentIndex, direction);
    }, 150);
  });

  // Init
  buildDots();
  updateButtons();
}

// Init skills carousel
createCarousel({
  trackId: "skillsTrack",
  prevId: "skillsPrev",
  nextId: "skillsNext",
  dotsId: "skillsDots",
  itemSelector: ".skill-group",
});

// Init projects carousel
createCarousel({
  trackId: "projectsTrack",
  prevId: "projectsPrev",
  nextId: "projectsNext",
  dotsId: "projectsDots",
  itemSelector: ".project-card",
});

/* ── PROJECT FILTER ──────────────────────────────────────── */
/**
 * Filter works WITH the carousel:
 * - Hiding filtered-out cards and recalculating pages
 * - Uses data-category attribute on each .project-card
 */
const filterBtns = document.querySelectorAll(".filter-btn");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;

    document
      .querySelectorAll("#projectsTrack .project-card")
      .forEach((card) => {
        const cats = card.dataset.category || "";
        const show = f === "all" || cats.includes(f);
        card.style.display = show ? "" : "none";
      });

    // Reset carousel to page 0 after filter change
    const prevBtn = document.getElementById("projectsPrev");
    const nextBtn = document.getElementById("projectsNext");
    const track = document.getElementById("projectsTrack");
    if (track) track.style.transform = "translateX(0)";
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = false;
  });
});

/* ── 8. CONTACT FORM + TOAST  */
const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");
let toastTimer;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.querySelector("#contactName").value.trim();
  const email = form.querySelector("#contactEmail").value.trim();
  const message = form.querySelector("#contactMessage").value.trim();
  if (!name || !email || !message) return;

  const submit = form.querySelector(".form-submit");
  submit.disabled = true;
  submit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending…';

  setTimeout(() => {
    submit.disabled = false;
    submit.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    form.reset();
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 4000);
  }, 1400);
});
