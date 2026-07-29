/* ===========================
   M1CREATIVE. — Main JavaScript
   Three.js 3D Scene + GSAP Scroll Animations
   =========================== */

// ======= GLOBAL STATE =======
let scene, camera, renderer, stars, nebula, planet, ring;
let mouseX = 0, mouseY = 0;
let scrollProgress = 0;
const clock = new THREE.Clock();
let introSunLight = null;
let lenis = null;
let shakeIntensity = 0;
const shakeDecay = 0.92;
let explosionParticles = [];
let trailParticles = [];
let earthChunks = [];
let galaxy = null;

// ======= ROCKET CRASH SEQUENCE =======
function createRocket() {
    const group = new THREE.Group();

    // Body (sleek metal cylinder, tripled in thickness & length)
    const bodyGeo = new THREE.CylinderGeometry(5.5, 5.5, 32, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x111111
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2; // Orient along Z axis
    group.add(body);

    // Nose Cone (glowing neon orange/red)
    const noseGeo = new THREE.ConeGeometry(5.5, 10, 16);
    const noseMat = new THREE.MeshStandardMaterial({
        color: 0xff3300,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x551100
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = 21.0;
    nose.rotation.x = Math.PI / 2;
    group.add(nose);

    // Fins (3 sleek metallic wings)
    const finGeo = new THREE.BoxGeometry(1.2, 8, 10);
    const finMat = new THREE.MeshStandardMaterial({
        color: 0xff3300,
        metalness: 0.8,
        roughness: 0.2
    });
    for (let i = 0; i < 3; i++) {
        const fin = new THREE.Mesh(finGeo, finMat);
        const angle = (i / 3) * Math.PI * 2;
        fin.position.x = Math.cos(angle) * 5.5;
        fin.position.y = Math.sin(angle) * 5.5;
        fin.position.z = -12.0;
        fin.rotation.z = angle;
        group.add(fin);
    }

    // Flame exhaust cone
    const flameGeo = new THREE.ConeGeometry(3.5, 18, 16);
    const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.name = 'flame';
    flame.position.z = -25.0;
    flame.rotation.x = -Math.PI / 2;
    group.add(flame);

    return group;
}
function spawnTrailParticle(pos, offset) {
    const geom = new THREE.SphereGeometry(2.8, 6, 6);
    const colors = [0xffaa00, 0xff3300, 0x666666];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const p = new THREE.Mesh(geom, mat);
    
    // Position at exhaust tip
    p.position.copy(pos).add(offset);
    
    // Slow drift velocity
    p.userData = {
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        vz: (Math.random() - 0.5) * 1.5,
        life: 1.0
    };
    
    scene.add(p);
    trailParticles.push(p);
}

function launchRocket() {
    // Starts closer to camera viewport (Z=520, camera is at Z=650) to ensure high visibility
    const startPos = new THREE.Vector3(250, 160, 520);
    const endPos = new THREE.Vector3(0, 0, -150);
    const controlPos = new THREE.Vector3(120, -50, 200);

    const rocket = createRocket();
    scene.add(rocket);
    rocket.position.copy(startPos);

    const pathObj = { progress: 0 };
    gsap.to(pathObj, {
        progress: 1,
        duration: 1.5, // fast, punchy impact flight path
        ease: 'power2.in',
        onUpdate: () => {
            const t = pathObj.progress;
            
            // Quadratic Bezier interpolation
            const currentPos = new THREE.Vector3();
            currentPos.x = (1-t)*(1-t)*startPos.x + 2*(1-t)*t*controlPos.x + t*t*endPos.x;
            currentPos.y = (1-t)*(1-t)*startPos.y + 2*(1-t)*t*controlPos.y + t*t*endPos.y;
            currentPos.z = (1-t)*(1-t)*startPos.z + 2*(1-t)*t*controlPos.z + t*t*endPos.z;

            // Orient the rocket toward its next step
            const nextT = Math.min(1, t + 0.02);
            const nextPos = new THREE.Vector3();
            nextPos.x = (1-nextT)*(1-nextT)*startPos.x + 2*(1-nextT)*nextT*controlPos.x + nextT*nextT*endPos.x;
            nextPos.y = (1-nextT)*(1-nextT)*startPos.y + 2*(1-nextT)*nextT*controlPos.y + nextT*nextT*endPos.y;
            nextPos.z = (1-nextT)*(1-nextT)*startPos.z + 2*(1-nextT)*nextT*controlPos.z + nextT*nextT*endPos.z;

            rocket.position.copy(currentPos);
            rocket.lookAt(nextPos);

            // Animate flame exhaust scaling
            const flame = rocket.children.find(c => c.name === 'flame');
            if (flame) {
                flame.scale.y = 1 + Math.sin(performance.now() * 0.08) * 0.4;
            }

            // Spawn trail particles at the exhaust tip (25 units behind rocket pivot)
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(rocket.quaternion);
            spawnTrailParticle(currentPos, forward.multiplyScalar(25));
        },
        onComplete: () => {
            triggerImpact(rocket);
        }
    });
}

function triggerImpact(rocket) {
    scene.remove(rocket);

    // Camera shake intensity spike
    shakeIntensity = 42;

    // Create full-screen additive thermal radial flash overlay
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.background = 'radial-gradient(circle, #ffeedd 0%, rgba(255, 90, 0, 0.4) 60%, transparent 100%)';
    flash.style.zIndex = '99999';
    flash.style.opacity = '0.9';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);

    gsap.to(flash, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => {
            if (flash.parentNode) {
                document.body.removeChild(flash);
            }
        }
    });


    // ── Hide Earth meshes completely ──
    if (introEarth) {
        introEarth.children.forEach(child => {
            child.visible = false;
        });
    }

    // 1. Spawn expanding shockwave ring
    const shockwaveGeo = new THREE.RingGeometry(0.1, 40, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
        color: 0xffaa44,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.position.set(0, 0, -150);
    shockwave.lookAt(camera.position);
    scene.add(shockwave);

    gsap.fromTo(shockwave.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        {
            x: 2.8, y: 2.8, z: 2.8,
            duration: 0.9,
            ease: 'power3.out',
            onComplete: () => {
                scene.remove(shockwave);
            }
        }
    );
    gsap.to(shockwaveMat, {
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out'
    });

    // 2. Spawn Earth fragment chunks flying outwards
    const chunkCount = 30;
    for (let i = 0; i < chunkCount; i++) {
        let color, size, isEmissive = false;
        const roll = Math.random();
        if (roll < 0.35) {
            color = 0x3d6e28; // Land chunk (green)
            size = 3.5 + Math.random() * 5.0;
        } else if (roll < 0.7) {
            color = 0x0a1f3c; // Ocean chunk (dark blue)
            size = 4.0 + Math.random() * 6.0;
        } else {
            color = 0xff4400; // Glowing magma core chunk
            size = 2.5 + Math.random() * 4.0;
            isEmissive = true;
        }

        const chunkGeo = new THREE.DodecahedronGeometry(size, 0);
        const chunkMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.1,
            transparent: true,
            opacity: 1.0,
            emissive: isEmissive ? 0xff4400 : 0x000000,
            emissiveIntensity: isEmissive ? 2.5 : 0.0
        });
        const chunk = new THREE.Mesh(chunkGeo, chunkMat);

        // Position chunk initially inside Earth's sphere radius (at 0, 0, -150)
        const radius = 5 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        chunk.position.set(
            Math.sin(phi) * Math.cos(theta) * radius,
            Math.sin(phi) * Math.sin(theta) * radius,
            -150 + Math.cos(phi) * radius
        );

        // Outward velocity from center
        const dir = new THREE.Vector3().copy(chunk.position).sub(new THREE.Vector3(0, 0, -150)).normalize();
        const speed = 2.0 + Math.random() * 7.5;
        
        chunk.userData = {
            velocity: dir.multiplyScalar(speed),
            rotVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.06,
                (Math.random() - 0.5) * 0.06,
                (Math.random() - 0.5) * 0.06
            ),
            life: 1.0
        };

        scene.add(chunk);
        earthChunks.push(chunk);
    }

    // 3. Spawn dense explosion sparks/flames particles
    const particleCount = 140; 
    const geom = new THREE.SphereGeometry(1.2, 6, 6);

    for (let i = 0; i < particleCount; i++) {
        const colors = [0xffffff, 0xffaa00, 0xff3300, 0xff5500, 0x222222];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0,
            blending: color === 0x222222 ? THREE.NormalBlending : THREE.AdditiveBlending
        });
        const p = new THREE.Mesh(geom, mat);

        p.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            -150 + (Math.random() - 0.5) * 8
        );

        // Spherical explosion velocity distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = 1 + Math.random() * 9;

        p.userData = {
            vx: Math.sin(phi) * Math.cos(theta) * speed,
            vy: Math.sin(phi) * Math.sin(theta) * speed,
            vz: Math.cos(phi) * speed,
            life: 1.0,
            decay: 0.94 + Math.random() * 0.04
        };

        scene.add(p);
        explosionParticles.push(p);
    }
}

function updateTrailAndExplosion() {
    // Update rocket trails (slower decay for thicker trail)
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;
        p.userData.life -= 0.02;
        p.material.opacity = p.userData.life;
        p.scale.multiplyScalar(0.96);
        if (p.userData.life <= 0) {
            scene.remove(p);
            trailParticles.splice(i, 1);
        }
    }
    
    // Update Earth chunks
    for (let i = earthChunks.length - 1; i >= 0; i--) {
        const chunk = earthChunks[i];
        chunk.position.add(chunk.userData.velocity);
        chunk.rotation.x += chunk.userData.rotVelocity.x;
        chunk.rotation.y += chunk.userData.rotVelocity.y;
        chunk.rotation.z += chunk.userData.rotVelocity.z;

        chunk.userData.velocity.multiplyScalar(0.975); // Slow down friction
        chunk.userData.life -= 0.007;
        chunk.scale.setScalar(chunk.userData.life);
        
        if (chunk.material) {
            chunk.material.opacity = chunk.userData.life;
        }

        if (chunk.userData.life <= 0) {
            scene.remove(chunk);
            earthChunks.splice(i, 1);
        }
    }

    // Update explosion
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const p = explosionParticles[i];
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;
        
        p.userData.vx *= 0.97;
        p.userData.vy *= 0.97;
        p.userData.vz *= 0.97;

        p.userData.life -= 0.015;
        p.material.opacity = p.userData.life;
        p.scale.multiplyScalar(p.userData.decay);

        if (p.userData.life <= 0) {
            scene.remove(p);
            explosionParticles.splice(i, 1);
        }
    }
}

// ======= SITEWIDE BLUEPRINT BACKGROUND CANVAS =======
let blueprintCanvas = null;
let blueprintCtx = null;
let blueprintAnimFrame = null;

function initBlueprintCanvas() {
    blueprintCanvas = document.getElementById('three-canvas');
    if (!blueprintCanvas) return;

    blueprintCtx = blueprintCanvas.getContext('2d');
    
    function resizeBlueprintCanvas() {
        if (!blueprintCanvas || !blueprintCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        blueprintCanvas.width = window.innerWidth * dpr;
        blueprintCanvas.height = window.innerHeight * dpr;
        blueprintCanvas.style.width = window.innerWidth + 'px';
        blueprintCanvas.style.height = window.innerHeight + 'px';
        blueprintCtx.scale(dpr, dpr);
    }
    
    window.removeEventListener('resize', resizeBlueprintCanvas);
    window.addEventListener('resize', resizeBlueprintCanvas);
    resizeBlueprintCanvas();

    function renderBlueprint(time) {
        if (!blueprintCtx || !blueprintCanvas) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const scrollY = window.scrollY || 0;

        // Clear background to ultra-dark midnight black
        blueprintCtx.fillStyle = '#050505';
        blueprintCtx.fillRect(0, 0, width, height);

        // 1. Soft Neon Green Ambient Glows behind conversion zones
        const t = (time || 0) * 0.001;
        const pulse1 = Math.sin(t * 0.8) * 0.015 + 0.045;
        const pulse2 = Math.cos(t * 0.6) * 0.015 + 0.04;

        // Glow 1: Hero / Brand Zone (Center)
        let g1 = blueprintCtx.createRadialGradient(width * 0.5, height * 0.35, 10, width * 0.5, height * 0.35, width * 0.45);
        g1.addColorStop(0, `rgba(166, 255, 0, ${pulse1})`);
        g1.addColorStop(1, 'rgba(166, 255, 0, 0)');
        blueprintCtx.fillStyle = g1;
        blueprintCtx.fillRect(0, 0, width, height);

        // Glow 2: Section Accent (Bottom Right)
        let g2 = blueprintCtx.createRadialGradient(width * 0.8, height * 0.75, 10, width * 0.8, height * 0.75, width * 0.5);
        g2.addColorStop(0, `rgba(166, 255, 0, ${pulse2})`);
        g2.addColorStop(1, 'rgba(166, 255, 0, 0)');
        blueprintCtx.fillStyle = g2;
        blueprintCtx.fillRect(0, 0, width, height);

        // 2. Blueprint Grid Lines
        const majorGrid = 60;
        const minorGrid = 15;
        const offsetY = (scrollY * 0.08) % majorGrid;

        // Minor grid lines (ultra faint)
        blueprintCtx.strokeStyle = 'rgba(255, 255, 255, 0.018)';
        blueprintCtx.lineWidth = 0.5;
        blueprintCtx.beginPath();

        for (let x = 0; x < width; x += minorGrid) {
            blueprintCtx.moveTo(x, 0);
            blueprintCtx.lineTo(x, height);
        }
        for (let y = -offsetY; y < height; y += minorGrid) {
            blueprintCtx.moveTo(0, y);
            blueprintCtx.lineTo(width, y);
        }
        blueprintCtx.stroke();

        // Major grid lines (structural blueprint lines)
        blueprintCtx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
        blueprintCtx.lineWidth = 1.0;
        blueprintCtx.beginPath();

        for (let x = 0; x < width; x += majorGrid) {
            blueprintCtx.moveTo(x, 0);
            blueprintCtx.lineTo(x, height);
        }
        for (let y = -offsetY; y < height; y += majorGrid) {
            blueprintCtx.moveTo(0, y);
            blueprintCtx.lineTo(width, y);
        }
        blueprintCtx.stroke();

        // Major Node Crosshairs (+)
        blueprintCtx.strokeStyle = 'rgba(166, 255, 0, 0.25)';
        blueprintCtx.lineWidth = 1.2;
        blueprintCtx.beginPath();
        const arm = 3;

        for (let x = majorGrid; x < width; x += majorGrid * 2) {
            for (let y = majorGrid - offsetY; y < height; y += majorGrid * 2) {
                blueprintCtx.moveTo(x - arm, y);
                blueprintCtx.lineTo(x + arm, y);
                blueprintCtx.moveTo(x, y - arm);
                blueprintCtx.lineTo(x, y + arm);
            }
        }
        blueprintCtx.stroke();

        blueprintAnimFrame = requestAnimationFrame(renderBlueprint);
    }

    if (blueprintAnimFrame) cancelAnimationFrame(blueprintAnimFrame);
    blueprintAnimFrame = requestAnimationFrame(renderBlueprint);
}

// ======= NEW BLUEPRINT INTRO SEQUENCE =======
function initIntro() {
    const loader = document.getElementById('loader');
    const introCta = document.getElementById('introCta');
    const introLogo = document.getElementById('introLogo');
    const statusText = document.getElementById('blueprintStatusText');

    // Initialize Blueprint background canvas across page
    initBlueprintCanvas();

    if (!loader) {
        document.body.style.overflow = '';
        if (lenis) lenis.start();
        initGSAPAnimations();
        return;
    }

    // Lock body scroll for intro
    document.body.style.overflow = 'hidden';

    if (introLogo) {
        introLogo.innerHTML = `
            <span class="intro-m">M</span><span class="logo-one">1</span><span class="intro-creative">CREATIVE.</span>
        `;
        const m = introLogo.querySelector('.intro-m');
        const one = introLogo.querySelector('.logo-one');
        const creative = introLogo.querySelector('.intro-creative');

        if (m) {
            m.style.opacity = '0';
            m.style.transform = 'translateY(15px) scale(0.9)';
            m.style.display = 'inline-block';
            m.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        if (one) {
            one.style.opacity = '0';
            one.style.transform = 'translateY(15px) scale(0.9)';
            one.style.display = 'inline-block';
            one.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        if (creative) {
            creative.style.opacity = '0';
            creative.style.transform = 'translateY(15px) scale(0.9)';
            creative.style.display = 'inline-block';
            creative.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        if (introCta) introCta.classList.add('show');

        // Step 1: M1 structure resolves white
        setTimeout(() => {
            if (statusText) statusText.textContent = 'BUILDING STRUCTURE...';
            if (m) { m.style.opacity = '1'; m.style.transform = 'translateY(0) scale(1)'; }
            if (one) { one.style.opacity = '1'; one.style.transform = 'translateY(0) scale(1)'; }
        }, 150);

        // Step 2: CREATIVE compiles in neon green
        setTimeout(() => {
            if (statusText) statusText.textContent = 'COMPILING DESIGN SYSTEM...';
            if (creative) { creative.style.opacity = '1'; creative.style.transform = 'translateY(0) scale(1)'; }
        }, 500);

        // Step 3: Terminal scanline sweep
        setTimeout(() => {
            if (statusText) statusText.textContent = 'BUILT WITH PRECISION';
            const scanline = document.querySelector('.blueprint-scanline');
            if (scanline) scanline.classList.add('active');
        }, 900);

        // Step 4: Dissolve intro and reveal Hero section
        setTimeout(() => {
            loader.classList.add('exit');
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            initGSAPAnimations();
        }, 1500);

    } else {
        setTimeout(() => {
            loader.classList.add('exit');
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            initGSAPAnimations();
        }, 1200);
    }
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

// ======= FORM HANDLING =======
function initForm() {
    const form = document.getElementById('contact-form');
    const successEl = document.getElementById('formSuccess');
    if (!form) return;

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
            inputs.forEach(input => {
                const group = input.closest('.form-group');
                if (group) group.classList.remove('is-valid', 'is-invalid');
            });
        }, 4000);
    });
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

            const setupNumber = Number(setup);
            const dueToday = setupNumber / 2;

            // Update modal content
            const badge = document.getElementById('checkoutBadge');
            badge.textContent = pkg.toUpperCase();
            badge.setAttribute('data-tier', tier);

            document.getElementById('checkoutPackageName').textContent = packageNames[pkg] || pkg;
            document.getElementById('checkoutSetup').textContent = `R${setupNumber.toLocaleString()} (50% upfront: R${dueToday.toLocaleString()})`;
            document.getElementById('checkoutMonthly').textContent = `R${Number(monthly).toLocaleString()}/mo`;
            document.getElementById('checkoutTotal').textContent = `R${dueToday.toLocaleString()}`;

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

    // Clear CSS transitions on these elements so GSAP animates them smoothly without clashing
    gsap.set('.service-card, .work-item, .pricing-card, .stat-card, .process-step', { transition: 'none' });

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

    // ── Unified Section Headers Reveal (Sleek slide up & scale) ──
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
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
                trigger: '.about-left',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 1.0,
            stagger: 0.15,
            ease: 'power3.out'
        }
    );

    // Staggered About stat cards (flips flat from side)
    gsap.fromTo('.stat-card',
        { opacity: 0, x: 60, rotationY: -15 },
        {
            scrollTrigger: {
                trigger: '.about-right',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            x: 0,
            rotationY: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power4.out'
        }
    );

    // Staggered Service cards (3D rotationX + scale)
    gsap.fromTo('.service-card',
        { opacity: 0, y: 90, rotationX: -12, scale: 0.93 },
        {
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power4.out',
            transformOrigin: 'top center'
        }
    );

    // Staggered Work showcase items
    gsap.fromTo('.work-item',
        { opacity: 0, y: 100, scale: 0.95 },
        {
            scrollTrigger: {
                trigger: '.work-showcase',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.12,
            ease: 'power3.out'
        }
    );

    // Staggered Pricing cards
    gsap.fromTo('.pricing-card',
        { opacity: 0, y: 90, rotationY: 10, scale: 0.95 },
        {
            scrollTrigger: {
                trigger: '.pricing-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            rotationY: 0,
            scale: 1,
            duration: 1.2,
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
                toggleActions: 'play none none reverse'
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
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out'
        }
    );

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
    const cards = document.querySelectorAll('.service-card, .work-item, .pricing-card, .stat-card');
    
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
            
            if (item._fadeTimeout) {
                clearTimeout(item._fadeTimeout);
            }

            const isMatching = (filter === 'all' || niche === filter);
            
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
        veloura: {
            title: "VELOURA — Beauty Lounge (Concept Build)",
            category: "Beauty & Wellness · CONCEPT BUILD",
            problem: "Concept Challenge: Demonstrates how a luxury beauty & spa lounge can elevate online conversions. Addresses typical industry friction like slow load times, generic templates, and clunky mobile menu navigation.",
            solution: "What This Concept Demonstrates: We designed and engineered an elegant dark-mauve landing page centered around custom typography, responsive galleries, and seamless page loading. Features a bespoke curtain slide-up entrance preloader.",
            features: [
                "Luxury visual design system (mauve HSL tokens)",
                "Bespoke curtain slide-up entrance preloader",
                "Custom service menu filters with instant transition styling",
                "Fully responsive, touch-first booking layout"
            ],
            tech: "HTML5, CSS Custom Variables, Modern ES6 JS, Intersection Observer API",
            url: "clients/veloura-beauty-lounge/index.html"
        },
        apex: {
            title: "Apex Legal — Corporate Law (Concept Build)",
            category: "Legal & Corporate · CONCEPT BUILD",
            problem: "Concept Challenge: Demonstrates how high-end corporate law firms can establish immediate digital authority. Overcomes common legal website drawbacks like intimidating clutter and confusing navigation hierarchies.",
            solution: "What This Concept Demonstrates: We engineered a commanding, sophisticated digital home in gold and navy. Features an interactive vector gold crest preloader, streamlined consultation booking flows, and an accessible FAQ panel.",
            features: [
                "Self-drawing gold vector emblem preloader",
                "Responsive lawyer profiles with interactive tilt effects",
                "Fully accessible client FAQ accordion panel system",
                "Consultation request forms with direct validation feedback"
            ],
            tech: "HTML5, CSS Flexbox & Grid, ES6 JS, SVG Path Animations",
            url: "clients/apex-legal/index.html"
        },
        luna: {
            title: "Luna Bistro — Fine Dining (Concept Build)",
            category: "Food & Dining · CONCEPT BUILD",
            problem: "Concept Challenge: Demonstrates how fine-dining establishments can convert online website visitors into table reservations. Solves common mobile menu crashes and disjointed branding.",
            solution: "What This Concept Demonstrates: We built a theatrical split-curtain preloader featuring a self-drawing gold crescent moon. Includes tabbed menu filters, high-resolution interior galleries, and custom table reservation workflows.",
            features: [
                "Theatrical top/bottom curtain panels with SVG moon drawing preloader",
                "Deduplicated tabbed category filters for both menus and photo galleries",
                "Fluid full-screen lightbox modal for culinary exploration",
                "Automated reservation forms with custom success animations"
            ],
            tech: "HTML5, Vanilla CSS, Vanilla ES6 JS, SVG Animations, Leaflet Map integration",
            url: "clients/luna-bistro/index.html"
        },
        stellar: {
            title: "Stellar Flight — Space Dashboard (Concept Build)",
            category: "Technology · CONCEPT BUILD",
            problem: "Concept Challenge: Demonstrates how futuristic tech concepts and space travel platforms can create intense visual engagement without sacrificing performance or usability.",
            solution: "What This Concept Demonstrates: We designed a futuristic space travel dashboard featuring an interactive WebGL space particle field, scroll-tied telemetry panels, glassmorphic cards, and orbital flight booking forms.",
            features: [
                "Dynamic WebGL Three.js space particle simulation",
                "Futuristic glassmorphic panels displaying orbital telemetry",
                "Neon glow design token styling with sci-fi layouts",
                "Orbit simulation loader paths and interactive forms"
            ],
            tech: "HTML5, CSS Grid, Three.js WebGL, ES6 JS, GSAP Animations",
            url: "clients/stellar-flight/index.html"
        },
        prisma: {
            title: "Prisma — Cinematic Studio (Concept Build)",
            category: "Film & Creative · CONCEPT BUILD",
            problem: "Concept Challenge: Demonstrates a digital portfolio canvas for avant-garde film directors and creative production studios that highlights video work without visual distraction.",
            solution: "What This Concept Demonstrates: We created a minimalist, high-contrast creative studio centered on a rotating WebGL 3D glass prism. Built fluid scroll-tied animation triggers and fullscreen video lightboxes.",
            features: [
                "Custom 3D WebGL rotating glass prism lens rendering",
                "High-contrast, brutalist design token typography",
                "Seamless fullscreen HTML5 video lightbox overlay",
                "Fluid page transitions with scroll-tied reveal triggers"
            ],
            tech: "HTML5, Custom CSS, WebGL, Three.js, ES6 JS, Parallax layouts",
            url: "clients/warm-clean-visions/index.html"
        },
        nhm: {
            title: "Bone x Epoch — Natural History Museum (Concept Build)",
            category: "Culture & Heritage · CONCEPT BUILD",
            problem: "Concept Challenge: Demonstrates how national museums and cultural institutions can modernize their web presence to drive international and local exhibition ticket sales.",
            solution: "What This Concept Demonstrates: We engineered a deep dark-velvet and gold museum portal featuring a self-drawing crest preloader, 3D digital artifact vaults, interactive exhibit filters, and online ticket booking UI.",
            features: [
                "Deep obsidian & gold heritage aesthetic design system",
                "Self-drawing SVG museum crest entrance preloader",
                "3D digital vault archive with high-resolution artifact scans",
                "Online ZAR ticket reservation portal for Cape Town visitors"
            ],
            tech: "HTML5, CSS Custom Variables, Vanilla ES6 JS, SVG Path Animations",
            url: "clients/nhm-museum/index.html"
        }
    };
    
    document.querySelectorAll('.work-item').forEach(item => {
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

// ======= INIT =======
document.addEventListener('DOMContentLoaded', () => {
    // Init UI interactions immediately (they don't need Three.js)
    initNavigation();
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

    // Lock scroll immediately for intro
    lenis.stop();

    // Start intro — Three.js scene + GSAP both start inside initIntro
    initIntro();

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);
});
