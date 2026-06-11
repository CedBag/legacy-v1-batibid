/**
 * BatiBid — Dashboard Profil 2 (Propriétaire Annonce)
 * Rendu complet : KPIs, mes annonces, publication, candidatures, boosts
 */

// Liste des candidatures fictives pour le Profil 2 (Marie)
let p2UploadedImagesList = [];
let p2Candidatures = [
  {
    id: "cand-p2-01",
    bienId: "b4",
    candidat: {
      id: "u3",
      name: "M. Jean DOSSOU",
      email: "jean@batibid.com",
      phone: "01 65 33 44 55",
      avatar: "JD"
    },
    statut: "En attente", // "En attente", "Accepté", "Refusé"
    date: "09/06/2026",
    profession: "Cadre Commercial (MTN Bénin)",
    revenu: "550 000 FCFA / mois",
    garant: "Garantie solidaire (Banque Ecobank)",
    message: "Bonjour, très intéressé par votre studio meublé à Cadjehoun. Je suis célibataire, sans animaux et mon dossier de solvabilité est déjà validé à 100% par le support BatiBid. Disponible pour emménager le 15 Juin."
  }
];

// Suivi des boosts d'annonces
let p2AnnoncesPremium = ["b4"]; // b4 est Premium par défaut pour la démo

function renderDashboardProprietaireAnnonce(user) {
  const root = document.getElementById("dashboard-root-layout");
  if (!root) return;

  // Calculs
  const userBiens = mockBiens.filter(b => b.proprietaireId === user.id);
  const activeCands = p2Candidatures.filter(c => c.statut === "En attente" && userBiens.some(b => b.id === c.bienId));
  const notifs = (mockNotifications[user.id] || []).filter(n => !n.lu);

  root.innerHTML = `
    <div class="dashboard-p2">

      <!-- ===== SIDEBAR ===== -->
      <aside class="dash-sidebar">
        <div class="dash-sidebar-profile">
          <div class="dash-avatar">${user.avatar}</div>
          <div>
            <div class="dash-user-name">${user.name}</div>
            <div class="dash-user-role">
              <span class="dash-badge-formula">
                <i class="fas fa-bullhorn"></i> Formule Annonce
              </span>
            </div>
          </div>
        </div>

        <nav class="dash-nav">
          <a class="dash-nav-item active" onclick="dashTabP2('overview','${user.id}')">
            <i class="fas fa-th-large"></i> Vue d'ensemble
          </a>
          <a class="dash-nav-item" onclick="dashTabP2('annonces','${user.id}')">
            <i class="fas fa-bullhorn"></i> Mes Annonces
            <span class="dash-nav-badge">${userBiens.length}</span>
          </a>
          <a class="dash-nav-item" onclick="dashTabP2('candidatures','${user.id}')">
            <i class="fas fa-users"></i> Candidatures
            ${activeCands.length > 0 ? `<span class="dash-nav-badge dash-nav-badge--alert">${activeCands.length}</span>` : ""}
          </a>
          <a class="dash-nav-item" onclick="dashTabP2('booster','${user.id}')">
            <i class="fas fa-rocket"></i> Booster mes annonces
          </a>
          <a class="dash-nav-item" onclick="dashTabP2('profil','${user.id}')">
            <i class="fas fa-user-cog"></i> Mon Profil
          </a>
          <a class="dash-nav-item" href="#blog" onclick="navigateTo('#blog')">
            <i class="fas fa-newspaper"></i> Blog BatiBid
          </a>
        </nav>

        <div class="dash-sidebar-support">
          <i class="fas fa-headset"></i>
          <div>
            <strong>Support BatiBid</strong>
            <span>Disponible 24h/7j</span>
          </div>
          <a href="https://wa.me/22997000000" target="_blank" class="dash-whatsapp-btn">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </aside>

      <!-- ===== MAIN CONTENT ===== -->
      <main class="dash-main" id="dash-main-content">
        ${renderDashP2Overview(user, userBiens, activeCands, notifs)}
      </main>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: VUE D'ENSEMBLE
// ──────────────────────────────────────────
function renderDashP2Overview(user, userBiens, activeCands, notifs) {
  const viewsCount = userBiens.reduce((sum, b) => sum + (b.id === "b4" ? 148 : 0), 0);
  const leadsCount = userBiens.reduce((sum, b) => sum + (b.id === "b4" ? 5 : 0), 0);

  let alertMarkup = "";
  if (activeCands.length > 0) {
    const mainCand = activeCands[0];
    const bienCand = userBiens.find(b => b.id === mainCand.bienId);
    alertMarkup = `
      <div style="background-color: var(--primary-light); border-left: 4px solid var(--primary); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; text-align: left;">
        <div style="flex: 1; min-width: 280px;">
          <h4 style="color: var(--secondary); margin-bottom: 0.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-user-plus" style="color: var(--primary);"></i> Nouvelle candidature reçue !
          </h4>
          <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0; line-height: 1.4;">
            <strong>${mainCand.candidat.name}</strong> a déposé son dossier pour votre bien <strong>${bienCand ? bienCand.title : "Studio Cadjehoun"}</strong>.
          </p>
        </div>
        <button class="btn btn-primary" onclick="dashTabP2('candidatures', '${user.id}')" style="padding: 0.65rem 1.25rem; font-size: 0.9rem; border-radius: var(--radius-sm);">
          <i class="fas fa-eye"></i> Étudier le dossier <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
  }

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Bonjour, ${user.name.split(" ")[2]} 👋</h1>
        <p class="dash-page-subtitle">Suivi en temps réel de vos annonces de mise en location</p>
      </div>
      <button class="btn btn-primary" onclick="openAddListingModalP2('${user.id}')">
        <i class="fas fa-plus"></i> Publier une nouvelle annonce
      </button>
    </div>

    <!-- ALERTE CANDIDATURES -->
    ${alertMarkup}

    <!-- KPI CARDS -->
    <div class="dash-kpi-grid">
      <div class="dash-kpi-card dash-kpi--primary">
        <div class="dash-kpi-icon"><i class="fas fa-bullhorn"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Annonces en ligne</span>
          <span class="dash-kpi-value">${userBiens.length} active(s)</span>
          <span class="dash-kpi-sub">Visibles dans le catalogue</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e3f2fd; color: #1565c0;"><i class="fas fa-eye"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Vues cumulées</span>
          <span class="dash-kpi-value">${viewsCount} visites</span>
          <span class="dash-kpi-sub">Intérêt des internautes</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e8f5e9; color: #2E7D32;"><i class="fas fa-users"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Candidatures reçues</span>
          <span class="dash-kpi-value">${p2Candidatures.length} dossier(s)</span>
          <span class="dash-kpi-sub">${activeCands.length} en attente d'avis</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #fff3e0; color: #e65100;"><i class="fas fa-rocket"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Options Boost activées</span>
          <span class="dash-kpi-value">${p2AnnoncesPremium.length} annonce(s)</span>
          <span class="dash-kpi-sub">Positionnement prioritaire</span>
        </div>
      </div>
    </div>

    <!-- SYNTHÈSE DES COMPORTEMENTS -->
    <div class="dash-two-col" style="margin-top: 2.5rem;">
      <!-- Mes annonces synthétiques -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-building"></i> Mes annonces</h3>
          <button class="dash-link-btn" onclick="dashTabP2('annonces', '${user.id}')">Gérer →</button>
        </div>
        <div class="dash-biens-list">
          ${userBiens.map(b => {
            const isPremium = p2AnnoncesPremium.includes(b.id);
            return `
              <div class="dash-bien-row">
                <img src="${b.image}" alt="${b.title}" class="dash-bien-thumb">
                <div class="dash-bien-info">
                  <div class="dash-bien-title">${b.title}</div>
                  <div class="dash-bien-address"><i class="fas fa-map-marker-alt"></i> ${b.address}, ${b.city}</div>
                </div>
                ${isPremium ? `<span class="dash-status-badge dash-status-occupé" style="font-size:0.7rem;"><i class="fas fa-rocket"></i> Premium</span>` : ""}
                <span class="dash-status-badge dash-status-${b.status === "Libre" ? "libre" : "en-annonce"}">
                  ${b.status}
                </span>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Dossier récent -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-folder-open"></i> Candidats récents</h3>
          <button class="dash-link-btn" onclick="dashTabP2('candidatures', '${user.id}')">Tous les dossiers →</button>
        </div>
        <div class="dash-biens-list">
          ${p2Candidatures.slice(0, 3).map(c => `
            <div class="dash-bien-row">
              <div class="dash-avatar" style="width:34px; height:34px; font-size:0.8rem;">${c.candidat.avatar}</div>
              <div class="dash-bien-info">
                <div class="dash-bien-title">${c.candidat.name}</div>
                <div class="dash-bien-address">${c.profession} · ${c.revenu}</div>
              </div>
              <span class="dash-status-badge dash-status-${c.statut === "Accepté" ? "occupé" : c.statut === "En attente" ? "en-annonce" : "incident"}">
                ${c.statut}
              </span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: MES ANNONCES
// ──────────────────────────────────────────
function renderDashP2Annonces(user, biens) {
  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Mes Annonces</h1>
        <p class="dash-page-subtitle">Liste de vos biens publiés pour mise en location</p>
      </div>
      <button class="btn btn-primary" onclick="openAddListingModalP2('${user.id}')">
        <i class="fas fa-plus"></i> Publier une annonce
      </button>
    </div>

    <div class="dash-listings-grid">
      ${biens.map(b => {
        const isPremium = p2AnnoncesPremium.includes(b.id);
        const views = b.id === "b4" ? 148 : 0;
        const favorites = b.id === "b4" ? 12 : 0;
        const contacts = b.id === "b4" ? 5 : 0;
        
        // Expiration dates
        const datePub = b.datePublication || "05/06/2026";
        const dateExp = b.dateExpiration || "05/07/2026";
        const daysLeft = b.joursRestants !== undefined ? b.joursRestants : 25;
        const formula = b.formula || (isPremium ? "premium" : "standard");
        const photosCount = b.imagesUploaded || 1;

        return `
          <div class="dash-listing-card">
            <div class="dash-listing-img-wrapper">
              <img src="${b.image}" alt="${b.title}" class="dash-listing-img">
              ${isPremium ? `<span class="property-card-badge" style="background-color: var(--primary); color: var(--white); font-weight:700;"><i class="fas fa-rocket"></i> Premium</span>` : ""}
              <span class="property-card-badge" style="left:auto; right:1rem; background-color:#ffebe6; color:var(--primary); font-weight:600;">${b.status}</span>
            </div>
            <div class="dash-listing-body">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span class="dash-status-badge" style="background:var(--gray-200); color:var(--secondary); font-size:0.65rem; font-weight:700; padding:2px 6px;">
                  Offre : ${formula === 'premium' ? 'Premium (10k)' : formula === 'decouverte' ? 'Découverte (Succès)' : 'Standard (6k)'}
                </span>
                <span style="font-size:0.75rem; color:var(--gray-600);"><i class="fas fa-camera"></i> ${photosCount} photo(s)</span>
              </div>

              <h3 class="dash-listing-title" style="margin-top:0.25rem;">${b.title}</h3>
              <p style="font-size:0.8rem; color:var(--gray-600); margin:0 0 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${b.address}, ${b.city} · ${b.surface} m²</p>
              
              <!-- DUREE DE PARUTION (30 JOURS) -->
              <div style="background-color: var(--gray-100); border-radius: var(--radius-sm); padding: 0.4rem 0.65rem; font-size: 0.78rem; color: var(--gray-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.25rem;">
                <i class="far fa-calendar-alt" style="color: var(--primary);"></i>
                <span>Du ${datePub} au ${dateExp}</span>
                <span style="margin-left: auto; color: var(--primary); font-weight: 800;">${daysLeft}j restants</span>
              </div>

              <div style="font-size:1.15rem; font-weight:800; color:var(--primary); margin-bottom:1rem;">${formatCurrency(b.loyer)} / mois</div>
              
              <div class="dash-listings-stats-row">
                <div class="dash-listing-stat">
                  <strong>${views}</strong>
                  <span>Vues</span>
                </div>
                <div class="dash-listing-stat">
                  <strong>${favorites}</strong>
                  <span>Favoris</span>
                </div>
                <div class="dash-listing-stat">
                  <strong>${contacts}</strong>
                  <span>Leads</span>
                </div>
              </div>

              <div style="display:flex; gap:0.5rem; margin-top:1.25rem;">
                <button class="btn btn-secondary" style="flex:1; font-size:0.75rem; padding:0.4rem;" onclick="showAlert('info', 'Édition', 'L\\'édition d\\'annonce sera opérationnelle en production.')">
                  <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn btn-secondary" style="flex:1.2; font-size:0.75rem; padding:0.4rem; border-color:var(--primary); color:var(--primary);" onclick="openRenewPaymentModal('${b.id}')">
                  <i class="fas fa-redo-alt"></i> Renouveler
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: CANDIDATURES LOCATAIRES
// ──────────────────────────────────────────
function renderDashP2Candidatures(user, cands) {
  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Candidatures Locataires</h1>
        <p class="dash-page-subtitle">Dossiers de solvabilité des locataires intéressés par vos annonces</p>
      </div>
    </div>

    <div>
      ${cands.length === 0 ? `
        <div class="dash-card text-center" style="padding:4rem;">
          <i class="fas fa-users-slash" style="font-size:3rem; color:var(--gray-500); margin-bottom:1rem;"></i>
          <h4 class="headline-md">Aucune candidature active</h4>
          <p class="body-md" style="color:var(--gray-600);">Toutes les candidatures reçues ont été traitées.</p>
        </div>
      ` : cands.map(c => {
        const bien = mockBiens.find(b => b.id === c.bienId);
        return `
          <div class="candidate-dossier-card">
            <div class="candidate-profile-side">
              <div class="candidate-avatar">${c.candidat.avatar}</div>
              <div class="candidate-meta">
                <h4>${c.candidat.name}</h4>
                <p>Postule pour : <strong>${bien ? bien.title : "Studio meublé"}</strong></p>
                <div class="candidate-badge-list">
                  <span class="dash-status-badge dash-status-libre"><i class="fas fa-briefcase"></i> ${c.profession}</span>
                  <span class="dash-status-badge dash-status-occupé"><i class="fas fa-coins"></i> ${c.revenu}</span>
                  <span class="dash-status-badge dash-status-en-annonce"><i class="fas fa-shield-alt"></i> ${c.garant}</span>
                </div>
                <p style="margin-top: 1rem; font-style: italic; font-size: 0.85rem; color: var(--gray-600); max-width: 600px; line-height: 1.5; background: var(--gray-100); padding: 0.75rem; border-radius: var(--radius-sm);">
                  "${c.message}"
                </p>
              </div>
            </div>
            
            <div class="candidate-action-side">
              ${c.statut === "En attente" ? `
                <button class="btn btn-secondary" onclick="decideCandidature('${c.id}', 'Refusé')">Refuser</button>
                <button class="btn btn-primary" onclick="decideCandidature('${c.id}', 'Accepté')">
                  <i class="fas fa-check-circle" style="margin-right:0.35rem;"></i> Accepter
                </button>
              ` : c.statut === "Accepté" ? `
                <div style="text-align:right;">
                  <span class="dash-status-badge dash-status-occupé" style="font-size:0.85rem; padding:0.5rem 1rem;">
                    <i class="fas fa-check-double"></i> Candidature Acceptée
                  </span>
                  <p style="font-size:0.75rem; color:var(--gray-500); margin-top:0.4rem;">Contrat de bail en cours de rédaction par BatiBid.</p>
                </div>
              ` : `
                <span class="dash-status-badge dash-status-incident" style="font-size:0.85rem; padding:0.5rem 1rem;">
                  <i class="fas fa-times-circle"></i> Candidature Refusée
                </span>
              `}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: BOOSTER MON ANNONCE
// ──────────────────────────────────────────
function renderDashP2Booster(user, biens) {
  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Booster mes Annonces</h1>
        <p class="dash-page-subtitle">Multipliez les vues et trouvez des locataires 3x plus vite</p>
      </div>
    </div>

    <div class="boost-options-grid">
      <!-- Option Premium -->
      <div class="boost-card boost--premium">
        <span class="boost-badge-popular">Recommandé</span>
        <div class="boost-card-header">
          <h3>Formule Annonce Premium</h3>
          <p style="font-size:0.85rem; color:var(--gray-600); margin:0;">Positionnement en tête de catalogue BatiBid</p>
          <div class="boost-price">10 000 FCFA<span> / publication</span></div>
        </div>
        <ul class="boost-features">
          <li><i class="fas fa-check"></i> Position prioritaire en haut de page pendant 30 jours</li>
          <li><i class="fas fa-check"></i> Badge "Premium" de visibilité accrue sur l'annonce</li>
          <li><i class="fas fa-check"></i> Relais automatique sur nos canaux WhatsApp de recherche</li>
          <li><i class="fas fa-check"></i> Alertes emails envoyées aux locataires chercheurs ciblés</li>
        </ul>
        <button class="btn btn-primary" onclick="openBoostPaymentModal('premium', 10000)">
          <i class="fas fa-rocket"></i> Activer le boost Premium
        </button>
      </div>

      <!-- Option Photos Pro -->
      <div class="boost-card">
        <div class="boost-card-header">
          <h3>Reportage Photo Professionnel</h3>
          <p style="font-size:0.85rem; color:var(--gray-600); margin:0;">BatiBid se déplace pour valoriser votre logement</p>
          <div class="boost-price">15 000 FCFA<span> / reportage</span></div>
        </div>
        <ul class="boost-features">
          <li><i class="fas fa-check"></i> Déplacement d'un photographe BatiBid sous 48h</li>
          <li><i class="fas fa-check"></i> 10 clichés HD optimisés pour l'immobilier</li>
          <li><i class="fas fa-check"></i> Intégration d'un plan schématique de l'appartement</li>
          <li><i class="fas fa-check"></i> Valorisation immédiate du taux de clics de 85%</li>
        </ul>
        <button class="btn btn-secondary" onclick="openBoostPaymentModal('photo', 15000)">
          <i class="fas fa-camera"></i> Commander le reportage photo
        </button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: MON PROFIL
// ──────────────────────────────────────────
function renderDashP2Profil(user) {
  return `
    <div class="dash-header">
      <h1 class="dash-page-title">Mon Profil</h1>
    </div>

    <div class="dash-two-col">
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-user"></i> Informations personnelles</h3>
        </div>
        <div class="dash-profil-form">
          <div class="form-group">
            <label class="form-label">Nom complet</label>
            <input type="text" class="form-control" value="${user.name}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Email de contact</label>
            <input type="email" class="form-control" value="${user.email}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Numéro WhatsApp de messagerie</label>
            <input type="tel" class="form-control" value="${user.phone}" readonly>
          </div>
          <button class="btn btn-secondary" onclick="showAlert('info','Profil','Pour changer vos informations de contact, veuillez contacter le support BatiBid.')">
            <i class="fas fa-edit"></i> Modifier mes coordonnées
          </button>
        </div>
      </div>
      
      <div class="dash-card" style="background:#fafafa;">
        <h3 style="font-size:1rem; font-weight:700; color:var(--secondary); margin-bottom:0.5rem;"><i class="fas fa-info-circle" style="color:var(--primary); margin-right:0.5rem;"></i>Abonnement & Publication</h3>
        <p style="font-size:0.88rem; color:var(--gray-600); line-height:1.6; margin:0;">
          Vous êtes inscrit en formule **Annonce Simple**. BatiBid met à votre disposition sa plateforme de visibilité. 
          Vous gérez directement les visites, la négociation, la contractualisation et le recouvrement avec le locataire de votre choix. 
          Pour déléguer le recouvrement et activer la garantie contre les loyers impayés, vous pouvez migrer à tout moment vers la **Gestion Intégrale (10%)** en prenant contact avec nos agents.
        </p>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB SWITCHING NAVIGATION P2
// ──────────────────────────────────────────
function dashTabP2(tab, userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;

  const main = document.getElementById("dash-main-content");
  if (!main) return;

  // Mettre à jour l'état actif dans la navigation
  document.querySelectorAll(".dash-nav-item").forEach(el => {
    el.classList.remove("active");
    if (el.getAttribute("onclick") && el.getAttribute("onclick").includes(`'${tab}'`)) {
      el.classList.add("active");
    }
  });

  const userBiens = mockBiens.filter(b => b.proprietaireId === user.id);
  const activeCands = p2Candidatures.filter(c => c.statut === "En attente" && userBiens.some(b => b.id === c.bienId));
  const notifs = (mockNotifications[user.id] || []).filter(n => !n.lu);

  const renderers = {
    overview:     () => renderDashP2Overview(user, userBiens, activeCands, notifs),
    annonces:     () => renderDashP2Annonces(user, userBiens),
    candidatures: () => renderDashP2Candidatures(user, p2Candidatures),
    booster:      () => renderDashP2Booster(user, userBiens),
    profil:       () => renderDashP2Profil(user)
  };

  if (renderers[tab]) {
    main.innerHTML = renderers[tab]();
  }
}

// ──────────────────────────────────────────
// ACTIONS : PUBLIER UNE NOUVELLE ANNONCE
// ──────────────────────────────────────────
window.handleP2FileSelect = function(input) {
  const files = Array.from(input.files);
  const remaining = 7 - p2UploadedImagesList.length;
  
  if (files.length > remaining) {
    showAlert("warning", "Limite dépassée", `Vous ne pouvez charger que ${remaining} photo(s) supplémentaire(s) (Maximum 7 photos au total).`);
  }
  
  const filesToAdd = files.slice(0, remaining);
  filesToAdd.forEach(file => {
    const url = URL.createObjectURL(file);
    p2UploadedImagesList.push({ name: file.name, url: url });
  });
  
  updateP2UploadUI();
};

window.removeP2UploadedImage = function(index) {
  p2UploadedImagesList.splice(index, 1);
  updateP2UploadUI();
};

window.updateP2UploadUI = function() {
  const countSpan = document.getElementById("p2-upload-count");
  const container = document.getElementById("p2-thumbnails-container");
  const hiddenInput = document.getElementById("add-images-count");
  
  if (countSpan) countSpan.textContent = `${p2UploadedImagesList.length} / 7`;
  if (hiddenInput) hiddenInput.value = p2UploadedImagesList.length.toString();
  
  if (container) {
    container.innerHTML = p2UploadedImagesList.map((img, idx) => `
      <div style="position:relative; width:70px; height:70px; border-radius:var(--radius-sm); border:1px solid var(--gray-300); background-color:var(--gray-100); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        <img src="${img.url}" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-sm);">
        <button type="button" style="position:absolute; top:-4px; right:-4px; background:#d32f2f; color:#fff; border:none; border-radius:50%; width:16px; height:16px; font-size:0.6rem; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="removeP2UploadedImage(${idx})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join("");
  }
};

window.triggerP2ImageUpload = function() {
  const fileInput = document.getElementById("p2-image-input");
  if (fileInput) fileInput.click();
};

window.selectFormulaP2 = function(type) {
  const formulaInput = document.getElementById("add-formula-p2");
  if (!formulaInput) return;
  formulaInput.value = type;
  
  document.querySelectorAll("[id^='formula-p2-']").forEach(el => {
    el.classList.remove("active");
  });
  
  const selectedCard = document.getElementById(`formula-p2-${type}`);
  if (selectedCard) {
    selectedCard.classList.add("active");
  }
};

function openAddListingModalP2(userId) {
  p2UploadedImagesList = [];

  showCustomModal(`
    <div style="text-align:left;">
      <h3 style="margin-bottom:1.25rem; border-bottom:1px solid var(--gray-300); padding-bottom:0.5rem; color:var(--primary);">
        <i class="fas fa-plus-circle"></i> Publier un nouveau bien
      </h3>
      <form onsubmit="submitNewListingP2(event, '${userId}')">
        <div class="form-group">
          <label class="form-label" for="add-title">Titre de l'annonce</label>
          <input type="text" class="form-control" id="add-title" placeholder="Ex: Appartement F4 de Standing" required>
        </div>

        <!-- CHOIX DE FORMULE -->
        <div class="form-group">
          <label class="form-label" style="font-weight:600;">Formule de publication</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.5rem;">
            <!-- Découverte Card -->
            <div id="formula-p2-decouverte" class="formula-select-card" onclick="selectFormulaP2('decouverte')">
              <div class="formula-card-title">Découverte</div>
              <div class="formula-card-price" style="font-size:0.88rem; font-weight:700;">1 mois loyer</div>
              <small style="color:var(--gray-500); display:block; line-height:1.2; font-size:0.65rem;">Frais uniquement à la réussite</small>
              <i class="fas fa-check-circle check-icon"></i>
            </div>
            <!-- Standard Card -->
            <div id="formula-p2-standard" class="formula-select-card active" onclick="selectFormulaP2('standard')">
              <div class="formula-card-title">Standard</div>
              <div class="formula-card-price" style="font-size:0.88rem; font-weight:700;">6 000 XOF</div>
              <small style="color:var(--gray-500); display:block; line-height:1.2; font-size:0.65rem;">Mise en ligne standard (30j)</small>
              <i class="fas fa-check-circle check-icon"></i>
            </div>
            <!-- Premium Card -->
            <div id="formula-p2-premium" class="formula-select-card" onclick="selectFormulaP2('premium')">
              <div class="formula-card-title">Premium</div>
              <div class="formula-card-price" style="font-size:0.88rem; font-weight:700;">10 000 XOF</div>
              <small style="color:var(--gray-500); display:block; line-height:1.2; font-size:0.65rem;">Boost visibilité max (30j)</small>
              <i class="fas fa-check-circle check-icon"></i>
            </div>
          </div>
          <input type="hidden" id="add-formula-p2" value="standard">
        </div>

        <!-- UPLOAD D'IMAGES REELLES -->
        <div class="form-group">
          <label class="form-label" style="font-weight:600;">Photos du logement (Jusqu'à 7 photos)</label>
          <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;">
            <div id="p2-upload-trigger" style="border:2px dashed var(--gray-400); border-radius:var(--radius-sm); width:70px; height:70px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-500); transition:all 0.2s;" onclick="triggerP2ImageUpload()">
              <i class="fas fa-camera" style="font-size:1.15rem;"></i>
              <span style="font-size:0.65rem; margin-top:2px; font-weight:700;" id="p2-upload-count">0 / 7</span>
            </div>
            <div id="p2-thumbnails-container" style="display:flex; gap:0.4rem; overflow-x:auto; flex:1;">
              <!-- Vignettes -->
            </div>
          </div>
          <input type="file" id="p2-image-input" multiple accept="image/*" style="display:none;" onchange="handleP2FileSelect(this)">
          <input type="hidden" id="add-images-count" value="0">
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label" for="add-type">Type de bien</label>
            <select class="form-control" id="add-type">
              <option value="appartement">Appartement</option>
              <option value="maison">Maison / Villa</option>
              <option value="studio">Studio</option>
              <option value="bureau">Bureau</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="add-city">Ville</label>
            <select class="form-control" id="add-city">
              <option value="Cotonou">Cotonou</option>
              <option value="Abomey-Calavi">Abomey-Calavi</option>
              <option value="Porto-Novo">Porto-Novo</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label" for="add-address">Quartier</label>
            <input type="text" class="form-control" id="add-address" placeholder="Ex: Fidjrossè" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="add-surface">Surface habitable (m²)</label>
            <input type="number" class="form-control" id="add-surface" placeholder="Ex: 85" required>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label" for="add-loyer">Loyer mensuel (FCFA)</label>
            <input type="number" class="form-control" id="add-loyer" placeholder="Ex: 120000" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="add-chambres">Nombre de chambres</label>
            <input type="number" class="form-control" id="add-chambres" value="2" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label" for="add-desc">Brève description</label>
          <textarea class="form-control" id="add-desc" rows="2" placeholder="Équipements, balcon, garage, état général..." required style="resize:none; font-family:var(--font-family);"></textarea>
        </div>

        <div style="display:flex; gap:0.75rem;">
          <button type="button" class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
          <button type="submit" class="btn btn-primary" style="flex:2;">
            <i class="fas fa-check"></i> Publier l'annonce
          </button>
        </div>
      </form>
    </div>
  `);
}

function submitNewListingP2(event, userId) {
  event.preventDefault();

  const title = document.getElementById("add-title").value;
  const type = document.getElementById("add-type").value;
  const city = document.getElementById("add-city").value;
  const address = document.getElementById("add-address").value;
  const surface = parseInt(document.getElementById("add-surface").value);
  const loyer = parseInt(document.getElementById("add-loyer").value);
  const bedrooms = parseInt(document.getElementById("add-chambres").value);
  const desc = document.getElementById("add-desc").value;
  const formula = document.getElementById("add-formula-p2").value;

  closeCustomModal();

  const datePub = new Date();
  const dateExp = new Date();
  dateExp.setDate(datePub.getDate() + 30);
  
  const datePubStr = datePub.toLocaleDateString("fr-FR");
  const dateExpStr = dateExp.toLocaleDateString("fr-FR");

  // Determine primary image
  const primaryImage = p2UploadedImagesList.length > 0 ? p2UploadedImagesList[0].url : "./apt_kitchen.png";

  const newBienId = "b_new_" + Math.floor(100 + Math.random() * 900);
  const newBien = {
    id: newBienId,
    proprietaireId: userId,
    locataireId: null,
    title: title,
    type: type,
    city: city,
    address: address,
    loyer: loyer,
    surface: surface,
    bedrooms: bedrooms,
    bathrooms: 1,
    status: "En annonce",
    verified: false,
    image: primaryImage,
    dateDebutBail: null,
    dateFinBail: null,
    commission: 0,
    formula: formula,
    datePublication: datePubStr,
    dateExpiration: dateExpStr,
    joursRestants: 30,
    imagesUploaded: p2UploadedImagesList.length
  };

  // Ajouter aux bases de données locales
  mockBiens.push(newBien);
  mockDb.properties.push({
    id: Math.floor(100 + Math.random() * 900),
    title: title,
    type: type,
    city: city,
    address: address,
    price: loyer,
    bedrooms: bedrooms,
    bathrooms: 1,
    surface: surface,
    status: "À Louer",
    image: primaryImage,
    verified: false,
    desc: desc
  });

  if (formula === "premium") {
    p2AnnoncesPremium.push(newBienId);
    showAlert("success", "Annonce publiée & Boostée !", `Votre bien "${title}" est publié en ligne avec la formule Premium (10 000 XOF).`);
  } else {
    showAlert("success", "Annonce publiée !", `Votre bien "${title}" est en ligne (Formule ${formula === "decouverte" ? "Découverte" : "Standard 6 000 XOF"}).`);
  }
  
  // Recharger l'onglet Annonces
  dashTabP2("annonces", userId);
}

// ──────────────────────────────────────────
// ACTIONS : DECIDER SUR LES CANDIDATURES
// ──────────────────────────────────────────
function decideCandidature(candId, decision) {
  const cand = p2Candidatures.find(c => c.id === candId);
  if (!cand) return;

  cand.statut = decision;

  if (decision === "Accepté") {
    showAlert("success", "Candidature validée !", `Vous avez accepté le dossier de ${cand.candidat.name}. BatiBid prépare la rédaction du contrat de bail numérique. Vous serez notifié sur WhatsApp dès sa signature.`);
  } else {
    showAlert("info", "Candidature rejetée", `Le dossier de ${cand.candidat.name} a été marqué comme refusé.`);
  }

  // Actualiser l'onglet
  const user = state.currentUser;
  dashTabP2("candidatures", user.id);
}

// ──────────────────────────────────────────
// ACTIONS : PAIEMENT BOOST MOMO
// ──────────────────────────────────────────
// ──────────────────────────────────────────
// ACTIONS : PAIEMENT BOOST MOMO & RENOUVELLEMENT
// ──────────────────────────────────────────
let p2ActiveBoost = {
  type: "",
  amount: 0
};
let p2ActiveRenewBienId = "";

function parseDateBJ(dateStr) {
  const parts = dateStr.split("/");
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function openBoostPaymentModal(type, amount) {
  p2ActiveBoost = { type, amount };
  const descText = type === "premium" ? "Boost de visibilité Premium" : "Reportage Photo Professionnel par BatiBid";

  showCustomModal(`
    <div style="text-align:left;">
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
        <div style="background:var(--primary-light); color:var(--primary); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
          <i class="fas fa-rocket"></i>
        </div>
        <div>
          <h3 style="margin:0; font-size:1.1rem;">Achat d'option Mobile Money</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--gray-600);">${descText}</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Montant à régler (XOF)</label>
        <input type="text" class="form-control" value="${formatCurrency(amount)}" readonly style="background-color: var(--gray-100); font-weight: 700; color: var(--secondary);">
      </div>

      <div class="form-group">
        <label class="form-label" for="p2-boost-op">Opérateur Mobile Money</label>
        <select class="form-control" id="p2-boost-op">
          <option value="mtn">MTN MoMo (+229 01 96 45 10 20)</option>
          <option value="moov">Moov Flooz</option>
          <option value="celtiis">Celtiis Cash</option>
        </select>
      </div>

      <div style="display:flex; gap:0.75rem; margin-top:1.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
        <button class="btn btn-primary" style="flex:2;" onclick="submitBoostPaymentP2()">
          <i class="fas fa-mobile-alt"></i> Payer via USSD Push
        </button>
      </div>
    </div>
  `);
}

function submitBoostPaymentP2() {
  const method = document.getElementById("p2-boost-op").value;
  closeCustomModal();

  const modal = document.getElementById("ussd-simulator-modal");
  const ussdText = document.getElementById("ussd-modal-text");
  
  if (modal && ussdText) {
    const opName = method === "mtn" ? "MTN MoMo" : method === "moov" ? "Moov Flooz" : "Celtiis Cash";
    ussdText.innerText = `BatiBid (${opName}): Confirmez le paiement de ${formatCurrency(p2ActiveBoost.amount)} pour l'achat du ${p2ActiveBoost.type === "premium" ? "Boost Annonce Premium" : "Reportage Photo Pro"} en entrant votre code PIN de validation.`;
    
    const pin = document.getElementById("ussd-pin-input");
    if (pin) pin.value = "";
    
    modal.classList.add("active");
  }
}

window.openRenewPaymentModal = function(bienId) {
  p2ActiveRenewBienId = bienId;
  const bien = mockBiens.find(b => b.id === bienId);
  const bienTitle = bien ? bien.title : "votre annonce";

  showCustomModal(`
    <div style="text-align:left;">
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
        <div style="background:var(--primary-light); color:var(--primary); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
          <i class="fas fa-redo-alt"></i>
        </div>
        <div>
          <h3 style="margin:0; font-size:1.1rem;">Renouveler mon annonce</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--gray-600);">${bienTitle}</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Frais de renouvellement (30 jours supplémentaires)</label>
        <input type="text" class="form-control" value="6 000 FCFA" readonly style="background-color: var(--gray-100); font-weight: 700; color: var(--secondary);">
      </div>

      <div class="form-group">
        <label class="form-label" for="p2-renew-op">Opérateur Mobile Money</label>
        <select class="form-control" id="p2-renew-op">
          <option value="mtn">MTN MoMo (+229 01 96 45 10 20)</option>
          <option value="moov">Moov Flooz</option>
          <option value="celtiis">Celtiis Cash</option>
        </select>
      </div>

      <div style="display:flex; gap:0.75rem; margin-top:1.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
        <button class="btn btn-primary" style="flex:2;" onclick="submitRenewPaymentP2()">
          <i class="fas fa-mobile-alt"></i> Payer via USSD Push
        </button>
      </div>
    </div>
  `);
};

window.submitRenewPaymentP2 = function() {
  const method = document.getElementById("p2-renew-op").value;
  closeCustomModal();

  const modal = document.getElementById("ussd-simulator-modal");
  const ussdText = document.getElementById("ussd-modal-text");
  
  if (modal && ussdText) {
    const opName = method === "mtn" ? "MTN MoMo" : method === "moov" ? "Moov Flooz" : "Celtiis Cash";
    ussdText.innerText = `BatiBid (${opName}): Confirmez le paiement de 6 000 FCFA pour le renouvellement de votre annonce pour 30 jours en entrant votre code PIN de validation.`;
    
    const pin = document.getElementById("ussd-pin-input");
    if (pin) pin.value = "";
    
    p2ActiveBoost = { type: "renew-p2", amount: 6000 };
    
    modal.classList.add("active");
  }
};

function confirmBoostP2() {
  const user = state.currentUser;
  
  if (p2ActiveBoost.type === "premium") {
    if (!p2AnnoncesPremium.includes("b4")) {
      p2AnnoncesPremium.push("b4");
    }
    showAlert("success", "Annonce Boostée !", "Votre annonce est désormais tagguée 'Premium' et propulsée en tête du catalogue BatiBid.");
  } else if (p2ActiveBoost.type === "renew-p2") {
    const bien = mockBiens.find(b => b.id === p2ActiveRenewBienId);
    if (bien) {
      const currentExp = bien.dateExpiration ? parseDateBJ(bien.dateExpiration) : new Date();
      currentExp.setDate(currentExp.getDate() + 30);
      bien.dateExpiration = currentExp.toLocaleDateString("fr-FR");
      bien.joursRestants = (bien.joursRestants || 0) + 30;
      
      showAlert("success", "Annonce Renouvelée !", `Votre annonce "${bien.title}" a été prolongée de 30 jours (Fin de parution le ${bien.dateExpiration}).`);
    }
  } else {
    showAlert("success", "Commande validée !", "Votre commande de reportage photo professionnel a bien été prise en compte. Un photographe prendra contact avec vous sous 24h.");
  }

  dashTabP2("annonces", user.id);
}
