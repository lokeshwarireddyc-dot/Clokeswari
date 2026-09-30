/**
 * Chivakala Lokeswari - 3D Interactive Portfolio
 * Features: Three.js particle constellation, interactive 3D cards,
 * dynamic typing, scroll spy, smooth reveals, live project demos, and mobile navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThreeJS();
  initTypingEffect();
  initNavbar();
  initCardTilt();
  initSkillBars();
  initScrollAnimations();
  initContactForm();
  initProjectCardFlip();
  initLiveDemoModals();
});

/* =====================================================
   1. THREE.JS 3D BACKGROUND
   ===================================================== */
function initThreeJS() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 80;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle System
  const particleCount = window.innerWidth < 768 ? 90 : 180;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const velocities = [];

  const colorPalette = [
    new THREE.Color(0x8b5cf6), // Purple
    new THREE.Color(0x3b82f6), // Blue
    new THREE.Color(0x06b6d4), // Cyan
    new THREE.Color(0xec4899)  // Pink
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 160;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 160;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;

    velocities.push({
      x: (Math.random() - 0.5) * 0.08,
      y: (Math.random() - 0.5) * 0.08,
      z: (Math.random() - 0.5) * 0.05
    });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Circular glow texture for particles
  const canvasTexture = document.createElement('canvas');
  canvasTexture.width = 64;
  canvasTexture.height = 64;
  const ctx = canvasTexture.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(167,139,250,0.8)');
  gradient.addColorStop(0.8, 'rgba(59,130,246,0.2)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const particleMap = new THREE.CanvasTexture(canvasTexture);

  const particleMaterial = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    map: particleMap,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleMesh);

  // Floating 3D Geometric Meshes
  const floatingObjects = [];
  const geometries = [
    new THREE.IcosahedronGeometry(6, 1),
    new THREE.TorusGeometry(5, 1.5, 12, 24),
    new THREE.OctahedronGeometry(5, 0)
  ];

  geometries.forEach((geo, index) => {
    const wireMat = new THREE.MeshBasicMaterial({
      color: index === 0 ? 0x8b5cf6 : index === 1 ? 0x3b82f6 : 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const mesh = new THREE.Mesh(geo, wireMat);
    mesh.position.set(
      (index - 1) * 45,
      (Math.random() - 0.5) * 40,
      -20 + index * 10
    );
    scene.add(mesh);
    floatingObjects.push({
      mesh,
      rotX: 0.003 + index * 0.002,
      rotY: 0.005 + index * 0.001,
      baseY: mesh.position.y,
      speed: 0.0015 + index * 0.0005
    });
  });

  // Mouse & Scroll interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Responsive resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth camera mouse follow
    targetX += (mouseX * 15 - targetX) * 0.05;
    targetY += (mouseY * 15 - targetY) * 0.05;
    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(scene.position);

    // Particle Animation
    const posAttr = particleGeometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      posAttr.array[i * 3] += velocities[i].x;
      posAttr.array[i * 3 + 1] += velocities[i].y;
      posAttr.array[i * 3 + 2] += velocities[i].z;

      // Wrap around bounds
      if (Math.abs(posAttr.array[i * 3]) > 80) velocities[i].x *= -1;
      if (Math.abs(posAttr.array[i * 3 + 1]) > 80) velocities[i].y *= -1;
      if (Math.abs(posAttr.array[i * 3 + 2]) > 50) velocities[i].z *= -1;
    }
    posAttr.needsUpdate = true;

    // Slow galaxy rotation
    particleMesh.rotation.y = elapsedTime * 0.03;
    particleMesh.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

    // Floating Wireframe Shapes
    floatingObjects.forEach((obj, idx) => {
      obj.mesh.rotation.x += obj.rotX;
      obj.mesh.rotation.y += obj.rotY;
      obj.mesh.position.y = obj.baseY + Math.sin(elapsedTime * 1.5 + idx) * 4;
    });

    renderer.render(scene, camera);
  }

  animate();
}

/* =====================================================
   2. DYNAMIC TYPING EFFECT
   ===================================================== */
function initTypingEffect() {
  const typedElem = document.getElementById('typed');
  if (!typedElem) return;

  const roles = [
    'Software Engineer',
    'Full-Stack Developer',
    'Java & Spring Boot Developer',
    'React.js Specialist',
    'Machine Learning Engineer'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typedElem.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedElem.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 110;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 1800; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* =====================================================
   3. NAVBAR SCROLL & ACTIVE SPY
   ===================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  const hamburger = document.getElementById('hamburger');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Navbar glass effect on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section Spy
    let currentSection = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    allNavLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Hamburger Toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu on link click
    allNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }
}

/* =====================================================
   4. 3D CARD TILT EFFECT
   ===================================================== */
function initCardTilt() {
  const cards = document.querySelectorAll('.about-card-3d, .project-card, .skill-category, .timeline-content, .cert-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      if (card.classList.contains('about-card-3d')) {
        const face = card.querySelector('.card-face');
        if (face) {
          face.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('about-card-3d')) {
        const face = card.querySelector('.card-face');
        if (face) {
          face.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
      }
    });
  });
}

/* =====================================================
   5. SKILL BARS ANIMATION
   ===================================================== */
function initSkillBars() {
  const skillSection = document.getElementById('skills');
  if (!skillSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fills = skillSection.querySelectorAll('.pill-fill');
          fills.forEach((fill) => {
            fill.classList.add('animated');
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(skillSection);
}

/* =====================================================
   6. SCROLL REVEAL ANIMATIONS
   ===================================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.section-header, .about-grid, .skill-category, .project-card, .timeline-item, .cert-card, .achievement-item, .contact-card, .contact-form'
  );

  animatedElements.forEach((el, idx) => {
    el.setAttribute('data-animate', '');
    el.style.transitionDelay = `${(idx % 4) * 0.1}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

/* =====================================================
   7. PROJECT CARD FLIP (MOBILE & CLICK SUPPORT)
   ===================================================== */
function initProjectCardFlip() {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // If user clicks on button or link, don't trigger 3D flip
      if (e.target.closest('a') || e.target.closest('button')) return;

      if (window.innerWidth <= 1024) {
        card.classList.toggle('flipped');
        const inner = card.querySelector('.project-card-inner');
        if (inner) {
          if (card.classList.contains('flipped')) {
            inner.style.transform = 'rotateY(180deg)';
          } else {
            inner.style.transform = 'rotateY(0deg)';
          }
        }
      }
    });
  });
}

/* =====================================================
   8. CONTACT FORM SUBMISSION
   ===================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const formSuccess = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending...';
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
      }
      if (formSuccess) {
        formSuccess.style.display = 'block';
        setTimeout(() => {
          formSuccess.style.display = 'none';
        }, 5000);
      }
      form.reset();
    }, 1200);
  });
}

/* =====================================================
   9. INTERACTIVE LIVE PROJECT DEMOS
   ===================================================== */
function initLiveDemoModals() {
  const modal = document.getElementById('demo-modal');
  const overlay = document.getElementById('demo-modal-overlay');
  const closeBtn = document.getElementById('demo-close-btn');
  const titleElem = document.getElementById('demo-title');
  const badgeElem = document.getElementById('demo-badge');
  const bodyElem = document.getElementById('demo-modal-body');

  if (!modal || !bodyElem) return;

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openModal(projectType) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (projectType === 'ecommerce') {
      titleElem.textContent = 'Online Shopping Management System (Spring Boot + React)';
      badgeElem.textContent = 'Full-Stack Live Simulator';
      renderEcommerceDemo(bodyElem);
    } else if (projectType === 'crop') {
      titleElem.textContent = 'Crop Classification & Yield Predictor';
      badgeElem.textContent = 'Satellite & ML Inference Pipeline';
      renderCropDemo(bodyElem);
    } else if (projectType === 'service') {
      titleElem.textContent = 'Service Finder App';
      badgeElem.textContent = 'Hackathon Web App Demo';
      renderServiceFinderDemo(bodyElem);
    } else if (projectType === 'iris') {
      titleElem.textContent = 'Iris Flower Classification (SVM Model)';
      badgeElem.textContent = 'ML Internship Live Classifier';
      renderIrisDemo(bodyElem);
    } else if (projectType === 'health') {
      titleElem.textContent = 'AI Disease Predictor & Diagnostic Assistant';
      badgeElem.textContent = 'Healthcare ML Inference Simulator';
      renderHealthDemo(bodyElem);
    } else if (projectType === 'kanban') {
      titleElem.textContent = 'TaskMaster Real-Time Kanban Board';
      badgeElem.textContent = 'Full-Stack Spring Boot + WebSocket Simulator';
      renderKanbanDemo(bodyElem);
    }
  }

  // Bind live demo buttons
  document.querySelectorAll('.live-btn[data-demo]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const demoType = btn.getAttribute('data-demo');
      openModal(demoType);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Demo 1: E-Commerce Store & Spring Boot API Simulator
function renderEcommerceDemo(container) {
  let cart = [
    { id: 1, name: 'Smart Fitness Watch', price: 89, qty: 1 },
    { id: 2, name: 'Wireless ANC Headphones', price: 129, qty: 1 }
  ];

  function getCartTotal() {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }

  container.innerHTML = `
    <div class="demo-grid-2col">
      <div class="demo-card-panel">
        <div class="demo-panel-title">
          <span>🛍️ Product Catalog</span>
          <span style="font-size:0.75rem; color:#38ef7d; font-weight:normal;">JWT Auth: Active</span>
        </div>
        <div class="ecommerce-products">
          <div class="ecom-item">
            <span class="ecom-item-icon">⌚</span>
            <span class="ecom-item-name">Smart Fitness Watch</span>
            <span class="ecom-item-price">$89.00</span>
            <button class="ecom-add-btn" onclick="window.addEcomItem('Smart Fitness Watch', 89)">+ Add to Cart</button>
          </div>
          <div class="ecom-item">
            <span class="ecom-item-icon">🎧</span>
            <span class="ecom-item-name">Wireless ANC Headphones</span>
            <span class="ecom-item-price">$129.00</span>
            <button class="ecom-add-btn" onclick="window.addEcomItem('Wireless ANC Headphones', 129)">+ Add to Cart</button>
          </div>
          <div class="ecom-item">
            <span class="ecom-item-icon">💻</span>
            <span class="ecom-item-name">Ultra Slim Pro Laptop</span>
            <span class="ecom-item-price">$899.00</span>
            <button class="ecom-add-btn" onclick="window.addEcomItem('Ultra Slim Pro Laptop', 899)">+ Add to Cart</button>
          </div>
          <div class="ecom-item">
            <span class="ecom-item-icon">⌨️</span>
            <span class="ecom-item-name">RGB Mechanical Keyboard</span>
            <span class="ecom-item-price">$65.00</span>
            <button class="ecom-add-btn" onclick="window.addEcomItem('RGB Mechanical Keyboard', 65)">+ Add to Cart</button>
          </div>
        </div>
      </div>

      <div class="demo-card-panel">
        <div class="demo-panel-title">
          <span>🛒 Redis-Cached Cart</span>
          <span id="ecom-cart-count" style="font-size:0.75rem; color:#a78bfa;">${cart.length} items</span>
        </div>
        <div class="ecom-cart-box">
          <div class="cart-items-list" id="ecom-cart-list">
            ${cart.map((item, idx) => `
              <div class="cart-row">
                <span>${item.name} (${item.qty}x)</span>
                <span style="color:#38ef7d; font-weight:600;">$${item.price * item.qty}</span>
              </div>
            `).join('')}
          </div>
          <div class="cart-total-bar">
            <span>Total:</span>
            <span id="ecom-total-val" style="color:#38ef7d;">$${getCartTotal()}</span>
          </div>

          <div style="margin-top:0.5rem;">
            <span style="font-size:0.75rem; font-weight:700; color:#94a3b8; display:block; margin-bottom:4px;">
              ⚡ Spring Boot REST & Redis Logs:
            </span>
            <div class="sim-terminal" id="ecom-logs">
              [Spring Boot 3.2] GET /api/v1/cart - 200 OK (3ms, Redis Cache Hit)<br/>
              [Spring Security] Authenticated: Bearer JWT user_clokeswari<br/>
              [PostgreSQL] Connection Pool: 8/10 active connections
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  window.addEcomItem = (name, price) => {
    const existing = cart.find((i) => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id: Date.now(), name, price, qty: 1 });
    }
    const cartList = document.getElementById('ecom-cart-list');
    const totalVal = document.getElementById('ecom-total-val');
    const countVal = document.getElementById('ecom-cart-count');
    const logs = document.getElementById('ecom-logs');

    if (cartList) {
      cartList.innerHTML = cart.map((item) => `
        <div class="cart-row">
          <span>${item.name} (${item.qty}x)</span>
          <span style="color:#38ef7d; font-weight:600;">$${item.price * item.qty}</span>
        </div>
      `).join('');
    }
    if (totalVal) totalVal.textContent = `$${getCartTotal()}`;
    if (countVal) countVal.textContent = `${cart.reduce((a, b) => a + b.qty, 0)} items`;
    if (logs) {
      const time = new Date().toLocaleTimeString();
      logs.innerHTML += `<br/>[${time}] POST /api/v1/cart/items - 201 Created (Redis synced: "${name}")`;
      logs.scrollTop = logs.scrollHeight;
    }
  };
}

// Demo 2: Crop Classification & Yield Predictor Simulator
function renderCropDemo(container) {
  container.innerHTML = `
    <div class="demo-grid-2col">
      <div class="demo-card-panel">
        <div class="demo-panel-title">🌱 Satellite & Climate Inputs</div>
        
        <div class="sim-form-group">
          <label>Agro-Climatic Zone</label>
          <select id="crop-zone" class="sim-select" onchange="window.runCropPrediction()">
            <option value="Tropical">Zone 1: Tropical Wet (High Yield)</option>
            <option value="Semi-Arid" selected>Zone 2: Semi-Arid (Deccan Plateau)</option>
            <option value="Coastal">Zone 3: Coastal Alluvial</option>
          </select>
        </div>

        <div class="sim-form-group">
          <label>
            <span>Rainfall (mm/season)</span>
            <span id="rainfall-val" style="color:#06b6d4;">680 mm</span>
          </label>
          <input type="range" min="200" max="1800" value="680" class="sim-slider" id="crop-rain" oninput="document.getElementById('rainfall-val').textContent = this.value + ' mm'; window.runCropPrediction();">
        </div>

        <div class="sim-form-group">
          <label>
            <span>NDVI Vegetation Index</span>
            <span id="ndvi-val" style="color:#38ef7d;">0.65</span>
          </label>
          <input type="range" min="0.1" max="0.95" step="0.05" value="0.65" class="sim-slider" id="crop-ndvi" oninput="document.getElementById('ndvi-val').textContent = this.value; window.runCropPrediction();">
        </div>

        <button class="sim-btn-action" onclick="window.runCropPrediction()">
          🛰️ Run Sentinel-2 ML Inference
        </button>
      </div>

      <div class="demo-card-panel">
        <div class="demo-panel-title">📊 ML Pipeline Outputs</div>
        <div class="sim-result-card" id="crop-result-box">
          <span class="sim-result-icon">🌾</span>
          <span class="sim-result-title" id="crop-res-name">Wheat (Triticum aestivum)</span>
          <span style="font-size:0.8rem; color:#94a3b8;" id="crop-res-zone">Identified from Sentinel-2 Multi-Spectral Imagery</span>

          <div class="sim-metric-row">
            <div class="sim-metric-item">
              Classification Accuracy
              <span class="sim-metric-val" id="crop-res-acc">94.8%</span>
            </div>
            <div class="sim-metric-item">
              Forecast Yield
              <span class="sim-metric-val" id="crop-res-yield">4.6 Tons / Ha</span>
            </div>
            <div class="sim-metric-item">
              Model MAPE Error
              <span class="sim-metric-val" style="color:#a78bfa;">11.4%</span>
            </div>
            <div class="sim-metric-item">
              Resource Savings
              <span class="sim-metric-val" style="color:#38ef7d;">-18% Water Overuse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  window.runCropPrediction = () => {
    const zone = document.getElementById('crop-zone').value;
    const rain = parseInt(document.getElementById('crop-rain').value);
    const ndvi = parseFloat(document.getElementById('crop-ndvi').value);

    let crop = 'Wheat';
    let icon = '🌾';
    let yieldVal = '4.2';

    if (rain > 1000 || zone === 'Coastal') {
      crop = 'Paddy Rice (Oryza sativa)';
      icon = '🍚';
      yieldVal = (3.8 + ndvi * 2.2).toFixed(1);
    } else if (rain < 500 && zone === 'Semi-Arid') {
      crop = 'Pearl Millet (Bajra)';
      icon = '🌽';
      yieldVal = (2.1 + ndvi * 1.5).toFixed(1);
    } else {
      crop = 'Wheat (Triticum aestivum)';
      icon = '🌾';
      yieldVal = (3.4 + ndvi * 2.5).toFixed(1);
    }

    const accuracy = (91.5 + ndvi * 4.2).toFixed(1);
    document.getElementById('crop-res-name').textContent = crop;
    document.querySelector('.sim-result-icon').textContent = icon;
    document.getElementById('crop-res-yield').textContent = `${yieldVal} Tons / Ha`;
    document.getElementById('crop-res-acc').textContent = `${accuracy}%`;
  };
}

// Demo 3: Service Finder App
function renderServiceFinderDemo(container) {
  const services = [
    { id: 1, name: 'Precision Electrical Solutions', cat: 'Electrical', rating: '4.9 ★', dist: '1.2 km away', icon: '⚡' },
    { id: 2, name: 'AquaFlow Plumbing Experts', cat: 'Plumbing', rating: '4.8 ★', dist: '2.5 km away', icon: '🔧' },
    { id: 3, name: 'EcoShine Deep Cleaning', cat: 'Cleaning', rating: '5.0 ★', dist: '0.8 km away', icon: '✨' },
    { id: 4, name: 'ByteMaster PC & Device Repair', cat: 'Tech', rating: '4.7 ★', dist: '3.1 km away', icon: '💻' }
  ];

  container.innerHTML = `
    <div class="demo-card-panel">
      <div class="demo-panel-title">
        <span>🔍 Search Local Verified Services</span>
        <span style="font-size:0.75rem; color:#38ef7d;">GPS: Active Location</span>
      </div>

      <div class="service-search-box">
        <input type="text" id="service-query" class="sim-input" placeholder="Search plumber, electrician, cleaning..." oninput="window.filterServices()" />
        <select id="service-cat-filter" class="sim-select" style="width:160px;" onchange="window.filterServices()">
          <option value="All">All Categories</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Tech">Tech</option>
        </select>
      </div>

      <div class="service-items-grid" id="services-list-box">
        ${services.map(s => `
          <div class="service-item-row">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="font-size:1.6rem;">${s.icon}</span>
              <div>
                <strong style="color:#f8fafc; font-size:0.92rem;">${s.name}</strong>
                <div style="font-size:0.76rem; color:#94a3b8;">${s.cat} • ${s.dist}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="color:#fbbf24; font-weight:700; font-size:0.85rem;">${s.rating}</span>
              <button class="ecom-add-btn" onclick="alert('✅ Booking request sent to ' + '${s.name}' + '! They will confirm in 5 mins.')">Book Now</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  window.filterServices = () => {
    const q = (document.getElementById('service-query').value || '').toLowerCase();
    const cat = document.getElementById('service-cat-filter').value;
    const filtered = services.filter(s => {
      const matchesQ = s.name.toLowerCase().includes(q) || s.cat.toLowerCase().includes(q);
      const matchesCat = cat === 'All' || s.cat === cat;
      return matchesQ && matchesCat;
    });

    const listBox = document.getElementById('services-list-box');
    if (listBox) {
      if (filtered.length === 0) {
        listBox.innerHTML = `<p style="text-align:center; padding:1.5rem; color:#94a3b8;">No matching service providers found.</p>`;
      } else {
        listBox.innerHTML = filtered.map(s => `
          <div class="service-item-row">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="font-size:1.6rem;">${s.icon}</span>
              <div>
                <strong style="color:#f8fafc; font-size:0.92rem;">${s.name}</strong>
                <div style="font-size:0.76rem; color:#94a3b8;">${s.cat} • ${s.dist}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="color:#fbbf24; font-weight:700; font-size:0.85rem;">${s.rating}</span>
              <button class="ecom-add-btn" onclick="alert('✅ Booking request sent to ' + '${s.name}' + '! They will confirm in 5 mins.')">Book Now</button>
            </div>
          </div>
        `).join('');
      }
    }
  };
}

// Demo 4: Iris Flower SVM Classification Model
function renderIrisDemo(container) {
  container.innerHTML = `
    <div class="demo-grid-2col">
      <div class="demo-card-panel">
        <div class="demo-panel-title">🌸 Morphological Measurements (cm)</div>

        <div class="sim-form-group">
          <label>
            <span>Sepal Length</span>
            <span id="sl-val" style="color:#a78bfa;">5.8 cm</span>
          </label>
          <input type="range" min="4.0" max="8.0" step="0.1" value="5.8" class="sim-slider" id="iris-sl" oninput="document.getElementById('sl-val').textContent = this.value + ' cm'; window.runIrisClassifier();">
        </div>

        <div class="sim-form-group">
          <label>
            <span>Sepal Width</span>
            <span id="sw-val" style="color:#a78bfa;">3.0 cm</span>
          </label>
          <input type="range" min="2.0" max="4.5" step="0.1" value="3.0" class="sim-slider" id="iris-sw" oninput="document.getElementById('sw-val').textContent = this.value + ' cm'; window.runIrisClassifier();">
        </div>

        <div class="sim-form-group">
          <label>
            <span>Petal Length</span>
            <span id="pl-val" style="color:#06b6d4;">4.2 cm</span>
          </label>
          <input type="range" min="1.0" max="7.0" step="0.1" value="4.2" class="sim-slider" id="iris-pl" oninput="document.getElementById('pl-val').textContent = this.value + ' cm'; window.runIrisClassifier();">
        </div>

        <div class="sim-form-group">
          <label>
            <span>Petal Width</span>
            <span id="pw-val" style="color:#06b6d4;">1.4 cm</span>
          </label>
          <input type="range" min="0.1" max="2.5" step="0.1" value="1.4" class="sim-slider" id="iris-pw" oninput="document.getElementById('pw-val').textContent = this.value + ' cm'; window.runIrisClassifier();">
        </div>
      </div>

      <div class="demo-card-panel">
        <div class="demo-panel-title">🎯 SVM Decision Output</div>
        <div class="sim-result-card">
          <span class="sim-result-icon" id="iris-res-icon">🌺</span>
          <span class="sim-result-title" id="iris-res-species">Iris Versicolor</span>
          <span style="font-size:0.8rem; color:#94a3b8;">Support Vector Classifier with RBF Kernel</span>

          <div class="sim-metric-row">
            <div class="sim-metric-item">
              SVM Confidence
              <span class="sim-metric-val" id="iris-res-conf">97.4%</span>
            </div>
            <div class="sim-metric-item">
              Decision Function Score
              <span class="sim-metric-val" id="iris-res-score">+2.84</span>
            </div>
            <div class="sim-metric-item">
              Model Recall
              <span class="sim-metric-val" style="color:#38ef7d;">0.98</span>
            </div>
            <div class="sim-metric-item">
              Kernel Type
              <span class="sim-metric-val" style="color:#a78bfa;">Scikit RBF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  window.runIrisClassifier = () => {
    const pl = parseFloat(document.getElementById('iris-pl').value);
    const pw = parseFloat(document.getElementById('iris-pw').value);

    let species = 'Iris Versicolor';
    let icon = '🌺';
    let conf = 97.4;

    if (pl < 2.5 && pw < 0.8) {
      species = 'Iris Setosa';
      icon = '🌸';
      conf = 99.8;
    } else if (pl > 4.8 || pw > 1.7) {
      species = 'Iris Virginica';
      icon = '🪻';
      conf = 96.2;
    } else {
      species = 'Iris Versicolor';
      icon = '🌺';
      conf = 95.7;
    }

    document.getElementById('iris-res-species').textContent = species;
    document.getElementById('iris-res-icon').textContent = icon;
    document.getElementById('iris-res-conf').textContent = `${conf}%`;
  };
}

// Demo 5: AI Healthcare Disease Predictor
function renderHealthDemo(container) {
  container.innerHTML = `
    <div class="demo-grid-2col">
      <div class="demo-card-panel">
        <div class="demo-panel-title">🩺 Select Patient Symptoms</div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:1rem;">
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-fever" checked onchange="window.runHealthPrediction()" /> 🤒 High Fever
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-fatigue" checked onchange="window.runHealthPrediction()" /> 🥱 Fatigue / Lethargy
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-cough" checked onchange="window.runHealthPrediction()" /> 🗣️ Dry Cough
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-headache" onchange="window.runHealthPrediction()" /> 🤕 Severe Headache
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-joints" onchange="window.runHealthPrediction()" /> 🦴 Joint & Muscle Pain
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-breath" onchange="window.runHealthPrediction()" /> 🫁 Shortness of Breath
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-rash" onchange="window.runHealthPrediction()" /> 🔴 Skin Rash
          </label>
          <label style="display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer;">
            <input type="checkbox" id="sym-nausea" onchange="window.runHealthPrediction()" /> 🤢 Nausea / Chills
          </label>
        </div>

        <div class="sim-form-group">
          <label>
            <span>Patient Age</span>
            <span id="patient-age-val" style="color:#a78bfa;">26 yrs</span>
          </label>
          <input type="range" min="10" max="80" value="26" class="sim-slider" id="patient-age" oninput="document.getElementById('patient-age-val').textContent = this.value + ' yrs'; window.runHealthPrediction();" />
        </div>

        <button class="sim-btn-action" onclick="window.runHealthPrediction()">
          🔬 Run Clinical ML Diagnostic Model
        </button>
      </div>

      <div class="demo-card-panel">
        <div class="demo-panel-title">📋 ML Diagnostic Assessment</div>
        <div class="sim-result-card">
          <span class="sim-result-icon" id="health-res-icon">🦠</span>
          <span class="sim-result-title" id="health-res-title">Viral Influenza (Flu)</span>
          <span style="font-size:0.8rem; color:#94a3b8;" id="health-res-desc">Scikit-Learn Random Forest Ensemble Model</span>

          <div class="sim-metric-row">
            <div class="sim-metric-item">
              Model Probability
              <span class="sim-metric-val" id="health-res-prob">95.4%</span>
            </div>
            <div class="sim-metric-item">
              Risk Stratification
              <span class="sim-metric-val" id="health-res-risk" style="color:#fbbf24;">Moderate</span>
            </div>
            <div class="sim-metric-item">
              Recommended Action
              <span class="sim-metric-val" style="color:#38ef7d; font-size:0.8rem;" id="health-res-action">Hydration & Rest</span>
            </div>
            <div class="sim-metric-item">
              Inference Latency
              <span class="sim-metric-val" style="color:#06b6d4;">8ms (Flask REST)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  window.runHealthPrediction = () => {
    const fever = document.getElementById('sym-fever').checked;
    const fatigue = document.getElementById('sym-fatigue').checked;
    const cough = document.getElementById('sym-cough').checked;
    const headache = document.getElementById('sym-headache').checked;
    const breath = document.getElementById('sym-breath').checked;
    const rash = document.getElementById('sym-rash').checked;
    const joints = document.getElementById('sym-joints').checked;

    let title = 'General Viral Fatigue';
    let icon = '🦠';
    let prob = 92.1;
    let risk = 'Low';
    let action = 'Rest & Fluids';

    if (breath && (fever || cough)) {
      title = 'Acute Respiratory Tract Condition';
      icon = '🫁';
      prob = 96.8;
      risk = 'High - Consult Physician';
      action = 'Clinical Evaluation';
    } else if (rash && fever) {
      title = 'Viral Exanthem / Allergic Rash';
      icon = '🔴';
      prob = 94.3;
      risk = 'Moderate';
      action = 'Antihistamines / Topical Care';
    } else if (headache && fatigue && !cough) {
      title = 'Tension Migraine Syndrome';
      icon = '🤕';
      prob = 95.2;
      risk = 'Low';
      action = 'Hydration & Electrolytes';
    } else if (fever && joints) {
      title = 'Arboviral Syndrome (Dengue / Chikungunya check)';
      icon = '🦟';
      prob = 93.6;
      risk = 'Moderate to High';
      action = 'Platelet Count Monitoring';
    } else {
      title = 'Common Viral Influenza (Flu)';
      icon = '🦠';
      prob = (91.0 + (fever ? 3 : 0) + (fatigue ? 2 : 0) + (cough ? 2.5 : 0)).toFixed(1);
      risk = fever && cough ? 'Moderate' : 'Low';
      action = 'Hydration, Vitamin C & Rest';
    }

    document.getElementById('health-res-title').textContent = title;
    document.getElementById('health-res-icon').textContent = icon;
    document.getElementById('health-res-prob').textContent = `${prob}%`;
    document.getElementById('health-res-risk').textContent = risk;
    document.getElementById('health-res-risk').style.color = risk.includes('High') ? '#ef4444' : risk.includes('Moderate') ? '#fbbf24' : '#38ef7d';
    document.getElementById('health-res-action').textContent = action;
  };
}

// Demo 6: TaskMaster Kanban Board Simulator
function renderKanbanDemo(container) {
  let tasks = [
    { id: 101, title: 'Implement JWT Auth in Spring Boot', status: 'todo', tag: 'Backend', priority: 'High' },
    { id: 102, title: 'Design 3D Hero Particle Canvas', status: 'in-progress', tag: 'Frontend', priority: 'Medium' },
    { id: 103, title: 'Write Scikit-Learn Unit Tests', status: 'in-progress', tag: 'ML', priority: 'High' },
    { id: 104, title: 'Configure Docker PostgreSQL Image', status: 'done', tag: 'DevOps', priority: 'Low' },
    { id: 105, title: 'Redis Session Cache Setup', status: 'done', tag: 'Backend', priority: 'High' }
  ];

  function renderBoard() {
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const percentDone = Math.round((doneTasks.length / tasks.length) * 100) || 0;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <input type="text" id="new-task-input" class="sim-input" placeholder="New agile task name..." style="width:240px; padding:0.45rem 0.75rem;" />
            <select id="new-task-tag" class="sim-select" style="width:110px; padding:0.45rem 0.5rem;">
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="ML">ML</option>
              <option value="DevOps">DevOps</option>
            </select>
            <button class="ecom-add-btn" onclick="window.addKanbanTask()">+ Add Task</button>
          </div>
          <div style="font-size:0.85rem; font-weight:700; color:#38ef7d;">
            Sprint Velocity: ${percentDone}% Done (${doneTasks.length}/${tasks.length})
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.85rem;">
          <!-- To Do -->
          <div class="demo-card-panel" style="padding:0.85rem;">
            <div class="demo-panel-title" style="color:#94a3b8; font-size:0.88rem; margin-bottom:0.75rem;">
              <span>📌 To Do (${todoTasks.length})</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem; min-height:160px;">
              ${todoTasks.map(t => `
                <div class="service-item-row" style="padding:0.6rem; flex-direction:column; align-items:flex-start; gap:0.4rem;">
                  <div style="display:flex; justify-content:space-between; width:100%; font-size:0.75rem;">
                    <span style="background:rgba(139,92,246,0.2); padding:0.1rem 0.4rem; border-radius:4px; color:#a78bfa;">${t.tag}</span>
                    <span style="color:#ef4444; font-weight:600;">${t.priority}</span>
                  </div>
                  <span style="font-size:0.82rem; font-weight:600; color:#f8fafc;">${t.title}</span>
                  <button class="ecom-add-btn" style="align-self:flex-end; font-size:0.7rem; padding:0.2rem 0.5rem;" onclick="window.moveTask(${t.id}, 'in-progress')">Start →</button>
                </div>
              `).join('') || '<div style="color:#64748b; font-size:0.75rem; text-align:center; padding:1rem;">No tasks in backlog</div>'}
            </div>
          </div>

          <!-- In Progress -->
          <div class="demo-card-panel" style="padding:0.85rem;">
            <div class="demo-panel-title" style="color:#38bdf8; font-size:0.88rem; margin-bottom:0.75rem;">
              <span>⚡ In Progress (${inProgTasks.length})</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem; min-height:160px;">
              ${inProgTasks.map(t => `
                <div class="service-item-row" style="padding:0.6rem; flex-direction:column; align-items:flex-start; gap:0.4rem;">
                  <div style="display:flex; justify-content:space-between; width:100%; font-size:0.75rem;">
                    <span style="background:rgba(56,189,248,0.2); padding:0.1rem 0.4rem; border-radius:4px; color:#38bdf8;">${t.tag}</span>
                    <span style="color:#fbbf24; font-weight:600;">${t.priority}</span>
                  </div>
                  <span style="font-size:0.82rem; font-weight:600; color:#f8fafc;">${t.title}</span>
                  <div style="display:flex; gap:0.3rem; align-self:flex-end;">
                    <button class="ecom-add-btn" style="background:rgba(255,255,255,0.1); font-size:0.7rem; padding:0.2rem 0.4rem;" onclick="window.moveTask(${t.id}, 'todo')">← Back</button>
                    <button class="ecom-add-btn" style="background:#10b981; font-size:0.7rem; padding:0.2rem 0.5rem;" onclick="window.moveTask(${t.id}, 'done')">Complete ✓</button>
                  </div>
                </div>
              `).join('') || '<div style="color:#64748b; font-size:0.75rem; text-align:center; padding:1rem;">Nothing active</div>'}
            </div>
          </div>

          <!-- Done -->
          <div class="demo-card-panel" style="padding:0.85rem;">
            <div class="demo-panel-title" style="color:#38ef7d; font-size:0.88rem; margin-bottom:0.75rem;">
              <span>✅ Completed (${doneTasks.length})</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem; min-height:160px;">
              ${doneTasks.map(t => `
                <div class="service-item-row" style="padding:0.6rem; flex-direction:column; align-items:flex-start; gap:0.4rem; opacity:0.85;">
                  <div style="display:flex; justify-content:space-between; width:100%; font-size:0.75rem;">
                    <span style="background:rgba(56,239,125,0.2); padding:0.1rem 0.4rem; border-radius:4px; color:#38ef7d;">${t.tag}</span>
                    <span style="color:#10b981;">Done ✓</span>
                  </div>
                  <span style="font-size:0.82rem; font-weight:600; color:#cbd5e1; text-decoration:line-through;">${t.title}</span>
                  <button class="ecom-add-btn" style="background:rgba(255,255,255,0.08); font-size:0.7rem; padding:0.15rem 0.4rem; align-self:flex-end;" onclick="window.moveTask(${t.id}, 'in-progress')">Reopen ↩</button>
                </div>
              `).join('') || '<div style="color:#64748b; font-size:0.75rem; text-align:center; padding:1rem;">No completed tasks</div>'}
            </div>
          </div>
        </div>

        <div class="sim-terminal" id="kanban-ws-logs" style="height:65px;">
          [WebSocket /stomp/kanban] Connected session: ws_client_clokeswari (Latency: 4ms)<br/>
          [PostgreSQL] Event dispatch synced across all collaborative sessions.
        </div>
      </div>
    `;
  }

  window.moveTask = (id, newStatus) => {
    const target = tasks.find(t => t.id === id);
    if (target) {
      target.status = newStatus;
      renderBoard();
      const logs = document.getElementById('kanban-ws-logs');
      if (logs) {
        const time = new Date().toLocaleTimeString();
        logs.innerHTML += `<br/>[${time}] STOMP WS event: Task #${id} status updated to '${newStatus}'`;
        logs.scrollTop = logs.scrollHeight;
      }
    }
  };

  window.addKanbanTask = () => {
    const input = document.getElementById('new-task-input');
    const tag = document.getElementById('new-task-tag').value;
    if (input && input.value.trim()) {
      tasks.unshift({
        id: Date.now() % 10000,
        title: input.value.trim(),
        status: 'todo',
        tag: tag,
        priority: 'High'
      });
      renderBoard();
      const logs = document.getElementById('kanban-ws-logs');
      if (logs) {
        const time = new Date().toLocaleTimeString();
        logs.innerHTML += `<br/>[${time}] STOMP WS broadcast: New task created "${input.value.trim()}"`;
        logs.scrollTop = logs.scrollHeight;
      }
    }
  };

  renderBoard();
}

