/* ============================================================
   QUBECSENSE LLP — Main JavaScript
   Interactions, animations, form handling
   ============================================================ */

'use strict';

// ─── Utility ──────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Navigation: Scroll + Mobile ──────────────────────────
(function initNav() {
  const navbar  = qs('#navbar');
  const menuBtn = qs('#nav-menu-btn');
  const mobileNav = qs('#mobile-nav');
  const mobileLinks = qsa('.mobile-nav-link');

  // Scroll-based class toggle
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  let isOpen = false;
  const openMenu  = () => { isOpen = true; mobileNav.style.display = 'flex'; mobileNav.setAttribute('aria-hidden','false'); menuBtn.setAttribute('aria-expanded','true'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { isOpen = false; mobileNav.style.display = 'none';  mobileNav.setAttribute('aria-hidden','true');  menuBtn.setAttribute('aria-expanded','false'); document.body.style.overflow = ''; };

  menuBtn.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on ESC
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeMenu(); });
})();


// ─── Smooth Scroll ────────────────────────────────────────
qsa('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 80; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ─── Scroll Reveal ────────────────────────────────────────
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  qsa('.reveal').forEach(el => io.observe(el));
})();


// ─── Counter Animation ────────────────────────────────────
(function initCounters() {
  // Hero stats
  const heroStats = qsa('.hero-stat-value[data-target]');

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.textContent.replace(/[\d.]/g, '').trim() || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = isDecimal
        ? (eased * target).toFixed(1)
        : Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const heroIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        heroStats.forEach(animateCounter);
        heroIo.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroSection = qs('.hero-stats');
  if (heroSection) heroIo.observe(heroSection);


  // Stats band counters
  const bandStats = qsa('.stat-value[data-count]');

  const animateBandCounter = (el) => {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = isDecimal
        ? (eased * target).toFixed(1)
        : Math.floor(eased * target);
      el.textContent = value + ' ' + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const bandIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bandStats.forEach(animateBandCounter);
        bandIo.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const band = qs('.stats-band');
  if (band) bandIo.observe(band);
})();


// ─── Live Dashboard Data Simulation ───────────────────────
(function initDashboardLive() {
  const flowEl    = qs('.dash-card-1 .dash-value');
  const sensorsEl = qs('.dash-card-2 .dash-value');

  if (!flowEl) return;

  let baseFlow = 18420;

  setInterval(() => {
    // Gently fluctuate flow
    const delta = (Math.random() - 0.5) * 80;
    baseFlow = Math.max(17000, Math.min(20000, baseFlow + delta));
    flowEl.innerHTML = `${Math.round(baseFlow).toLocaleString('en-IN')} <span class="dash-unit">kL</span>`;
  }, 3000);

  // Sparkline bars in hero: subtle live flicker
  const bars = qsa('.sparkline-bar span');
  setInterval(() => {
    const randomIdx = Math.floor(Math.random() * bars.length);
    const heights = bars.map(b => parseInt(b.style.height));
    const newH = Math.max(15, Math.min(95, heights[randomIdx] + (Math.random() - 0.5) * 15));
    bars[randomIdx].style.height = newH + '%';
  }, 1200);
})();


// ─── Quality Bar Animations ────────────────────────────────
(function initQualityBars() {
  const barIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        qsa('.q-bar-fill', entry.target).forEach(fill => {
          const targetW = fill.style.width;
          fill.style.width = '0%';
          requestAnimationFrame(() => {
            fill.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1)';
            fill.style.width = targetW;
          });
        });
        barIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  qsa('.feature-card, .dash-card').forEach(el => barIo.observe(el));
})();


// ─── Contact Form ──────────────────────────────────────────
(function initContactForm() {
  const form      = qs('#contact-form');
  const submitBtn = qs('#form-submit-btn');
  const toast     = qs('#toast');

  if (!form) return;

  const showToast = () => {
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 4500);
  };

  const setLoading = (loading) => {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Submitting…</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="animation:spin 1s linear infinite;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Submit Enquiry</span><span aria-hidden="true">→</span>`;
    }
  };

  // Add spin keyframe dynamically
  const style = document.createElement('style');
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);

  // Inline validation
  const validateField = (field) => {
    const val = field.value.trim();
    let error = '';

    if (field.required && !val) {
      error = 'This field is required.';
    } else if (field.type === 'email' && val) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = 'Please enter a valid email address.';
    } else if (field.type === 'tel' && val) {
      if (!/^[\+\d\s\-\(\)]{7,15}$/.test(val)) error = 'Please enter a valid phone number.';
    }

    // Remove old error
    const existingErr = field.parentElement.querySelector('.field-error');
    if (existingErr) existingErr.remove();

    if (error) {
      const errEl = document.createElement('span');
      errEl.className = 'field-error';
      errEl.style.cssText = 'display:block;font-size:0.72rem;color:#ef5350;margin-top:5px;font-weight:500;';
      errEl.textContent = error;
      field.parentElement.appendChild(errEl);
      field.style.borderColor = '#ef5350';
      return false;
    } else {
      field.style.borderColor = '';
      return true;
    }
  };

  // Live validation on blur
  qsa('.form-input, .form-select, .form-textarea', form).forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const errEl = field.parentElement.querySelector('.field-error');
      if (errEl) { errEl.remove(); field.style.borderColor = ''; }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const fields = qsa('.form-input[required], .form-select[required]', form);
    const privacyCheck = qs('#privacy-consent');
    let valid = fields.map(f => validateField(f)).every(Boolean);

    if (!privacyCheck.checked) {
      valid = false;
      const existingErr = privacyCheck.parentElement.querySelector('.field-error');
      if (!existingErr) {
        const errEl = document.createElement('span');
        errEl.className = 'field-error';
        errEl.style.cssText = 'display:block;font-size:0.72rem;color:#ef5350;margin-top:5px;font-weight:500;';
        errEl.textContent = 'Please accept the privacy policy to continue.';
        privacyCheck.parentElement.appendChild(errEl);
      }
    }

    if (!valid) return;

    setLoading(true);

    // Simulate submission
    await new Promise(r => setTimeout(r, 1800));

    setLoading(false);
    form.reset();
    qsa('.field-error', form).forEach(e => e.remove());
    qsa('.form-input, .form-select, .form-textarea', form).forEach(f => f.style.borderColor = '');
    showToast();

    // Scroll to top of form
    qs('.contact-form-wrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();


// ─── Newsletter ────────────────────────────────────────────
(function initNewsletter() {
  const btn   = qs('#newsletter-btn');
  const input = qs('#newsletter-email');
  const toast = qs('#toast');

  if (!btn) return;

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.style.borderColor = '#ef5350';
      input.placeholder = 'Please enter a valid email';
      return;
    }
    input.style.borderColor = '';
    input.value = '';
    input.placeholder = '✓ Subscribed!';

    // Show toast
    toast.querySelector('.toast-icon').textContent = '📧';
    toast.querySelector('div > div:first-child').textContent = 'Newsletter Subscribed!';
    toast.querySelector('div > div:last-child').textContent = 'You\'ll receive your first issue soon.';
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        toast.querySelector('.toast-icon').textContent = '✅';
        toast.querySelector('div > div:first-child').textContent = 'Enquiry Submitted!';
        toast.querySelector('div > div:last-child').textContent = 'Our team will contact you within 24 hours.';
      }, 500);
    }, 4000);
    setTimeout(() => { input.placeholder = 'your@email.com'; }, 3000);
  });
})();


// ─── Sensor Ring Entrance Animation ───────────────────────
(function initSensorRings() {
  const rings = qsa('.sensor-ring-fill');
  const ringIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        qsa('.sensor-ring-fill', entry.target).forEach(ring => {
          const finalOffset = ring.getAttribute('stroke-dashoffset');
          ring.style.strokeDashoffset = '251.2';
          requestAnimationFrame(() => {
            ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1) 0.3s';
            ring.style.strokeDashoffset = finalOffset;
          });
        });
        ringIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  qsa('.sensor-visual').forEach(el => ringIo.observe(el));
})();


// ─── Parallax Hero Orbs (subtle) ──────────────────────────
(function initParallax() {
  const orbs = qsa('.hero-orb');
  if (orbs.length === 0) return;

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 0.4;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px) scale(1)`;
    });
  }, { passive: true });
})();


// ─── Active nav highlight on scroll ───────────────────────
(function initActiveNav() {
  const sections = qsa('section[id], div[id]');
  const navLinks = qsa('.nav-links a');

  const sectionIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'white';
            link.style.fontWeight = '600';
          } else {
            link.style.fontWeight = '';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionIo.observe(s));
})();


// ─── Step items: hover number colour is in CSS ─────────────
// Ensure smooth reveal when reaching "How It Works" section
(function initSteps() {
  const stepsIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        qsa('.step-item', entry.target).forEach((step, i) => {
          setTimeout(() => step.classList.add('visible'), i * 150);
        });
        stepsIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  qsa('.steps-grid').forEach(el => stepsIo.observe(el));
})();


// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Ensure all reveal items already in viewport get shown
  qsa('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });

  console.log('%c💧 QUBECSENSE LLP', 'font-size:20px;font-weight:800;color:#26c6da;');
  console.log('%cSave Water. Save The Future. — qubecsense.in', 'color:#66bb6a;font-size:13px;');
});
