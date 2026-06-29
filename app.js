/**
 * BatiBid Redesign - Client-side Interactive Application Logic
 * Implements: Dynamic template preloading, Hash-based routing, Mock database,
 * 360° interactive Canvas, Payment simulation, Drawer search panel, Password validation.
 */

// ==========================================
// MOCK DATABASE & STATE
// (mockDb, mockUsers, mockBiens, mockTransactions, mockIncidents,
//  mockNotifications - définis dans js/db.js chargé avant ce fichier)
// ==========================================

// Global App State
let state = {
  currentUser: null,
  activeView: "#home",
  authOnboardingStep: 1,
  authSelectedRole: "",
  authLocataireGere: false,
  currentFilter: {
    city: "",
    radius: 5,
    types: ["appartement", "maison", "bureau"], // default checked
    minPrice: 0,
    maxPrice: 2000000,
    rooms: 1 // default active
  },
  currentCoords: null,
  catalogViewMode: 'list',
  currentViewingPropertyId: null,
  activeTestimonialIdx: 0,
  panoramaYaw: 0,
  isDraggingPanorama: false,
  lastMouseX: 0
};

// ==========================================
// CLIENT ROUTER & DYNAMIC PRELOADER
// ==========================================
async function loadAllPages() {
  const pages = ['home', 'gerer', 'faire-louer', 'trouver', 'construire', 'conseils-juridiques', 'partenariats', 'blog', 'contact', 'auth', 'dashboard', 'detail', 'pay', 'invoices', 'invoice-detail-view'];
  try {
    await Promise.all(pages.map(async page => {
      // Use dynamic timestamp to prevent browser caching of HTML templates
      const res = await fetch(`pages/${page}.html?v=${Date.now()}`);
      if (!res.ok) throw new Error(`Impossible de charger la page: ${page}`);
      const html = await res.text();
      const el = document.getElementById(page);
      if (el) el.innerHTML = html;
    }));
  } catch (error) {
    console.error("Erreur de préchargement des pages:", error);
  }
}

function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || "#home";
  state.activeView = hash;
  
  // Update UI sections visibility
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
  });
  
  let targetView = document.querySelector(hash);
  if (!targetView) {
    targetView = document.querySelector("#home");
    state.activeView = "#home";
  }
  
  targetView.classList.add("active");
  
  // Highlight active link in header
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === hash) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Hide footer & scroll bar on full-screen pages (dashboard, pay, invoices)
  const fullScreenPages = ["#dashboard", "#pay", "#invoice-detail-view"];
  const footer = document.querySelector(".footer");
  const scrollBar = document.getElementById("scroll-progress-bar");
  const mobileStickyCta = document.getElementById("mobile-sticky-cta");
  const isDashboard = fullScreenPages.some(p => hash.startsWith(p));
  if (footer)    footer.style.display    = isDashboard ? "none"  : "";
  if (scrollBar) scrollBar.style.display = isDashboard ? "none"  : "";
  if (mobileStickyCta) mobileStickyCta.style.display = (isDashboard || state.currentUser) ? "none" : "";

  // Toggle dashboard body class
  if (isDashboard) {
    document.body.classList.add("dashboard-active-mode");
  } else {
    document.body.classList.remove("dashboard-active-mode");
  }

  window.scrollTo(0, 0);

  // Trigger view-specific initializations
  onViewLoad(hash);
}

function onViewLoad(hash) {
  // Trigger scroll animations on all public pages
  const publicPages = ['#home', '#gerer', '#faire-louer', '#trouver', '#construire', '#conseils-juridiques', '#partenariats', '#blog', '#contact'];
  if (publicPages.some(p => hash.startsWith(p))) {
    setTimeout(initScrollAnimations, 150);
  }

  if (hash === "#home") {
    renderTestimonials();
    renderTestimonialsGrid();
    setTimeout(initCounterUp, 300);
  } else if (hash === "#conseils-juridiques") {
    setTimeout(initCounterUp, 300);
  } else if (hash === "#trouver") {
    showPropertySkeletons(6);
    initSearchFilters();
    setTimeout(() => {
      renderPropertyList();
      updateRadiusSlider();
    }, 600);
  } else if (hash === "#detail") {
    renderPropertyDetails();
  } else if (hash === "#pay") {
    initPaymentForm();
  } else if (hash === "#invoices") {
    renderInvoicesTable();
  } else if (hash === "#dashboard") {
    renderDashboard();
  } else if (hash === "#auth") {
    toggleAuthForm('register');
  }
}

function navigateTo(hash) {
  window.location.hash = hash;
}

// ==========================================
// MOBILE MENU
// ==========================================
function toggleMobileMenu() {
  const overlay = document.getElementById("mobile-nav-overlay");
  if (!overlay) return;
  const isOpen = overlay.classList.contains("open");
  if (isOpen) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  } else {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

// Close mobile menu when clicking on the backdrop
document.addEventListener("DOMContentLoaded", function() {
  const overlay = document.getElementById("mobile-nav-overlay");
  if (overlay) {
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) {
        toggleMobileMenu();
      }
    });
  }
  
  // Initialize radius slider fill on first load
  setTimeout(() => {
    updateRadiusSlider();
  }, 800);
});

// Update radius slider track fill dynamically
function updateRadiusSlider() {
  const slider = document.getElementById("search-radius-input");
  if (!slider) return;
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #D95E2B 0%, #D95E2B ${pct}%, #E2E2E2 ${pct}%, #E2E2E2 100%)`;
}

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
window.addEventListener("scroll", function() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = pct + "%";
}, { passive: true });

// ==========================================
// COUNTER-UP ANIMATION (IntersectionObserver)
// ==========================================
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = Math.ceil(target / (duration / 16));
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString("fr-FR");
  }, 16);
}

function initCounterUp() {
  const counters = document.querySelectorAll(".counter-num[data-target]");
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = "1";
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ==========================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ==========================================
let _scrollAnimObserver = null;

function initScrollAnimations() {
  // Disconnect previous observer to avoid leaks on SPA navigation
  if (_scrollAnimObserver) {
    _scrollAnimObserver.disconnect();
  }

  _scrollAnimObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Stagger children: animate each child with an increasing delay
      if (el.classList.contains('stagger-children')) {
        Array.from(el.children).forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('is-visible');
          }, i * 100);
        });
        el.classList.add('is-visible');
      } else {
        el.classList.add('is-visible');
      }

      _scrollAnimObserver.unobserve(el);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  // Observe all animatable elements in the current active view
  const activeView = document.querySelector('.view-section.active');
  if (!activeView) return;

  const selectors = [
    '.reveal', '.reveal-left', '.reveal-right', '.reveal-scale',
    '.stagger-children', '.timeline-step'
  ];

  activeView.querySelectorAll(selectors.join(', ')).forEach(el => {
    // Reset visibility for re-entry on SPA navigation
    el.classList.remove('is-visible');
    if (el.classList.contains('stagger-children')) {
      Array.from(el.children).forEach(child => child.classList.remove('is-visible'));
    }
    _scrollAnimObserver.observe(el);
  });
}

// ==========================================
// SKELETON LOADER FOR PROPERTY CARDS
// ==========================================
function showPropertySkeletons(count = 6) {
  const grid = document.querySelector(".properties-list-grid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line-short"></div>
        <div class="skeleton skeleton-line-mid"></div>
        <div class="skeleton skeleton-line-full"></div>
        <div class="skeleton skeleton-line-full"></div>
      </div>
    `;
    grid.appendChild(card);
  }
}

// ==========================================
// CONTACT FORM MULTI-STEP NAVIGATION
// ==========================================
function nextContactStep(step) {
  // Validate current step first
  const current = step - 1;
  if (current === 1) {
    const name = document.getElementById("contact-name");
    if (name && !name.value.trim()) { name.focus(); return; }
  } else if (current === 2) {
    const email = document.getElementById("contact-email");
    if (email && (!email.value.trim() || !email.value.includes("@"))) { email.focus(); return; }
  }
  showContactStep(step);
}

function prevContactStep(step) {
  showContactStep(step);
}

function showContactStep(step) {
  [1, 2, 3].forEach(s => {
    const el = document.getElementById(`contact-step-${s}`);
    if (el) el.style.display = s === step ? "block" : "none";
    const stepEl = document.getElementById(`cp-step-${s}`);
    if (stepEl) {
      stepEl.classList.remove("active", "done");
      if (s < step) stepEl.classList.add("done");
      if (s === step) stepEl.classList.add("active");
    }
  });
  const fill = document.getElementById("cp-progress-fill");
  if (fill) fill.style.width = `${Math.round((step / 3) * 100)}%`;
}

function submitContactForm(e) {
  e.preventDefault();
  const msg = document.getElementById("contact-msg");
  if (msg && !msg.value.trim()) { msg.focus(); return; }
  // Mark step 3 as done
  const stepEl = document.getElementById("cp-step-3");
  if (stepEl) { stepEl.classList.remove("active"); stepEl.classList.add("done"); }
  const fill = document.getElementById("cp-progress-fill");
  if (fill) fill.style.width = "100%";
  showAlert("success", "Message envoyé !", "Notre équipe reviendra vers vous sous 24 heures.");
}

// ==========================================
// MOBILE STICKY CTA - Toggle on auth state
// ==========================================
function updateMobileStickyCtaVisibility() {
  const cta = document.getElementById("mobile-sticky-cta");
  if (!cta) return;
  cta.style.display = state.currentUser ? "none" : "";
}

// ==========================================
// PARTENARIATS FORM VALIDATION
// ==========================================
function validatePartnerName(input) {
  const val = input.value.trim();
  const hint = document.getElementById("partner-name-hint");
  if (val.length < 3) {
    input.style.borderColor = "var(--error)";
    if (hint) { hint.textContent = "Minimum 3 caractères requis."; hint.style.color = "var(--error)"; }
    return false;
  }
  input.style.borderColor = "var(--success)";
  if (hint) { hint.textContent = "✓"; hint.style.color = "var(--success)"; }
  return true;
}

function validatePartnerPhone(input) {
  const val = input.value.replace(/\s+/g, "");
  const hint = document.getElementById("partner-phone-hint");
  // Accept: 01XXXXXXXX (10 digits starting with 01) or +22901XXXXXXXX
  const beninLocal = /^01\d{8}$/.test(val);
  const beninIntl  = /^\+22901\d{8}$/.test(val);
  if (!beninLocal && !beninIntl) {
    input.style.borderColor = "var(--error)";
    if (hint) { hint.textContent = "Format invalide. Utilisez : 01 XX XX XX XX (10 chiffres)"; hint.style.color = "var(--error)"; }
    return false;
  }
  input.style.borderColor = "var(--success)";
  if (hint) { hint.textContent = "✓ Numéro valide"; hint.style.color = "var(--success)"; }
  return true;
}

function handlePartnerTypeChange(select) {
  const autreGroup = document.getElementById("partner-autre-group");
  if (!autreGroup) return;
  if (select.value === "autre") {
    autreGroup.style.display = "block";
    document.getElementById("partner-autre").required = true;
  } else {
    autreGroup.style.display = "none";
    document.getElementById("partner-autre").required = false;
    document.getElementById("partner-autre").value = "";
  }
}

function submitPartnerForm(event) {
  event.preventDefault();
  const nameInput = document.getElementById("partner-name");
  const phoneInput = document.getElementById("partner-phone");
  const typeSelect = document.getElementById("partner-type");

  let valid = true;
  if (!validatePartnerName(nameInput)) valid = false;
  if (!validatePartnerPhone(phoneInput)) valid = false;
  if (!typeSelect.value) {
    typeSelect.style.borderColor = "var(--error)";
    valid = false;
  }
  if (typeSelect.value === "autre") {
    const autreInput = document.getElementById("partner-autre");
    if (!autreInput.value.trim()) {
      autreInput.style.borderColor = "var(--error)";
      valid = false;
    }
  }
  if (!valid) {
    showAlert("error", "Formulaire incomplet", "Veuillez corriger les champs en rouge avant d'envoyer votre demande.");
    return;
  }
  showAlert("success", "Demande reçue !", "Notre responsable partenariats prendra contact avec vous sous 48h. Merci de votre intérêt pour BatiBid !");
  event.target.reset();
  // Reset visual states
  ["partner-name","partner-phone","partner-type"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.borderColor = "";
  });
  document.getElementById("partner-autre-group").style.display = "none";
  document.getElementById("partner-name-hint").textContent = "";
  document.getElementById("partner-phone-hint").textContent = "Format : 01 XX XX XX XX (nouveau format béninois)";
}

// ==========================================
// TESTIMONIALS GRID (Rich cards with stars & initials)
// ==========================================
const testimonialAvatars = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=100"
];

function renderTestimonials() {
  // Legacy slider support (keep for any remaining slider references)
  const sliderContainer = document.getElementById("testimonial-slider-content");
  if (sliderContainer) {
    sliderContainer.innerHTML = "";
    mockDb.testimonials.forEach((t, idx) => {
      const card = document.createElement("div");
      card.className = `testimonial-card ${idx === state.activeTestimonialIdx ? "active" : ""}`;
      card.innerHTML = `<p class="testimonial-quote">"${t.quote}"</p><div class="testimonial-avatar">${t.author.charAt(0)}</div><h4 class="testimonial-author">${t.author}</h4><p class="testimonial-role">${t.role}</p>`;
      sliderContainer.appendChild(card);
    });
  }
  // New rich grid
  renderTestimonialsGrid();
}

function renderTestimonialsGrid() {
  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;
  grid.innerHTML = "";
  mockDb.testimonials.forEach((t, idx) => {
    const initials = t.author.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const hasPhoto = idx < testimonialAvatars.length;
    const stars = `<span class="testimonial-stars">${'<i class="fas fa-star"></i>'.repeat(5)}</span>`;
    const avatarContent = hasPhoto
      ? `<img src="${testimonialAvatars[idx]}" alt="${t.author}">`
      : initials;
    const card = document.createElement("div");
    card.className = "testimonial-card-rich";
    card.innerHTML = `
      ${stars}
      <p class="testimonial-text">${t.quote}</p>
      <div class="testimonial-author-row">
        <div class="testimonial-author-avatar">${avatarContent}</div>
        <div>
          <div class="testimonial-author-name">${t.author}</div>
          <div class="testimonial-author-role">${t.role}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function slideTestimonial(direction) {
  const len = mockDb.testimonials.length;
  if (direction === "next") {
    state.activeTestimonialIdx = (state.activeTestimonialIdx + 1) % len;
  } else {
    state.activeTestimonialIdx = (state.activeTestimonialIdx - 1 + len) % len;
  }
  renderTestimonials();
}

// ==========================================
// INTEGRATED AUTHENTICATION & ONBOARDING SYSTEM
// ==========================================
function selectAuthRole(role) {
  state.authSelectedRole = role;
  document.querySelectorAll(".auth-role-card").forEach(c => {
    c.classList.remove("selected");
  });
  const card = document.getElementById(`auth-role-${role}`);
  if (card) card.classList.add("selected");
  const nextBtn = document.getElementById("auth-next-1");
  if (nextBtn) nextBtn.removeAttribute("disabled");
  
  // Toggle formula visibility (proprietaire only)
  const formulaGroup = document.getElementById("auth-formula-group");
  if (formulaGroup) {
    formulaGroup.style.display = role === "proprietaire" ? "block" : "none";
  }

  // Toggle locataire-type checkbox (locataire only)
  const locataireGroup = document.getElementById("auth-locataire-type-group");
  if (locataireGroup) {
    locataireGroup.style.display = role === "locataire" ? "block" : "none";
  }
  // Reset locataire sub-type when role changes
  state.authLocataireGere = false;
  const gereCheckbox = document.getElementById("auth-locataire-gere");
  if (gereCheckbox) gereCheckbox.checked = false;
}

function nextAuthStep() {
  if (!state.authSelectedRole) return;
  state.authOnboardingStep = 2;
  document.getElementById("auth-step-1-view").classList.remove("active");
  document.getElementById("auth-step-2-view").classList.add("active");
  document.getElementById("auth-step-indicator-2").classList.add("active");
  document.getElementById("auth-step-indicator-1").classList.remove("active");
  document.getElementById("auth-step-indicator-1").classList.add("completed");
}

function prevAuthStep() {
  state.authOnboardingStep = 1;
  document.getElementById("auth-step-2-view").classList.remove("active");
  document.getElementById("auth-step-1-view").classList.add("active");
  document.getElementById("auth-step-indicator-2").classList.remove("active");
  document.getElementById("auth-step-indicator-1").classList.remove("completed");
  document.getElementById("auth-step-indicator-1").classList.add("active");
}

function toggleAuthForm(mode) {
  const registerView = document.getElementById("auth-register-view");
  const loginView = document.getElementById("auth-login-view");
  
  if (mode === "login") {
    if (registerView) registerView.classList.remove("active");
    if (loginView) loginView.classList.add("active");
  } else {
    if (loginView) loginView.classList.remove("active");
    if (registerView) registerView.classList.add("active");
  }
}

function focusLogin() {
  const emailInput = document.getElementById("login-email");
  if (emailInput) {
    emailInput.focus();
    emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function updateCriterion(id, isValid, text) {
  const el = document.getElementById(id);
  if (!el) return;
  if (isValid) {
    el.classList.add("valid");
    el.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> ${text}`;
  } else {
    el.classList.remove("valid");
    el.innerHTML = `<i class="fas fa-circle-notch" style="color: var(--gray-500);"></i> ${text}`;
  }
}

function validatePasswordStrength() {
  const password = document.getElementById("auth-reg-password").value;
  
  const lengthValid = password.length >= 8;
  const upperValid = /[A-Z]/.test(password);
  const numberValid = /[0-9]/.test(password);
  const specialValid = /[^A-Za-z0-9]/.test(password);
  
  updateCriterion("crit-length", lengthValid, "Au moins 8 caractères");
  updateCriterion("crit-upper", upperValid, "Une lettre majuscule");
  updateCriterion("crit-number", numberValid, "Un chiffre (0-9)");
  updateCriterion("crit-special", specialValid, "Un caractère spécial (ex: @, #, $, !)");
  
  const allValid = lengthValid && upperValid && numberValid && specialValid;
  const submitBtn = document.getElementById("auth-reg-submit-btn");
  if (submitBtn) {
    if (allValid) {
      submitBtn.removeAttribute("disabled");
    } else {
      submitBtn.setAttribute("disabled", "true");
    }
  }
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById("login-email");
  const pwdInput   = document.getElementById("login-password");
  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const pwd   = pwdInput   ? pwdInput.value : "";

  // Lookup in mockUsers
  const found = (typeof mockUsers !== "undefined")
    ? mockUsers.find(u => u.email.toLowerCase() === email && u.password === pwd)
    : null;

  if (!found) {
    showAlert("error", "Identifiants incorrects",
      "Vérifiez votre email et mot de passe. Comptes démo :\n• simplice@batibid.com\n• marie@batibid.com\n• jean@batibid.com\n• carine@batibid.com\nMot de passe : Demo@1234");
    return;
  }

  state.currentUser = { ...found };
  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
  updateHeaderAuth();
  updateMobileStickyCtaVisibility();
  navigateTo("#dashboard");
  showAlert("success", "Connexion réussie !", `Bienvenue, ${found.name.split(" ")[1]} !`);
}

function handleAuthRegisterSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById("auth-reg-name").value;
  const email = document.getElementById("auth-reg-email").value;
  const phone = document.getElementById("auth-reg-phone").value;
  const formulaSelect = document.getElementById("auth-reg-formula");
  const formula = formulaSelect ? formulaSelect.value : "";
  
  state.currentUser = {
    name: name || "Utilisateur BatiBid",
    email: email || "user@batibid.com",
    phone: phone || "+229 97 00 00 00",
    role: state.authSelectedRole,
    formula: formula,
    locataireGere: state.authLocataireGere || false  // true = géré par BatiBid, false = locataire chercheur
  };
  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
  
  updateHeaderAuth();
  updateMobileStickyCtaVisibility();
  navigateTo("#dashboard");
  
  // Personalized success message based on locataire sub-type
  if (state.currentUser.role === "locataire" && state.currentUser.locataireGere) {
    showAlert("success", "Compte créé !", "Bienvenue ! Votre espace locataire BatiBid vous permet de payer votre loyer et de signaler des incidents en ligne.");
  } else {
    showAlert("success", "Profil créé !", "Votre compte a été configuré avec succès.");
  }
  
  // Reset fields
  state.authOnboardingStep = 1;
  state.authSelectedRole = "";
  document.getElementById("auth-reg-name").value = "";
  document.getElementById("auth-reg-phone").value = "";
  document.getElementById("auth-reg-email").value = "";
  document.getElementById("auth-reg-password").value = "";
  prevAuthStep();
}

function handleLogout() {
  state.currentUser = null;
  localStorage.removeItem("currentUser");
  updateHeaderAuth();
  navigateTo("#home");
  showAlert("info", "Déconnexion", "Vous avez été déconnecté avec succès.");
}

function updateHeaderAuth() {
  const visitorActions = document.getElementById("header-visitor-actions");
  const userActions = document.getElementById("header-user-actions");
  const navMenu = document.getElementById("header-nav-menu");
  const mobileLinks = document.getElementById("mobile-nav-links");
  const mobileFooter = document.querySelector(".mobile-nav-footer");
  const mobileStickyCta = document.getElementById("mobile-sticky-cta");
  
  if (state.currentUser) {
    if (visitorActions) visitorActions.style.display = "none";
    if (userActions) userActions.style.display = "flex";
    const usernameEl = document.getElementById("header-username");
    if (usernameEl) usernameEl.innerText = state.currentUser.name;
    
    if (navMenu) {
      navMenu.innerHTML = `
        <a href="#dashboard" class="nav-link">Mon Espace</a>
        <a href="#blog" class="nav-link">Blog</a>
      `;
    }

    if (mobileLinks) {
      mobileLinks.innerHTML = `
        <a href="#dashboard" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-th-large"></i> Mon Espace</a>
        <a href="#blog" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-newspaper"></i> Blog</a>
      `;
    }

    if (mobileFooter) {
      mobileFooter.innerHTML = `
        <button class="btn btn-secondary" style="width: 100%; border-color: var(--gray-400);" onclick="toggleMobileMenu(); handleLogout()">
          <i class="fas fa-sign-out-alt"></i> Quitter
        </button>
      `;
    }

    if (mobileStickyCta) {
      mobileStickyCta.style.display = "none";
    }
  } else {
    if (visitorActions) visitorActions.style.display = "flex";
    if (userActions) userActions.style.display = "none";
    
    if (navMenu) {
      navMenu.innerHTML = `
        <a href="#gerer" class="nav-link">Gérer</a>
        <a href="#faire-louer" class="nav-link">Faire louer</a>
        <a href="#construire" class="nav-link">Construire &amp; Rénover</a>
        <a href="#conseils-juridiques" class="nav-link">Conseils Juridiques</a>
        <div class="dropdown">
          <a class="nav-link" style="display: flex; align-items: center; gap: 0.25rem;">
            Découvrir Plus <i class="fas fa-chevron-down" style="font-size: 0.75rem;"></i>
          </a>
          <div class="dropdown-menu">
            <a href="#partenariats"><i class="fas fa-handshake" style="margin-right: 0.5rem; color: var(--primary);"></i> Partenariats</a>
            <a href="#blog"><i class="fas fa-newspaper" style="margin-right: 0.5rem; color: var(--primary);"></i> Blog</a>
            <a href="#contact"><i class="fas fa-envelope" style="margin-right: 0.5rem; color: var(--primary);"></i> Contact</a>
          </div>
        </div>
      `;
    }

    if (mobileLinks) {
      mobileLinks.innerHTML = `
        <a href="#home" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-home"></i> Accueil</a>
        <a href="#gerer" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-key"></i> Gérer</a>
        <a href="#faire-louer" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-bullhorn"></i> Faire louer</a>
        <a href="#trouver" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-search"></i> Trouver une location</a>
        <a href="#construire" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-hard-hat"></i> Construire &amp; Rénover</a>
        <a href="#conseils-juridiques" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-balance-scale"></i> Conseils Juridiques</a>
        <div class="mobile-nav-divider"></div>
        <a href="#partenariats" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-handshake"></i> Partenariats</a>
        <a href="#blog" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-newspaper"></i> Blog</a>
        <a href="#contact" class="mobile-nav-link" onclick="toggleMobileMenu()"><i class="fas fa-envelope"></i> Contact</a>
      `;
    }

    if (mobileFooter) {
      mobileFooter.innerHTML = `
        <a href="#auth" class="btn btn-primary" style="width: 100%;" onclick="toggleMobileMenu()">
          <i class="fas fa-user" style="margin-right: 0.5rem;"></i> S'identifier
        </a>
      `;
    }

    if (mobileStickyCta) {
      const hash = window.location.hash || "#home";
      const fullScreenPages = ["#dashboard", "#pay", "#invoice-detail-view"];
      const isDashboard = fullScreenPages.some(p => hash.startsWith(p));
      mobileStickyCta.style.display = isDashboard ? "none" : "";
    }
  }
}


// ==========================================
// SEARCH FILTERS & CATALOG
// ==========================================
let currentSortMode = "recent";
let catalogMap = null;
let catalogMapCircle = null;
let catalogMapMarkers = [];

function initSearchFilters() {
  const cityInput = document.getElementById("search-city-input");
  const budgetMin = document.getElementById("budget-min");
  const budgetMax = document.getElementById("budget-max");
  const radiusInput = document.getElementById("search-radius-input");
  const radiusDisplay = document.getElementById("radius-display");
  
  if (!cityInput) return;
  
  cityInput.value = state.currentFilter.city;
  budgetMin.value = state.currentFilter.minPrice || "";
  budgetMax.value = state.currentFilter.maxPrice || "";
  
  if (radiusInput) {
    radiusInput.value = state.currentFilter.radius || 5;
    if (radiusDisplay) {
      radiusDisplay.textContent = radiusInput.value + " km";
    }
    updateRadiusSlider();
  }
  
  document.querySelectorAll("input[name='type-bien']").forEach(cb => {
    cb.checked = state.currentFilter.types.includes(cb.value);
  });
  
  document.querySelectorAll(".rooms-btn").forEach(btn => {
    const rVal = parseInt(btn.innerText);
    if (rVal === state.currentFilter.rooms) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
    
    // Clean old listeners to prevent duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", () => {
      document.querySelectorAll(".rooms-btn").forEach(b => b.classList.remove("active"));
      newBtn.classList.add("active");
    });
  });
}

function applySearchFilters() {
  const checkedTypes = [];
  document.querySelectorAll("input[name='type-bien']:checked").forEach(cb => {
    checkedTypes.push(cb.value);
  });
  
  const minPrice = parseInt(document.getElementById("budget-min").value) || 0;
  const maxPrice = parseInt(document.getElementById("budget-max").value) || 2000000;
  
  const activeRoomsBtn = document.querySelector(".rooms-btn.active");
  const roomsVal = activeRoomsBtn ? parseInt(activeRoomsBtn.innerText) : 1;
  
  const radiusInput = document.getElementById("search-radius-input");
  const radiusVal = radiusInput ? parseInt(radiusInput.value) : 5;
  
  state.currentFilter = {
    city: document.getElementById("search-city-input").value.trim(),
    radius: radiusVal,
    types: checkedTypes,
    minPrice: minPrice,
    maxPrice: maxPrice,
    rooms: roomsVal
  };
  
  updateGeocodingAndRender();
}

window.resetSearchFilters = function() {
  state.currentFilter = {
    city: "",
    radius: 5,
    types: ["appartement", "maison", "bureau"],
    minPrice: 0,
    maxPrice: 2000000,
    rooms: 1
  };
  state.currentCoords = null;
  initSearchFilters();
  applySearchFilters();
};

async function updateGeocodingAndRender() {
  if (state.currentFilter.city) {
    const coords = await getCoordinatesForQuery(state.currentFilter.city);
    state.currentCoords = coords;
  } else {
    state.currentCoords = null;
  }
  
  renderPropertyList();
  
  // If map container is visible, update Leaflet map
  const mapContainer = document.getElementById("catalog-map-container");
  if (mapContainer && mapContainer.style.display !== "none") {
    initCatalogMap();
  }
}

async function getCoordinatesForQuery(query) {
  const mockCoords = {
    "cotonou": { lat: 6.36, lng: 2.41 },
    "calavi": { lat: 6.42, lng: 2.30 },
    "abomey-calavi": { lat: 6.42, lng: 2.30 },
    "haie vive": { lat: 6.362, lng: 2.397 },
    "fidjrossè": { lat: 6.364, lng: 2.368 },
    "ganhi": { lat: 6.353, lng: 2.433 },
    "cadjehoun": { lat: 6.365, lng: 2.411 },
    "cocotomey": { lat: 6.422, lng: 2.302 }
  };
  
  const clean = query.toLowerCase().trim();
  for (const key in mockCoords) {
    if (clean.includes(key)) {
      return mockCoords[key];
    }
  }
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Benin')}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim Geocoding API failed, using fallback.", err);
  }
  
  return { lat: 6.36, lng: 2.41 };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

window.switchCatalogViewMode = function(mode) {
  state.catalogViewMode = mode;
  const listGrid = document.querySelector(".properties-list-grid");
  const mapContainer = document.getElementById("catalog-map-container");
  const listBtn = document.getElementById("view-mode-list-btn");
  const mapBtn = document.getElementById("view-mode-map-btn");
  
  if (!listGrid || !mapContainer) return;
  
  if (mode === 'map') {
    listGrid.style.display = 'none';
    mapContainer.style.display = 'block';
    if (listBtn) listBtn.classList.remove('active');
    if (mapBtn) mapBtn.classList.add('active');
    
    setTimeout(() => {
      initCatalogMap();
    }, 100);
  } else {
    listGrid.style.display = 'grid';
    mapContainer.style.display = 'none';
    if (listBtn) listBtn.classList.add('active');
    if (mapBtn) mapBtn.classList.remove('active');
  }
};

window.sortCatalogProperties = function(sortVal) {
  currentSortMode = sortVal;
  renderPropertyList();
};

function initCatalogMap() {
  const mapElement = document.getElementById("catalog-map");
  if (!mapElement) return;
  
  if (catalogMap) {
    catalogMap.invalidateSize();
    updateCatalogMap();
    return;
  }
  
  const startLat = state.currentCoords ? state.currentCoords.lat : 6.36;
  const startLng = state.currentCoords ? state.currentCoords.lng : 2.41;
  
  catalogMap = L.map('catalog-map').setView([startLat, startLng], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(catalogMap);
  
  catalogMap.on('click', function(e) {
    updateSearchCenterByCoords(e.latlng.lat, e.latlng.lng, "Point sélectionné sur la carte");
  });
  
  updateCatalogMap();
}

function updateCatalogMap() {
  if (!catalogMap) return;
  
  catalogMapMarkers.forEach(m => catalogMap.removeLayer(m));
  catalogMapMarkers = [];
  
  if (catalogMapCircle) {
    catalogMap.removeLayer(catalogMapCircle);
    catalogMapCircle = null;
  }
  
  if (state.currentCoords) {
    const center = [state.currentCoords.lat, state.currentCoords.lng];
    catalogMap.setView(center, getZoomLevelForRadius(state.currentFilter.radius));
    
    catalogMapCircle = L.circle(center, {
      color: '#D95E2B',
      fillColor: '#D95E2B',
      fillOpacity: 0.15,
      radius: state.currentFilter.radius * 1000
    }).addTo(catalogMap);
    
    const centerMarker = L.marker(center, {
      icon: L.divIcon({
        className: 'center-marker',
        html: '<div style="background-color: var(--secondary); color: var(--white); padding: 5px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; border: 1px solid var(--primary);box-shadow: 0 2px 10px rgba(0,0,0,0.15);"><i class="fas fa-search-location"></i> Centre</div>',
        iconSize: [60, 25],
        iconAnchor: [30, 12]
      })
    }).addTo(catalogMap);
    catalogMapMarkers.push(centerMarker);
  }
}

window.selectCarrefourCenter = function(value) {
  const coordsMap = {
    etoile: { lat: 6.3776, lng: 2.4243, label: "Étoile Rouge" },
    toyota: { lat: 6.3685, lng: 2.3995, label: "Carrefour Toyota" },
    cadjehoun: { lat: 6.3552, lng: 2.3942, label: "Carrefour Cadjehoun" },
    fidjrosse: { lat: 6.3631, lng: 2.3614, label: "Carrefour Fidjrossè" },
    sacre_coeur: { lat: 6.3664, lng: 2.4112, label: "Carrefour Sacré-Cœur" },
    ganhi: { lat: 6.3533, lng: 2.4355, label: "Ganhi (Trois Banques)" },
    arconville: { lat: 6.4384, lng: 2.3482, label: "Carrefour Arconville" },
    kpota: { lat: 6.4258, lng: 2.3551, label: "Carrefour Kpota" },
    iita: { lat: 6.4187, lng: 2.3361, label: "Carrefour IITA" },
    cocotomey: { lat: 6.4011, lng: 2.2789, label: "Carrefour Cocotomey" }
  };

  if (!value || !coordsMap[value]) {
    return;
  }

  const target = coordsMap[value];
  updateSearchCenterByCoords(target.lat, target.lng, target.label);
};

window.updateSearchCenterByCoords = function(lat, lng, label) {
  state.currentCoords = { lat, lng };
  state.currentFilter.city = label;
  
  const input = document.getElementById("search-city-input");
  if (input) {
    input.value = label;
  }
  
  const select = document.getElementById("filter-carrefour");
  if (select) {
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value && select.options[i].text.includes(label)) {
        select.value = select.options[i].value;
        found = true;
        break;
      }
    }
    if (!found) {
      select.value = "";
    }
  }
  
  updateCatalogMap();
  renderPropertyList();
};

function getZoomLevelForRadius(radiusKm) {
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 25) return 11;
  return 10;
}

function renderPropertyList() {
  const listContainer = document.querySelector(".properties-list-grid");
  if (!listContainer) return;
  
  listContainer.innerHTML = "";
  
  let filtered = mockDb.properties.filter(p => {
    if (state.currentFilter.city) {
      if (state.currentCoords && p.latitude && p.longitude) {
        const dist = calculateDistance(state.currentCoords.lat, state.currentCoords.lng, p.latitude, p.longitude);
        p.currentDistance = dist;
        if (dist > state.currentFilter.radius) {
          return false;
        }
      } else {
        const cLower = state.currentFilter.city.toLowerCase();
        const matchCity = p.city.toLowerCase().includes(cLower);
        const matchAddr = p.address.toLowerCase().includes(cLower);
        if (!matchCity && !matchAddr) return false;
        p.currentDistance = null;
      }
    } else {
      p.currentDistance = null;
    }
    
    if (state.currentFilter.types.length > 0 && !state.currentFilter.types.includes(p.type)) {
      return false;
    }
    
    if (p.price < state.currentFilter.minPrice || p.price > state.currentFilter.maxPrice) {
      return false;
    }
    
    if (p.bedrooms < state.currentFilter.rooms && p.type !== "bureau") {
      return false;
    }
    
    return true;
  });
  
  // Sorting logic
  if (currentSortMode === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSortMode === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    filtered.sort((a, b) => b.id - a.id);
  }
  
  const badgeCount = document.getElementById("catalog-count-badge");
  if (badgeCount) {
    badgeCount.innerText = `${filtered.length} résultats trouvés`;
  }
  
  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center" style="grid-column: span 3; padding: 4rem 2rem;">
        <i class="fas fa-search-minus" style="font-size: 3rem; color: var(--gray-500); margin-bottom: 1rem;"></i>
        <h3 class="headline-md">Aucun bien ne correspond</h3>
        <p class="body-md" style="color: var(--gray-600);">Essayez d'élargir vos filtres ou d'augmenter le budget maximal.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "property-card";
    
    const isSaved = mockDb.savedProperties.includes(p.id);
    
    card.innerHTML = `
      <div class="property-card-img-wrapper">
        <img src="${p.image}" class="property-card-img" alt="${p.title}">
        <span class="property-card-badge" style="background-color: #ffebe6; color: var(--primary);">${p.status}</span>
        ${p.verified ? `<span class="property-card-badge" style="left: auto; right: 3.5rem; background-color: var(--success-light); color: var(--success);"><i class="fas fa-check-circle"></i> Vérifié</span>` : ''}
        <button class="property-card-save-btn ${isSaved ? "saved" : ""}" onclick="toggleSaveProperty(event, ${p.id})">
          <i class="${isSaved ? "fas" : "far"} fa-heart"></i>
        </button>
      </div>
      <div class="property-card-content">
        <div class="property-card-price">${formatCurrency(p.price)}<span>/mois</span></div>
        <h3 class="property-card-title">${p.title}</h3>
        <div class="property-card-location">
          <i class="fas fa-map-marker-alt"></i> ${p.address}, ${p.city}
          ${p.currentDistance !== undefined && p.currentDistance !== null ? `<span style="margin-left: 0.5rem; color: var(--primary); font-weight: 700;">(${p.currentDistance.toFixed(1)} km)</span>` : ''}
        </div>
        <div class="property-card-details">
          <span><i class="fas fa-ruler-combined"></i> ${p.surface}m²</span>
          <span><i class="fas fa-bed"></i> ${p.bedrooms} ch.</span>
          <span><i class="fas fa-bath"></i> ${p.bathrooms} sdb.</span>
        </div>
        <button class="btn btn-secondary mt-4" style="width: 100%;" onclick="viewPropertyDetails(${p.id})">
          <i class="fas fa-eye" style="margin-right: 0.5rem;"></i> Voir Détails
        </button>
      </div>
    `;
    listContainer.appendChild(card);
  });
}

function toggleSaveProperty(event, id) {
  event.stopPropagation();
  const idx = mockDb.savedProperties.indexOf(id);
  if (idx > -1) {
    mockDb.savedProperties.splice(idx, 1);
    showAlert("info", "Bien retiré !", "Le bien a été retiré de vos favoris.");
  } else {
    mockDb.savedProperties.push(id);
    showAlert("success", "Bien sauvegardé !", "Le bien a été ajouté à vos favoris.");
  }
  renderPropertyList();
}

function viewPropertyDetails(id) {
  state.currentViewingPropertyId = id;
  navigateTo("#detail");
}

// ==========================================
// CUSTOM SEARCH POP OVER (SLIDE-OVER DRAWER)
// ==========================================
function openCustomSearchModal() {
  const modal = document.getElementById("custom-search-modal");
  if (modal) modal.classList.add("active");
}

function closeCustomSearchModal() {
  const modal = document.getElementById("custom-search-modal");
  if (modal) modal.classList.remove("active");
}

function submitCustomSearch(event) {
  event.preventDefault();
  closeCustomSearchModal();
  showAlert("success", "Recherche personnalisée enregistrée !", "Votre demande de recherche a été prise en compte avec succès. Un agent BatiBid va vous contacter sur WhatsApp pour vous proposer des biens.");
}

// ==========================================
// RENT ESTIMATOR DRAWERS & LOGIC
// ==========================================
const neighborhoodsByCity = {
  cotonou: [
    { value: "haievive", label: "Haie Vive" },
    { value: "fidjrosse", label: "Fidjrossè" },
    { value: "cadjehoun", label: "Cadjehoun" },
    { value: "akpakpa", label: "Akpakpa" }
  ],
  calavi: [
    { value: "cocotomey", label: "Cocotomey" },
    { value: "zogbadje", label: "UAC / Zogbadjè" },
    { value: "tankpe", label: "Tankpè" }
  ],
  portonovo: [
    { value: "ouando", label: "Ouando" },
    { value: "tokpota", label: "Tokpota" }
  ]
};

function updateEstNeighborhoods() {
  const citySelect = document.getElementById("est-city");
  const neighSelect = document.getElementById("est-neighborhood");
  if (!citySelect || !neighSelect) return;
  
  const selectedCity = citySelect.value;
  const list = neighborhoodsByCity[selectedCity] || [];
  
  neighSelect.innerHTML = "";
  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.value;
    opt.innerText = item.label;
    neighSelect.appendChild(opt);
  });
}

function openRentEstimator() {
  const modal = document.getElementById("rent-estimator-modal");
  if (modal) modal.classList.add("active");
  const resContainer = document.getElementById("est-result-container");
  if (resContainer) resContainer.style.display = "none";
}

function closeRentEstimator() {
  const modal = document.getElementById("rent-estimator-modal");
  if (modal) modal.classList.remove("active");
}

function calculateRentEstimate(event) {
  event.preventDefault();
  
  const type = document.getElementById("est-type").value;
  const neighborhood = document.getElementById("est-neighborhood").value;
  const rooms = parseInt(document.getElementById("est-rooms").value) || 1;
  
  let basePrice = 100000;
  if (type === "maison") basePrice = 180000;
  else if (type === "studio") basePrice = 55000;
  else if (type === "bureau") basePrice = 220000;
  
  const neighborhoodMultipliers = {
    haievive: 1.8,
    fidjrosse: 1.4,
    cadjehoun: 1.3,
    akpakpa: 1.1,
    cocotomey: 0.8,
    zogbadje: 0.7,
    tankpe: 0.75,
    ouando: 0.6,
    tokpota: 0.55
  };
  
  const mult = neighborhoodMultipliers[neighborhood] || 1.0;
  
  let roomsMult = 1.0;
  if (rooms === 2) roomsMult = 1.5;
  else if (rooms === 3) roomsMult = 2.0;
  else if (rooms >= 4) roomsMult = 2.8;
  
  const estimated = basePrice * mult * roomsMult;
  
  const minVal = Math.round((estimated * 0.9) / 5000) * 5000;
  const maxVal = Math.round((estimated * 1.15) / 5000) * 5000;
  
  const formatVal = (val) => {
    return new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
      .format(val)
      .replace("XOF", "FCFA");
  };
  const resValue = document.getElementById("est-result-value");
  const resContainer = document.getElementById("est-result-container");
  
  if (resValue && resContainer) {
    resValue.innerText = `${formatVal(minVal)} - ${formatVal(maxVal)}`;
    resContainer.style.display = "block";
  }
}

// ==========================================
// PROPERTY DETAIL - GALLERY, VIDEO, 360°
// ==========================================
let detailGalleryIndex = 0;
let detailGalleryImages = [];

function renderPropertyDetails() {
  const p = mockDb.properties.find(item => item.id === state.currentViewingPropertyId) || mockDb.properties[0];
  detailGalleryIndex = 0;
  detailGalleryImages = p.images || [p.image];

  document.getElementById("detail-title").innerText = p.title;
  document.getElementById("detail-location").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${p.address}, ${p.city}`;
  document.getElementById("detail-desc").innerText = p.desc;
  document.getElementById("detail-beds").innerText = p.bedrooms;
  document.getElementById("detail-baths").innerText = p.bathrooms;
  document.getElementById("detail-surface").innerText = p.surface;
  document.getElementById("detail-type").innerText = p.type.charAt(0).toUpperCase() + p.type.slice(1);

  // Verified badge
  const badge = document.getElementById("detail-verified-badge");
  if (badge) badge.style.display = p.verified ? "inline-flex" : "none";

  // Video tab visibility
  const videoTabBtn = document.getElementById("detail-video-tab-btn");
  if (videoTabBtn) videoTabBtn.style.display = p.videoUrl ? "flex" : "none";

  // Populate gallery
  const mainImg = document.getElementById("detail-gallery-main-img");
  if (mainImg) mainImg.src = detailGalleryImages[0];
  updateGalleryCounter();
  renderGalleryThumbs();

  // CTA Box
  const ctaBox = document.getElementById("detail-cta-box");
  if (ctaBox) {
    ctaBox.innerHTML = `
      <div class="detail-cta-card">
        <h4 style="margin-bottom: 1rem;">Intéressé par ce bien ?</h4>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">${formatCurrency(p.price)} <span style="font-size:1rem; font-weight:600; color:var(--gray-600);">/mois</span></div>
        ${p.verified ? `<div class="detail-verified-badge" style="margin-bottom:1.25rem;"><i class="fas fa-shield-check"></i> Bien Vérifié BatiBid</div>` : ''}
        <p style="font-size: 0.85rem; color: var(--gray-600); margin-bottom: 1.5rem;">
          <i class="fas fa-shield-alt" style="color: var(--success); margin-right: 0.25rem;"></i> 
          Transactions sécurisées et garanties par BatiBid.
        </p>
        <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.75rem;" onclick="startRentPayment(${p.id})">
          <i class="fas fa-key" style="margin-right: 0.5rem;"></i> Louer maintenant
        </button>
        <a href="https://wa.me/22997000000" class="btn btn-secondary" target="_blank" style="width: 100%; margin-bottom: 0.75rem; text-align:center; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
          <i class="fab fa-whatsapp" style="color:#25D366;"></i> Contacter un agent
        </a>
        <button class="btn btn-secondary" style="width: 100%; border:none; color:var(--gray-600); font-size:0.85rem;" onclick="navigateTo('#trouver')">
          <i class="fas fa-arrow-left" style="margin-right:0.4rem;"></i> Retour aux biens
        </button>
      </div>
    `;
  }

  // Show gallery tab by default
  switchDetailTab('gallery', document.querySelector('.detail-tab-btn'));

  // Initialize 360
  init360Canvas(p.title);

  // Set video URL
  const iframe = document.getElementById("detail-video-iframe");
  if (iframe && p.videoUrl) {
    iframe.src = p.videoUrl;
  } else if (iframe) {
    iframe.src = "";
  }
}

function renderGalleryThumbs() {
  const container = document.getElementById("detail-gallery-thumbs");
  if (!container) return;
  container.innerHTML = detailGalleryImages.map((src, i) => `
    <div class="detail-gallery-thumb ${i === detailGalleryIndex ? 'active' : ''}" onclick="galleryGoTo(${i})">
      <img src="${src}" alt="Photo ${i + 1}">
    </div>
  `).join('');
}

function updateGalleryCounter() {
  const counter = document.getElementById("detail-gallery-counter");
  if (counter) counter.innerText = `${detailGalleryIndex + 1} / ${detailGalleryImages.length}`;
}

function galleryGoTo(idx) {
  detailGalleryIndex = idx;
  const mainImg = document.getElementById("detail-gallery-main-img");
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = detailGalleryImages[idx];
      mainImg.style.opacity = '1';
    }, 180);
  }
  updateGalleryCounter();
  renderGalleryThumbs();
}

function galleryPrev() {
  const newIdx = (detailGalleryIndex - 1 + detailGalleryImages.length) % detailGalleryImages.length;
  galleryGoTo(newIdx);
}

function galleryNext() {
  const newIdx = (detailGalleryIndex + 1) % detailGalleryImages.length;
  galleryGoTo(newIdx);
}

function switchDetailTab(tabName, btn) {
  // Hide all panels
  document.querySelectorAll('.detail-media-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
  // Show target panel
  const panel = document.getElementById(`detail-panel-${tabName}`);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
  // Re-init 360 canvas if switching to panorama
  if (tabName === 'panorama') {
    const p = mockDb.properties.find(item => item.id === state.currentViewingPropertyId) || mockDb.properties[0];
    setTimeout(() => init360Canvas(p.title), 50);
  }
}

function init360Canvas(title) {
  const canvas = document.getElementById("panorama-360");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  const resizeCanvas = () => {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height || 400;
  };
  
  resizeCanvas();
  state.panoramaYaw = 0;
  
  const drawRoom = () => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, h/2);
    ceilingGrad.addColorStop(0, "#2c2c2c");
    ceilingGrad.addColorStop(1, "#444444");
    ctx.fillStyle = ceilingGrad;
    ctx.fillRect(0, 0, w, h/2);
    
    const floorGrad = ctx.createLinearGradient(0, h/2, 0, h);
    floorGrad.addColorStop(0, "#FDF6ED");
    floorGrad.addColorStop(1, "#E5DACB");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h/2, w, h/2);
    
    const wallWidth = w * 0.8;
    const offset = (state.panoramaYaw % wallWidth);
    const colors = ["#FFFFFF", "#F9F9F9", "#E8E8E8", "#FFFFFF"];
    const textLabels = ["SALON PRINCIPAL", "Cuisine moderne", "Chambre principale", "Balcon vue dégagée"];
    
    for (let i = -2; i < 4; i++) {
      const xStart = offset + (i * wallWidth);
      ctx.fillStyle = colors[Math.abs(i) % colors.length];
      ctx.fillRect(xStart, h * 0.15, wallWidth, h * 0.7);
      
      ctx.strokeStyle = "rgba(28,28,28,0.08)";
      ctx.lineWidth = 2;
      ctx.strokeRect(xStart, h * 0.15, wallWidth, h * 0.7);
      
      ctx.fillStyle = "rgba(217, 94, 43, 0.05)";
      ctx.fillRect(xStart + wallWidth * 0.2, h * 0.25, wallWidth * 0.25, h * 0.4);
      ctx.strokeStyle = "var(--primary)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(xStart + wallWidth * 0.2, h * 0.25, wallWidth * 0.25, h * 0.4);
      
      ctx.fillStyle = "var(--secondary)";
      ctx.font = "bold 14px 'Hanken Grotesk'";
      ctx.textAlign = "center";
      ctx.fillText(textLabels[Math.abs(i) % textLabels.length], xStart + wallWidth / 2, h * 0.5);
    }
    
    ctx.fillStyle = "rgba(28, 28, 28, 0.7)";
    ctx.beginPath();
    ctx.arc(w - 50, 50, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - 50, 50);
    const angle = (state.panoramaYaw / wallWidth) * 2 * Math.PI;
    ctx.lineTo(w - 50 + 20 * Math.sin(angle), 50 - 20 * Math.cos(angle));
    ctx.stroke();
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 10px 'Hanken Grotesk'";
    ctx.fillText("N", w - 50, 32);
  };
  
  drawRoom();
  
  // Mouse drag
  canvas.addEventListener("mousedown", (e) => { state.isDraggingPanorama = true; state.lastMouseX = e.clientX; });
  window.addEventListener("mouseup", () => { state.isDraggingPanorama = false; });
  canvas.addEventListener("mousemove", (e) => {
    if (!state.isDraggingPanorama) return;
    const deltaX = e.clientX - state.lastMouseX;
    state.panoramaYaw += deltaX * 1.5;
    state.lastMouseX = e.clientX;
    drawRoom();
  });

  // Touch support for mobile
  canvas.addEventListener("touchstart", (e) => { state.isDraggingPanorama = true; state.lastMouseX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener("touchend", () => { state.isDraggingPanorama = false; });
  canvas.addEventListener("touchmove", (e) => {
    if (!state.isDraggingPanorama) return;
    const deltaX = e.touches[0].clientX - state.lastMouseX;
    state.panoramaYaw += deltaX * 1.5;
    state.lastMouseX = e.touches[0].clientX;
    drawRoom();
  }, { passive: true });
}

// ==========================================
// PAYMENT PROCESS & SIMULATOR
// ==========================================
let activePaymentProperty = null;

function startRentPayment(propertyId) {
  if (!state.currentUser) {
    navigateTo("#auth");
    showAlert("warning", "Connexion requise", "Veuillez vous connecter pour initier la location d'un bien.");
    return;
  }
  
  activePaymentProperty = mockDb.properties.find(p => p.id === propertyId);
  navigateTo("#pay");
}

function initPaymentForm() {
  if (!activePaymentProperty) {
    navigateTo("#trouver");
    return;
  }
  
  document.getElementById("pay-prop-title").innerText = activePaymentProperty.title;
  document.getElementById("pay-prop-price").innerText = formatCurrency(activePaymentProperty.price);
  document.getElementById("pay-total-amount").innerText = formatCurrency(activePaymentProperty.price);
  
  selectPaymentMethod("mtn");
}

function selectPaymentMethod(method) {
  document.querySelectorAll(".pay-method-btn").forEach(b => {
    b.classList.remove("selected");
  });
  document.getElementById(`method-${method}`).classList.add("selected");
  
  const labelPhone = document.getElementById("pay-phone-label");
  const phoneInput = document.getElementById("pay-phone-input");
  
  if (method === "mtn") {
    labelPhone.innerText = "Numéro MTN Mobile Money (MoMo)";
    phoneInput.placeholder = "Ex: 97 00 00 00";
  } else if (method === "moov") {
    labelPhone.innerText = "Numéro Moov Money (Flooz)";
    phoneInput.placeholder = "Ex: 95 00 00 00";
  } else {
    labelPhone.innerText = "Numéro Celtiis Cash";
    phoneInput.placeholder = "Ex: 40 00 00 00";
  }
}

function submitPayment(event) {
  event.preventDefault();
  
  const phone = document.getElementById("pay-phone-input").value;
  if (!phone) {
    showAlert("error", "Erreur de saisie", "Veuillez renseigner votre numéro de paiement.");
    return;
  }
  
  const modal = document.getElementById("ussd-simulator-modal");
  document.getElementById("ussd-modal-text").innerText = `BatiBid: Confirmez le paiement de ${formatCurrency(activePaymentProperty.price)} pour le bien "${activePaymentProperty.title}" en entrant votre code PIN de validation.`;
  modal.classList.add("active");
}

function cancelUssdPayment() {
  document.getElementById("ussd-simulator-modal").classList.remove("active");
  showAlert("error", "Paiement Annulé", "Vous avez annulé la transaction mobile money.");
}

function confirmUssdPayment() {
  document.getElementById("ussd-simulator-modal").classList.remove("active");
  
  if (state.currentUser && state.currentUser.role === "locataire" && state.currentUser.locataireGere) {
    if (typeof confirmPaymentP4 === "function") {
      confirmPaymentP4();
    }
    return;
  }
  
  if (state.currentUser && state.currentUser.role === "proprietaire" && state.currentUser.formula === "annonce") {
    if (typeof confirmBoostP2 === "function") {
      confirmBoostP2();
    }
    return;
  }
  
  const newTx = {
    id: "TX-" + Math.floor(1000 + Math.random() * 9000),
    date: getTodayDateString(),
    description: `Loyer initial - ${activePaymentProperty.title}`,
    amount: activePaymentProperty.price,
    method: document.querySelector(".pay-method-btn.selected").id.replace("method-", "").toUpperCase() + " Money",
    status: "Payé"
  };
  
  mockDb.transactions.unshift(newTx);
  showAlert("success", "Paiement validé !", "Votre reçu de paiement et votre contrat sont disponibles dans votre espace.");
  navigateTo("#invoices");
}

// ==========================================
// INVOICES & DATA TABLE
// ==========================================
function renderInvoicesTable() {
  const tbody = document.getElementById("invoices-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  mockDb.transactions.forEach(tx => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.date}</td>
      <td>${tx.description}</td>
      <td>${formatCurrency(tx.amount)}</td>
      <td>${tx.method}</td>
      <td><span class="status-badge success"><i class="fas fa-check-circle"></i> ${tx.status}</span></td>
      <td>
        <button class="btn btn-ghost" style="padding: 0.35rem 0.75rem;" onclick="viewInvoiceDetails('${tx.id}')">
          <i class="fas fa-file-invoice"></i> Voir
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function viewInvoiceDetails(txId) {
  const tx = mockDb.transactions.find(t => t.id === txId);
  const wrapper = document.getElementById("invoice-view-wrapper");
  if (!wrapper) return;
  
  wrapper.innerHTML = `
    <div class="invoice-wrapper">
      <div class="invoice-header">
        <div class="invoice-logo-side">
          <h2>Bati<span>Bid</span></h2>
          <p>Technologie immobilière sécurisée</p>
          <p>Cotonou, Bénin</p>
        </div>
        <div class="invoice-details-side">
          <h3>FACTURE QUITTANCE</h3>
          <p>Référence: ${tx.id}</p>
          <p>Date d'émission: ${tx.date}</p>
          <p>Statut: <strong>PAYÉ</strong></p>
        </div>
      </div>
      
      <div class="invoice-parties">
        <div class="invoice-party">
          <h4>Émetteur</h4>
          <p><strong>BatiBid SARL</strong></p>
          <p>Zone Commerciale Akpakpa</p>
          <p>Cotonou, Bénin</p>
          <p>Email: contact@batibid.com</p>
        </div>
        <div class="invoice-party">
          <h4>Destinataire</h4>
          <p><strong>${state.currentUser ? state.currentUser.name : "Jean DUPONT"}</strong></p>
          <p>Email: ${state.currentUser ? state.currentUser.email : "jean.dupont@gmail.com"}</p>
          <p>Téléphone: ${state.currentUser ? state.currentUser.phone : "+229 97 22 33 44"}</p>
        </div>
      </div>
      
      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>Description de la prestation</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${tx.description}</strong><br>
              <span style="font-size: 0.85rem; color: var(--gray-600);">Règlement par ${tx.method}</span>
            </td>
            <td style="text-align: right; font-weight: 700;">${formatCurrency(tx.amount)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="invoice-total-section">
        <div class="invoice-total-box">
          <div class="invoice-total-row">
            <span>Sous-total:</span>
            <span>${formatCurrency(tx.amount)}</span>
          </div>
          <div class="invoice-total-row">
            <span>Frais de service (0%):</span>
            <span>0 FCFA</span>
          </div>
          <div class="invoice-total-row grand-total">
            <span>Montant Total:</span>
            <span>${formatCurrency(tx.amount)}</span>
          </div>
        </div>
      </div>
      
      <div class="invoice-footer-notes">
        <p>Merci pour votre confiance en BatiBid.</p>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; color: var(--gray-500);">Cette facture numérique sert de justificatif de paiement légal pour l'occupation du bien immobilier.</p>
      </div>
    </div>
    
    <div class="invoice-actions" style="margin-bottom: 4rem;">
      <button class="btn btn-secondary" onclick="navigateTo('#invoices')">
        <i class="fas fa-arrow-left"></i> Retour aux factures
      </button>
      <button class="btn btn-primary" onclick="window.print()">
        <i class="fas fa-print"></i> Imprimer / PDF
      </button>
    </div>
  `;
  
  navigateTo("#invoice-detail-view");
}

// ==========================================
// DASHBOARD VIEWS GENERATION - Dispatcher
// ==========================================
function renderDashboard() {
  const layout = document.getElementById("dashboard-root-layout");
  if (!layout) return;

  const user = state.currentUser;

  if (!user) {
    layout.innerHTML = `<div style="padding:4rem; text-align:center;">
      <p>Vous n'êtes pas connecté. <a href="#auth" onclick="navigateTo('#auth')">Se connecter</a></p>
    </div>`;
    return;
  }

  // Profil 1 - Propriétaire Gestion Locative (Standard 8% ou Premium 10%)
  if (user.role === "proprietaire" && (user.formula === "integrale" || user.formula === "standard" || user.formula === "premium")) {
    if (typeof renderDashboardProprietaireIntegral === "function") {
      renderDashboardProprietaireIntegral(user);
    } else {
      renderOwnerDashboard(layout, user); // fallback
    }
    return;
  }

  // Profil 2 - Propriétaire Mise en Location (annonce)
  if (user.role === "proprietaire" && (user.formula === "annonce" || user.formula === "collecte" || user.formula === "simple")) {
    if (typeof renderDashboardProprietaireAnnonce === "function") {
      renderDashboardProprietaireAnnonce(user);
    } else {
      renderOwnerDashboard(layout, user);
    }
    return;
  }

  // Profil 4 - Locataire géré par BatiBid
  if (user.role === "locataire" && user.locataireGere) {
    if (typeof renderDashboardLocataireGere === "function") {
      renderDashboardLocataireGere(user);
    } else {
      renderTenantDashboard(layout, user);
    }
    return;
  }

  // Profil 3 - Locataire chercheur
  if (user.role === "locataire" && !user.locataireGere) {
    if (typeof renderDashboardLocataireChercheur === "function") {
      renderDashboardLocataireChercheur(user);
    } else {
      renderTenantDashboard(layout, user);
    }
    return;
  }
  
  renderTenantDashboard(layout, user);
}

// Global dashboard sidebar drawer toggle helper for mobile
window.toggleDashSidebar = function() {
  const sidebar = document.querySelector(".dash-sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  
  let backdrop = document.querySelector(".dash-sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "dash-sidebar-backdrop";
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("open");
      backdrop.classList.remove("active");
    });
    sidebar.parentNode.appendChild(backdrop);
  }
  
  if (sidebar.classList.contains("open")) {
    backdrop.classList.add("active");
  } else {
    backdrop.classList.remove("active");
  }
};

// ==========================================
// CUSTOM MODAL UTILITY
// ==========================================
function showCustomModal(html) {
  // Remove any existing modal
  closeCustomModal();
  const overlay = document.createElement("div");
  overlay.className = "custom-modal-overlay";
  overlay.id = "custom-modal-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCustomModal();
  });
  const box = document.createElement("div");
  box.className = "custom-modal-box";
  box.innerHTML = html;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function closeCustomModal() {
  const existing = document.getElementById("custom-modal-overlay");
  if (existing) existing.remove();
}

function renderTenantDashboard(layout, user) {
  layout.innerHTML = `
    <div class="sidebar">
      <ul class="sidebar-menu">
        <li class="sidebar-item active"><a href="#dashboard"><i class="fas fa-home"></i> Résumé</a></li>
        <li class="sidebar-item"><a href="#trouver"><i class="fas fa-search"></i> Catalogue de biens</a></li>
        <li class="sidebar-item"><a href="#invoices"><i class="fas fa-file-invoice-dollar"></i> Mes Factures</a></li>
        <li class="sidebar-item"><a href="#contact"><i class="fas fa-headset"></i> Support Client</a></li>
      </ul>
      <div class="sidebar-footer">
        <button class="btn btn-secondary" style="width: 100%;" onclick="handleLogout()">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>
    </div>
    
    <div class="dashboard-main">
      <div class="dashboard-welcome">
        <h2 class="headline-lg">Bonjour, ${user.name} 👋</h2>
        <p class="body-md" style="color: var(--gray-600);">Ravi de vous revoir sur votre espace locataire BatiBid.</p>
      </div>
      
      <!-- Warning Alert: Loyer Dû (Profil 4) -->
      <div style="background-color: #ffebe6; border-left: 4px solid var(--primary); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; text-align: left;">
        <div style="flex: 1; min-width: 280px;">
          <h4 style="color: var(--secondary); margin-bottom: 0.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-circle" style="color: var(--primary);"></i> Loyer mensuel en attente
          </h4>
          <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0; line-height: 1.4;">Votre loyer de Juin 2026 d'un montant de 350 000 FCFA est en attente de règlement.</p>
        </div>
        <button class="btn btn-primary" onclick="startRentPayment(1)" style="padding: 0.65rem 1.25rem; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem; border-radius: var(--radius-sm);">
          <i class="fas fa-wallet"></i> Payer mon loyer <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box orange"><i class="fas fa-home"></i></div>
          <div class="metric-info">
            <h5>Bien Occupé</h5>
            <div class="metric-value">1 appartement</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box red"><i class="fas fa-exclamation-triangle" style="color: var(--primary);"></i></div>
          <div class="metric-info">
            <h5>Statut Loyer</h5>
            <div class="metric-value" style="color: var(--primary); font-size: 1.1rem; font-weight: 700;">Dû (Juin 2026)</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box blue"><i class="fas fa-clock"></i></div>
          <div class="metric-info">
            <h5>Date Limite</h5>
            <div class="metric-value" style="font-size: 1.1rem; color: var(--primary); font-weight: 700;">05 Juin 2026</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box purple"><i class="fas fa-heart"></i></div>
          <div class="metric-info">
            <h5>Biens Favoris</h5>
            <div class="metric-value">${mockDb.savedProperties.length}</div>
          </div>
        </div>
      </div>
      
      <h3 class="headline-md mb-4">Mon Logement Actuel</h3>
      <div style="background-color: var(--white); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-300); display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem;">
        <div style="width: 150px; height: 100px; background-color: var(--gray-300); border-radius: var(--radius-md); overflow: hidden; position: relative;">
          <img src="./apt_kitchen.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Mon appartement">
        </div>
        <div style="flex-grow: 1;">
          <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">Appartement F3 Haut Standing</h4>
          <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> Haie Vive, Cotonou</p>
          <div style="font-weight: 700; color: var(--primary);">350 000 FCFA / mois</div>
        </div>
        <div>
          <button class="btn btn-secondary" onclick="viewPropertyDetails(1)">
            <i class="fas fa-info-circle"></i> Gérer mon bail
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOwnerDashboard(layout, user) {
  layout.innerHTML = `
    <div class="sidebar">
      <ul class="sidebar-menu">
        <li class="sidebar-item active"><a href="#dashboard"><i class="fas fa-chart-line"></i> Performance</a></li>
        <li class="sidebar-item"><a href="#dashboard" onclick="showAlert('info', 'Indisponible', 'Simulation : cette section affiche vos biens.')"><i class="fas fa-building"></i> Mes Biens</a></li>
        <li class="sidebar-item"><a href="#dashboard" onclick="showAlert('info', 'Indisponible', 'Simulation : liste de vos locataires.')"><i class="fas fa-users"></i> Mes Locataires</a></li>
        <li class="sidebar-item"><a href="#dashboard" onclick="triggerAutoReport()"><i class="fas fa-file-invoice"></i> Rapports auto.</a></li>
      </ul>
      <div class="sidebar-footer">
        <button class="btn btn-secondary" style="width: 100%;" onclick="handleLogout()">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>
    </div>
    
    <div class="dashboard-main">
      <div class="dashboard-welcome" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 class="headline-lg">Tableau de bord, M. ${user.name.split(' ')[0]} 👋</h2>
          <p class="body-md" style="color: var(--gray-600);">Gestion locative garantie de vos propriétés.</p>
        </div>
        <div style="background-color: var(--success-light); color: var(--success); font-weight: 700; padding: 0.5rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem; border: 1px solid var(--success);">
          <i class="fas fa-shield-alt" style="margin-right: 0.25rem;"></i> Garantie Recouvrement Active (100%)
        </div>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box orange"><i class="fas fa-wallet"></i></div>
          <div class="metric-info">
            <h5>Revenus Mensuels</h5>
            <div class="metric-value">480 000 FCFA</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box green"><i class="fas fa-check-double"></i></div>
          <div class="metric-info">
            <h5>Taux de recouvrement</h5>
            <div class="metric-value">100%</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box blue"><i class="fas fa-chart-pie"></i></div>
          <div class="metric-info">
            <h5>Taux d'occupation</h5>
            <div class="metric-value">92%</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box purple"><i class="fas fa-tools"></i></div>
          <div class="metric-info">
            <h5>Tickets Maintenance</h5>
            <div class="metric-value">0 ouvert</div>
          </div>
        </div>
      </div>
      
      <div style="background-color: var(--white); padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-300); box-shadow: var(--shadow-soft); margin-bottom: 3rem;">
        <h3 class="headline-md mb-4" style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-chart-bar" style="color: var(--primary);"></i> Suivi Financier Global
        </h3>
        
        <div style="height: 180px; width: 100%; background-color: var(--gray-100); border-radius: var(--radius-md); border: 1px dashed var(--gray-500); display: flex; align-items: center; justify-content: center; color: var(--gray-600); position: relative; overflow: hidden;">
          <svg viewBox="0 0 500 150" style="position: absolute; top:0; left:0; width:100%; height:100%;">
            <path d="M 50 120 L 150 90 L 250 110 L 350 70 L 450 40" fill="none" stroke="var(--primary)" stroke-width="4" />
            <circle cx="50" cy="120" r="6" fill="var(--primary)" />
            <circle cx="150" cy="90" r="6" fill="var(--primary)" />
            <circle cx="250" cy="110" r="6" fill="var(--primary)" />
            <circle cx="350" cy="70" r="6" fill="var(--primary)" />
            <circle cx="450" cy="40" r="6" fill="var(--primary)" />
          </svg>
          <div style="position: absolute; bottom: 1rem; right: 1rem; background-color: var(--white); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; border: 1px solid var(--gray-300);">
            Tendance revenus garantis 2026
          </div>
        </div>
      </div>
    </div>
  `;
}

function triggerAutoReport() {
  showAlert("success", "Rapport Généré !", "Le rapport de gestion mensuel automatique a été compilé et envoyé à votre adresse email.");
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatCurrency(val) {
  return new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
    .format(val)
    .replace("XOF", "FCFA");
}

// Pricing tab switching
window.switchPricingTab = function(tabName) {
  // Update active state on tab buttons
  document.querySelectorAll('.pricing-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update visibility of pricing panes
  document.querySelectorAll('.pricing-tab-pane').forEach(pane => {
    pane.classList.remove('active');
    pane.style.display = 'none';
  });
  const activePane = document.getElementById(`pane-${tabName}`);
  if (activePane) {
    activePane.style.display = 'block';
    // Small delay to trigger animation
    setTimeout(() => {
      activePane.classList.add('active');
    }, 10);
  }
};

// Toggle management sub-formula (Standard vs Premium)
window.toggleManagementPrice = function(mode) {
  const toggleBtnStandard = document.getElementById('m-toggle-standard');
  const toggleBtnPremium = document.getElementById('m-toggle-premium');
  const priceDisplay = document.getElementById('m-price-display');
  const descDisplay = document.getElementById('m-desc-display');
  const featuresList = document.getElementById('m-features-list');

  if (!toggleBtnStandard || !toggleBtnPremium || !priceDisplay || !descDisplay || !featuresList) return;

  if (mode === 'standard') {
    toggleBtnStandard.classList.add('active');
    toggleBtnPremium.classList.remove('active');
    priceDisplay.innerHTML = '8%<span> du loyer / mois</span>';
    descDisplay.innerText = 'Sécurisation courante de vos loyers et gestion technique de base.';
    featuresList.innerHTML = `
      <li><i class="fas fa-check-circle"></i> Collecte automatique des loyers par Mobile Money</li>
      <li><i class="fas fa-check-circle"></i> Suivi des paiements en temps réel</li>
      <li><i class="fas fa-check-circle"></i> Accès complet aux rapports financiers</li>
      <li><i class="fas fa-check-circle"></i> Support client standard</li>
      <li><i class="fas fa-check-circle"></i> Notifications par e-mail</li>
    `;
  } else {
    toggleBtnStandard.classList.remove('active');
    toggleBtnPremium.classList.add('active');
    priceDisplay.innerHTML = '10%<span> du loyer / mois</span>';
    descDisplay.innerText = 'Gestion locative intégrale avec assistance 24/7 et suivi fiscal complet.';
    featuresList.innerHTML = `
      <li><i class="fas fa-check-circle"></i> Toutes les fonctionnalités de l'offre Standard</li>
      <li><i class="fas fa-check-circle"></i> Assistance prioritaire et technique 24/7</li>
      <li><i class="fas fa-check-circle"></i> Rédaction et renouvellement des baux inclus</li>
      <li><i class="fas fa-check-circle"></i> Optimisation fiscale immobilière annuelle</li>
      <li><i class="fas fa-check-circle"></i> Notifications e-mail et SMS prioritaires</li>
    `;
  }
};

// Check legal services coverage simulator
window.checkLegalCoverage = function(issue) {
  const resultDiv = document.getElementById("legal-simulator-result");
  if (!resultDiv) return;

  if (!issue) {
    resultDiv.style.display = "none";
    return;
  }

  let title = "";
  let price = "";
  let statusClass = ""; // tag-included, tag-premium, tag-none
  let statusText = "";
  let description = "";
  let borderColor = "";

  switch (issue) {
    case "expulsion":
    case "recouvrement":
      title = "Procédure d'Expulsion et de Recouvrement";
      price = "100 000 - 300 000 XOF + 10% des sommes recouvrées";
      statusClass = "tag-included";
      statusText = "Totalement Inclus (Gratuit)";
      borderColor = "#2e7d32"; // green
      description = "Ce service est entièrement pris en charge par BatiBid dans le cadre de nos contrats de Gestion Locative Standard (8%) et Premium (10%). Vous n'avez aucun honoraire supplémentaire à payer à nos juristes.";
      break;
    case "strategie":
      title = "Plan d'Action Juridique / Stratégie Contentieuse";
      price = "50 000 - 100 000 XOF (Analyse initiale)";
      statusClass = "tag-included";
      statusText = "Totalement Inclus (Gratuit)";
      borderColor = "#2e7d32"; // green
      description = "Ce service est entièrement pris en charge dans le cadre de nos contrats de Gestion Locative Standard (8%) et Premium (10%). Nos experts analysent les pièces et élaborent la stratégie pour vous défendre.";
      break;
    case "fiscalite":
      title = "Optimisation Fiscale Immobilière";
      price = "75 000 - 200 000 XOF";
      statusClass = "tag-premium";
      statusText = "Inclus dans l'offre Premium (10%)";
      borderColor = "#d95e2b"; // orange
      description = "Ce service est couvert pour les propriétaires ayant souscrit à l'offre de Gestion Locative Premium (10%). Pour les clients de l'offre Standard (8%) ou hors gestion, ce service est disponible sous forme de forfait à la carte.";
      break;
    case "transaction":
      title = "Transaction Immobilière Sécurisée";
      price = "80 000 - 150 000 XOF (Conseil initial) + Commission";
      statusClass = "tag-none";
      statusText = "Non Couvert (Service à la carte)";
      borderColor = "#606060"; // grey
      description = "Ce service concerne l'achat ou la vente de biens immobiliers. Il est exclu des formules de gestion locative classique. Nos juristes vous accompagnent de manière indépendante pour sécuriser votre investissement.";
      break;
    case "bail":
      title = "Forfait Contrat de Location Sécurisé";
      price = "50 000 - 100 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte (Inclus lors de la mise en location)";
      borderColor = "#606060"; // grey
      description = "La rédaction du bail est offerte lors de la signature d'une formule de gestion locative ou d'une offre découverte. En dehors de ces cadres, la rédaction ou négociation d'un contrat de bail de manière isolée est facturée au tarif forfaitaire indiqué.";
      break;
    case "mediation":
      title = "Accords contradictoires de Règlement Amiable / Médiation";
      price = "50 000 - 200 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte";
      borderColor = "#606060";
      description = "Ce service permet d'intervenir en médiateur pour sceller un accord officiel écrit et éviter le tribunal. Disponible en prestation autonome pour tout propriétaire ou locataire hors gestion.";
      break;
    case "contrat":
      title = "Sécurisation de vos Contrats d'Affaires";
      price = "50 000 - 200 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte";
      borderColor = "#606060";
      description = "Rédaction et sécurisation juridique de vos contrats de construction, rénovation ou contrats d'artisans. Service à la carte indépendant.";
      break;
    case "precontentieux":
      title = "Acte de procédure préalable à la saisine (Précontentieux locatif)";
      price = "20 000 - 50 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte";
      borderColor = "#606060";
      description = "Préparation et envoi des mises en demeure formelles aux locataires avant toute saisine des juridictions. Service autonome à la carte.";
      break;
    default:
      resultDiv.style.display = "none";
      return;
  }

  resultDiv.innerHTML = `
    <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--secondary); margin-bottom: 0.5rem;">${title}</h4>
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center;">
      <span class="coverage-tag ${statusClass}" style="margin: 0;"><i class="fas ${statusClass === 'tag-included' ? 'fa-check-double' : statusClass === 'tag-premium' ? 'fa-star' : 'fa-info-circle'}"></i> ${statusText}</span>
      <span style="font-size: 0.85rem; font-weight: 700; color: var(--gray-600);"><i class="fas fa-tag"></i> Tarif de base : ${price}</span>
    </div>
    <p class="body-sm" style="color: var(--gray-600); margin: 0; line-height: 1.5;">${description}</p>
  `;
  resultDiv.style.borderColor = borderColor;
  resultDiv.style.display = "block";
};

function getTodayDateString() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('fr-FR', options);
}

function showAlert(type, title, message) {
  const modal = document.getElementById("alert-modal");
  const icon = document.getElementById("alert-modal-icon");
  const modalTitle = document.getElementById("alert-modal-title");
  const modalText = document.getElementById("alert-modal-text");
  
  if (!modal) return;
  
  icon.className = "modal-icon";
  if (type === "success") {
    icon.classList.add("success", "fas", "fa-check-circle");
  } else if (type === "error") {
    icon.classList.add("error", "fas", "fa-exclamation-triangle");
  } else {
    icon.classList.add("fas", "fa-info-circle");
  }
  
  modalTitle.innerText = title;
  modalText.innerText = message;
  
  modal.classList.add("active");
}

function closeAlert() {
  document.getElementById("alert-modal").classList.remove("active");
}

// Initialize on execution after pages are loaded
document.addEventListener("DOMContentLoaded", async () => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    try {
      state.currentUser = JSON.parse(storedUser);
    } catch (e) {
      console.error("Erreur de parsing du currentUser stocké", e);
    }
  }
  await loadAllPages();
  initRouter();
  updateHeaderAuth();
});

// Unregister all active Service Workers to avoid cache-poisoning/stale content bugs
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister().then(() => {
        console.log("Service Worker BatiBid désenregistré avec succès !");
      });
    }
  });
}

// Clear all browser caches for BatiBid
if ("caches" in window) {
  caches.keys().then((keys) => {
    return Promise.all(keys.map((key) => {
      console.log("Nettoyage du cache du navigateur :", key);
      return caches.delete(key);
    }));
  });
}
