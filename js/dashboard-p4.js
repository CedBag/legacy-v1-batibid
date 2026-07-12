/**
 * BatiBid - Dashboard Profil 4 (Locataire Géré)
 * Rendu complet : KPIs, bail, transactions, incidents, paiement de loyer & dettes
 */

// Variables d'état temporaires pour le paiement P4
let p4ActivePayment = {
  type: "",    // "loyer" ou "dette"
  amount: 0,
  txId: ""
};

function renderDashboardLocataireGere(user) {
  const root = document.getElementById("dashboard-root-layout");
  if (!root) return;

  // Récupérer le bien loué et ses données associées
  const bien = mockBiens.find(b => b.id === user.bienLoueId);
  const userTx = mockTransactions.filter(t => t.locataireId === user.id);
  const incidents = mockIncidents.filter(i => i.bienId === user.bienLoueId);
  const notifs = (mockNotifications[user.id] || []).filter(n => !n.lu);

  root.innerHTML = `
    <div class="dashboard-p4">
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
                <i class="fas fa-key"></i> Locataire Géré
              </span>
            </div>
          </div>
        </div>

        <nav class="dash-nav">
          <a class="dash-nav-item active" onclick="dashTabP4('overview','${user.id}')">
            <i class="fas fa-th-large"></i> Vue d'ensemble
          </a>
          <a class="dash-nav-item" onclick="dashTabP4('logement','${user.id}')">
            <i class="fas fa-home"></i> Mon Logement
          </a>
          <a class="dash-nav-item" onclick="dashTabP4('finances','${user.id}')">
            <i class="fas fa-file-invoice-dollar"></i> Finances & Factures
            ${userTx.some(t => t.statutLocataire === "impayé") ? `<span class="dash-nav-badge dash-nav-badge--alert">!</span>` : ""}
          </a>
          <a class="dash-nav-item" onclick="dashTabP4('incidents','${user.id}')">
            <i class="fas fa-tools"></i> Maintenance & Incidents
            ${incidents.filter(i => i.statut === "En cours").length > 0 ? `<span class="dash-nav-badge">${incidents.filter(i => i.statut === "En cours").length}</span>` : ""}
          </a>
          <a class="dash-nav-item" onclick="dashTabP4('profil','${user.id}')">
            <i class="fas fa-user-cog"></i> Mon Profil
          </a>
          <a class="dash-nav-item" href="#blog" onclick="navigateTo('#blog')">
            <i class="fas fa-newspaper"></i> Blog BatiBid
          </a>
          <a class="dash-nav-item" onclick="handleLogout()" style="color: #ff6b6b !important;">
            <i class="fas fa-sign-out-alt"></i> Se déconnecter
          </a>
        </nav>

        <div class="dash-sidebar-support">
          <i class="fas fa-headset"></i>
          <div>
            <strong>Support BatiBid</strong>
            <span>Disponible 24h/7j</span>
          </div>
          <a href="https://wa.me/2290142484848?text=Bonjour%20BatiBid%2C%20je%20suis%20un%20utilisateur%20de%20l%27application%20et%20j%27ai%20une%20question." target="_blank" class="dash-whatsapp-btn">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </aside>

      <!-- ===== MAIN CONTENT ===== -->
      <main class="dash-main" id="dash-main-content">
        ${renderDashP4Overview(user, bien, userTx, incidents, notifs)}
      </main>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: VUE D'ENSEMBLE
// ──────────────────────────────────────────
function renderDashP4Overview(user, bien, userTx, incidents, notifs) {
  // Calculs financiers
  const loyerEnAttente = userTx.find(t => t.mois === "Juin 2026" && t.statutLocataire === "impayé");
  const detteActive = userTx.find(t => t.statutLocataire === "impayé" && t.mois !== "Juin 2026");
  const openIncidents = incidents.filter(i => i.statut === "En cours");

  let alertMarkup = "";

  if (user.congeDonne) {
    alertMarkup += `
      <div class="dash-alert-card dash-alert--warning" style="border-left: 4px solid var(--primary); background: rgba(217, 94, 43, 0.05); margin-bottom:1.5rem;">
        <div class="dash-alert-body">
          <h4 class="dash-alert-title" style="color: var(--primary); font-weight:700; display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <i class="fas fa-exclamation-circle"></i> Préavis de départ actif
          </h4>
          <p class="dash-alert-desc" style="color: var(--secondary); margin:0;">
            Votre demande de congé a été validée. Le préavis légal de 3 mois est en cours et prendra fin le <strong>${user.congeDate || '10/09/2026'}</strong>.
            Vous restez redevable des loyers jusqu'à cette date, après quoi un état des lieux de sortie sera effectué pour la restitution de votre caution.
          </p>
        </div>
      </div>
    `;
  }

  // 1. Alerte Loyer Avril impayé (Dette active)
  if (detteActive) {
    const totalDette = detteActive.montantBrut;
    alertMarkup += `
      <div class="dash-alert-card dash-alert--danger">
        <div class="dash-alert-body">
          <h4 class="dash-alert-title">
            <i class="fas fa-exclamation-triangle"></i> Dette locative active - Avril 2026
          </h4>
          <p class="dash-alert-desc">
            Votre loyer d'Avril de ${formatCurrency(detteActive.montantBrut)} est en retard et a été <strong>couvert par la garantie BatiBid</strong>. 
            Aucune pénalité de retard n'est appliquée. Total dû : <strong>${formatCurrency(totalDette)}</strong>.
          </p>
        </div>
        <button class="btn btn-primary" onclick="openPaymentModalP4('dette', ${totalDette}, '${detteActive.id}')">
          <i class="fas fa-shield-alt"></i> Régler ma dette
        </button>
      </div>
    `;
  }

  // 2. Alerte Loyer Juin en attente
  if (loyerEnAttente) {
    alertMarkup += `
      <div class="dash-alert-card dash-alert--warning">
        <div class="dash-alert-body">
          <h4 class="dash-alert-title">
            <i class="fas fa-clock"></i> Loyer mensuel en attente - Juin 2026
          </h4>
          <p class="dash-alert-desc">
            Votre loyer de Juin 2026 d'un montant de <strong>${formatCurrency(loyerEnAttente.montantBrut)}</strong> est exigible. 
            Date limite de paiement : <strong>${loyerEnAttente.dateEcheance}</strong>.
          </p>
        </div>
        <button class="btn btn-primary" onclick="openPaymentModalP4('loyer', ${loyerEnAttente.montantBrut}, '${loyerEnAttente.id}')">
          <i class="fas fa-wallet"></i> Payer mon loyer
        </button>
      </div>
    `;
  }

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Bonjour, ${user.name.split(" ")[2]} 👋</h1>
        <p class="dash-page-subtitle">Bienvenue sur votre espace locataire sécurisé</p>
      </div>
    </div>

    <!-- ALERTES PAIEMENT -->
    ${alertMarkup}

    <!-- KPI CARDS -->
    <div class="dash-kpi-grid">
      <div class="dash-kpi-card ${detteActive ? "dash-kpi--alert" : "dash-kpi--primary"}">
        <div class="dash-kpi-icon"><i class="fas fa-money-bill-wave"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Statut Loyer</span>
          <span class="dash-kpi-value">
            ${detteActive ? "Dette Active" : loyerEnAttente ? "En attente" : "À jour"}
          </span>
          <span class="dash-kpi-sub">
            ${detteActive ? "Règlement urgent à BatiBid" : loyerEnAttente ? "Date limite: 05 Juin 2026" : "Tous vos loyers sont réglés"}
          </span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e3f2fd; color: #1565c0;"><i class="fas fa-file-contract"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Mon Bail Actif</span>
          <span class="dash-kpi-value">${bien ? bien.dateDebutBail.split('/')[2] : "2026"}</span>
          <span class="dash-kpi-sub">Échéance : ${bien ? bien.dateFinBail : "-"}</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e8f5e9; color: #2E7D32;"><i class="fas fa-shield-alt"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Dette accumulée</span>
          <span class="dash-kpi-value">
            ${detteActive ? formatCurrency(detteActive.montantBrut) : "0 FCFA"}
          </span>
          <span class="dash-kpi-sub">Garanti par BatiBid - Sans pénalité</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #fff3e0; color: #e65100;"><i class="fas fa-tools"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Tickets maintenance</span>
          <span class="dash-kpi-value">${openIncidents.length}</span>
          <span class="dash-kpi-sub">Incident(s) en cours de résolution</span>
        </div>
      </div>
    </div>

    <!-- MON LOGEMENT ACTUEL -->
    <h3 class="headline-md mb-4" style="margin-top:2.5rem;"><i class="fas fa-home" style="color:var(--primary); margin-right:0.5rem;"></i>Mon logement actuel</h3>
    ${bien ? `
      <div class="dash-housing-card">
        <div class="dash-housing-gallery">
          <img src="${bien.image}" alt="${bien.title}" class="dash-housing-img">
          <div class="dash-housing-badges">
            <span class="dash-status-badge dash-status-occupé">✅ Logement Occupé</span>
          </div>
        </div>
        <div class="dash-housing-specs">
          <div>
            <h2 class="headline-md" style="color: var(--secondary); margin-bottom:0.25rem;">${bien.title}</h2>
            <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 1.25rem;">
              <i class="fas fa-map-marker-alt" style="color: var(--primary); margin-right:0.25rem;"></i> ${bien.address}, ${bien.city}
            </p>
            
            <div class="dash-housing-grid">
              <div class="dash-housing-spec-item">
                <span class="dash-housing-spec-label">Loyer Mensuel</span>
                <span class="dash-housing-spec-value" style="color: var(--primary);">${formatCurrency(bien.loyer)}</span>
              </div>
              <div class="dash-housing-spec-item">
                <span class="dash-housing-spec-label">Surface habitable</span>
                <span class="dash-housing-spec-value">${bien.surface} m²</span>
              </div>
              <div class="dash-housing-spec-item">
                <span class="dash-housing-spec-label">Pièces & Chambres</span>
                <span class="dash-housing-spec-value">${bien.bedrooms} ch. / ${bien.bathrooms} sdb</span>
              </div>
            </div>
          </div>
          
          <div style="display:flex; gap:1rem;">
            <button class="btn btn-secondary" onclick="dashTabP4('logement','${user.id}')">
              <i class="fas fa-info-circle"></i> Voir les détails du bail
            </button>
            <button class="btn btn-secondary" style="border-color:#25D366; color:#2E7D32;" onclick="window.open('https://wa.me/2290142484848?text=Bonjour%20BatiBid%2C%20je%20suis%20un%20utilisateur%20de%20l%27application%20et%20j%27ai%20une%20question.')">
              <i class="fab fa-whatsapp" style="margin-right:0.5rem;"></i> Contacter le support
            </button>
          </div>
        </div>
      </div>
    ` : `
      <div class="dash-card text-center" style="padding:4rem;">
        <p>Aucun logement enregistré pour ce compte.</p>
      </div>
    `}
  `;
}

// ──────────────────────────────────────────
// TAB: MON LOGEMENT (Détail)
// ──────────────────────────────────────────
function renderDashP4Logement(user, bien) {
  if (!bien) return `<div class="dash-card text-center" style="padding:4rem;"><p>Données indisponibles.</p></div>`;

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Mon Logement</h1>
        <p class="dash-page-subtitle">Informations relatives à votre location active</p>
      </div>
    </div>

    ${user.congeDonne ? `
      <div class="dash-alert-card dash-alert--warning" style="border-left: 4px solid var(--primary); background: rgba(217, 94, 43, 0.05); margin-bottom:2rem;">
        <div class="dash-alert-body">
          <h4 class="dash-alert-title" style="color: var(--primary); font-weight:700; display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <i class="fas fa-exclamation-circle"></i> Préavis de départ actif
          </h4>
          <p class="dash-alert-desc" style="color: var(--secondary); margin: 0;">
            Votre préavis légal de 3 mois est en cours et prendra fin le <strong>${user.congeDate}</strong>.
            Vous devez régler les loyers restants et libérer le logement à cette date.
          </p>
        </div>
      </div>
    ` : ""}

    <div class="dash-two-col">
      <!-- Fiche Technique -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-building"></i> Caractéristiques du logement</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem; font-size:0.92rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Type de bien</span>
            <strong>${bien.type.charAt(0).toUpperCase() + bien.type.slice(1)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Ville</span>
            <strong>${bien.city}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Quartier / Adresse</span>
            <strong>${bien.address}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Superficie</span>
            <strong>${bien.surface} m²</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Chambres</span>
            <strong>${bien.bedrooms} chambres</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding-bottom:0.25rem;">
            <span style="color:var(--gray-600); font-weight:600;">Salles de bain</span>
            <strong>${bien.bathrooms} sdb</strong>
          </div>
        </div>
      </div>

      <!-- Conditions du Bail -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-file-contract"></i> Conditions de location</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem; font-size:0.92rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Loyer de base</span>
            <strong>${formatCurrency(bien.loyer)} / mois</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Début du bail</span>
            <strong>${bien.dateDebutBail}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Fin du bail</span>
            <strong>${bien.dateFinBail}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <span style="color:var(--gray-600); font-weight:600;">Mode de paiement exigé</span>
            <strong>Mobile Money / Virement direct</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding-bottom:0.25rem;">
            <span style="color:var(--gray-600); font-weight:600;">Gestionnaire</span>
            <strong style="color:var(--primary);">BatiBid SARL (Gestion Intégrale)</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Dépôt de Garantie & Documents et Mandat de gestion -->
    <div class="dash-two-col" style="margin-top: 2rem;">
      <!-- Dépôt de Garantie & Documents -->
      <div class="dash-card" style="background: var(--white);">
        <div class="dash-card-header">
          <h3><i class="fas fa-piggy-bank"></i> Dépôt de garantie & Documents</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem; font-size:0.92rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--gray-100); padding-bottom:0.75rem;">
            <div>
              <span style="color:var(--gray-600); font-weight:600; display:block;">Dépôt de garantie (Caution)</span>
              <small style="color:var(--gray-500);">Sécurisé par BatiBid (Garantie de restitution)</small>
            </div>
            <strong style="color:var(--success); font-size:1.05rem;">${formatCurrency(bien.loyer * 2)}</strong>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:0.25rem;">
            <div>
              <span style="color:var(--gray-600); font-weight:600; display:block;">Contrat de bail numérique</span>
              <small style="color:var(--gray-500);">Signé électroniquement le ${bien.dateDebutBail}</small>
            </div>
            <button class="btn btn-secondary" style="font-size:0.75rem; padding:0.4rem 0.8rem;" onclick="showAlert('success', 'Téléchargement', 'Simulation : Le document Contrat_Bail_F3_Signe.pdf a été téléchargé.')">
              <i class="fas fa-download"></i> Télécharger
            </button>
          </div>
        </div>
      </div>

      <!-- Relation Tripartite BatiBid -->
      <div class="dash-card" style="background:#fafafa; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 style="font-size:1rem; font-weight:700; color:var(--secondary); margin-bottom:0.5rem;"><i class="fas fa-shield-alt" style="color:var(--primary); margin-right:0.5rem;"></i>Relation Tripartite BatiBid</h3>
          <p style="font-size:0.88rem; color:var(--gray-600); line-height:1.6; margin:0 0 1rem 0;">
            Ce bien est sous mandat exclusif de **Gestion Intégrale**. BatiBid gère l'ensemble de la relation financière et technique.
            Ne versez aucun loyer directement au propriétaire.
          </p>
        </div>
        <div style="display:flex; gap:0.75rem; margin-top:auto;">
          ${user.congeDonne 
            ? `<div style="background:#ffebee; color:#c62828; border:1px solid #ffcdd2; border-radius:var(--radius-sm); padding:0.5rem 0.75rem; font-size:0.82rem; font-weight:600; width:100%; text-align:center;">
                 <i class="fas fa-info-circle"></i> Préavis de départ actif (jusqu'au ${user.congeDate})
               </div>`
            : `<button class="btn" style="border:1px solid #d32f2f; color:#d32f2f; background:transparent; font-size:0.82rem; padding:0.5rem 1rem; font-weight:600; border-radius:var(--radius-sm); width:100%; transition:all 0.2s;" onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='transparent'" onclick="terminateLeaseP4('${bien.id}', '${user.id}')">
                 <i class="fas fa-sign-out-alt"></i> Résilier mon bail / Donner congé
               </button>`
          }
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: FINANCES & FACTURES (Historique)
// ──────────────────────────────────────────
function renderDashP4Finances(user, userTx) {
  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Mes Paiements & Factures</h1>
        <p class="dash-page-subtitle">Historique des transactions de loyer réglées à BatiBid</p>
      </div>
    </div>

    <div class="dash-card">
      <div class="dash-card-header">
        <h3><i class="fas fa-exchange-alt"></i> Grand livre des loyers</h3>
      </div>
      <div class="dash-tx-table-wrap">
        <table class="dash-tx-table">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Mois</th>
              <th>Date de paiement</th>
              <th>Montant Brut</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${userTx.map(t => {
              return `
                <tr>
                  <td><span class="dash-tx-ref">${t.id}</span></td>
                  <td><strong>${t.mois}</strong></td>
                  <td>${t.datePaiement || "-"}</td>
                  <td>${formatCurrency(t.montantBrut)}</td>
                  <td>
                    ${t.statutLocataire === "payé"
                      ? `<span class="dash-tx-badge dash-tx-badge--paid"><i class="fas fa-check"></i> Réglé</span>`
                      : t.couvertParBatiBid
                        ? `<span class="dash-tx-badge dash-tx-badge--impaid"><i class="fas fa-shield-alt"></i> Impayé (Couvert BatiBid)</span>`
                        : `<span class="dash-tx-badge dash-tx-badge--pending"><i class="fas fa-clock"></i> En attente</span>`
                    }
                  </td>
                  <td>
                    ${t.statutLocataire === "payé"
                      ? `<button class="btn btn-secondary" style="font-size:0.75rem; padding:0.35rem 0.75rem;" onclick="viewQuittanceLocataire('${t.id}')">
                          <i class="fas fa-file-invoice"></i> Quittance
                        </button>`
                      : t.couvertParBatiBid
                        ? `<button class="btn btn-primary" style="font-size:0.75rem; padding:0.35rem 0.75rem;" onclick="openPaymentModalP4('dette', ${t.montantBrut}, '${t.id}')">
                            <i class="fas fa-shield-alt"></i> Régler dette
                          </button>`
                        : `<button class="btn btn-primary" style="font-size:0.75rem; padding:0.35rem 0.75rem;" onclick="openPaymentModalP4('loyer', ${t.montantBrut}, '${t.id}')">
                            <i class="fas fa-wallet"></i> Payer loyer
                          </button>`
                    }
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: MAINTENANCE & INCIDENTS
// ──────────────────────────────────────────
function renderDashP4Incidents(user, bien, incidents) {
  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Maintenance & Dépannages</h1>
        <p class="dash-page-subtitle">Signalez un incident technique dans votre logement pour intervention</p>
      </div>
    </div>

    <div class="dash-two-col">
      <!-- Historique des pannes -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-history"></i> Historique des tickets</h3>
        </div>
        <div class="incidents-grid" id="incidents-p4-list">
          ${incidents.length === 0 ? `
            <div class="text-center" style="padding:3rem 1rem;">
              <i class="fas fa-tools" style="font-size:2rem; color:var(--gray-400); margin-bottom:0.5rem;"></i>
              <p style="font-size:0.88rem; color:var(--gray-600);">Aucun incident technique signalé sur votre logement.</p>
            </div>
          ` : incidents.map(i => `
            <div class="incident-card">
              <div class="incident-info">
                <div class="incident-icon-wrapper ${i.statut === "Résolu" ? "incident-icon--success" : "incident-icon--alert"}">
                  <i class="fas ${i.statut === "Résolu" ? "fa-check-circle" : "fa-tools"}"></i>
                </div>
                <div class="incident-details">
                  <h4>${i.categorie} - ${i.priorite} priorité</h4>
                  <p>${i.description}</p>
                  <p style="font-size:0.72rem; color:var(--gray-500); margin-top:0.25rem;">Signalé le ${i.date} ${i.technicien ? `· Expert : ${i.technicien}` : ""}</p>
                </div>
              </div>
              <div class="incident-status-wrapper">
                <span class="dash-status-badge dash-status-${i.statut === "Résolu" ? "occupé" : i.statut === "En cours" ? "incident" : "en-annonce"}">
                  ${i.statut}
                </span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Formulaire de signalement -->
      <div class="incident-form-box">
        <h3 style="font-size:1rem; font-weight:700; color:var(--secondary); margin-bottom:1.25rem; display:flex; align-items:center; gap:0.5rem;">
          <i class="fas fa-exclamation-circle" style="color:var(--primary);"></i> Déclarer une panne
        </h3>
        <form onsubmit="submitIncidentP4(event)">
          <div class="form-group">
            <label class="form-label" for="inc-cat">Catégorie d'équipement</label>
            <select class="form-control" id="inc-cat" required>
              <option value="Plomberie">Plomberie (Fuite, canalisation, eau chaude)</option>
              <option value="Électricité">Électricité (Tableau, prises, pannes de réseau)</option>
              <option value="Serrurerie & Portes">Serrurerie & Portes (Clé perdue, porte bloquée)</option>
              <option value="Climatisation">Climatisation (Non fonctionnelle, bruit anormal)</option>
              <option value="Gros œuvre / Infiltration">Gros œuvre / Infiltration</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="inc-priorite">Priorité constatée</label>
            <select class="form-control" id="inc-priorite" required>
              <option value="Moyenne">Moyenne (Habitation confortable mais gênée)</option>
              <option value="Haute">Haute (Panne bloquante, urgence sous 12h)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="inc-desc">Description de la panne</label>
            <textarea class="form-control" id="inc-desc" rows="4" placeholder="Décrivez le problème le plus précisément possible (Ex: Fuite sous l'évier de la cuisine, l'eau s'écoule continuellement...)" required style="resize:none; font-family:var(--font-family);"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;">
            <i class="fas fa-paper-plane" style="margin-right:0.5rem;"></i> Envoyer le ticket de dépannage
          </button>
        </form>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: MON PROFIL
// ──────────────────────────────────────────
function renderDashP4Profil(user) {
  return `
    <div class="dash-header">
      <h1 class="dash-page-title">Mon Profil & Documents</h1>
    </div>

    <div class="dash-two-col">
      <!-- Informations -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-user"></i> Informations locataire</h3>
        </div>
        <div class="dash-profil-form">
          <div class="form-group">
            <label class="form-label">Nom Complet</label>
            <input type="text" class="form-control" value="${user.name}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Email Principal</label>
            <input type="email" class="form-control" value="${user.email}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Numéro WhatsApp de contact</label>
            <input type="tel" class="form-control" value="${user.phone}" readonly>
          </div>
          <button class="btn btn-secondary" onclick="showAlert('info','Profil','Pour modifier votre numéro WhatsApp ou vos coordonnées, veuillez contacter le support BatiBid.')">
            <i class="fas fa-edit"></i> Demander une modification
          </button>
        </div>
      </div>

      <!-- Justificatifs pièces d'identité -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-file-signature"></i> Pièces Justificatives obligatoires</h3>
        </div>
        <p style="font-size:0.85rem; color:var(--gray-600); margin-bottom:1.5rem; line-height:1.5;">
          Conformément aux normes en vigueur pour la location sécurisée BatiBid, vous devez téléverser une pièce d'identité en cours de validité.
        </p>
        
        <div class="upload-dropzone" onclick="simulateDocUpload()">
          <i class="fas fa-cloud-upload-alt upload-icon"></i>
          <h4>Glissez-déposez votre pièce d'identité</h4>
          <p style="font-size:0.75rem; color:var(--gray-500); margin-top:0.25rem;">Formats acceptés : PDF, PNG, JPG (Max 5 Mo)</p>
        </div>

        <div class="uploaded-docs-list">
          <div class="uploaded-doc-item">
            <span><i class="fas fa-file-pdf" style="color:var(--primary); margin-right:0.5rem;"></i> Contrat_Bail_F3_Signé.pdf</span>
            <span style="color:var(--success); font-weight:700;"><i class="fas fa-check-circle"></i> Validé</span>
          </div>
          <div class="uploaded-doc-item" id="uploaded-cni-doc">
            <span><i class="fas fa-file-image" style="color:var(--gray-600); margin-right:0.5rem;"></i> CNI_Carine_SOGLO.jpg</span>
            <span style="color:var(--success); font-weight:700;"><i class="fas fa-check-circle"></i> Validé</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB SWITCHING NAVIGATION P4
// ──────────────────────────────────────────
function dashTabP4(tab, userId) {
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

  const bien = mockBiens.find(b => b.id === user.bienLoueId);
  const userTx = mockTransactions.filter(t => t.locataireId === user.id);
  const incidents = mockIncidents.filter(i => i.bienId === user.bienLoueId);
  const notifs = (mockNotifications[user.id] || []).filter(n => !n.lu);

  const renderers = {
    overview:  () => renderDashP4Overview(user, bien, userTx, incidents, notifs),
    logement:  () => renderDashP4Logement(user, bien),
    finances:  () => renderDashP4Finances(user, userTx),
    incidents: () => renderDashP4Incidents(user, bien, incidents),
    profil:    () => renderDashP4Profil(user)
  };

  if (renderers[tab]) {
    main.innerHTML = renderers[tab]();
  }
}

// ──────────────────────────────────────────
// ACTIONS INCIDENTS & DOCUMENTS
// ──────────────────────────────────────────
function submitIncidentP4(event) {
  event.preventDefault();
  const cat = document.getElementById("inc-cat").value;
  const prio = document.getElementById("inc-priorite").value;
  const desc = document.getElementById("inc-desc").value;

  if (!desc.trim()) return;

  const user = state.currentUser;
  const newInc = {
    id: "INC-" + Math.floor(100 + Math.random() * 900),
    bienId: user.bienLoueId,
    signalePar: user.id,
    categorie: cat,
    description: desc,
    statut: "En cours",
    priorite: prio,
    date: new Date().toLocaleDateString("fr-FR"),
    technicien: "Support BatiBid Partenaire"
  };

  mockIncidents.push(newInc);
  showAlert("success", "Panne signalée !", "Votre ticket technique a bien été enregistré. Un artisan qualifié vous contactera d'ici 2h.");
  
  // Recharger l'onglet incidents
  dashTabP4("incidents", user.id);
}

function simulateDocUpload() {
  showAlert("success", "Téléversement réussi !", "Votre document d'identité a été soumis avec succès à nos équipes de vérification BatiBid.");
}

// ──────────────────────────────────────────
// PROFIL 4 : PASSAGE AU MODE MOMO SIMULATEUR
// ──────────────────────────────────────────
function openPaymentModalP4(type, amount, txId) {
  p4ActivePayment = { type, amount, txId };

  const descText = type === "loyer" ? "Loyer mensuel Juin 2026" : "Dette locative en recouvrement Avril 2026";

  showCustomModal(`
    <div style="text-align:left;">
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
        <div style="background:var(--primary-light); color:var(--primary); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
          <i class="fas fa-wallet"></i>
        </div>
        <div>
          <h3 style="margin:0; font-size:1.1rem;">Paiement Mobile Money sécurisé</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--gray-600);">${descText}</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Montant à régler (XOF)</label>
        <input type="text" class="form-control" value="${formatCurrency(amount)}" readonly style="background-color: var(--gray-100); font-weight: 700; color: var(--secondary);">
      </div>

      <div class="form-group">
        <label class="form-label" for="p4-pay-method">Opérateur Mobile Money</label>
        <select class="form-control" id="p4-pay-method">
          <option value="mtn">MTN MoMo (+229 01 97 88 77 66)</option>
          <option value="moov">Moov Flooz</option>
          <option value="celtiis">Celtiis Cash</option>
        </select>
      </div>

      <div style="background:var(--gray-100); border-radius:var(--radius-sm); padding:0.75rem 1rem; font-size:0.82rem; color:var(--gray-600); margin-bottom:1.5rem;">
        <i class="fas fa-shield-alt" style="color:var(--primary); margin-right:0.35rem;"></i>
        Le paiement est crypté et sécurisé en partenariat direct avec les opérateurs locaux au Bénin.
      </div>

      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
        <button class="btn btn-primary" style="flex:2;" onclick="submitPaymentModalP4()">
          <i class="fas fa-mobile-alt"></i> Initier la transaction push
        </button>
      </div>
    </div>
  `);
}

function submitPaymentModalP4() {
  const method = document.getElementById("p4-pay-method").value;
  closeCustomModal();

  // Ouvrir le simulateur USSD d'arrière-plan
  const modal = document.getElementById("ussd-simulator-modal");
  const ussdText = document.getElementById("ussd-modal-text");
  
  if (modal && ussdText) {
    const operatorName = method === "mtn" ? "MTN MoMo" : method === "moov" ? "Moov Flooz" : "Celtiis Cash";
    ussdText.innerText = `BatiBid (${operatorName}): Confirmez le paiement de ${formatCurrency(p4ActivePayment.amount)} pour le règlement de votre ${p4ActivePayment.type === "loyer" ? "loyer de Juin" : "dette d'Avril"} en saisissant votre code PIN de validation à 4 chiffres.`;
    
    // Vider le champ de code PIN
    const pin = document.getElementById("ussd-pin-input");
    if (pin) pin.value = "";
    
    modal.classList.add("active");
  }
}

function confirmPaymentP4() {
  const tx = mockTransactions.find(t => t.id === p4ActivePayment.txId);
  if (tx) {
    // Mettre à jour l'historique local en direct
    tx.statutLocataire = "payé";
    tx.datePaiement = new Date().toLocaleDateString("fr-FR");
    tx.couvertParBatiBid = false;

    // Ajouter une notification de succès dans l'historique
    const user = state.currentUser;
    if (mockNotifications[user.id]) {
      mockNotifications[user.id].unshift({
        id: "n_new_" + Math.floor(100 + Math.random() * 900),
        type: "success",
        icon: "fa-check-circle",
        texte: `Règlement validé avec succès pour le mois de ${tx.mois} (${formatCurrency(p4ActivePayment.amount)})`,
        date: tx.datePaiement,
        lu: false
      });
    }

    showAlert("success", "Paiement Validé !", `Votre loyer de ${tx.mois} a bien été réglé. La quittance est disponible au téléchargement.`);
    
    // Rafraîchir l'onglet courant
    dashTabP4("overview", user.id);
  }
}

// ──────────────────────────────────────────
// TÉLÉCHARGEMENT DE QUITTANCE (PDF Simulator)
// ──────────────────────────────────────────
function viewQuittanceLocataire(txId) {
  const tx = mockTransactions.find(t => t.id === txId);
  if (!tx) return;

  const user = state.currentUser;
  const bien = mockBiens.find(b => b.id === tx.bienId);

  // Nous réutilisons et configurons le conteneur d'invoice de l'application
  const content = document.getElementById("invoice-detail-view");
  if (!content) return;

  content.innerHTML = `
    <div class="invoice-container">
      <div class="invoice-header">
        <div class="invoice-logo-side">
          <h2>Bati<span>Bid</span></h2>
          <p>Technologie immobilière sécurisée</p>
          <p>Cotonou, Bénin</p>
        </div>
        <div class="invoice-details-side">
          <h3>QUITTANCE DE LOYER</h3>
          <p>Référence: ${tx.id}</p>
          <p>Date d'émission: ${tx.datePaiement}</p>
          <p>Statut: <strong>RÉGLÉ</strong></p>
        </div>
      </div>
      
      <div class="invoice-parties">
        <div class="invoice-party">
          <h4>Bailleur (Mandataire)</h4>
          <p><strong>BatiBid SARL</strong></p>
          <p>Zone Commerciale Akpakpa, Cotonou</p>
          <p>Bénin</p>
          <p>Email: gestion@batibid.com</p>
        </div>
        <div class="invoice-party">
          <h4>Locataire</h4>
          <p><strong>${user.name}</strong></p>
          <p>Email: ${user.email}</p>
          <p>Téléphone: ${user.phone}</p>
        </div>
      </div>
      
      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>Description de la prestation locative</th>
            <th style="text-align: right;">Montant réglé</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Loyer mensuel - Mois de ${tx.mois}</strong><br>
              <span style="font-size: 0.85rem; color: var(--gray-600);">Logement : ${bien ? bien.title : "Appartement F3"} (${bien ? bien.address : ""})</span><br>
              <span style="font-size: 0.85rem; color: var(--gray-600);">Période de location : ${tx.mois}</span>
            </td>
            <td style="text-align: right; font-weight: 700;">${formatCurrency(tx.montantBrut)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="invoice-total-section">
        <div class="invoice-total-box">
          <div class="invoice-total-row">
            <span>Loyer net de taxes :</span>
            <span>${formatCurrency(tx.montantBrut)}</span>
          </div>
          <div class="invoice-total-row grand-total">
            <span>Montant Total Réglé :</span>
            <span>${formatCurrency(tx.montantBrut)}</span>
          </div>
        </div>
      </div>
      
      <div class="invoice-footer-notes">
        <p>Cette quittance certifie le versement intégral des sommes mentionnées pour la période désignée.</p>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; color: var(--gray-500);">Document numérique sécurisé conforme aux exigences fiscales et administratives béninoises.</p>
      </div>
    </div>
    
    <div class="invoice-actions" style="margin-bottom: 4rem;">
      <button class="btn btn-secondary" onclick="navigateTo('#dashboard')">
        <i class="fas fa-arrow-left"></i> Retour au tableau de bord
      </button>
      <button class="btn btn-primary" onclick="window.print()">
        <i class="fas fa-print"></i> Imprimer / Enregistrer en PDF
      </button>
    </div>
  `;
  
  navigateTo("#invoice-detail-view");
}

window.checkCongeInput = function(value) {
  const btn = document.getElementById("confirm-conge-btn");
  if (btn) {
    if (value === "CONGÉ") {
      btn.removeAttribute("disabled");
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    } else {
      btn.setAttribute("disabled", "true");
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    }
  }
};

window.executeTerminationP4 = function(bienId, userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;

  // Set the congé status on user
  user.congeDonne = true;
  user.congeDate = "10/09/2026"; // 3 months notice from June 10, 2026

  closeCustomModal();
  showAlert("success", "Demande de congé enregistrée", `Votre préavis de 3 mois a bien été activé. La libération des lieux est prévue pour le ${user.congeDate}.`);

  // Refresh tab
  dashTabP4("logement", userId);
};

function terminateLeaseP4(bienId, userId) {
  const bien = mockBiens.find(b => b.id === bienId);
  const bienTitle = bien ? bien.title : "votre logement";

  showCustomModal(`
    <div style="text-align:left;">
      <h3 style="margin-bottom:1rem; border-bottom:1px solid var(--gray-300); padding-bottom:0.75rem; color:#d32f2f;">
        <i class="fas fa-exclamation-triangle"></i> Résiliation de Bail & Demande de Congé
      </h3>
      
      <p style="font-size:0.9rem; margin-bottom:1rem; line-height:1.4;">
        Vous vous apprêtez à donner congé pour le logement : <br>
        <strong>${bienTitle}</strong>
      </p>

      <div style="background:#ffebee; border-left:4px solid #d32f2f; border-radius:var(--radius-sm); padding:0.75rem 1rem; font-size:0.82rem; color:#c62828; margin-bottom:1.25rem;">
        <p style="margin:0 0 0.5rem 0; font-weight:700;"><i class="fas fa-gavel"></i> Dispositions Légales (Loi sur le bail à usage d'habitation au Bénin) :</p>
        <ul style="margin:0; padding-left:1.25rem; line-height:1.4;">
          <li><strong>Préavis obligatoire de 3 mois :</strong> Le bail prendra fin effectivement 3 mois après cette demande. Vous restez redevable des loyers et charges durant tout le préavis.</li>
          <li><strong>Restitution des locaux :</strong> Le logement doit être rendu propre, vidé, et conforme à l'état des lieux d'entrée.</li>
          <li><strong>Dépôt de garantie (Caution) :</strong> Le remboursement de votre caution (700 000 FCFA) sera effectué sous 30 jours après la remise des clés, déduction faite d'éventuelles réparations locatives.</li>
        </ul>
      </div>

      <div class="form-group" style="margin-bottom:1.5rem;">
        <label class="form-label" style="font-weight:600;">Veuillez saisir le mot-clé <strong style="color:#d32f2f;">"CONGÉ"</strong> en majuscules pour confirmer :</label>
        <input type="text" class="form-control" id="conge-confirm-input" placeholder="Saisir CONGÉ ici" oninput="checkCongeInput(this.value)">
      </div>

      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
        <button id="confirm-conge-btn" class="btn" style="flex:2; background:#d32f2f; color:#fff; font-weight:600; opacity:0.5; cursor:not-allowed;" disabled onclick="executeTerminationP4('${bienId}', '${userId}')">
          <i class="fas fa-file-contract"></i> Confirmer la demande
        </button>
      </div>
    </div>
  `);
}
window.terminateLeaseP4 = terminateLeaseP4;
