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

// ======= ROCKET CRASH SEQUENCE =======
function createRocket() {
    const group = new THREE.Group();

    // Body (sleek metal cylinder)
    const bodyGeo = new THREE.CylinderGeometry(2, 2, 12, 12);
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
    const noseGeo = new THREE.ConeGeometry(2, 5, 12);
    const noseMat = new THREE.MeshStandardMaterial({
        color: 0xff3300,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x551100
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = 8.5;
    nose.rotation.x = Math.PI / 2;
    group.add(nose);

    // Fins (3 sleek metallic wings)
    const finGeo = new THREE.BoxGeometry(0.5, 3, 4);
    const finMat = new THREE.MeshStandardMaterial({
        color: 0xff3300,
        metalness: 0.8,
        roughness: 0.2
    });
    for (let i = 0; i < 3; i++) {
        const fin = new THREE.Mesh(finGeo, finMat);
        const angle = (i / 3) * Math.PI * 2;
        fin.position.x = Math.cos(angle) * 2;
        fin.position.y = Math.sin(angle) * 2;
        fin.position.z = -4;
        fin.rotation.z = angle;
        group.add(fin);
    }

    // Flame exhaust cone
    const flameGeo = new THREE.ConeGeometry(1.2, 6, 12);
    const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.name = 'flame';
    flame.position.z = -9;
    flame.rotation.x = -Math.PI / 2;
    group.add(flame);

    return group;
}

function spawnTrailParticle(pos, offset) {
    const geom = new THREE.SphereGeometry(1.0, 6, 6);
    const colors = [0xff8800, 0xff3300, 0x555555];
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
    const startPos = new THREE.Vector3(380, 220, 250);
    const endPos = new THREE.Vector3(0, 0, -150);
    // Control point to create a beautiful sweeping arc
    const controlPos = new THREE.Vector3(200, -80, 50);

    const rocket = createRocket();
    scene.add(rocket);
    rocket.position.copy(startPos);

    const pathObj = { progress: 0 };
    gsap.to(pathObj, {
        progress: 1,
        duration: 2.4,
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

            // Spawn trail particles at the exhaust tip
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(rocket.quaternion);
            spawnTrailParticle(currentPos, forward.multiplyScalar(9));
        },
        onComplete: () => {
            triggerImpact(rocket);
        }
    });
}

function triggerImpact(rocket) {
    scene.remove(rocket);

    // Camera shake intensity spike
    shakeIntensity = 38;

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

    // 2. Spawn explosion debris particles
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
    // Update rocket trails
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;
        p.userData.life -= 0.04;
        p.material.opacity = p.userData.life;
        p.scale.multiplyScalar(0.95);
        if (p.userData.life <= 0) {
            scene.remove(p);
            trailParticles.splice(i, 1);
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

// ======= SCROLL-DRIVEN SPACE INTRO =======
let introPhase = 'loading'; // 'loading' | 'active' | 'warping' | 'done'
let introCameraZ = 650;         // starts at a realistic distance from Earth
let introCameraTargetZ = 650;   // smoothly lerped
let introScrollTotal = 0;       // cumulative scroll delta
const INTRO_SCROLL_MAX = 4000;  // pixels of scroll to complete journey
const INTRO_Z_START   = 650;    // realistic distance view of Earth
const INTRO_Z_END     = 1900;   // far out in space
let introEarth = null;          // the dedicated Earth sphere

function initIntro() {
    const loader          = document.getElementById('loader');
    const introCta        = document.getElementById('introCta');
    const introScrollHint = document.getElementById('introScrollHint');


    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // ── Build scene ──
    initThreeJS();
    createSecondPlanet(); // Creates the ringed ice planet (will be far back during intro)

    // Dedicated white sun light to illuminate Earth realistically with shading/highlights
    introSunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    introSunLight.position.set(400, 300, 600);
    scene.add(introSunLight);

    // Position canvas absolutely inside loader
    const cvs = document.getElementById('three-canvas');
    cvs.style.position = 'absolute';
    cvs.style.top = '0';
    cvs.style.left = '0';

    // ── Create Earth at origin, camera starts close ──
    introEarth = createEarth();
    introEarth.position.set(0, 0, -150);
    scene.add(introEarth);

    // Reposition background planets so they're revealed as camera pulls back
    if (planet) {
        planet.position.set(-700, -200, -2200);
    }
    if (planet2) {
        planet2.position.set(800, 150, -2800);
    }

    // Camera starts at realistic distance from Earth
    camera.position.set(0, 20, INTRO_Z_START);
    camera.lookAt(0, 0, 0);
    introCameraZ = INTRO_Z_START;
    introCameraTargetZ = INTRO_Z_START;

    // Start render loop
    animate();

    // ── UI reveal sequence ──
    // Center logo and CTA reveal smoothly
    setTimeout(() => {
        introCta.classList.add('show');
    }, 800);
    
    // Launch rocket after logo fades in
    setTimeout(() => {
        launchRocket();
    }, 1200);

    // Release scroll block and show scroll instructions AFTER the crash
    setTimeout(() => {
        introScrollHint.classList.add('show');
        introPhase = 'active';
    }, 4200);


    // ── Scroll-driven camera ──
    let lastTouchY = 0;
    let warpTriggered = false;

    function onIntroWheel(e) {
        if (introPhase !== 'active') return;
        e.preventDefault();

        // Normalise different scroll device speeds
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 30;  // Firefox line mode
        if (e.deltaMode === 2) delta *= 300; // page mode

        advanceIntro(delta);
    }

    function onIntroTouchStart(e) {
        lastTouchY = e.touches[0].clientY;
    }
    function onIntroTouchMove(e) {
        if (introPhase !== 'active') return;
        e.preventDefault();
        const delta = (lastTouchY - e.touches[0].clientY) * 2.5;
        lastTouchY = e.touches[0].clientY;
        advanceIntro(delta);
    }

    function advanceIntro(delta) {
        if (delta <= 0) return; // only scroll down moves camera back
        introScrollTotal = Math.min(introScrollTotal + delta, INTRO_SCROLL_MAX);

        const progress = introScrollTotal / INTRO_SCROLL_MAX;

        // Map progress → camera Z with easing for a natural pull-back feel
        const eased = 1 - Math.pow(1 - progress, 1.6);
        introCameraTargetZ = INTRO_Z_START + eased * (INTRO_Z_END - INTRO_Z_START);

        // Dynamically fade out the centered logo and hint as we scroll
        introCta.style.opacity = Math.max(0, 1 - progress * 2.5);
        introCta.style.transform = `translate(-50%, calc(-50% - ${progress * 100}px))`;

        // Seamlessly dissolve the black loader background during the last 30% of the scroll
        if (progress > 0.7) {
            const fadeProgress = (progress - 0.7) / 0.3; // 0 to 1
            loader.style.opacity = Math.max(0, 1 - fadeProgress);
        } else {
            loader.style.opacity = '1';
        }

        // At 100% scroll: transition directly to main website (no warp, no flash)
        if (progress >= 1.0 && !warpTriggered) {
            warpTriggered = true;
            introPhase = 'done';
            window.removeEventListener('wheel', onIntroWheel);
            window.removeEventListener('touchstart', onIntroTouchStart);
            window.removeEventListener('touchmove', onIntroTouchMove);
            finishIntro();
        }
    }

    window.addEventListener('wheel', onIntroWheel, { passive: false });
    window.addEventListener('touchstart', onIntroTouchStart, { passive: false });
    window.addEventListener('touchmove', onIntroTouchMove, { passive: false });

    // ── Finish: reveal site ──
    function finishIntro() {
        introPhase = 'done';

        // Remove Earth and sun light from scene (intro-only)
        if (introEarth) {
            scene.remove(introEarth);
            introEarth = null;
        }
        if (introSunLight) {
            scene.remove(introSunLight);
            introSunLight = null;
        }

        // Restore background planet positions for the site
        if (planet) planet.position.set(350, -100, -400);
        if (planet2) planet2.position.set(300, 80, -900);

        // Move canvas to body as persistent background
        const canvas = document.getElementById('three-canvas');
        canvas.style.position = '';
        canvas.style.top = '';
        canvas.style.left = '';
        document.body.insertBefore(canvas, document.body.firstChild);

        // Instantly hide the loader since it is already faded out
        loader.style.display = 'none';

        // Start GSAP animations immediately for a seamless blend
        initGSAPAnimations();

        // Unlock scroll
        document.body.style.overflow = '';
        if (lenis) lenis.start();


        // Seamless camera starting position — it will smoothly slide/lerp to homepage Z in animate()
        introCameraZ = INTRO_Z_END;
        camera.position.z = INTRO_Z_END;
        if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ── Earth sphere (intro-only) ──
function createEarth() {
    const group = new THREE.Group();

    // Draw Earth texture on canvas
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');

    // Deep blue ocean base
    const ocean = ctx.createLinearGradient(0, 0, size, size / 2);
    ocean.addColorStop(0,   '#0a1f3c');
    ocean.addColorStop(0.3, '#0d2a50');
    ocean.addColorStop(0.6, '#0a1f3c');
    ocean.addColorStop(1,   '#071525');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, size, size / 2);

    // Continents — rough patches
    ctx.globalAlpha = 1;
    const continents = [
        { x: 120, y: 80,  w: 160, h: 90,  color: '#2d6a2f' },  // Americas top
        { x: 100, y: 155, w: 90,  h: 100, color: '#3a7a2a' },  // S. America
        { x: 340, y: 60,  w: 100, h: 80,  color: '#4a7a30' },  // Europe
        { x: 370, y: 120, w: 180, h: 140, color: '#3d6e28' },  // Africa
        { x: 480, y: 50,  w: 200, h: 100, color: '#5c7a35' },  // Asia
        { x: 580, y: 140, w: 100, h: 70,  color: '#6b8c3e' },  // SE Asia
        { x: 660, y: 200, w: 100, h: 80,  color: '#4a7a30' },  // Australia
        { x: 200, y: 60,  w: 60,  h: 40,  color: '#c8a86c' },  // desert patch
        { x: 440, y: 90,  w: 40,  h: 60,  color: '#c8b46c' },  // Middle East
    ];
    continents.forEach(cont => {
        ctx.fillStyle = cont.color;
        ctx.beginPath();
        ctx.ellipse(cont.x, cont.y, cont.w / 2, cont.h / 2, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Slight variation blob
        ctx.fillStyle = cont.color + 'cc';
        ctx.beginPath();
        ctx.ellipse(cont.x + 20, cont.y + 15, cont.w / 3, cont.h / 3, 0.8, 0, Math.PI * 2);
        ctx.fill();
    });

    // Snow caps
    const topCap = ctx.createLinearGradient(0, 0, 0, 40);
    topCap.addColorStop(0, 'rgba(230,245,255,0.85)');
    topCap.addColorStop(1, 'rgba(230,245,255,0)');
    ctx.fillStyle = topCap;
    ctx.fillRect(0, 0, size, 40);
    const botCap = ctx.createLinearGradient(0, size / 2 - 38, 0, size / 2);
    botCap.addColorStop(0, 'rgba(230,245,255,0)');
    botCap.addColorStop(1, 'rgba(230,245,255,0.9)');
    ctx.fillStyle = botCap;
    ctx.fillRect(0, size / 2 - 38, size, 38);

    // Cloud streaks
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 22; i++) {
        const cy = 20 + Math.random() * (size / 2 - 40);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.ellipse(Math.random() * size, cy, 60 + Math.random() * 120, 4 + Math.random() * 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(c);
    const earthGeo = new THREE.SphereGeometry(200, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.75,
        metalness: 0.05,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    group.add(earthMesh);

    // Atmosphere glow (blue rim)
    const atmosGeo = new THREE.SphereGeometry(212, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
        color: 0x3a9bdc,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    group.add(new THREE.Mesh(atmosGeo, atmosMat));

    // Outer glow halo
    const haloGeo = new THREE.SphereGeometry(230, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0x1a6bdc,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    group.add(new THREE.Mesh(haloGeo, haloMat));

    return group;
}

// ── Second planet for intro depth ──
let planet2;
function createSecondPlanet() {
    planet2 = new THREE.Group();

    // Icy blue-white planet
    const geo = new THREE.SphereGeometry(80, 48, 48);
    const canv = document.createElement('canvas');
    canv.width = 512; canv.height = 256;
    const pCtx = canv.getContext('2d');

    // Base: icy blue
    const bg = pCtx.createLinearGradient(0, 0, 512, 256);
    bg.addColorStop(0, '#0d1a2e');
    bg.addColorStop(0.4, '#1a3550');
    bg.addColorStop(0.7, '#0f2a42');
    bg.addColorStop(1, '#0a1520');
    pCtx.fillStyle = bg;
    pCtx.fillRect(0, 0, 512, 256);

    // Ice bands
    for (let i = 0; i < 18; i++) {
        const y = Math.random() * 256;
        pCtx.fillStyle = `rgba(${140 + Math.random() * 80}, ${200 + Math.random() * 40}, 255, ${Math.random() * 0.3 + 0.05})`;
        pCtx.fillRect(0, y, 512, Math.random() * 14 + 3);
    }
    // Polar ice caps
    const capGrad = pCtx.createLinearGradient(0, 0, 0, 50);
    capGrad.addColorStop(0, 'rgba(220,240,255,0.7)');
    capGrad.addColorStop(1, 'rgba(220,240,255,0)');
    pCtx.fillStyle = capGrad;
    pCtx.fillRect(0, 0, 512, 50);
    const capGrad2 = pCtx.createLinearGradient(0, 206, 0, 256);
    capGrad2.addColorStop(0, 'rgba(220,240,255,0)');
    capGrad2.addColorStop(1, 'rgba(220,240,255,0.6)');
    pCtx.fillStyle = capGrad2;
    pCtx.fillRect(0, 206, 512, 50);

    const tex = new THREE.CanvasTexture(canv);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    planet2.add(mesh);

    // Rings around it
    const ringGeo = new THREE.RingGeometry(100, 160, 64);
    // Fix ring UVs
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        uv.setXY(i, v3.length() < 130 ? 0 : 1, 1);
    }
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xa0d4ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.4;
    planet2.add(ringMesh);

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(86, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
        color: 0xa0d4ff,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide
    });
    planet2.add(new THREE.Mesh(atmosGeo, atmosMat));

    planet2.position.set(300, 80, -900);
    scene.add(planet2);
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
        alpha: false
    });
    renderer.setClearColor(0x000000, 1);
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

    // Update rocket trails and explosion particles
    updateTrailAndExplosion();

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
        if (introPhase === 'done') {
            planet.position.y = -100 + Math.sin(time * 0.3) * 20;
        } else {
            planet.position.y = -60 + Math.sin(time * 0.25) * 15;
        }
    }

    // Second intro planet
    if (planet2) {
        planet2.children[0].rotation.y += 0.0007;
        planet2.children[0].rotation.x += 0.0002;
        planet2.position.y = 80 + Math.sin(time * 0.2) * 12;
        if (planet2.children[1]) {
            planet2.children[1].rotation.z += 0.0004; // ring drift
        }
    }
    
    // Earth slow rotation during intro
    if (introEarth) {
        if (introEarth.children[0]) {
            introEarth.children[0].rotation.y += 0.0005; // Earth turns slowly
        }
        // Rotate clouds layer slightly faster for realistic atmospheric drift
        const clouds = introEarth.children.find(c => c.userData.isClouds);
        if (clouds) {
            clouds.rotation.y += 0.0007;
        }
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

    // ── Camera control ──
    if (introPhase === 'done') {
        // After intro: normal mouse parallax + scroll-based zoom
        camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.02;
        const targetZ = 800 - scrollProgress * 600;
        camera.position.z += (targetZ - camera.position.z) * 0.03;
    } else if (introPhase === 'warping') {
        // Warp: snap directly to target (no lag)
        introCameraZ = introCameraTargetZ;
        camera.position.z = introCameraZ;
        camera.position.x *= 0.92; // straighten out
        camera.position.y *= 0.92;
    } else {
        // Intro active/loading: smooth lerp toward scroll-set target
        introCameraZ += (introCameraTargetZ - introCameraZ) * 0.06;
        camera.position.z = introCameraZ;
        // Very subtle horizontal drift (keep Earth centered)
        camera.position.x += (Math.sin(time * 0.05) * 5 - camera.position.x) * 0.008;
        camera.position.y += (Math.cos(time * 0.04) * 3 + 20 - camera.position.y) * 0.008;
    }

    // Apply camera shake if active
    if (shakeIntensity > 0.05) {
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= shakeDecay;
    }

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

    // Smooth scroll for anchor links using Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                if (lenis) {
                    lenis.scrollTo(target, { offset: 0, duration: 1.2 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const packageNames = {
        Bronze: 'Starter Presence',
        Silver: 'Growth Package',
        Gold: 'Premium Authority'
    };

    // Open checkout from pricing CTA buttons
    document.querySelectorAll('.pricing-cta').forEach(btn => {
        btn.addEventListener('click', () => {
            const pkg = btn.dataset.package;

            const fullPackageName = `${pkg} ${packageNames[pkg]}`;
            const message = `Hi M1Creative, I’m interested in your ${fullPackageName} for my business. Please send me the next steps to get started in 2-5 days!`;
            window.open(`https://wa.me/27828722365?text=${encodeURIComponent(message)}`, '_blank');
            return;

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
        { opacity: 0, y: 40 },
        {
            scrollTrigger: {
                trigger: '.about-description',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 1.0,
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
    const ctas = document.querySelectorAll('.hero-btn');
    ctas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                if (lenis) {
                    lenis.scrollTo(target, { offset: 0, duration: 1.2 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
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

// ======= REVIEWS INFINITE SCROLL =======
function initReviews() {
    const track = document.querySelector('.reviews-track');
    if (!track) return;

    // Clone all review cards to create a seamless loop
    const cards = track.querySelectorAll('.review-card');
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
}

// ======= PORTFOLIO FILTERS =======
function initPortfolioFilters() {
    const pills = document.querySelectorAll('.niche-pill');
    const items = document.querySelectorAll('.work-item');
    if (!pills.length || !items.length) return;

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.getAttribute('data-filter');

            items.forEach(item => {
                const niche = item.getAttribute('data-niche');
                
                if (item._fadeTimeout) {
                    clearTimeout(item._fadeTimeout);
                }
                
                if (filter === 'all' || niche === filter) {
                    item.style.display = '';
                    // Force reflow
                    item.offsetHeight;
                    item.style.opacity = '';
                    item.style.transform = '';
                    item.classList.add('visible');
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(30px) scale(0.95)';
                    item._fadeTimeout = setTimeout(() => {
                        item.style.display = 'none';
                    }, 400);
                }
            });
        });
    });
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
            title: "VELOURA — Beauty Lounge",
            category: "Beauty & Wellness",
            problem: "Veloura struggled to attract high-end, premium salon bookings online. Their previous website was slow, felt generic, and lacked the visual refinement required to appeal to luxury spa customers looking for an elite wellness experience.",
            solution: "We designed and engineered an elegant dark-mauve landing page centered around custom typography, responsive galleries, and seamless page loading. An upscale vertical-slide preloader was created to mirror the calming transition from a busy day to a luxury spa treatment.",
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
            title: "Apex Legal — Corporate Law",
            category: "Legal & Corporate",
            problem: "Corporate law firms often feel impersonal, hard to navigate, and intimidating to prospective clients. Apex faced low conversion rates on consultations due to cluttered site design, a lack of clear navigation hierarchies, and generic branding.",
            solution: "We engineered a commanding, sophisticated digital home in gold and navy. An interactive preloader draws a precise vector gold crest on startup to build instant authority. Navigation was streamlined to guide clients directly to booking a consultation, paired with a custom FAQ accordion.",
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
            title: "Luna Bistro — Fine Dining",
            category: "Food & Dining",
            problem: "Luna Bistro needed to showcase their atmosphere and premium dishes to convert digital visitors into table reservations. Their previous mobile layout crashed when viewing menus, and a lack of unified branding led to high customer drop-offs.",
            solution: "We built a theatrical split-curtain preloader featuring a self-drawing gold crescent moon and stars. Created fully responsive tabbed gallery and menu filtering systems to explore dishes and interiors, integrated Google Maps, and built a custom table booking form validation pipeline.",
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
            title: "Stellar Flight — Space Dashboard",
            category: "Technology",
            problem: "Space travel concepts require building intense visual excitement and showing engineering excellence. Standard corporate website templates fail to convey the scale, high performance, and awe of future cosmic tourism.",
            solution: "We designed a futuristic space booking dashboard. Implemented a fully interactive WebGL space field that shifts and revolves dynamically based on the visitor's scroll, paired with glassmorphic cards, telemetry dashboards, and neon borders.",
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
            title: "Prisma — Cinematic Studio",
            category: "Film & Creative",
            problem: "Avant-garde filmmakers need a digital canvas that reflects their creative authority without distracting from their videos. A standard grid template felt too plain and failed to capture their artistic voice.",
            solution: "We created a minimalist, high-contrast creative studio centered on a rotating WebGL 3D glass prism. Built fluid scroll-tied animation triggers, fullscreen video lightboxes, and a sleek layout showing their award-winning documentaries.",
            features: [
                "Custom 3D WebGL rotating glass prism lens rendering",
                "High-contrast, brutalist design token typography",
                "Seamless fullscreen HTML5 video lightbox overlay",
                "Fluid page transitions with scroll-tied reveal triggers"
            ],
            tech: "HTML5, Custom CSS, WebGL, Three.js, ES6 JS, Parallax layouts",
            url: "clients/warm-clean-visions/index.html"
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
