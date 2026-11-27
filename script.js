/* ===========================
   M1CREATIVE. — Main JavaScript
   GSAP Scroll Animations & UI Interactions
   =========================== */

// ======= GLOBAL STATE =======
let mouseX = 0, mouseY = 0;
let scrollProgress = 0;
let lenis = null;

// ======= GSAP & ANIMATIONS INITIALIZATION =======
function initIntro() {
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    initGSAPAnimations();
}
// ======= SCROLL HANDLING =======
function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = Math.min(scrollTop / docHeight, 1);

    // Navbar style
    const navbar = document.getElementById('navbar');
    if (scrollTop > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Animate elements on scroll
    animateOnScroll();
}

// ======= SCROLL REVEAL ANIMATIONS =======
function animateOnScroll() {
    // Animate big text words
    document.querySelectorAll('.animate-text .word').forEach(word => {
        if (!word) return;
        const rect = word.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            word.classList.add('visible');
        }
    });

    // Animate counters
    document.querySelectorAll('.stat-number').forEach(num => {
        const rect = num.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85 && !num.dataset.animated) {
            num.dataset.animated = 'true';
            animateCounter(num);
        }
    });
}

// ======= COUNTER ANIMATION =======
function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target + '+';
        }
    }

    requestAnimationFrame(update);
}

// ======= MOUSE TRACKING =======
function handleMouseMove(e) {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
}

// ======= CURSOR GLOW =======
function initCursorGlow() {
    if (window.matchMedia('(hover: hover)').matches) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);

        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }
}

// ======= NAVIGATION =======
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navbar = document.getElementById('navbar');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        if (navbar) {
            navbar.classList.toggle('menu-active');
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            if (navbar) {
                navbar.classList.remove('menu-active');
            }
        });
    });

    // Smooth scroll for anchor links using Lenis (excluding the case study launch button)
    document.querySelectorAll('a[href^="#"]:not(#caseStudyLaunchBtn)').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    if (lenis) {
                        lenis.scrollTo(target, { offset: 0, duration: 1.2 });
                    } else {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        });
    });
}

// ======= CALENDAR & BOOKING FORM HANDLING =======
function initForm() {
    const form = document.getElementById('contact-form');
    const successEl = document.getElementById('formSuccess');
    if (!form) return;

    // Calendar Elements
    const calDaysGrid = document.getElementById('calendar-days');
    const calMonthYear = document.getElementById('cal-month-year');
    const calPrevBtn = document.getElementById('cal-prev');
    const calNextBtn = document.getElementById('cal-next');
    const timeSlotsWrapper = document.getElementById('time-slots-wrapper');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const selectedDateInput = document.getElementById('selected-date-input');
    const selectedTimeInput = document.getElementById('selected-time-input');
    const resetBtn = document.getElementById('booking-reset-btn');
    const successDetail = document.getElementById('booking-success-detail');

    let currentDate = new Date();
    let displayMonth = currentDate.getMonth();
    let displayYear = currentDate.getFullYear();
    let selectedDate = null;
    let selectedTime = null;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function renderCalendar() {
        if (!calDaysGrid || !calMonthYear) return;

        calMonthYear.textContent = `${monthNames[displayMonth]} ${displayYear}`;

        // Enable/Disable Prev Button (don't go before current month/year)
        const today = new Date();
        const isCurrentMonth = (displayYear === today.getFullYear() && displayMonth === today.getMonth());
        if (calPrevBtn) calPrevBtn.disabled = isCurrentMonth;

        calDaysGrid.innerHTML = '';

        // First day of display month
        const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();
        // Convert Sun(0)-Sat(6) to Mon(0)-Sun(6)
        const adjustedFirstDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

        // Total days in display month
        const totalDays = new Date(displayYear, displayMonth + 1, 0).getDate();

        // Empty cells before month starts
        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'cal-day-cell disabled';
            calDaysGrid.appendChild(emptyCell);
        }

        // Render days
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.className = 'cal-day-cell';
            cell.textContent = day;

            const dateObj = new Date(displayYear, displayMonth, day);
            const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Check if past date
            const isToday = (today.getFullYear() === displayYear && today.getMonth() === displayMonth && today.getDate() === day);
            const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dayOfWeek = dateObj.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // Sat or Sun

            if (isToday) cell.classList.add('today');

            if (isPast || isWeekend) {
                cell.classList.add('disabled');
            } else {
                if (selectedDate === dateStr) {
                    cell.classList.add('selected');
                }

                cell.addEventListener('click', () => {
                    calDaysGrid.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('selected'));
                    cell.classList.add('selected');
                    selectedDate = dateStr;
                    if (selectedDateInput) selectedDateInput.value = dateStr;

                    // Format display date
                    const options = { weekday: 'short', month: 'short', day: 'numeric' };
                    const formattedDate = dateObj.toLocaleDateString('en-US', options);
                    if (selectedDateDisplay) selectedDateDisplay.textContent = formattedDate;

                    if (timeSlotsWrapper) {
                        timeSlotsWrapper.style.display = 'block';
                        timeSlotsWrapper.classList.remove('cal-error-glow');
                    }
                });
            }

            calDaysGrid.appendChild(cell);
        }
    }

    if (calPrevBtn) {
        calPrevBtn.addEventListener('click', () => {
            if (displayMonth === 0) {
                displayMonth = 11;
                displayYear--;
            } else {
                displayMonth--;
            }
            renderCalendar();
        });
    }

    if (calNextBtn) {
        calNextBtn.addEventListener('click', () => {
            if (displayMonth === 11) {
                displayMonth = 0;
                displayYear++;
            } else {
                displayMonth++;
            }
            renderCalendar();
        });
    }

    // Time slots click handling
    if (timeSlotsGrid) {
        timeSlotsGrid.querySelectorAll('.time-slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                timeSlotsGrid.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTime = btn.getAttribute('data-time');
                if (selectedTimeInput) selectedTimeInput.value = selectedTime;
                if (timeSlotsWrapper) timeSlotsWrapper.classList.remove('cal-error-glow');
            });
        });
    }

    // Initial render
    renderCalendar();

    // Standard input validation
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');

    function validateInput(input) {
        const group = input.closest('.form-group');
        if (!group) return;

        const val = input.value.trim();
        const isRequired = input.hasAttribute('required');

        if (val === '') {
            if (isRequired) {
                group.classList.remove('is-valid');
                group.classList.add('is-invalid');
            } else {
                group.classList.remove('is-valid', 'is-invalid');
            }
            return;
        }

        let isValid = true;
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(val);
        } else if (input.type === 'tel') {
            const telRegex = /^\+?[0-9\s\-]{7,15}$/;
            isValid = telRegex.test(val);
        }

        if (isValid) {
            group.classList.add('is-valid');
            group.classList.remove('is-invalid');
        } else {
            group.classList.remove('is-valid');
            group.classList.add('is-invalid');
        }
    }

    inputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.closest('.form-group').classList.contains('is-invalid') || input.closest('.form-group').classList.contains('is-valid')) {
                validateInput(input);
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Check if date and time selected
        if (!selectedDate) {
            if (calDaysGrid) {
                calDaysGrid.classList.add('cal-error-glow');
                setTimeout(() => calDaysGrid.classList.remove('cal-error-glow'), 2500);
            }
            return;
        }

        if (!selectedTime) {
            if (timeSlotsWrapper) {
                timeSlotsWrapper.classList.add('cal-error-glow');
                setTimeout(() => timeSlotsWrapper.classList.remove('cal-error-glow'), 2500);
            }
            return;
        }

        let allValid = true;
        inputs.forEach(input => {
            validateInput(input);
            if (input.closest('.form-group') && input.closest('.form-group').classList.contains('is-invalid')) {
                allValid = false;
            }
        });

        if (!allValid) return;

        // Collect form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        console.log('Calendar Booking Submitted:', data);

        // Update success text with selected date and time
        const dateParts = selectedDate.split('-');
        const formattedDateStr = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        if (successDetail) {
            successDetail.innerHTML = `Your 15-minute alignment call is booked for <strong>${formattedDateStr} at ${selectedTime} (SAST)</strong>.<br>A calendar invitation has been sent to <strong>${data.email || 'your email'}</strong>.`;
        }

        // Show success message
        successEl.classList.add('show');
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            selectedDate = null;
            selectedTime = null;
            if (selectedDateInput) selectedDateInput.value = '';
            if (selectedTimeInput) selectedTimeInput.value = '';
            if (timeSlotsWrapper) timeSlotsWrapper.style.display = 'none';
            if (timeSlotsGrid) {
                timeSlotsGrid.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
            }
            renderCalendar();
            successEl.classList.remove('show');
            inputs.forEach(input => {
                const group = input.closest('.form-group');
                if (group) group.classList.remove('is-valid', 'is-invalid');
            });
        });
    }
}

// ======= CHECKOUT SYSTEM =======
function initCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    const closeBtn = document.getElementById('checkoutClose');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSuccess = document.getElementById('checkoutSuccess');

    if (!overlay) return;

    const packageNames = {
        Bronze: 'Starter Presence',
        Silver: 'Growth Machine',
        Gold: 'Premium Authority'
    };

    // Get Started buttons: redirect to contact form with package pre-selected
    document.querySelectorAll('.pricing-cta').forEach(btn => {
        btn.addEventListener('click', () => {
            const pkg = btn.dataset.package; // Bronze | Silver | Gold
            window.location.href = 'contact.html?package=' + encodeURIComponent(pkg);
        });
    });

    // Close checkout
    function closeCheckout() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeCheckout);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCheckout();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeCheckout();
        }
    });

    // Handle checkout form submission — Yoco Payment Integration
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('checkout-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const btnIcon = submitBtn.querySelector('.btn-icon');
        const errorEl = document.getElementById('checkoutError');

        // Collect form data
        const packageName = document.getElementById('checkout-package').value;
        const setupAmount = document.getElementById('checkout-setup-amount').value;
        const customerName = document.getElementById('checkout-name').value;
        const customerEmail = document.getElementById('checkout-email').value;
        const customerPhone = document.getElementById('checkout-phone').value;
        const businessName = document.getElementById('checkout-business').value;
        const notes = document.getElementById('checkout-notes').value;

        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnIcon.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        errorEl.style.display = 'none';

        try {
            // Call our serverless API to create a Yoco checkout session
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseInt(setupAmount, 10) * 100, // Convert Rands to cents
                    currency: 'ZAR',
                    packageName: packageName,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    customerPhone: customerPhone,
                    businessName: businessName,
                    notes: notes
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create payment session');
            }

            if (result.redirectUrl) {
                // Redirect to Yoco's hosted payment page
                window.location.href = result.redirectUrl;
            } else {
                throw new Error('No payment URL received. Please try again.');
            }

        } catch (error) {
            console.error('Payment error:', error);

            // Show error message
            errorEl.textContent = error.message || 'Something went wrong. Please try again.';
            errorEl.style.display = 'block';

            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnIcon.style.display = 'inline-flex';
            btnLoading.style.display = 'none';
        }
    });
}

// ======= WINDOW RESIZE =======
function handleResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ======= VALUE PROP SCROLL REVEAL =======
// Note: Animation now handled by GSAP in initGSAPAnimations() to avoid conflicts
function initValuePropObserver() {
    // Intentionally empty - GSAP handles .value-prop-card animations
}

// ======= BUILT ON SCROLL REVEAL =======
// Note: Animation now handled by GSAP in initGSAPAnimations() to avoid conflicts
function initBuiltOnObserver() {
    // Intentionally empty - GSAP handles .built-on-item animations
    // Immediately reveal the caption (no animation needed)
    const caption = document.querySelector('.built-on-caption');
    if (caption) caption.classList.add('built-on-visible');
}

// ======= GSAP SCROLL ANIMATIONS =======
let gsapInitialized = false;
function initGSAPAnimations() {
    if (gsapInitialized) return;  // Guard: never register ScrollTriggers twice
    gsapInitialized = true;
    gsap.registerPlugin(ScrollTrigger);

    // Clear CSS transitions on these elements so GSAP animates them smoothly without clashing
    gsap.set('.service-card, .work-item, .pricing-card, .stat-card, .process-step, .built-on-item, .value-prop-card', { transition: 'none' });

    // ── Hero Section Entrance (Fades & rises on page reveal) ──
    gsap.fromTo('.hero-content > *',
        { opacity: 0, y: 60 },
        {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.18,
            ease: 'power4.out',
            clearProps: 'all'
        }
    );

    // Hero parallax on scroll
    gsap.to('.hero-content', {
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: -150,
        opacity: 0,
        scale: 0.93
    });

    // ── Section headers reveal ──
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            scale: 0.98,
            duration: 1.2,
            stagger: 0.12,
            ease: 'power4.out'
        });
    });

    // ── About Section Description ──
    gsap.fromTo('.about-description', 
        { opacity: 0, y: 30 },
        {
            scrollTrigger: {
                trigger: '.about-full-desc',   // fixed: was '.about-left' which doesn't exist
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            duration: 1.0,
            stagger: 0.15,
            ease: 'power3.out'
        }
    );

    // Staggered About value-prop cards (new blueprint cards)
    gsap.fromTo('.value-prop-card',
        { opacity: 0, y: 50, rotationY: -8 },
        {
            scrollTrigger: {
                trigger: '.value-prop-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: 1.0,
            stagger: 0.12,
            ease: 'power4.out',
            clearProps: 'rotationY'  // release 3D transform after animation, keep opacity/position
        }
    );

        // Built-on LogoLoop reveal
    if (document.querySelector('.logoloop-wrapper')) {
        gsap.fromTo('.logoloop-wrapper, .built-on-caption',
            { opacity: 0, y: 30 },
            {
                scrollTrigger: {
                    trigger: '.built-on-section',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                clearProps: 'transform'
            }
        );
    }

    // Staggered Service cards — targets both condensed (homepage) and full services grid
    gsap.fromTo('.condensed-service-card, .service-card',
        { opacity: 0, y: 50, scale: 0.96 },
        {
            scrollTrigger: {
                trigger: '.condensed-services-grid, .services-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: 'power4.out'
        }
    );

    // Staggered Work showcase items
    gsap.fromTo('.work-item',
        { opacity: 0, y: 60, scale: 0.97 },
        {
            scrollTrigger: {
                trigger: '.work-showcase',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.12,
            ease: 'power3.out'
        }
    );

    // Staggered Pricing cards
    gsap.fromTo('.pricing-card',
        { opacity: 0, y: 60, scale: 0.97 },
        {
            scrollTrigger: {
                trigger: '.pricing-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: 'power4.out'
        }
    );

    // Staggered Process timeline steps in Contact Section
    gsap.fromTo('.process-step',
        { opacity: 0, x: -40, scale: 0.98 },
        {
            scrollTrigger: {
                trigger: '.process-timeline',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.15,
            ease: 'power3.out'
        }
    );

    // Contact form slide in
    gsap.fromTo('.contact-form',
        { opacity: 0, y: 50, scale: 0.98 },
        {
            scrollTrigger: {
                trigger: '.contact-form',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out'
        }
    );

    // Modern sections smooth reveal
    if (document.querySelector('.service-modern-card')) {
        gsap.fromTo('.service-modern-card',
            { opacity: 0, y: 40 },
            {
                scrollTrigger: {
                    trigger: '.services-modern-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: 'power3.out'
            }
        );
    }

    if (document.querySelector('.work-modern-card')) {
        gsap.fromTo('.work-modern-card, .work-featured-wide',
            { opacity: 0, y: 45 },
            {
                scrollTrigger: {
                    trigger: '.work-modern-section',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 1.0,
                stagger: 0.12,
                ease: 'power3.out'
            }
        );
    }

    if (document.querySelector('.process-step-card')) {
        gsap.fromTo('.process-step-card',
            { opacity: 0, y: 40 },
            {
                scrollTrigger: {
                    trigger: '.process-steps-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out'
            }
        );
    }

    if (document.querySelector('.pricing-modern-card')) {
        gsap.fromTo('.pricing-modern-card',
            { opacity: 0, y: 40 },
            {
                scrollTrigger: {
                    trigger: '.pricing-modern-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out'
            }
        );
    }
}

// ======= HERO CTA SCROLL =======
function initHeroScroll() {
    const ctas = document.querySelectorAll('.hero-btn, .section-view-all-btn');
    ctas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    if (lenis) {
                        lenis.scrollTo(target, { offset: 0, duration: 1.2 });
                    } else {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    });
}


// ======= TILT EFFECT ON SERVICE CARDS =======
function initTiltEffects() {
    const cards = document.querySelectorAll('.service-card, .work-item, .pricing-card, .stat-card, .value-prop-card');
    
    cards.forEach(card => {
        card.classList.add('spotlight-card');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ======= FAQ ACCORDION =======
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close others
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current
            item.classList.toggle('active');
        });
    });
}

// ======= REVIEWS INFINITE SCROLL & REVIEW CREATOR =======
const defaultReviews = [];

function initReviews() {
    const track = document.querySelector('.reviews-track');
    if (!track) return;

    // Load custom reviews from localStorage
    let customReviews = [];
    try {
        const stored = localStorage.getItem('m1creative_custom_reviews');
        if (stored) {
            customReviews = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error loading reviews from localStorage:", e);
    }

    // Combine reviews (custom ones prepended to default reviews to show newest first)
    const allReviews = [...customReviews, ...defaultReviews];

    // Clear track
    track.innerHTML = '';

    // Render review cards
    allReviews.forEach(review => {
        const starsHtml = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
        
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-stars">${starsHtml}</div>
            <p class="review-text">"${review.text}"</p>
            <div class="review-author">
                <img src="${review.avatar}" alt="${review.name}" class="review-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=a6ff00&color=0d0d0d&bold=true'"/>
                <div class="review-info">
                    <span class="review-name">${review.name}</span>
                </div>
            </div>
        `;
        track.appendChild(card);
    });

    // Clone all cards to create a seamless infinite loop
    const originalCards = track.querySelectorAll('.review-card');
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
}

function initReviewModal() {
    const openBtn = document.getElementById('openReviewModalBtn');
    const closeBtn = document.getElementById('closeReviewModal');
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('reviewModal');
    const form = document.getElementById('reviewForm');
    const starsContainer = document.getElementById('interactiveStars');

    if (!modal) return;

    let selectedRating = 5; // Default rating

    // Star Selection Interaction
    const stars = starsContainer ? starsContainer.querySelectorAll('.interactive-star') : [];
    
    function updateStars(val, type = 'selected') {
        stars.forEach(star => {
            const starVal = parseInt(star.getAttribute('data-value'));
            if (starVal <= val) {
                star.classList.add(type);
            } else {
                star.classList.remove(type);
            }
        });
    }

    if (stars.length) {
        // Initialize default selected stars
        updateStars(selectedRating, 'selected');

        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const hoverVal = parseInt(star.getAttribute('data-value'));
                updateStars(hoverVal, 'hovered');
            });

            star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.classList.remove('hovered'));
            });

            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-value'));
                updateStars(selectedRating, 'selected');
            });
        });
    }

    // Modal Control Functions
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Disable page scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore page scrolling
        // Reset form
        if (form) {
            form.reset();
            selectedRating = 5;
            updateStars(5, 'selected');
        }
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('reviewAuthorName');
            const textInput = document.getElementById('reviewText');

            if (!nameInput || !textInput) return;

            const name = nameInput.value.trim();
            const text = textInput.value.trim();

            if (!name || !text) return;

            // Generate initials avatar
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=a6ff00&color=0d0d0d&bold=true`;

            const newReview = {
                name,
                role: "",
                stars: selectedRating,
                text,
                avatar: avatarUrl
            };

            // Get existing, prepend new, save
            let customReviews = [];
            try {
                const stored = localStorage.getItem('m1creative_custom_reviews');
                if (stored) {
                    customReviews = JSON.parse(stored);
                }
            } catch (err) {
                console.error(err);
            }

            customReviews.unshift(newReview);

            try {
                localStorage.setItem('m1creative_custom_reviews', JSON.stringify(customReviews));
            } catch (err) {
                console.error("Failed to save review to localStorage:", err);
            }

            // Re-initialize reviews list
            initReviews();

            // Close modal
            closeModal();

            // Show toast notification
            showReviewToast("Thank you! Your review has been published.");
        });
    }
}

function showReviewToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'glass-card';
    toast.style.cssText = `
        padding: 16px 24px;
        background: rgba(15, 15, 15, 0.9);
        border: 1px solid var(--accent);
        border-radius: 12px;
        color: var(--text-white);
        font-weight: 500;
        font-size: 0.9rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        pointer-events: auto;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    toast.innerHTML = `
        <span style="color: var(--accent); font-weight: bold;">✓</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

// ======= PORTFOLIO FILTERS =======
function initPortfolioFilters() {
    const pills = document.querySelectorAll('.niche-pill');
    const items = document.querySelectorAll('.work-item');
    const moreBtn = document.getElementById('workMoreBtn');
    if (!pills.length || !items.length) return;

    let isExpanded = !moreBtn;

    function updateVisibility(filter) {
        let visibleCount = 0;
        items.forEach((item) => {
            const niche = item.getAttribute('data-niche');
            const type = item.getAttribute('data-type');
            
            if (item._fadeTimeout) {
                clearTimeout(item._fadeTimeout);
            }

            const isMatching = (filter === 'all' || niche === filter || type === filter);
            
            if (isMatching) {
                if (filter === 'all' && !isExpanded && visibleCount >= 3) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(30px) scale(0.95)';
                    item._fadeTimeout = setTimeout(() => {
                        item.style.display = 'none';
                    }, 400);
                } else {
                    item.style.display = '';
                    item.offsetHeight; // force reflow
                    item.style.opacity = '';
                    item.style.transform = '';
                    item.classList.add('visible');
                }
                visibleCount++;
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px) scale(0.95)';
                item._fadeTimeout = setTimeout(() => {
                    item.style.display = 'none';
                }, 400);
            }
        });

        // Show/hide "Show More" button
        if (moreBtn) {
            if (filter === 'all' && visibleCount > 3) {
                moreBtn.style.display = 'inline-block';
                moreBtn.textContent = isExpanded ? 'Show Less' : 'Show More Projects';
            } else {
                moreBtn.style.display = 'none';
            }
        }
    }

    // Run visibility once on init
    updateVisibility('all');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.getAttribute('data-filter');
            updateVisibility(filter);
        });
    });

    if (moreBtn) {
        moreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            const activePill = document.querySelector('.niche-pill.active');
            const filter = activePill ? activePill.getAttribute('data-filter') : 'all';
            
            updateVisibility(filter);

            // Scroll back to portfolio section top if collapsing
            if (!isExpanded) {
                const workSec = document.getElementById('work');
                if (workSec && typeof lenis !== 'undefined') {
                    lenis.scrollTo(workSec, { offset: 0, duration: 0.8 });
                }
            }
        });
    }
}

// ======= CASE STUDY MODAL =======
function initCaseStudies() {
    const overlay = document.getElementById('caseStudyOverlay');
    const closeBtn = document.getElementById('caseStudyClose');
    const badge = document.getElementById('caseStudyBadge');
    const title = document.getElementById('caseStudyTitle');
    const problem = document.getElementById('caseStudyProblem');
    const solution = document.getElementById('caseStudySolution');
    const featuresList = document.getElementById('caseStudyFeatures');
    const tech = document.getElementById('caseStudyTech');
    const launchBtn = document.getElementById('caseStudyLaunchBtn');
    
    if (!overlay || !closeBtn) return;
    
    const caseStudies = {
        elavea: {
            title: "ELAVEA — Beauty Lounge (Featured Project)",
            category: "Beauty & Wellness · FEATURED PROJECT",
            problem: "Client & Design Objective: Engineered to elevate luxury beauty & spa lounge online bookings. Solves common industry friction points such as slow mobile load times, uninspired template aesthetics, and cumbersome treatment menu navigation.",
            solution: "What We Engineered: We designed and engineered an elegant dark-mauve digital presence centered around bespoke typography, responsive treatment galleries, and instant booking flows. Features a custom curtain slide-up entrance preloader.",
            features: [
                "Luxury visual design system (mauve HSL tokens)",
                "Bespoke curtain slide-up entrance preloader",
                "Custom service menu filters with instant transition styling",
                "Fully responsive, touch-first booking layout"
            ],
            tech: "HTML5, CSS Custom Variables, Modern ES6 JS, Intersection Observer API",
            url: "clients/elavea-beauty-lounge/index.html"
        },
        sterling: {
            title: "Sterling & Vance — Corporate Law (Featured Project)",
            category: "Legal & Corporate · FEATURED PROJECT",
            problem: "Strategic Objective: Engineered to establish immediate digital prestige and authority for corporate law and advisory firms. Overcomes common legal website drawbacks like intimidating clutter and confusing navigation hierarchies.",
            solution: "What We Engineered: We engineered a commanding, sophisticated digital home in gold and navy. Features an interactive vector gold crest preloader, streamlined consultation booking flows, and an accessible FAQ panel.",
            features: [
                "Self-drawing gold vector emblem preloader",
                "Responsive lawyer profiles with interactive tilt effects",
                "Fully accessible client FAQ accordion panel system",
                "Consultation request forms with direct validation feedback"
            ],
            tech: "HTML5, CSS Flexbox & Grid, ES6 JS, SVG Path Animations",
            url: "clients/sterling-vance/index.html"
        },
        ambrelle: {
            title: "Ambrelle House — Fine Dining (Featured Project)",
            category: "Food & Dining · FEATURED PROJECT",
            problem: "Strategic Objective: Engineered to convert website visitors into confirmed fine-dining table reservations through sensory visual storytelling. Solves common mobile menu crashes and disjointed brand presentation.",
            solution: "What We Engineered: We engineered a theatrical split-curtain preloader featuring a self-drawing gold crescent moon. Includes tabbed menu filters, high-resolution interior galleries, and custom table reservation workflows.",
            features: [
                "Theatrical top/bottom curtain panels with SVG moon drawing preloader",
                "Deduplicated tabbed category filters for both menus and photo galleries",
                "Fluid full-screen lightbox modal for culinary exploration",
                "Automated reservation forms with custom success animations"
            ],
                        tech: "HTML5, Vanilla CSS, Vanilla ES6 JS, SVG Animations, Leaflet Map integration",
            url: "clients/ambrelle-house/index.html"
        },
        kopano: {
            title: "Kopano Construction — Building South Africa's Future",
            category: "Construction & Engineering · FEATURED PROJECT",
            problem: "Strategic Objective: Engineered to establish immediate digital credibility, showcase high-scale commercial and residential builds across South Africa, and capture high-intent structural quote requests. Overcomes generic construction template clutter, missing compliance proof (CIDB, NHBRC), and lack of transparent project estimation.",
            solution: "What We Engineered: We architected a powerful, high-contrast digital presence featuring a real-time 3D interactive architectural tower scene, categorized structural project galleries, client testimonial proof, and an integrated multi-step quote calculator for residential and commercial tenders.",
            features: [
                "Interactive 3D isometric building tower with crane animation",
                "Dynamic architectural project showcase with category chips",
                "Comprehensive CIDB, NHBRC, and B-BBEE compliance badge architecture",
                "Streamlined fixed-price site visit & quote estimation system"
            ],
            tech: "HTML5, CSS 3D Transforms, Vanilla ES6 JavaScript, Google Web Fonts (Archivo & Inter)",
            url: "clients/kopano-construction/index.html"
        },
        sonkrag: {
            title: "Sonkrag Solar — Renewable Energy & Battery Systems",
            category: "Solar & Clean Energy · FEATURED PROJECT",
            problem: "Strategic Objective: Engineered to solve South African loadshedding anxiety and convert residential and commercial energy consumers into qualified solar installation leads. Eliminates confusing technical jargon and hidden cost ambiguity.",
            solution: "What We Engineered: We designed and engineered a clean, sun-inspired modern solar platform featuring an interactive savings estimator, tier-based backup & hybrid system comparison cards, real-time power generation data visualizers, and an intuitive site assessment request funnel.",
            features: [
                "Interactive load-shedding survival & solar savings calculator",
                "Tiered inverter, battery storage, and panel package visualizer",
                "Trust architecture featuring CoC electrical certification and Tier-1 hardware warranties",
                "Frictionless free site assessment quote booking workflow"
            ],
            tech: "HTML5, CSS Custom Variables, Modern ES6 JS, Embedded SVG System Architecture",
            url: "clients/sonkrag-solar/index.html"
        },
        tessera: {
            title: "Tessera Pools — Bespoke Pool Builders",
            category: "Luxury Living & Architecture · FEATURED PROJECT",
            problem: "Strategic Objective: Engineered for high-end South African architectural estates, boutique hotels, and luxury homeowners seeking bespoke pool construction. Solves the disconnect between standard pool catalogs and ultra-luxury architectural craftsmanship.",
            solution: "What We Engineered: We crafted a lavish, fluid-inspired luxury showcase featuring an ambient interactive water surface canvas simulation, 3D perspective card tilt physics, a masonry portfolio grid of custom rim-flow and lap pools, and an executive consultation intake system.",
            features: [
                "Interactive WebGL/Canvas fluid water wave simulation on hero",
                "3D mouse-tracking card perspective tilt physics across gallery items",
                "Masonry architectural portfolio with dynamic filter tags",
                "Exclusive bespoke site consultation and architectural spec workflow"
            ],
            tech: "HTML5, Canvas API / Fluid Dynamics, CSS 3D Perspective, ES6 JS, Cormorant Garamond & Manrope Typography",
            url: "clients/tessera-pools/index.html"
        }
    };
    
    document.querySelectorAll('.work-item, .work-modern-card').forEach(item => {
        const liveLink = item.querySelector('.live-site-link');
        const triggerBtn = item.querySelector('.case-study-trigger');
        const projectKey = item.getAttribute('data-project');
        
        // Bind case study to the dedicated Case Study button
        if (triggerBtn && projectKey && caseStudies[projectKey]) {
            triggerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const data = caseStudies[projectKey];
                
                // Populate data
                badge.textContent = data.category;
                title.textContent = data.title;
                problem.textContent = data.problem;
                solution.textContent = data.solution;
                tech.textContent = data.tech;
                launchBtn.setAttribute('href', data.url);
                
                // Populate features
                featuresList.innerHTML = '';
                data.features.forEach(f => {
                    const li = document.createElement('li');
                    li.textContent = f;
                    featuresList.appendChild(li);
                });
                
                // Open overlay
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        // Live site link — just opens in new tab, no modal
        if (liveLink) {
            liveLink.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    });
    
    // Close functions
    function closeCaseStudy() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeBtn.addEventListener('click', closeCaseStudy);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCaseStudy();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeCaseStudy();
        }
    });
}


// ======= LOGOLOOP (REACT BITS ENGINE ADAPTATION) =======
function initLogoLoop() {
    const root = document.getElementById('brandLogoLoop');
    const track = document.getElementById('logoLoopTrack');
    if (!root || !track) return;

    const list = track.querySelector('.logoloop__list');
    if (!list) return;

    let offset = 0;
    let velocity = 0;
    let targetSpeed = 45; // Pixels per second to the left
    let currentSpeed = targetSpeed;
    let isHovered = false;
    let isDragging = false;
    let pointerStartX = 0;
    let pointerLastX = 0;
    let pointerLastTime = 0;
    let dragDistance = 0;
    let lastTime = performance.now();
    let period = list.offsetWidth || 1;
    let animId = null;

    function updatePeriod() {
        if (list) {
            period = list.getBoundingClientRect().width || list.offsetWidth || 1;
        }
    }
    updatePeriod();

    const resizeObserver = window.ResizeObserver ? new ResizeObserver(() => {
        updatePeriod();
    }) : null;
    if (resizeObserver) resizeObserver.observe(list);

    // Hover slowdown
    root.addEventListener('mouseenter', () => {
        isHovered = true;
    });
    root.addEventListener('mouseleave', () => {
        isHovered = false;
    });

    // Drag & Fling Physics
    root.addEventListener('pointerdown', (e) => {
        isDragging = true;
        dragDistance = 0;
        pointerStartX = e.clientX;
        pointerLastX = e.clientX;
        pointerLastTime = performance.now();
        velocity = 0;
        root.setPointerCapture(e.pointerId);
    });

    root.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const now = performance.now();
        const deltaX = e.clientX - pointerLastX;
        const dt = Math.max(1, now - pointerLastTime);
        
        dragDistance += Math.abs(deltaX);
        offset -= deltaX; // move with finger/cursor
        velocity = -(deltaX / dt) * 1000; // px/sec

        pointerLastX = e.clientX;
        pointerLastTime = now;
    });

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        try {
            root.releasePointerCapture(e.pointerId);
        } catch (_) {}
    }

    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);

    // Prevent navigation if dragged
    root.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (e) => {
            if (dragDistance > 6) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // Animation loop
    function tick(now) {
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        if (!isDragging) {
            // Apply friction to fling velocity
            if (Math.abs(velocity) > 0.1) {
                velocity *= Math.exp(-dt * 3.5);
                offset += velocity * dt;
            } else {
                velocity = 0;
                // Normal running speed with smooth hover deceleration
                const desiredSpeed = isHovered ? 0 : targetSpeed;
                currentSpeed += (desiredSpeed - currentSpeed) * Math.min(1, dt * 5);
                offset += currentSpeed * dt;
            }
        }

        // Infinite modulo loop
        if (period > 0) {
            offset = ((offset % period) + period) % period;
        }

        // Apply 3D accelerated transform to track
        track.style.transform = `translate3d(${-offset.toFixed(2)}px, 0, 0)`;

        animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);
}

// ======= INIT =======

// ─── VIDEO CARD PLAY/PAUSE ────────────────────────────────────────────────────
function initVideoCards() {
    const playSVG = '<polygon points="5,3 19,12 5,21"/>';
    const pauseSVG = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';

    document.querySelectorAll('.work-video-frame').forEach(function(frame) {
        var video = frame.querySelector('video');
        var btn = frame.querySelector('.work-video-play-btn');
        var label = btn ? btn.querySelector('.play-label') : null;
        var svgIcon = btn ? btn.querySelector('svg') : null;

        if (!video || !btn) {
            // For static preview image cards, clicking frame launches project
            var primaryLink = frame.closest('.work-item, .work-modern-card')?.querySelector('a.work-action-btn.primary');
            if (primaryLink) {
                frame.style.cursor = 'pointer';
                frame.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'A' && !e.target.closest('a') && !e.target.closest('button')) {
                        window.open(primaryLink.href, '_blank', 'noopener,noreferrer');
                    }
                });
            }
            return;
        }

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (video.paused) {
                // Pause all other videos first
                document.querySelectorAll('.work-video').forEach(function(v) {
                    if (v !== video && !v.paused) {
                        v.pause();
                        var otherFrame = v.closest('.work-video-frame');
                        var otherBtn = otherFrame ? otherFrame.querySelector('.work-video-play-btn') : null;
                        if (otherBtn) {
                            var otherLabel = otherBtn.querySelector('.play-label');
                            var otherSvg = otherBtn.querySelector('svg');
                            if (otherLabel) otherLabel.textContent = 'Play';
                            if (otherSvg) otherSvg.innerHTML = playSVG;
                            otherBtn.classList.remove('playing');
                        }
                    }
                });
                video.play();
                if (label) label.textContent = 'Pause';
                if (svgIcon) svgIcon.innerHTML = pauseSVG;
                btn.classList.add('playing');
            } else {
                video.pause();
                if (label) label.textContent = 'Play';
                if (svgIcon) svgIcon.innerHTML = playSVG;
                btn.classList.remove('playing');
            }
        });

        // Click anywhere on the video frame also toggles play/pause
        frame.addEventListener('click', function(e) {
            if (e.target !== btn && !btn.contains(e.target)) {
                btn.click();
            }
        });

        video.addEventListener('ended', function() {
            if (label) label.textContent = 'Play';
            if (svgIcon) svgIcon.innerHTML = playSVG;
            btn.classList.remove('playing');
        });
    });
}


// ─── FLOATING WHATSAPP BUTTON INJECTION ───────────────────────────────────────
function initFloatingWhatsApp() {
    if (document.querySelector(".floating-whatsapp-btn")) return;

    var btn = document.createElement("a");
    btn.href = "https://wa.me/27720733092?text=Hi%20Michael,%20I%27d%20like%20to%20inquire%20about%20a%20website%20for%20my%20business";
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className = "floating-whatsapp-btn";
    btn.setAttribute("aria-label", "Chat with Michael on WhatsApp");
    btn.innerHTML = '<span class="whatsapp-pulse"></span>' +
        '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
        '<span class="whatsapp-tooltip">Chat with us on WhatsApp</span>';

    document.body.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', () => {
    // Init UI interactions immediately (they don't need Three.js)
    initNavigation();
    initLogoLoop();
    initForm();
    initCheckout();
    initCursorGlow();
    initTiltEffects();
    initFAQ();
    initReviews();
    initReviewModal();
    initPortfolioFilters();
    initHeroScroll();
    initCaseStudies();

    // Init Lenis smooth scrolling
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Fast start, slow end
        smooth: true,
        mouseMultiplier: 0.95,
        smoothTouch: false,
    });

    function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);

    // Sync Lenis scroll triggers
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Start animations and background canvas immediately (intro removed)
    initIntro();

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    initVideoCards();

    initFloatingWhatsApp();
});
