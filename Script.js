/**
 * LATAV – Latinoamericana de Aceites Vegetales
 * script.js – Main JavaScript
 */

'use strict';

/* =========================================
   1. NAVBAR – Sticky & Mobile Toggle
   ========================================= */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav-link');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = y;
  }, { passive: true });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    // Animate hamburger → X
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }, { passive: true });
})();

/* =========================================
   2. SCROLL ANIMATIONS (Intersection Observer)
   ========================================= */
(function initScrollAnimations() {
  const animateTargets = document.querySelectorAll('[data-animate]');

  if (!animateTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay based on sibling index
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-animate]'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.12}s`;
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  animateTargets.forEach(el => observer.observe(el));
})();

/* =========================================
   3. CONTACT FORM – Validation + WhatsApp
   ========================================= */
(function initContactForm() {
  const form      = document.getElementById('cotizacionForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  const WHATSAPP_NUMBER = '573143104386';

  // --- Validation helpers ---
  function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById('err-' + fieldId);
    if (field) field.classList.add('error');
    if (err)   err.textContent = msg;
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById('err-' + fieldId);
    if (field) field.classList.remove('error');
    if (err)   err.textContent = '';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function validateForm() {
    let valid = true;
    const required = [
      { id: 'nombre',   label: 'El nombre es obligatorio' },
      { id: 'empresa',  label: 'El nombre de empresa es obligatorio' },
      { id: 'telefono', label: 'El teléfono es obligatorio' },
      { id: 'correo',   label: 'El correo es obligatorio' },
      { id: 'producto', label: 'Selecciona un producto' },
      { id: 'volumen',  label: 'Indica el volumen aproximado' },
    ];

    required.forEach(({ id, label }) => {
      clearError(id);
      const el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        showError(id, label);
        valid = false;
      }
    });

    // Email format
    const correoEl = document.getElementById('correo');
    if (correoEl && correoEl.value.trim() && !validateEmail(correoEl.value)) {
      showError('correo', 'Ingresa un correo electrónico válido');
      valid = false;
    }

    return valid;
  }

  // Real-time clear errors
  ['nombre', 'empresa', 'telefono', 'correo', 'producto', 'volumen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearError(id));
      el.addEventListener('change', () => clearError(id));
    }
  });

  // --- Build WhatsApp message ---
  function buildWhatsAppMessage(data) {
    const lines = [
      'Hola, quiero solicitar una cotización:',
      '',
      `📌 Nombre: ${data.nombre}`,
      `🏢 Empresa: ${data.empresa}`,
      `📞 Teléfono: ${data.telefono}`,
      `📧 Correo: ${data.correo}`,
      `🛢️ Producto de interés: ${data.producto}`,
      `📦 Volumen aproximado: ${data.volumen}`,
      `⚙️ Servicio: ${data.servicio || 'No especificado'}`,
      `📝 Mensaje adicional:`,
      data.mensaje || '(Sin mensaje adicional)',
      '',
      'Por favor, quedo atento a más información.',
    ];
    return lines.join('\n');
  }

  // --- Submit handler ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErr = form.querySelector('.error');
      if (firstErr) {
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErr.focus();
      }
      return;
    }

    // Collect form data
    const nombre   = document.getElementById('nombre').value.trim();
    const cargo    = document.getElementById('cargo').value.trim();
    const empresa  = document.getElementById('empresa').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const correo   = document.getElementById('correo').value.trim();
    const producto = document.getElementById('producto').value.trim();
    const volumen  = document.getElementById('volumen').value.trim();
    const mensaje  = document.getElementById('mensaje').value.trim();

    // Collect checkboxes
    const servicioChecked = Array.from(
      form.querySelectorAll('input[name="servicio"]:checked')
    ).map(cb => cb.value);
    const servicio = servicioChecked.length > 0 ? servicioChecked.join(', ') : '';

    const formData = { nombre, cargo, empresa, telefono, correo, producto, volumen, servicio, mensaje };

    // Build message
    const message = buildWhatsAppMessage(formData);
    const encoded = encodeURIComponent(message);
    const waUrl   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

    // Show loading state
    const btnLabel   = submitBtn.querySelector('.btn-label');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = true;
    btnLabel.style.display   = 'none';
    btnLoading.style.display = 'flex';

    // Small delay for UX feedback, then open WhatsApp
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Reset button state after 2s
      setTimeout(() => {
        submitBtn.disabled = false;
        btnLabel.style.display   = '';
        btnLoading.style.display = 'none';
      }, 2000);

      // Optional: reset form
      // form.reset();
    }, 900);
  });
})();

/* =========================================
   4. SMOOTH SCROLL for anchor links
   ========================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH   = document.getElementById('navbar')?.offsetHeight || 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =========================================
   5. Counter animation (hero stats or badges)
   ========================================= */
(function initCounters() {
  // If you add stat counters later, wire here
})();

/* =========================================
   6. Parallax subtle effect on hero
   ========================================= */
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        heroBg.style.transform = `translateY(${y * 0.3}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* =========================================
   7. WhatsApp FAB – show after scroll
   ========================================= */
(function initFab() {
  const fab = document.querySelector('.wa-fab');
  if (!fab) return;
  // Already visible, just ensure it's accessible
})();