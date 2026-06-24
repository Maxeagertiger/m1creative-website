/* ===========================
   M1CREATIVE. — Main JavaScript
   Three.js 3D Scene + GSAP Scroll Animations
   =========================== */

// ======= GLOBAL STATE =======
let scene, camera, renderer, stars, nebula, planet, ring;
let mouseX = 0, mouseY = 0;
let scrollProgress = 0;
const clock = new THREE.Clock();

// ======= CINEMATIC SPACE INTRO =======
function initIntro() {
    const canvas = document.getElementById('intro-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    // Cap canvas resolution for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w, h, cx, cy;
    function sizeCanvas() {
        w = canvas.width = window.innerWidth * dpr;
        h = canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        cx = w / 2;
        cy = h / 2;
    }
    sizeCanvas();

    // Pre-compute star colors as rgba base strings (avoids per-frame string ops)
    const STAR_COUNT = 400;
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        let r, g, b;
        const roll = Math.random();
        if (roll > 0.85) {
            // Accent green-ish
            r = 180 + Math.random() * 40 | 0;
            g = 255;
            b = 50 + Math.random() * 30 | 0;
        } else if (roll > 0.7) {
            // Blue-white
            r = 160 + Math.random() * 40 | 0;
            g = 200 + Math.random() * 30 | 0;
            b = 255;
        } else {
            // White
            const v = 200 + Math.random() * 55 | 0;
            r = v; g = v; b = v;
        }
        stars.push({
            x: (Math.random() - 0.5) * w * 3,
            y: (Math.random() - 0.5) * h * 3,
            z: Math.random() * 2000,
            size: Math.random() * 1.5 + 0.5,
            r, g, b
        });
    }

    let speed = 2;
    let targetSpeed = 2;
    let introFrame;
    let startTime = performance.now();

    function drawStars() {
        // Trail fade
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 0, w, h);

        const isWarping = speed > 10;

        for (let i = 0; i < STAR_COUNT; i++) {
            const s = stars[i];
            s.z -= speed;

            if (s.z <= 0) {
                s.z = 2000;
                s.x = (Math.random() - 0.5) * w * 3;
                s.y = (Math.random() - 0.5) * h * 3;
            }

            const factor = 600 / s.z;
            const sx = s.x * factor + cx;
            const sy = s.y * factor + cy;

            if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

            const size = s.size * factor * 0.5;
            const alpha = Math.min(1, (2000 - s.z) / 600);

            // Streak during warp — single line, no beginPath per star
            if (isWarping) {
                const prevFactor = 600 / (s.z + speed);
                const px = s.x * prevFactor + cx;
                const py = s.y * prevFactor + cy;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},${(alpha * 0.6).toFixed(2)})`;
                ctx.lineWidth = size * 0.7;
                ctx.stroke();
            }

            // Star dot — use fillRect instead of arc for speed
            const dotSize = Math.max(size, 0.8);
            ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha.toFixed(2)})`;
            ctx.fillRect(sx - dotSize * 0.5, sy - dotSize * 0.5, dotSize, dotSize);
        }

        speed += (targetSpeed - speed) * 0.05;
    }

    function introLoop() {
        const elapsed = performance.now() - startTime;

        if (elapsed < 400) {
            targetSpeed = 3;
        } else if (elapsed < 1000) {
            targetSpeed = 45;
        } else if (elapsed < 2000) {
            targetSpeed = 55;
        } else if (elapsed < 2600) {
            targetSpeed = 4;
        } else {
            targetSpeed = 2;
        }

        drawStars();
        introFrame = requestAnimationFrame(introLoop);
    }

    introLoop();

    // Choreograph UI reveals
    const introContent = document.querySelector('.intro-content');
    const introM = document.querySelector('.intro-m');
    const introOne = document.querySelector('.intro-one');
    const introCreative = document.querySelector('.intro-creative');
    const introLogo = document.querySelector('.intro-logo');
    const introTagline = document.querySelector('.intro-tagline');
    const introLine = document.querySelector('.intro-line');
    const introFlash = document.querySelector('.intro-flash');
    const loader = document.getElementById('loader');

    setTimeout(() => introContent.classList.add('show'), 700);

    setTimeout(() => {
        introM.classList.add('show');
        introOne.classList.add('show');
        introCreative.classList.add('show');
    }, 900);

    setTimeout(() => {
        introLogo.classList.add('glow');
        introTagline.classList.add('show');
        introLine.classList.add('show');
    }, 1500);

    // Flash + zoom out
    setTimeout(() => {
        introFlash.classList.add('fire');
        introContent.classList.remove('show');
        introContent.classList.add('zoom-out');
    }, 3200);

    // Stop canvas & start Three.js
    setTimeout(() => {
        cancelAnimationFrame(introFrame);
        ctx.clearRect(0, 0, w, h);
        loader.classList.add('exit');
        // Now init the heavy 3D scene
        initThreeJS();
        animate();
    }, 3900);

    setTimeout(() => {
        loader.style.display = 'none';
        canvas.remove();
    }, 4900);

    window.addEventListener('resize', sizeCanvas);
}

// ======= THREE.JS SCENE SETUP =======
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0008);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 0, 800);

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xa6ff00, 2, 2000);
    pointLight1.position.set(200, 200, 400);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa0d4ff, 1.5, 2000);
    pointLight2.position.set(-300, -100, 300);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xff6b6b, 1, 1500);
    pointLight3.position.set(0, -200, 200);
    scene.add(pointLight3);

    createStarField();
    createNebula();
    createPlanet();
    createFloatingGeometries();
    createParticleRing();
}

// ======= STAR FIELD =======
function createStarField() {
    const starsCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 4000;
        positions[i3 + 1] = (Math.random() - 0.5) * 4000;
        positions[i3 + 2] = (Math.random() - 0.5) * 4000;
        sizes[i] = Math.random() * 3 + 0.5;

        // Color variation: white, blue-white, yellow-white
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
            colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1;
        } else if (colorChoice < 0.8) {
            colors[i3] = 0.7; colors[i3 + 1] = 0.85; colors[i3 + 2] = 1;
        } else {
            colors[i3] = 1; colors[i3 + 1] = 0.95; colors[i3 + 2] = 0.7;
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

// ======= NEBULA CLOUDS =======
function createNebula() {
    nebula = new THREE.Group();

    const nebulaColors = [0xa6ff00, 0xa0d4ff, 0x8b5cf6, 0xff6b6b];

    for (let i = 0; i < 12; i++) {
        const geometry = new THREE.PlaneGeometry(600 + Math.random() * 400, 600 + Math.random() * 400);

        const canvas2d = document.createElement('canvas');
        canvas2d.width = 256;
        canvas2d.height = 256;
        const ctx = canvas2d.getContext('2d');

        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        const texture = new THREE.CanvasTexture(canvas2d);

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: nebulaColors[i % nebulaColors.length],
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 1500,
            (Math.random() - 0.5) * 1500 - 500
        );
        mesh.rotation.z = Math.random() * Math.PI;
        mesh.userData = {
            rotSpeed: (Math.random() - 0.5) * 0.001,
            floatSpeed: Math.random() * 0.5 + 0.3,
            floatAmount: Math.random() * 30 + 10,
            initY: mesh.position.y
        };
        nebula.add(mesh);
    }

    scene.add(nebula);
}

// ======= PLANET =======
function createPlanet() {
    planet = new THREE.Group();

    // Planet sphere
    const planetGeo = new THREE.SphereGeometry(120, 64, 64);

    // Create planet texture procedurally
    const planetCanvas = document.createElement('canvas');
    planetCanvas.width = 512;
    planetCanvas.height = 256;
    const pCtx = planetCanvas.getContext('2d');

    // Base color
    const baseGrad = pCtx.createLinearGradient(0, 0, 512, 256);
    baseGrad.addColorStop(0, '#2a1810');
    baseGrad.addColorStop(0.3, '#4a2820');
    baseGrad.addColorStop(0.5, '#3a2018');
    baseGrad.addColorStop(0.7, '#5a3828');
    baseGrad.addColorStop(1, '#2a1810');
    pCtx.fillStyle = baseGrad;
    pCtx.fillRect(0, 0, 512, 256);

    // Bands
    for (let i = 0; i < 20; i++) {
        const y = Math.random() * 256;
        const height = Math.random() * 20 + 5;
        pCtx.fillStyle = `rgba(${100 + Math.random() * 80}, ${40 + Math.random() * 40}, ${20 + Math.random() * 30}, ${Math.random() * 0.4 + 0.1})`;
        pCtx.fillRect(0, y, 512, height);
    }

    // Swirl spots
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 40 + 10;
        const spotGrad = pCtx.createRadialGradient(x, y, 0, x, y, r);
        spotGrad.addColorStop(0, `rgba(${180 + Math.random() * 50}, ${80 + Math.random() * 50}, ${20}, 0.5)`);
        spotGrad.addColorStop(1, 'rgba(0,0,0,0)');
        pCtx.fillStyle = spotGrad;
        pCtx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    const planetTex = new THREE.CanvasTexture(planetCanvas);

    const planetMat = new THREE.MeshStandardMaterial({
        map: planetTex,
        roughness: 0.8,
        metalness: 0.1
    });

    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planet.add(planetMesh);

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(125, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
        color: 0xa6ff00,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    const atmos = new THREE.Mesh(atmosGeo, atmosMat);
    planet.add(atmos);

    planet.position.set(350, -100, -400);
    scene.add(planet);
}

// ======= FLOATING GEOMETRIES =======
const floatingObjects = [];
function createFloatingGeometries() {
    const geometries = [
        new THREE.IcosahedronGeometry(8, 0),
        new THREE.OctahedronGeometry(10, 0),
        new THREE.TetrahedronGeometry(9, 0),
        new THREE.BoxGeometry(10, 10, 10),
        new THREE.TorusGeometry(8, 3, 8, 16)
    ];

    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xa6ff00, wireframe: true, transparent: true, opacity: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0xa0d4ff, wireframe: true, transparent: true, opacity: 0.3 }),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.35 }),
    ];

    for (let i = 0; i < 30; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const mat = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(geo, mat.clone());

        mesh.position.set(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
        );

        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);

        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            floatSpeed: Math.random() * 0.8 + 0.2,
            floatAmount: Math.random() * 40 + 10,
            initY: mesh.position.y
        };

        floatingObjects.push(mesh);
        scene.add(mesh);
    }
}

// ======= PARTICLE RING =======
function createParticleRing() {
    const ringCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ringCount * 3);
    const colors = new Float32Array(ringCount * 3);

    for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2;
        const radius = 250 + (Math.random() - 0.5) * 60;
        const i3 = i * 3;
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = (Math.random() - 0.5) * 15;
        positions[i3 + 2] = Math.sin(angle) * radius;

        const t = i / ringCount;
        colors[i3] = 0.78 + t * 0.22;     // R
        colors[i3 + 1] = 1.0 - t * 0.17;    // G
        colors[i3 + 2] = t * 0.4;            // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    ring = new THREE.Points(geometry, material);
    ring.position.set(0, 0, -200);
    ring.rotation.x = Math.PI * 0.35;
    scene.add(ring);
}

// ======= ANIMATION LOOP =======
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Rotate stars slowly
    if (stars) {
        stars.rotation.y += 0.00008;
        stars.rotation.x += 0.00003;
    }

    // Nebula floating
    if (nebula) {
        nebula.children.forEach(cloud => {
            cloud.rotation.z += cloud.userData.rotSpeed;
            cloud.position.y = cloud.userData.initY + Math.sin(time * cloud.userData.floatSpeed) * cloud.userData.floatAmount;
        });
    }

    // Planet rotation
    if (planet) {
        planet.children[0].rotation.y += 0.001;
        planet.position.y = -100 + Math.sin(time * 0.3) * 20;
    }

    // Floating geometries
    floatingObjects.forEach(obj => {
        obj.rotation.x += obj.userData.rotSpeedX;
        obj.rotation.y += obj.userData.rotSpeedY;
        obj.position.y = obj.userData.initY + Math.sin(time * obj.userData.floatSpeed) * obj.userData.floatAmount;
    });

    // Particle ring rotation
    if (ring) {
        ring.rotation.z += 0.001;
    }

    // Camera parallax from mouse
    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.02;

    // Camera zoom based on scroll
    const targetZ = 800 - scrollProgress * 600;
    camera.position.z += (targetZ - camera.position.z) * 0.03;

    camera.lookAt(scene.position);
    renderer.render(scene, camera);
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
        const rect = word.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            word.classList.add('visible');
        }
    });

    // Animate about description
    document.querySelectorAll('.about-description').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            el.classList.add('visible');
        }
    });

    // Animate stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            card.classList.add('visible');
        }
    });

    // Animate service cards
    document.querySelectorAll('.service-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            card.classList.add('visible');
        }
    });

    // Animate work items
    document.querySelectorAll('.work-item').forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            item.classList.add('visible');
        }
    });

    // Animate pricing cards
    document.querySelectorAll('.pricing-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            card.classList.add('visible');
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

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ======= FORM HANDLING =======
function initForm() {
    const form = document.getElementById('contact-form');
    const successEl = document.getElementById('formSuccess');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        });

        console.log('Form submission:', data);

        // Show success message
        successEl.classList.add('show');

        // Reset form after delay
        setTimeout(() => {
            form.reset();
            successEl.classList.remove('show');
        }, 4000);
    });
}

// ======= CHECKOUT SYSTEM =======
function initCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    const closeBtn = document.getElementById('checkoutClose');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSuccess = document.getElementById('checkoutSuccess');

    const packageNames = {
        Bronze: 'Starter Presence',
        Silver: 'Growth Package',
        Gold: 'Premium Authority'
    };

    // Open checkout from pricing CTA buttons
    document.querySelectorAll('.pricing-cta').forEach(btn => {
        btn.addEventListener('click', () => {
            const pkg = btn.dataset.package;
            const setup = btn.dataset.setup;
            const monthly = btn.dataset.monthly;
            const tier = pkg.toLowerCase();

            // Update modal content
            const badge = document.getElementById('checkoutBadge');
            badge.textContent = pkg.toUpperCase();
            badge.setAttribute('data-tier', tier);

            document.getElementById('checkoutPackageName').textContent = packageNames[pkg] || pkg;
            document.getElementById('checkoutSetup').textContent = `R${Number(setup).toLocaleString()}`;
            document.getElementById('checkoutMonthly').textContent = `R${Number(monthly).toLocaleString()}/mo`;
            document.getElementById('checkoutTotal').textContent = `R${Number(setup).toLocaleString()}`;

            // Set hidden fields
            document.getElementById('checkout-package').value = pkg;
            document.getElementById('checkout-setup-amount').value = setup;
            document.getElementById('checkout-monthly-amount').value = monthly;

            // Reset form state
            checkoutForm.reset();
            checkoutSuccess.classList.remove('show');

            // Open modal
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
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

// ======= GSAP SCROLL ANIMATIONS =======
function initGSAPAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero parallax
    gsap.to('.hero-content', {
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: -150,
        opacity: 0,
        scale: 0.9
    });

    // Section tags slide in
    gsap.utils.toArray('.section-tag').forEach(tag => {
        gsap.from(tag, {
            scrollTrigger: {
                trigger: tag,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            x: -30,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    // Light section transition
    gsap.from('#contact', {
        scrollTrigger: {
            trigger: '#contact',
            start: 'top 90%',
            end: 'top 30%',
            scrub: 1
        },
        clipPath: 'inset(10% 5% 10% 5% round 30px)',
    });
}

// ======= TILT EFFECT ON SERVICE CARDS =======
function initTiltEffects() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', () => {
    // Start intro first — Three.js is deferred until intro finishes
    initIntro();
    initNavigation();
    initForm();
    initCheckout();
    initCursorGlow();
    initTiltEffects();

    // Delay GSAP init to ensure DOM is ready
    setTimeout(() => {
        initGSAPAnimations();
    }, 100);

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);
});
