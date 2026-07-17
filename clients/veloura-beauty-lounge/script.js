/* =========================================================
   Veloura Beauty Lounge — Interactive scripts
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  if (toggle && navList) {
    toggle.addEventListener("click", () => {
      const open = navList.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu when a link is clicked (mobile)
    navList.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navList.classList.remove("is-open");
        toggle.classList.remove("is-open");
      })
    );
  }

  /* ---------- Scroll reveal with staggered delay ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // staggered delay relative to entry order within batch
            const delay = (entry.target.dataset.delay || i * 90) + "ms";
            entry.target.style.transitionDelay = delay;
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.querySelector("form.contact-form");
  if (form) {
    const status = form.querySelector(".form-status");

    const setError = (field, hasError) => {
      field.classList.toggle("invalid", hasError);
    };

    const validators = {
      name: (v) => v.trim().length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      phone: (v) => v.trim() === "" || /^[\d\s+()\-]{7,}$/.test(v.trim()),
      message: (v) => v.trim().length >= 10,
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll(".field").forEach((field) => {
        const input = field.querySelector("input, textarea, select");
        if (!input) return;
        const name = input.name;
        const fn = validators[name];
        if (fn && !fn(input.value)) {
          setError(field, true);
          valid = false;
        } else {
          setError(field, false);
        }
      });

      if (valid) {
        status.textContent =
          "Thank you! Your booking request has been received — we'll be in touch within 24 hours.";
        status.classList.add("show");
        form.reset();
        setTimeout(() => status.classList.remove("show"), 6000);
      }
    });

    // Clear individual error on input
    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => {
        const field = el.closest(".field");
        if (field && field.classList.contains("invalid")) {
          const fn = validators[el.name];
          if (fn && fn(el.value)) setError(field, false);
        }
      });
    });
  }
})();
