/**
 * BatiBid — Dashboard Profil 3 (Locataire Chercheur)
 * Rendu complet : KPIs, favoris, mes candidatures, dossier de solvabilité
 */

// Liste des candidatures actives de Jean DOSSOU
let p3Candidatures = [
  {
    id: "cand-p3-01",
    bienId: "b1", // Appartement Haie Vive
    date: "06/06/2026",
    statut: "À l'étude", // "À l'étude", "Accepté", "Refusé"
    etape: 2, // 1: Dossier envoyé, 2: Visite effectuée & Dossier à l'étude, 3: Contrat proposé, 4: Clés remises
    bienTitle: "Appartement F3 Haut Standing — Haie Vive",
    loyer: 350000
  }
];

// Progression du dossier de solvabilité de Jean (100% de base)
let p3SolvencyScore = 100;
let p3SolvencyDocs = [
  { name: "Pièce d'identité (CNI_Jean_DOSSOU.pdf)", type: "cni", date: "01/06/2026", status: "Vérifié" },
  { name: "Contrat de travail (Contrat_Cadre_MTN.pdf)", type: "contrat", date: "01/06/2026", status: "Vérifié" },
  { name: "Bulletins de salaire (3_Derniers_Bulletins.pdf)", type: "bulletins", date: "01/06/2026", status: "Vérifié" }
];

function renderDashboardLocataireChercheur(user) {
  const root = document.getElementById("dashboard-root-layout");
  if (!root) return;

  // Calculs
  const savedIds = mockDb.savedProperties;
  const userCands = p3Candidatures;
  const notifs = (mockNotifications[user.id] || []).filter(n => !n.lu);

  root.innerHTML = `
    <div class="dashboard-p3">
      <div class="dash-mobile-topbar">
        <button class="dash-menu-toggle" onclick="toggleDashSidebar()">
          <i class="fas fa-bars"></i>
        </button>
        <div class="dash-mobile-logo">BatiBid Espace</div>
        <div class="dash-avatar-small">${user.avatar}</div>
      </div>

      <!-- ===== SIDEBAR ===== -->
      <aside class="dash-sidebar">
        <div class="dash-sidebar-profile">
          <div class="dash-avatar">${user.avatar}</div>
          <div>
            <div class="dash-user-name">${user.name}</div>
            <div class="dash-user-role">
              <span class="dash-badge-formula">
                <i class="fas fa-search"></i> Locataire Chercheur
              </span>
            </div>
          </div>
        </div>

        <nav class="dash-nav">
          <a class="dash-nav-item active" onclick="dashTabP3('overview','${user.id}')">
            <i class="fas fa-th-large"></i> Vue d'ensemble
          </a>
          <a class="dash-nav-item" onclick="dashTabP3('favoris','${user.id}')">
            <i class="fas fa-heart"></i> Mes Favoris
            <span class="dash-nav-badge">${savedIds.length}</span>
          </a>
          <a class="dash-nav-item" onclick="dashTabP3('candidatures','${user.id}')">
            <i class="fas fa-folder-open"></i> Candidatures
            <span class="dash-nav-badge">${userCands.length}</span>
          </a>
          <a class="dash-nav-item" onclick="dashTabP3('solvabilite','${user.id}')">
            <i class="fas fa-shield-alt"></i> Solvabilité BatiBid
            ${p3SolvencyScore < 100 ? `<span class="dash-nav-badge dash-nav-badge--alert">!</span>` : `<span class="dash-nav-badge" style="background:var(--success);"><i class="fas fa-check"></i></span>`}
          </a>
          <a class="dash-nav-item" onclick="dashTabP3('profil','${user.id}')">
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
        ${renderDashP3Overview(user, savedIds, userCands, notifs)}
      </main>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: VUE D'ENSEMBLE
// ──────────────────────────────────────────
function renderDashP3Overview(user, savedIds, userCands, notifs) {
  // Calcul de la jauge circulaire
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (p3SolvencyScore / 100) * circumference;

  let solvencyBadge = `<span class="solvency-status-badge solvency-status--verified"><i class="fas fa-check-circle"></i> Dossier 100% Validé</span>`;
  let solvencyNotice = "Votre dossier de solvabilité a été approuvé par BatiBid. Les propriétaires recevront votre candidature avec un label de confiance prioritaire.";
  
  if (p3SolvencyScore < 100) {
    solvencyBadge = `<span class="solvency-status-badge solvency-status--pending"><i class="fas fa-exclamation-circle"></i> Pièces manquantes</span>`;
    solvencyNotice = "Complétez votre dossier pour que nos équipes puissent valider votre solvabilité et booster vos chances d'obtention de bail.";
  }

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Bonjour, ${user.name.split(" ")[2]} 👋</h1>
        <p class="dash-page-subtitle">Suivez vos recherches et gérez vos dossiers de candidature</p>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('#trouver')">
        <i class="fas fa-search"></i> Parcourir le catalogue de biens
      </button>
    </div>

    <!-- JAUGE DE SOLVABILITÉ -->
    <div class="solvency-box">
      <div class="solvency-progress-wrapper">
        <svg class="solvency-progress-svg">
          <circle class="solvency-progress-bg" cx="45" cy="45" r="40"></circle>
          <circle class="solvency-progress-bar" cx="45" cy="45" r="40" style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};"></circle>
        </svg>
        <span class="solvency-percent">${p3SolvencyScore}%</span>
      </div>
      <div class="solvency-info">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:var(--secondary);">Label Garant BatiBid</h3>
          ${solvencyBadge}
        </div>
        <p style="font-size:0.88rem; color:var(--gray-600); margin:0 0 1rem; line-height:1.5;">${solvencyNotice}</p>
        <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.9rem;" onclick="dashTabP3('solvabilite', '${user.id}')">
          <i class="fas fa-folder-open"></i> Gérer mes pièces justificatives
        </button>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="dash-kpi-grid">
      <div class="dash-kpi-card dash-kpi--primary">
        <div class="dash-kpi-icon"><i class="fas fa-heart"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Biens sauvegardés</span>
          <span class="dash-kpi-value">${savedIds.length} favoris</span>
          <span class="dash-kpi-sub">Biens en attente de décision</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e3f2fd; color: #1565c0;"><i class="fas fa-paper-plane"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Candidatures actives</span>
          <span class="dash-kpi-value">${userCands.length} déposée(s)</span>
          <span class="dash-kpi-sub">En cours d'évaluation</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e8f5e9; color: #2E7D32;"><i class="fas fa-handshake"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Visites programmées</span>
          <span class="dash-kpi-value">1 planifiée</span>
          <span class="dash-kpi-sub">Visite physique ou virtuelle 360</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #fff3e0; color: #e65100;"><i class="fas fa-bell"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Alertes email & SMS</span>
          <span class="dash-kpi-value">Actives</span>
          <span class="dash-kpi-sub">Pour vos zones de recherche</span>
        </div>
      </div>
    </div>

    <!-- DEUX COLONNES -->
    <div class="dash-two-col" style="margin-top: 2.5rem;">
      <!-- Favoris Rapides -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-heart"></i> Favoris récents</h3>
          <button class="dash-link-btn" onclick="dashTabP3('favoris', '${user.id}')">Voir tous →</button>
        </div>
        <div class="dash-biens-list">
          ${savedIds.length === 0 ? `
            <p style="font-size:0.85rem; color:var(--gray-600); padding:1rem 0;">Aucun favori enregistré. Visitez le catalogue pour sauvegarder des biens.</p>
          ` : savedIds.slice(0, 3).map(id => {
            const b = mockDb.properties.find(item => item.id === id);
            if (!b) return "";
            return `
              <div class="dash-bien-row">
                <img src="${b.image}" alt="${b.title}" class="dash-bien-thumb">
                <div class="dash-bien-info">
                  <div class="dash-bien-title">${b.title}</div>
                  <div class="dash-bien-address"><i class="fas fa-map-marker-alt"></i> ${b.address}, ${b.city}</div>
                </div>
                <div style="font-weight:700; font-size:0.85rem; color:var(--primary);">${formatCurrency(b.price)}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Candidature active -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-paper-plane"></i> Candidature active</h3>
          <button class="dash-link-btn" onclick="dashTabP3('candidatures', '${user.id}')">Suivre mes dossiers →</button>
        </div>
        ${userCands.length === 0 ? `
          <p style="font-size:0.85rem; color:var(--gray-600); padding:1rem 0;">Aucune candidature en cours.</p>
        ` : (() => {
          const c = userCands[0];
          return `
            <div style="display:flex; flex-direction:column; gap:1rem; font-size:0.88rem;">
              <div>
                <strong>${c.bienTitle}</strong>
                <div style="color:var(--gray-600); font-size:0.78rem; margin-top:0.2rem;">Loyer : ${formatCurrency(c.loyer)}/mois · Envoyée le ${c.date}</div>
              </div>
              <div style="background:var(--gray-100); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--gray-200);">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-weight:700;">
                  <span>Statut du dossier :</span>
                  <span style="color:var(--primary);">${c.statut}</span>
                </div>
                <div class="cand-timeline" style="margin:1rem 0 0.5rem;">
                  <div class="cand-timeline-step ${c.etape >= 1 ? "completed" : ""}">
                    <div class="cand-step-dot"><i class="fas fa-check"></i></div>
                    <span>Dossier envoyé</span>
                  </div>
                  <div class="cand-timeline-step ${c.etape === 2 ? "active" : c.etape > 2 ? "completed" : ""}">
                    <div class="cand-step-dot">${c.etape > 2 ? '<i class="fas fa-check"></i>' : '2'}</div>
                    <span>Étude / Visite</span>
                  </div>
                  <div class="cand-timeline-step ${c.etape === 3 ? "active" : c.etape > 3 ? "completed" : ""}">
                    <div class="cand-step-dot">3</div>
                    <span>Contrat</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        })()}
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: MES FAVORIS
// ──────────────────────────────────────────
function renderDashP3Favoris(user, savedIds) {
  const properties = savedIds.map(id => mockDb.properties.find(p => p.id === id)).filter(Boolean);

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Mes Favoris</h1>
        <p class="dash-page-subtitle">Biens immobiliers que vous avez sauvegardés pour suivi</p>
      </div>
    </div>

    ${properties.length === 0 ? `
      <div class="dash-card text-center" style="padding:4rem;">
        <i class="far fa-heart" style="font-size:3rem; color:var(--gray-400); margin-bottom:1rem; display:block; margin-inline:auto;"></i>
        <h4 class="headline-md">Aucun favori enregistré</h4>
        <p class="body-md" style="color:var(--gray-600); margin-bottom:1.5rem;">Sauvegardez des biens depuis le catalogue pour les retrouver ici.</p>
        <button class="btn btn-primary" onclick="navigateTo('#trouver')">Découvrir le catalogue</button>
      </div>
    ` : `
      <div class="fav-grid">
        ${properties.map(p => {
          const alreadyApplied = p3Candidatures.some(c => c.bienTitle.includes(p.title));
          return `
            <div class="dash-listing-card">
              <div class="dash-listing-img-wrapper">
                <img src="${p.image}" alt="${p.title}" class="dash-listing-img">
                <span class="property-card-badge" style="background-color: var(--success-light); color: var(--success); font-weight:700;"><i class="fas fa-check-circle"></i> Vérifié</span>
              </div>
              <div class="dash-listing-body">
                <h3 class="dash-listing-title">${p.title}</h3>
                <p style="font-size:0.8rem; color:var(--gray-600); margin:0 0 1rem;"><i class="fas fa-map-marker-alt"></i> ${p.address}, ${p.city} · ${p.surface} m²</p>
                <div style="font-size:1.15rem; font-weight:800; color:var(--primary); margin-bottom:1rem;">${formatCurrency(p.price)} / mois</div>
                
                <div style="display:flex; gap:0.5rem; margin-top:1.25rem;">
                  <button class="btn btn-secondary" style="flex:1; font-size:0.75rem; padding:0.4rem;" onclick="removeFavoriteP3(${p.id})">
                    <i class="fas fa-trash-alt"></i> Retirer
                  </button>
                  ${alreadyApplied ? `
                    <button class="btn btn-secondary" style="flex:1.5; font-size:0.75rem; padding:0.4rem; color:var(--success); border-color:var(--success);" disabled>
                      <i class="fas fa-check-circle"></i> Déjà postulé
                    </button>
                  ` : `
                    <button class="btn btn-primary" style="flex:1.5; font-size:0.75rem; padding:0.4rem;" onclick="openApplyModalP3(${p.id}, '${p.title}', ${p.price})">
                      <i class="fas fa-paper-plane"></i> Déposer dossier
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `}
  `;
}

// ──────────────────────────────────────────
// TAB: MES CANDIDATURES
// ──────────────────────────────────────────
function renderDashP3Candidatures(user) {
  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Mes candidatures</h1>
        <p class="dash-page-subtitle">Suivi du traitement de vos dossiers locatifs déposés</p>
      </div>
    </div>

    <div>
      ${p3Candidatures.length === 0 ? `
        <div class="dash-card text-center" style="padding:4rem;">
          <i class="fas fa-paper-plane" style="font-size:3rem; color:var(--gray-400); margin-bottom:1rem; display:block; margin-inline:auto;"></i>
          <h4 class="headline-md">Aucune candidature déposée</h4>
          <p class="body-md" style="color:var(--gray-600); margin-bottom:1.5rem;">Postulez à des logements depuis vos favoris pour lancer l'évaluation.</p>
          <button class="btn btn-primary" onclick="dashTabP3('favoris', '${user.id}')">Aller aux favoris</button>
        </div>
      ` : p3Candidatures.map(c => `
        <div class="candidate-dossier-card" style="flex-direction:column; align-items:stretch;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; border-bottom:1px solid var(--gray-100); padding-bottom:1rem; margin-bottom:1rem;">
            <div>
              <h3 style="font-size:1.1rem; margin:0 0 0.25rem;">${c.bienTitle}</h3>
              <p style="font-size:0.8rem; color:var(--gray-600); margin:0;">Loyer demandé : <strong>${formatCurrency(c.loyer)} / mois</strong> · Envoyée le ${c.date}</p>
            </div>
            <div>
              <span class="dash-status-badge dash-status-${c.statut === "Accepté" ? "occupé" : c.statut === "À l'étude" ? "en-annonce" : "incident"}" style="font-size:0.8rem; padding:0.4rem 0.85rem;">
                ${c.statut}
              </span>
            </div>
          </div>
          
          <div style="background:var(--gray-100); padding:1.25rem; border-radius:var(--radius-sm); border:1px solid var(--gray-200);">
            <h4 style="font-size:0.85rem; font-weight:700; color:var(--secondary); margin-bottom:1rem;"><i class="fas fa-route" style="color:var(--primary); margin-right:0.35rem;"></i>Étapes de traitement BatiBid :</h4>
            <div class="cand-timeline">
              <div class="cand-timeline-step ${c.etape >= 1 ? "completed" : ""}">
                <div class="cand-step-dot"><i class="fas fa-check"></i></div>
                <span>Dossier transmis</span>
              </div>
              <div class="cand-timeline-step ${c.etape === 2 ? "active" : c.etape > 2 ? "completed" : ""}">
                <div class="cand-step-dot">${c.etape > 2 ? '<i class="fas fa-check"></i>' : '2'}</div>
                <span>Visite & Évaluation</span>
              </div>
              <div class="cand-timeline-step ${c.etape === 3 ? "active" : c.etape > 3 ? "completed" : ""}">
                <div class="cand-step-dot">3</div>
                <span>Contrat en rédaction</span>
              </div>
              <div class="cand-timeline-step ${c.etape === 4 ? "active" : c.etape > 4 ? "completed" : ""}">
                <div class="cand-step-dot">4</div>
                <span>Remise des clés</span>
              </div>
            </div>
          </div>

          ${c.statut === "Accepté" ? `
            <div style="margin-top:1.25rem; display:flex; justify-content:flex-end; gap:1rem;">
              <button class="btn btn-primary" onclick="showAlert('success', 'Contrat en préparation', 'Le propriétaire a accepté votre dossier. Le support BatiBid prépare la signature électronique du contrat.')">
                <i class="fas fa-file-contract"></i> Signer mon bail
              </button>
            </div>
          ` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: DOSSIER DE SOLVABILITÉ
// ──────────────────────────────────────────
function renderDashP3Solvency(user) {
  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Mon Dossier de Solvabilité</h1>
        <p class="dash-page-subtitle">Rassemblez vos documents pour obtenir le label BatiBid Garant</p>
      </div>
    </div>

    <div class="solvency-box" style="margin-bottom:2rem;">
      <div class="solvency-info">
        <h3 style="margin:0 0 0.5rem; font-size:1.1rem; font-weight:700;">Statut de conformité : <strong>${p3SolvencyScore}%</strong></h3>
        <p style="font-size:0.88rem; color:var(--gray-600); margin:0; line-height:1.5;">
          ${p3SolvencyScore === 100 
            ? "Félicitations ! Votre dossier a été validé par nos auditeurs. Vous bénéficiez d'une garantie prioritaire de solvabilité vis-à-vis des propriétaires."
            : "Veuillez téléverser les pièces requises manquantes ci-dessous. Le support BatiBid audite votre dossier sous 12 heures ouvrables."
          }
        </p>
      </div>
      ${p3SolvencyScore === 100 ? `
        <span class="solvency-status-badge solvency-status--verified" style="font-size:0.95rem; padding:0.6rem 1.2rem;">
          <i class="fas fa-shield-alt"></i> Garant BatiBid Actif
        </span>
      ` : ""}
    </div>

    <div class="dash-two-col">
      <!-- Zone de dépôt -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-file-upload"></i> Charger un justificatif</h3>
        </div>
        <div class="upload-dropzone" onclick="simulateDocUploadP3()">
          <i class="fas fa-file-medical upload-icon"></i>
          <h4>Déposer un document justificatif</h4>
          <p style="font-size:0.75rem; color:var(--gray-500); margin-top:0.25rem;">Pièce d'identité, Attestation de revenus ou contrat de travail</p>
        </div>
      </div>

      <!-- Liste des pièces -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-list-ul"></i> Liste des pièces de solvabilité</h3>
        </div>
        <div class="uploaded-docs-list" style="margin-top:0;">
          ${p3SolvencyDocs.map(doc => `
            <div class="uploaded-doc-item">
              <span style="display:flex; align-items:center; gap:0.5rem;">
                <i class="fas ${doc.type === "cni" ? "fa-id-card" : doc.type === "contrat" ? "fa-file-contract" : "fa-file-invoice-dollar"}" style="color:var(--primary);"></i>
                ${doc.name}
              </span>
              <span style="color:var(--success); font-weight:700;"><i class="fas fa-check-circle"></i> ${doc.status}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: MON PROFIL
// ──────────────────────────────────────────
function renderDashP3Profil(user) {
  return `
    <div class="dash-header">
      <h1 class="dash-page-title">Mon Profil</h1>
    </div>

    <div class="dash-card" style="max-width: 600px;">
      <div class="dash-card-header">
        <h3><i class="fas fa-user-circle"></i> Données personnelles</h3>
      </div>
      <div class="dash-profil-form">
        <div class="form-group">
          <label class="form-label">Nom et Prénom</label>
          <input type="text" class="form-control" value="${user.name}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Adresse de messagerie</label>
          <input type="email" class="form-control" value="${user.email}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Contact WhatsApp</label>
          <input type="tel" class="form-control" value="${user.phone}" readonly>
        </div>
        <button class="btn btn-secondary" onclick="showAlert('info','Profil','Pour modifier vos données personnelles de profil, veuillez solliciter notre support.')">
          <i class="fas fa-edit"></i> Demander une mise à jour
        </button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB SWITCHING NAVIGATION P3
// ──────────────────────────────────────────
function dashTabP3(tab, userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;

  const main = document.getElementById("dash-main-content");
  if (!main) return;

  // Auto-close mobile drawer sidebar
  const sidebar = document.querySelector(".dash-sidebar");
  if (sidebar) sidebar.classList.remove("open");
  const backdrop = document.querySelector(".dash-sidebar-backdrop");
  if (backdrop) backdrop.classList.remove("active");

  // Mettre à jour l'état actif dans la navigation
  document.querySelectorAll(".dash-nav-item").forEach(el => {
    el.classList.remove("active");
    if (el.getAttribute("onclick") && el.getAttribute("onclick").includes(`'${tab}'`)) {
      el.classList.add("active");
    }
  });

  const savedIds = mockDb.savedProperties;
  const userCands = p3Candidatures;
  const notifs = (mockNotifications[user.id] || []).filter(n => !n.lu);

  const renderers = {
    overview:     () => renderDashP3Overview(user, savedIds, userCands, notifs),
    favoris:      () => renderDashP3Favoris(user, savedIds),
    candidatures: () => renderDashP3Candidatures(user),
    solvabilite:  () => renderDashP3Solvency(user),
    profil:       () => renderDashP3Profil(user)
  };

  if (renderers[tab]) {
    main.innerHTML = renderers[tab]();
  }
}

// ──────────────────────────────────────────
// ACTIONS DES BIENS FAVORIS
// ──────────────────────────────────────────
function removeFavoriteP3(propId) {
  const idx = mockDb.savedProperties.indexOf(propId);
  if (idx > -1) {
    mockDb.savedProperties.splice(idx, 1);
    showAlert("info", "Favori retiré", "Le bien a été supprimé de vos favoris.");
    
    const user = state.currentUser;
    dashTabP3("favoris", user.id);
  }
}

function openApplyModalP3(propId, title, price) {
  showCustomModal(`
    <div style="text-align:left;">
      <h3 style="margin-bottom:1.25rem; color:var(--primary);"><i class="fas fa-paper-plane"></i> Poser ma candidature</h3>
      <p style="font-size:0.85rem; color:var(--gray-600); margin-bottom:1.5rem;">
        Vous déposez votre dossier pour le bien : <strong>${title}</strong> (${formatCurrency(price)} / mois).
      </p>
      
      <form onsubmit="submitApplyP3(event, ${propId}, '${title}', ${price})">
        <div style="background:var(--success-light); color:var(--success); border:1px solid var(--success); padding:0.75rem 1rem; border-radius:var(--radius-sm); font-size:0.82rem; margin-bottom:1.5rem; font-weight:600;">
          <i class="fas fa-shield-alt"></i> Votre dossier de solvabilité BatiBid est complet (100%). Il sera automatiquement attaché à votre envoi.
        </div>
        
        <div class="form-group">
          <label class="form-label" for="apply-msg">Message d'accompagnement pour le propriétaire</label>
          <textarea class="form-control" id="apply-msg" rows="4" placeholder="Ex: Bonjour, je suis cadre chez MTN, mon dossier est validé par BatiBid et je suis très motivé pour emménager..." required style="resize:none; font-family:var(--font-family);"></textarea>
        </div>

        <div style="display:flex; gap:0.75rem; margin-top:1.5rem;">
          <button type="button" class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
          <button type="submit" class="btn btn-primary" style="flex:2;">
            <i class="fas fa-check"></i> Soumettre mon dossier
          </button>
        </div>
      </form>
    </div>
  `);
}

function submitApplyP3(event, propId, title, price) {
  event.preventDefault();
  const msg = document.getElementById("apply-msg").value;
  closeCustomModal();

  const user = state.currentUser;
  
  // Ajouter à la liste locale des candidatures
  const newCand = {
    id: "cand-p3-" + Math.floor(100 + Math.random() * 900),
    bienId: "b_ext_" + propId,
    date: new Date().toLocaleDateString("fr-FR"),
    statut: "À l'étude",
    etape: 1,
    bienTitle: title,
    loyer: price
  };
  p3Candidatures.unshift(newCand);

  showAlert("success", "Candidature transmise !", `Votre dossier complet a bien été envoyé au propriétaire du bien "${title}". Vous serez informé dès qu'une visite ou qu'une décision sera planifiée.`);
  
  // Basculer vers l'onglet candidatures
  dashTabP3("candidatures", user.id);
}

function simulateDocUploadP3() {
  showAlert("success", "Vérification en cours", "Votre pièce justificative a été reçue et est en cours d'audit par BatiBid.");
}
