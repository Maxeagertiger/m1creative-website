/* ── PRISMA GLOBAL INTERACTIVES ── */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initMobileNav();
  initHoverStates();
});

// Custom Cursor (with inertia/lag for the ring)
function initCursor() {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot moves instantly
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });
  
  // Smoothly interpolate the ring position
  function updateRing() {
    const ease = 0.15; // Speed of the lagging follow effect
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    
    requestAnimationFrame(updateRing);
  }
  updateRing();
}

// Mobile Hamburger Navigation Toggles
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.querySelectorAll('span').forEach((bar, index) => {
        if (links.classList.contains('open')) {
          if (index === 0) bar.style.transform = 'translateY(7px) rotate(45deg)';
          if (index === 1) bar.style.opacity = '0';
          if (index === 2) bar.style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
          bar.style.transform = 'none';
          bar.style.opacity = '1';
        }
      });
    });
  }
}

// Add Cursor Classes on Hover over Interactive Elements
function initHoverStates() {
  const interactives = document.querySelectorAll('a, button, select, input, textarea, .interactive-card');
  
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}
