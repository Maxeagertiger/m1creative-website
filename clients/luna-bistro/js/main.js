/* ============================================================
   LUNA BISTRO - JavaScript
   Handles all interactive features including:
   - Preloader animation
   - Navigation behavior
   - Smooth scrolling
   - Scroll-triggered animations
   - Parallax effects
   - Image lightbox gallery
   - Testimonial carousel
   - Form validation
   - Newsletter subscription
   ============================================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  /* ============================================================
     PRELOADER
     Shows loading animation then fades out
     ============================================================ */
  const preloader = document.querySelector('.preloader');
  
  if (preloader) {
    // Hide preloader after content loads
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.classList.add('hidden');
        document.body.classList.remove('loading');
      }, 2400); // 2.4 second minimum display time
    });
  }
  
  /* ============================================================
     NAVIGATION
     Fixed nav with scroll effects and mobile toggle
     ============================================================ */
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navMobile = document.querySelector('.nav-mobile');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Add scrolled class when page is scrolled
  function handleNavScroll() {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll(); // Check initial state
  
  // Mobile navigation toggle
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navMobile.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });
    
    // Close mobile nav when clicking a link
    navMobile.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.classList.remove('nav-open');
      });
    });
  }
  
  // Highlight active navigation link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
  
  /* ============================================================
     SMOOTH SCROLL
     Animates scroll to anchor targets
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile nav if open
        if (navMobile && navMobile.classList.contains('active')) {
          navToggle.classList.remove('active');
          navMobile.classList.remove('active');
        }
      }
    });
  });
  
  /* ============================================================
     SCROLL-TRIGGERED ANIMATIONS
     Fade in elements as they enter viewport
     ============================================================ */
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
  
  function checkElementsInView() {
    const triggerPoint = window.innerHeight * 0.85;
    
    animatedElements.forEach(function(element) {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < triggerPoint) {
        element.classList.add('visible');
      }
    });
  }
  
  // Check on scroll and resize
  window.addEventListener('scroll', checkElementsInView);
  window.addEventListener('resize', checkElementsInView);
  
  // Initial check
  setTimeout(checkElementsInView, 100);
  
  /* ============================================================
     PARALLAX EFFECT
     Creates depth through scroll-based movement
     ============================================================ */
  const parallaxBackgrounds = document.querySelectorAll('.hero-background, .page-header-background');
  
  function updateParallax() {
    const scrollY = window.scrollY;
    
    parallaxBackgrounds.forEach(function(bg) {
      const speed = 0.5;
      const yPos = -(scrollY * speed);
      bg.style.transform = `translateY(${yPos}px)`;
    });
  }
  
  window.addEventListener('scroll', function() {
    requestAnimationFrame(updateParallax);
  });
  
  /* ============================================================
     IMAGE LIGHTBOX
     Full-screen gallery viewer
     ============================================================ */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-content img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  
  let currentGalleryIndex = 0;
  let galleryImages = [];
  
  if (galleryItems.length > 0 && lightbox) {
    // Collect all gallery images
    galleryItems.forEach(function(item, index) {
      const img = item.querySelector('img');
      if (img) {
        galleryImages.push(img.src);
        
        // Open lightbox on click
        item.addEventListener('click', function() {
          currentGalleryIndex = index;
          openLightbox(galleryImages[currentGalleryIndex]);
        });
      }
    });
    
    // Open lightbox function
    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    // Close lightbox function
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Navigate to previous image
    function prevImage() {
      currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
      lightboxImg.src = galleryImages[currentGalleryIndex];
    }
    
    // Navigate to next image
    function nextImage() {
      currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
      lightboxImg.src = galleryImages[currentGalleryIndex];
    }
    
    // Event listeners
    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', prevImage);
    }
    
    if (lightboxNext) {
      lightboxNext.addEventListener('click', nextImage);
    }
    
    // Close on background click
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    });
  }
  
  /* ============================================================
     TESTIMONIAL CAROUSEL
     Sliding testimonial cards
     ============================================================ */
  const testimonialsTrack = document.querySelector('.testimonials-track');
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  const testimonialPrev = document.querySelector('.testimonials-prev');
  const testimonialNext = document.querySelector('.testimonials-next');
  
  let currentTestimonial = 0;
  let testimonialInterval;
  
  if (testimonialsTrack && testimonialSlides.length > 0) {
    // Go to specific slide
    function goToTestimonial(index) {
      currentTestimonial = index;
      
      // Wrap around
      if (currentTestimonial < 0) {
        currentTestimonial = testimonialSlides.length - 1;
      } else if (currentTestimonial >= testimonialSlides.length) {
        currentTestimonial = 0;
      }
      
      // Move track
      testimonialsTrack.style.transform = `translateX(-${currentTestimonial * 100}%)`;
      
      // Update dots
      testimonialDots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentTestimonial);
      });
    }
    
    // Previous slide
    function prevTestimonial() {
      goToTestimonial(currentTestimonial - 1);
      resetAutoPlay();
    }
    
    // Next slide
    function nextTestimonial() {
      goToTestimonial(currentTestimonial + 1);
      resetAutoPlay();
    }
    
    // Auto-play functionality
    function startAutoPlay() {
      testimonialInterval = setInterval(nextTestimonial, 5000);
    }
    
    function resetAutoPlay() {
      clearInterval(testimonialInterval);
      startAutoPlay();
    }
    
    // Event listeners
    if (testimonialPrev) {
      testimonialPrev.addEventListener('click', prevTestimonial);
    }
    
    if (testimonialNext) {
      testimonialNext.addEventListener('click', nextTestimonial);
    }
    
    testimonialDots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        goToTestimonial(index);
        resetAutoPlay();
      });
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    testimonialsTrack.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    testimonialsTrack.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextTestimonial();
        } else {
          prevTestimonial();
        }
      }
    }
    
    // Initialize
    goToTestimonial(0);
    startAutoPlay();
  }
  
  /* ============================================================
     MENU TABS
     Filter menu items by category
     ============================================================ */
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuCards = document.querySelectorAll('.menu-card');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (menuTabs.length > 0) {
    menuTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        const category = this.dataset.category;
        
        // Update active tab
        menuTabs.forEach(function(t) {
          t.classList.remove('active');
        });
        this.classList.add('active');
        
        // Filter menu items if present
        if (menuCards.length > 0) {
          menuCards.forEach(function(card) {
            if (category === 'all' || card.dataset.category === category) {
              card.style.display = 'block';
              setTimeout(function() {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, 50);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
              setTimeout(function() {
                card.style.display = 'none';
              }, 300);
            }
          });
        }

        // Filter gallery items if present
        if (galleryItems.length > 0) {
          galleryItems.forEach(function(item) {
            if (category === 'all' || item.dataset.category === category) {
              item.style.display = 'block';
              setTimeout(function() {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
              }, 50);
            } else {
              item.style.opacity = '0';
              item.style.transform = 'translateY(20px) scale(0.95)';
              setTimeout(function() {
                item.style.display = 'none';
              }, 300);
            }
          });
        }
      });
    });
  }
  
  /* ============================================================
     CONTACT FORM VALIDATION
     Client-side form validation with feedback
     ============================================================ */
  const contactForm = document.querySelector('.contact-form form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      const formData = {};
      
      // Get all form inputs
      const inputs = this.querySelectorAll('.form-input, .form-textarea, .form-select');
      
      inputs.forEach(function(input) {
        const value = input.value.trim();
        const name = input.name;
        const errorElement = input.parentElement.querySelector('.form-error');
        
        // Reset previous error state
        input.classList.remove('error');
        if (errorElement) {
          errorElement.classList.remove('visible');
        }
        
        // Validate required fields
        if (input.hasAttribute('required') && !value) {
          isValid = false;
          input.classList.add('error');
          if (errorElement) {
            errorElement.textContent = 'This field is required';
            errorElement.classList.add('visible');
          }
          return;
        }
        
        // Validate email format
        if (input.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            input.classList.add('error');
            if (errorElement) {
              errorElement.textContent = 'Please enter a valid email address';
              errorElement.classList.add('visible');
            }
            return;
          }
        }
        
        // Validate phone format (optional)
        if (input.type === 'tel' && value) {
          const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            input.classList.add('error');
            if (errorElement) {
              errorElement.textContent = 'Please enter a valid phone number';
              errorElement.classList.add('visible');
            }
            return;
          }
        }
        
        formData[name] = value;
      });
      
      if (isValid) {
        // Show success message
        const formContent = contactForm.querySelector('.form-content');
        const successMessage = contactForm.querySelector('.form-success');
        
        if (formContent && successMessage) {
          formContent.style.display = 'none';
          successMessage.classList.add('visible');
        }
        
        // Here you would typically send the form data to a server
        console.log('Form submitted:', formData);
      }
    });
    
    // Real-time validation on blur
    const inputs = contactForm.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        const value = this.value.trim();
        const errorElement = this.parentElement.querySelector('.form-error');
        
        // Clear error on valid input
        if (value && this.classList.contains('error')) {
          this.classList.remove('error');
          if (errorElement) {
            errorElement.classList.remove('visible');
          }
        }
      });
    });
  }
  
  /* ============================================================
     RESERVATION FORM
     Date/time booking validation
     ============================================================ */
  const reservationForm = document.querySelector('.reservation-form form');
  
  if (reservationForm) {
    // Set minimum date to today
    const dateInput = reservationForm.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
    
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      const formData = {};
      
      // Validate all required fields
      const inputs = this.querySelectorAll('.form-input, .form-select, .form-textarea');
      
      inputs.forEach(function(input) {
        const value = input.value.trim();
        const name = input.name;
        const errorElement = input.parentElement.querySelector('.form-error');
        
        input.classList.remove('error');
        if (errorElement) {
          errorElement.classList.remove('visible');
        }
        
        if (input.hasAttribute('required') && !value) {
          isValid = false;
          input.classList.add('error');
          if (errorElement) {
            errorElement.textContent = 'This field is required';
            errorElement.classList.add('visible');
          }
          return;
        }
        
        formData[name] = value;
      });
      
      if (isValid) {
        // Show success state
        const formContent = reservationForm.querySelector('.form-content');
        const successMessage = reservationForm.querySelector('.form-success');
        
        if (formContent && successMessage) {
          formContent.style.display = 'none';
          successMessage.classList.add('visible');
        }
        
        console.log('Reservation submitted:', formData);
      }
    });
  }
  
  /* ============================================================
     NEWSLETTER SUBSCRIPTION
     Email signup with validation
     ============================================================ */
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  
  newsletterForms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('.newsletter-input');
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email || !emailRegex.test(email)) {
        emailInput.style.borderColor = '#e74c3c';
        emailInput.focus();
        return;
      }
      
      // Success feedback
      emailInput.style.borderColor = 'var(--color-accent)';
      emailInput.value = '';
      
      // Show success message (could be a toast notification)
      const submitBtn = this.querySelector('.newsletter-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Subscribed!';
      submitBtn.disabled = true;
      
      setTimeout(function() {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        emailInput.style.borderColor = '';
      }, 3000);
      
      console.log('Newsletter subscription:', email);
    });
  });
  
  /* ============================================================
     COUNTER ANIMATION
     Animated number counting for statistics
     ============================================================ */
  const counters = document.querySelectorAll('.stat-number');
  let countersAnimated = false;
  
  function animateCounters() {
    if (countersAnimated) return;
    
    const statsSection = document.querySelector('.about-stats');
    if (!statsSection) return;
    
    const rect = statsSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      countersAnimated = true;
      
      counters.forEach(function(counter) {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const suffix = counter.textContent.replace(/\d/g, '');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        function updateCounter() {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current) + suffix;
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target + suffix;
          }
        }
        
        updateCounter();
      });
    }
  }
  
  window.addEventListener('scroll', animateCounters);
  animateCounters(); // Check on load
  
  /* ============================================================
     INTERSECTION OBSERVER
     Modern scroll detection for animations
     ============================================================ */
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(function(el) {
      observer.observe(el);
    });
  }
  
  /* ============================================================
     SCROLL TO TOP BUTTON
     Appears when user scrolls down
     ============================================================ */
  const scrollTopBtn = document.querySelector('.scroll-top');
  
  if (scrollTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });
    
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  /* ============================================================
     LAZY LOADING IMAGES
     Deferred image loading for performance
     ============================================================ */
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      imageObserver.observe(img);
    });
  }
  
  /* ============================================================
     CURRENT YEAR
     Updates copyright year automatically
     ============================================================ */
  const yearElements = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  
  yearElements.forEach(function(el) {
    el.textContent = currentYear;
  });
  
}); // End DOMContentLoaded
