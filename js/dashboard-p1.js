/**
 * BatiBid - Dashboard Profil 1 (Propriétaire Gestion Intégrale)
 * Rendu complet : KPIs, biens, transactions, notifications, retrait
 */

let p1Withdrawals = [];

function renderDashboardProprietaireIntegral(user) {
  const root = document.getElementById("dashboard-root-layout");
  if (!root) return;

  // Calculs financiers Juin 2026 pour u1
  const userBiens   = mockBiens.filter(b => user.bienIds && user.bienIds.includes(b.id));
  const userTx      = mockTransactions.filter(t => t.proprietaireId === user.id && t.mois === "Juin 2026");
  const totalBrut   = userTx.reduce((s, t) => s + t.montantBrut, 0);
  const totalComm   = userTx.reduce((s, t) => s + t.commission, 0);
  const totalNet    = userTx.reduce((s, t) => s + t.montantNet, 0);
  const bienOccupe  = userBiens.filter(b => b.status === "Occupé").length;
  const bienLibre   = userBiens.filter(b => b.status === "Libre").length;
  const bienIncident= userBiens.filter(b => b.status === "Incident").length;
  const notifs      = (mockNotifications[user.id] || []).filter(n => !n.lu);
  const allTx       = mockTransactions.filter(t => t.proprietaireId === user.id);

  root.innerHTML = `
    <div class="dashboard-p1">
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
                <i class="fas fa-star"></i> Gestion ${user.formula === "standard" ? "Standard (8%)" : "Premium (10%)"}
              </span>
            </div>
          </div>
        </div>

        <nav class="dash-nav">
          <a class="dash-nav-item active" onclick="dashTab('overview','${user.id}')">
            <i class="fas fa-th-large"></i> Vue d'ensemble
          </a>
          <a class="dash-nav-item" onclick="dashTab('biens','${user.id}')">
            <i class="fas fa-building"></i> Mes Biens
            <span class="dash-nav-badge">${userBiens.length}</span>
          </a>
          <a class="dash-nav-item" onclick="dashTab('finances','${user.id}')">
            <i class="fas fa-wallet"></i> Revenus & Finances
          </a>
          <a class="dash-nav-item" onclick="dashTab('rapports','${user.id}')">
            <i class="fas fa-chart-bar"></i> Rapports
          </a>
          <a class="dash-nav-item" onclick="dashTab('notifications','${user.id}')">
            <i class="fas fa-bell"></i> Notifications
            ${notifs.length > 0 ? `<span class="dash-nav-badge dash-nav-badge--alert">${notifs.length}</span>` : ""}
          </a>
          <a class="dash-nav-item" onclick="dashTab('profil','${user.id}')">
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
        ${renderDashP1Overview(user, userBiens, totalBrut, totalNet, totalComm, bienOccupe, bienLibre, bienIncident, notifs, allTx)}
      </main>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: VUE D'ENSEMBLE
// ──────────────────────────────────────────
function renderDashP1Overview(user, userBiens, totalBrut, totalNet, totalComm, bienOccupe, bienLibre, bienIncident, notifs, allTx) {
  const incidentsBiens = mockIncidents.filter(i => user.bienIds && user.bienIds.includes(i.bienId) && i.statut === "En cours");

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Bonjour, ${user.name.split(" ")[1]} 👋</h1>
        <p class="dash-page-subtitle">Voici l'état de votre portefeuille immobilier - Juin 2026</p>
      </div>
      <button class="btn btn-primary dash-retrait-btn" onclick="openRetraitModal()">
        <i class="fas fa-paper-plane"></i> Retirer mes fonds
      </button>
    </div>

    <!-- KPI CARDS -->
    <div class="dash-kpi-grid">
      <div class="dash-kpi-card dash-kpi--primary">
        <div class="dash-kpi-icon"><i class="fas fa-wallet"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Revenus nets Juin 2026</span>
          <span class="dash-kpi-value">${formatCurrency(totalNet)}</span>
          <span class="dash-kpi-sub">Après commission BatiBid (${formatCurrency(totalComm)})</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e8f5e9; color: #2E7D32;"><i class="fas fa-home"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Biens occupés</span>
          <span class="dash-kpi-value">${bienOccupe} / ${userBiens.length}</span>
          <span class="dash-kpi-sub">${bienLibre} libre${bienLibre > 1 ? "s" : ""} · ${bienIncident} incident${bienIncident > 1 ? "s" : ""}</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #fff3e0; color: #e65100;"><i class="fas fa-percent"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Commission BatiBid</span>
          <span class="dash-kpi-value">${formatCurrency(totalComm)}</span>
          <span class="dash-kpi-sub">Selon la formule (8% ou 10%)</span>
        </div>
      </div>
      <div class="dash-kpi-card ${notifs.length > 0 ? "dash-kpi--alert" : ""}">
        <div class="dash-kpi-icon" style="background: #fce4ec; color: #c62828;"><i class="fas fa-bell"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Alertes non lues</span>
          <span class="dash-kpi-value">${notifs.length}</span>
          <span class="dash-kpi-sub">${incidentsBiens.length} incident(s) en cours</span>
        </div>
      </div>
    </div>

    <!-- BIENS RAPIDE + ALERTES -->
    <div class="dash-two-col">

      <!-- Mes biens synthèse -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-building"></i> Mes biens</h3>
          <button class="dash-link-btn" onclick="dashTab('biens','${user.id}')">Tout voir →</button>
        </div>
        <div class="dash-biens-list">
          ${userBiens.map(b => `
            <div class="dash-bien-row">
              <img src="${b.image}" alt="${b.title}" class="dash-bien-thumb">
              <div class="dash-bien-info">
                <div class="dash-bien-title">${b.title}</div>
                <div class="dash-bien-address"><i class="fas fa-map-marker-alt"></i> ${b.address}, ${b.city}</div>
              </div>
              <span class="dash-status-badge dash-status-${b.status.toLowerCase().replace(" ", "-")}">
                ${b.status === "Occupé" ? '<i class="fas fa-user-check"></i>' : b.status === "Libre" ? '<i class="fas fa-door-open"></i>' : '<i class="fas fa-exclamation-triangle"></i>'}
                ${b.status}
              </span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Alertes & notifications -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="fas fa-bell"></i> Alertes récentes</h3>
          <button class="dash-link-btn" onclick="dashTab('notifications','${user.id}')">Tout voir →</button>
        </div>
        <div class="dash-notif-list">
          ${(mockNotifications[user.id] || []).slice(0, 4).map(n => `
            <div class="dash-notif-row ${!n.lu ? "dash-notif-unread" : ""}">
              <div class="dash-notif-icon dash-notif-${n.type}"><i class="fas ${n.icon}"></i></div>
              <div class="dash-notif-text">
                <span>${n.texte}</span>
                <small>${n.date}</small>
              </div>
              ${!n.lu ? '<span class="dash-notif-dot"></span>' : ""}
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- DERNIÈRES TRANSACTIONS -->
    <div class="dash-card" style="margin-top: 2rem;">
      <div class="dash-card-header">
        <h3><i class="fas fa-exchange-alt"></i> Dernières transactions</h3>
        <button class="dash-link-btn" onclick="dashTab('finances','${user.id}')">Voir tout →</button>
      </div>
      <div class="dash-tx-table-wrap">
        <table class="dash-tx-table">
          <thead>
            <tr>
              <th>Bien</th>
              <th>Mois</th>
              <th>Loyer brut</th>
              <th>Commission</th>
              <th>Net reçu</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${allTx.map(t => {
              const bien = mockBiens.find(b => b.id === t.bienId);
              const isImpaId = t.couvertParBatiBid;
              return `
                <tr>
                  <td><small>${bien ? bien.address : "-"}</small></td>
                  <td>${t.mois}</td>
                  <td>${formatCurrency(t.montantBrut)}</td>
                  <td class="dash-tx-comm">−${formatCurrency(t.commission)}</td>
                  <td class="dash-tx-net">${formatCurrency(t.montantNet)}</td>
                  <td>
                    ${isImpaId
                      ? `<span class="dash-tx-badge dash-tx-badge--covered"><i class="fas fa-shield-alt"></i> Couvert</span>`
                      : `<span class="dash-tx-badge dash-tx-badge--paid"><i class="fas fa-check"></i> Reçu</span>`
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
// TAB: MES BIENS (détail)
// ──────────────────────────────────────────
function renderDashP1Biens(user) {
  const userBiens = mockBiens.filter(b => user.bienIds && user.bienIds.includes(b.id));

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Mes Biens</h1>
        <p class="dash-page-subtitle">${userBiens.length} bien(s) en gestion intégrale</p>
      </div>
      <button class="btn btn-primary" onclick="openAddListingModalP1('${user.id}')">
        <i class="fas fa-plus"></i> Confier un nouveau bien
      </button>
    </div>

    <div class="dash-biens-grid">
      ${userBiens.map(b => {
        const txBien = mockTransactions.filter(t => t.bienId === b.id && t.mois === "Juin 2026");
        const dernierLoyer = txBien[0];
        const incidents = mockIncidents.filter(i => i.bienId === b.id);
        return `
          <div class="dash-bien-detail-card">
            <div>
              <img src="${b.image}" alt="${b.title}" class="dash-bien-card-img">
              <div class="dash-bien-card-body">
                <div class="dash-bien-card-header">
                  <h3>${b.title}</h3>
                  <span class="dash-status-badge dash-status-${b.status.toLowerCase().replace(" ", "-")}">
                    ${b.status}
                  </span>
                </div>
                <p class="dash-bien-card-address"><i class="fas fa-map-marker-alt"></i> ${b.address}, ${b.city} · ${b.surface}m²</p>

                <div class="dash-bien-card-stats">
                  <div class="dash-bien-stat">
                    <span class="dash-bien-stat-label">Loyer</span>
                    <span class="dash-bien-stat-value">${formatCurrency(b.loyer)}/mois</span>
                  </div>
                  <div class="dash-bien-stat">
                    <span class="dash-bien-stat-label">Formule</span>
                    <span class="dash-bien-stat-value" style="font-weight: 700; color: var(--primary);">${b.commission === 0.08 ? "Standard (8%)" : "Premium (10%)"}</span>
                  </div>
                  <div class="dash-bien-stat">
                    <span class="dash-bien-stat-label">Net reçu (Juin)</span>
                    <span class="dash-bien-stat-value" style="color: var(--success);">
                      ${dernierLoyer ? formatCurrency(dernierLoyer.montantNet) : "-"}
                      ${dernierLoyer && dernierLoyer.couvertParBatiBid ? '<span class="dash-tx-badge dash-tx-badge--covered" style="font-size:0.7rem;"><i class="fas fa-shield-alt"></i> Couvert</span>' : ""}
                    </span>
                  </div>
                  <div class="dash-bien-stat">
                    <span class="dash-bien-stat-label">Bail</span>
                    <span class="dash-bien-stat-value">${b.dateDebutBail || "Non défini"} → ${b.dateFinBail || "-"}</span>
                  </div>
                </div>

                ${incidents.length > 0 ? `
                  <div class="dash-bien-incidents">
                    ${incidents.map(i => `
                      <div class="dash-incident-pill dash-incident-${i.statut === "Résolu" ? "ok" : "alert"}">
                        <i class="fas ${i.statut === "Résolu" ? "fa-check-circle" : "fa-tools"}"></i>
                        ${i.categorie} - ${i.statut}
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: REVENUS & FINANCES
// ──────────────────────────────────────────
function renderDashP1Finances(user) {
  const allTx = mockTransactions.filter(t => t.proprietaireId === user.id);
  const totalNetAll = allTx.reduce((s, t) => s + t.montantNet, 0);
  const totalCommAll = allTx.reduce((s, t) => s + t.commission, 0);
  const totalWithdrawn = p1Withdrawals.reduce((s, w) => s + w.montant, 0);
  const currentBalance = totalNetAll - totalWithdrawn;

  // Withdrawal History HTML
  let withdrawalsHtml = "";
  if (p1Withdrawals.length === 0) {
    withdrawalsHtml = `
      <div class="dash-card" style="margin-top: 2rem;">
        <div class="dash-card-header">
          <h3><i class="fas fa-history"></i> Historique des retraits MoMo / Banque</h3>
        </div>
        <div class="text-center" style="padding: 2.5rem 1rem; color: var(--gray-500);">
          <i class="fas fa-wallet" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--gray-400);"></i>
          <p style="font-size: 0.9rem; margin: 0;">Aucun virement ou retrait effectué pour le moment.</p>
        </div>
      </div>
    `;
  } else {
    withdrawalsHtml = `
      <div class="dash-card" style="margin-top: 2rem;">
        <div class="dash-card-header">
          <h3><i class="fas fa-history"></i> Historique des retraits MoMo / Banque</h3>
        </div>
        <div class="dash-tx-table-wrap">
          <table class="dash-tx-table">
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Date</th>
                <th>Destination</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${p1Withdrawals.map(w => `
                <tr>
                  <td><small class="dash-tx-ref">${w.id}</small></td>
                  <td>${w.date}</td>
                  <td>${w.dest}</td>
                  <td><strong>${formatCurrency(w.montant)}</strong></td>
                  <td>
                    <span class="dash-tx-badge ${w.statut === 'En cours' ? 'dash-tx-badge--pending' : 'dash-tx-badge--paid'}">
                      <i class="fas ${w.statut === 'En cours' ? 'fa-spinner fa-spin' : 'fa-check-circle'}"></i> ${w.statut}
                    </span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return `
    <div class="dash-header">
      <div>
        <h1 class="dash-page-title">Revenus & Finances</h1>
        <p class="dash-page-subtitle">Historique complet de vos encaissements et retraits</p>
      </div>
      <button class="btn btn-primary" onclick="openRetraitModal()">
        <i class="fas fa-paper-plane"></i> Retirer vers MoMo / Banque
      </button>
    </div>

    <!-- RÉSUMÉ FINANCIER -->
    <div class="dash-kpi-grid" style="margin-bottom: 2rem;">
      <div class="dash-kpi-card dash-kpi--primary">
        <div class="dash-kpi-icon"><i class="fas fa-wallet"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Solde disponible</span>
          <span class="dash-kpi-value">${formatCurrency(currentBalance)}</span>
          <span class="dash-kpi-sub">Total net encaissé : ${formatCurrency(totalNetAll)}</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #fff3e0; color: #e65100;"><i class="fas fa-percent"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Total commissions BatiBid</span>
          <span class="dash-kpi-value">${formatCurrency(totalCommAll)}</span>
          <span class="dash-kpi-sub">Transparence garantie (8% / 10%)</span>
        </div>
      </div>
      <div class="dash-kpi-card">
        <div class="dash-kpi-icon" style="background: #e8f5e9; color: #2E7D32;"><i class="fas fa-shield-alt"></i></div>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">Couverts par BatiBid</span>
          <span class="dash-kpi-value">${allTx.filter(t => t.couvertParBatiBid).length}</span>
          <span class="dash-kpi-sub">Garantie active sur impayés</span>
        </div>
      </div>
    </div>

    <!-- PERFORMANCE FINANCIÈRE CARD (SVG LINE GRAPH) -->
    <div class="dash-card" style="margin-bottom: 2rem;">
      <div class="dash-card-header">
        <h3><i class="fas fa-chart-line"></i> Performance Financière (Revenus Nets - 6 Derniers Mois)</h3>
      </div>
      <div style="background-color: var(--white); border-radius: var(--radius-md); padding: 1rem 0; width:100%; overflow-x:auto;">
        <svg viewBox="0 0 600 220" style="width: 100%; height: auto; min-width: 550px; font-family: var(--font-family);">
          <!-- Defs for Gradient -->
          <defs>
            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.28"/>
              <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          <line x1="55" y1="180" x2="550" y2="180" stroke="var(--gray-200)" stroke-width="1" />
          <line x1="55" y1="150" x2="550" y2="150" stroke="var(--gray-100)" stroke-width="1" stroke-dasharray="4" />
          <line x1="55" y1="120" x2="550" y2="120" stroke="var(--gray-100)" stroke-width="1" stroke-dasharray="4" />
          <line x1="55" y1="90" x2="550" y2="90" stroke="var(--gray-100)" stroke-width="1" stroke-dasharray="4" />
          <line x1="55" y1="60" x2="550" y2="60" stroke="var(--gray-100)" stroke-width="1" stroke-dasharray="4" />
          <line x1="55" y1="30" x2="550" y2="30" stroke="var(--gray-200)" stroke-width="1" />

          <!-- Y Axis Labels -->
          <text x="45" y="184" text-anchor="end" fill="var(--gray-500)" font-size="10" font-weight="600">0</text>
          <text x="45" y="154" text-anchor="end" fill="var(--gray-500)" font-size="10" font-weight="600">300k</text>
          <text x="45" y="124" text-anchor="end" fill="var(--gray-500)" font-size="10" font-weight="600">600k</text>
          <text x="45" y="94" text-anchor="end" fill="var(--gray-500)" font-size="10" font-weight="600">900k</text>
          <text x="45" y="64" text-anchor="end" fill="var(--gray-500)" font-size="10" font-weight="600">1,2M</text>
          <text x="45" y="34" text-anchor="end" fill="var(--gray-500)" font-size="10" font-weight="600">1,5M</text>

          <!-- Area under Curve -->
          <path d="M 60 148 L 150 148 L 240 148 L 330 148 L 420 148 L 510 40 L 510 180 L 60 180 Z" fill="url(#chart-area-grad)" />

          <!-- Curve Line -->
          <path d="M 60 148 L 150 148 L 240 148 L 330 148 L 420 148 L 510 40" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Dots & Value Labels -->
          <!-- Jan -->
          <circle cx="60" cy="148" r="5" fill="var(--white)" stroke="var(--primary)" stroke-width="3" style="cursor:pointer;" />
          <text x="60" y="136" text-anchor="middle" fill="var(--secondary)" font-size="10" font-weight="700">315k</text>
          
          <!-- Feb -->
          <circle cx="150" cy="148" r="5" fill="var(--white)" stroke="var(--primary)" stroke-width="3" style="cursor:pointer;" />
          <text x="150" y="136" text-anchor="middle" fill="var(--secondary)" font-size="10" font-weight="700">315k</text>

          <!-- Mar -->
          <circle cx="240" cy="148" r="5" fill="var(--white)" stroke="var(--primary)" stroke-width="3" style="cursor:pointer;" />
          <text x="240" y="136" text-anchor="middle" fill="var(--secondary)" font-size="10" font-weight="700">315k</text>

          <!-- Apr -->
          <circle cx="330" cy="148" r="5" fill="var(--white)" stroke="var(--primary)" stroke-width="3" style="cursor:pointer;" />
          <text x="330" y="136" text-anchor="middle" fill="var(--secondary)" font-size="10" font-weight="700">315k</text>

          <!-- May -->
          <circle cx="420" cy="148" r="5" fill="var(--white)" stroke="var(--primary)" stroke-width="3" style="cursor:pointer;" />
          <text x="420" y="136" text-anchor="middle" fill="var(--secondary)" font-size="10" font-weight="700">315k</text>

          <!-- Jun -->
          <circle cx="510" cy="40" r="6" fill="var(--primary)" stroke="var(--white)" stroke-width="2" style="cursor:pointer; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.15));" />
          <text x="510" y="26" text-anchor="middle" fill="var(--primary)" font-size="11" font-weight="800">1,39M</text>

          <!-- X Axis Labels -->
          <text x="60" y="202" text-anchor="middle" fill="var(--gray-600)" font-size="11" font-weight="600">Jan</text>
          <text x="150" y="202" text-anchor="middle" fill="var(--gray-600)" font-size="11" font-weight="600">Fév</text>
          <text x="240" y="202" text-anchor="middle" fill="var(--gray-600)" font-size="11" font-weight="600">Mar</text>
          <text x="330" y="202" text-anchor="middle" fill="var(--gray-600)" font-size="11" font-weight="600">Avr</text>
          <text x="420" y="202" text-anchor="middle" fill="var(--gray-600)" font-size="11" font-weight="600">Mai</text>
          <text x="510" y="202" text-anchor="middle" fill="var(--secondary)" font-size="11" font-weight="800">Juin</text>
        </svg>
      </div>
    </div>

    <!-- TABLEAU COMPLET -->
    <div class="dash-card">
      <div class="dash-card-header">
        <h3><i class="fas fa-table"></i> Historique des transactions</h3>
      </div>
      <div class="dash-tx-table-wrap">
        <table class="dash-tx-table">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Bien</th>
              <th>Mois</th>
              <th>Méthode</th>
              <th>Loyer brut</th>
              <th>Commission</th>
              <th>Net reçu</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${allTx.map(t => {
              const bien = mockBiens.find(b => b.id === t.bienId);
              return `
                <tr>
                  <td><small class="dash-tx-ref">${t.id}</small></td>
                  <td><small>${bien ? bien.address : "-"}</small></td>
                  <td>${t.mois}</td>
                  <td>${t.methode || (t.couvertParBatiBid ? "Couvert BatiBid" : "-")}</td>
                  <td>${formatCurrency(t.montantBrut)}</td>
                  <td class="dash-tx-comm">−${formatCurrency(t.commission)}</td>
                  <td class="dash-tx-net"><strong>${formatCurrency(t.montantNet)}</strong></td>
                  <td>
                    ${t.couvertParBatiBid
                      ? `<span class="dash-tx-badge dash-tx-badge--covered"><i class="fas fa-shield-alt"></i> Couvert</span>`
                      : `<span class="dash-tx-badge dash-tx-badge--paid"><i class="fas fa-check"></i> Reçu</span>`
                    }
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
          <tfoot>
            <tr class="dash-tx-total-row">
              <td colspan="4"><strong>TOTAL</strong></td>
              <td>${formatCurrency(allTx.reduce((s,t)=>s+t.montantBrut,0))}</td>
              <td class="dash-tx-comm">−${formatCurrency(totalCommAll)}</td>
              <td class="dash-tx-net"><strong>${formatCurrency(totalNetAll)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- HISTORIQUE DES RETRAITS -->
    ${withdrawalsHtml}
  `;
}

// ──────────────────────────────────────────
// TAB: RAPPORTS
// ──────────────────────────────────────────
function renderDashP1Rapports(user) {
  const mois = ["Juin 2026","Mai 2026","Avril 2026","Mars 2026","Février 2026","Janvier 2026"];
  return `
    <div class="dash-header">
      <h1 class="dash-page-title">Rapports</h1>
    </div>
    <div class="dash-card">
      <div class="dash-card-header">
        <h3><i class="fas fa-file-pdf"></i> Rapports mensuels automatiques</h3>
      </div>
      <div class="dash-rapports-list">
        ${mois.map((m, i) => `
          <div class="dash-rapport-row">
            <div class="dash-rapport-icon"><i class="fas fa-file-alt"></i></div>
            <div class="dash-rapport-info">
              <strong>Rapport de gestion - ${m}</strong>
              <span>Revenus, commissions, incidents, taux d'occupation</span>
            </div>
            <div class="dash-rapport-actions">
              ${i < 2 ? `
                <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.9rem;" onclick="showAlert('info','Rapport PDF','Simulation : Le rapport ${m} serait téléchargé en PDF.')">
                  <i class="fas fa-download"></i> Télécharger
                </button>
              ` : `
                <span style="font-size:0.8rem; color: var(--gray-500);">En cours de génération</span>
              `}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: NOTIFICATIONS
// ──────────────────────────────────────────
function renderDashP1Notifications(user) {
  const notifs = mockNotifications[user.id] || [];
  return `
    <div class="dash-header">
      <h1 class="dash-page-title">Notifications</h1>
    </div>
    <div class="dash-card">
      <div class="dash-notif-list" style="gap: 0.75rem;">
        ${notifs.map(n => `
          <div class="dash-notif-row dash-notif-row--full ${!n.lu ? "dash-notif-unread" : ""}">
            <div class="dash-notif-icon dash-notif-${n.type}"><i class="fas ${n.icon}"></i></div>
            <div class="dash-notif-text" style="flex:1;">
              <span>${n.texte}</span>
              <small>${n.date}</small>
            </div>
            ${!n.lu ? '<span class="dash-notif-dot"></span>' : '<i class="fas fa-check" style="color:var(--gray-400); font-size:0.75rem;"></i>'}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// TAB: MON PROFIL
// ──────────────────────────────────────────
function renderDashP1Profil(user) {
  return `
    <div class="dash-header">
      <h1 class="dash-page-title">Mon Profil</h1>
    </div>
    <div class="dash-two-col">
      <div class="dash-card">
        <div class="dash-card-header"><h3><i class="fas fa-user"></i> Informations personnelles</h3></div>
        <div class="dash-profil-form">
          <div class="form-group">
            <label class="form-label">Nom complet</label>
            <input type="text" class="form-control" value="${user.name}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" value="${user.email}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Téléphone WhatsApp</label>
            <input type="tel" class="form-control" value="${user.phone}" readonly>
          </div>
          <button class="btn btn-secondary" onclick="showAlert('info','Modification','La modification du profil sera activée en production.')">
            <i class="fas fa-edit"></i> Modifier
          </button>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-header"><h3><i class="fas fa-file-contract"></i> Mon contrat BatiBid</h3></div>
        <div class="dash-profil-form">
          <div class="form-group">
            <label class="form-label">Formule souscrite</label>
            <input type="text" class="form-control" value="Gestion Intégrale - 10% / mois" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">RIB / Compte de virement</label>
            <input type="text" class="form-control" value="${user.rib}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Statut du compte</label>
            <input type="text" class="form-control" value="✅ Actif - Vérifié" style="color: var(--success); font-weight:700;" readonly>
          </div>
          <button class="btn btn-secondary" onclick="showAlert('info','Contrat','Votre contrat PDF sera téléchargeable en production.')">
            <i class="fas fa-download"></i> Télécharger mon contrat
          </button>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// NAVIGATION ENTRE ONGLETS
// ──────────────────────────────────────────
function dashTab(tab, userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;

  const main = document.getElementById("dash-main-content");
  if (!main) return;

  // Auto-close mobile drawer sidebar
  const sidebar = document.querySelector(".dash-sidebar");
  if (sidebar) sidebar.classList.remove("open");
  const backdrop = document.querySelector(".dash-sidebar-backdrop");
  if (backdrop) backdrop.classList.remove("active");

  // Update active nav item
  document.querySelectorAll(".dash-nav-item").forEach(el => {
    el.classList.remove("active");
    if (el.getAttribute("onclick") && el.getAttribute("onclick").includes(`'${tab}'`)) {
      el.classList.add("active");
    }
  });

  const userBiens   = mockBiens.filter(b => user.bienIds && user.bienIds.includes(b.id));
  const userTx      = mockTransactions.filter(t => t.proprietaireId === user.id && t.mois === "Juin 2026");
  const totalBrut   = userTx.reduce((s, t) => s + t.montantBrut, 0);
  const totalComm   = userTx.reduce((s, t) => s + t.commission, 0);
  const totalNet    = userTx.reduce((s, t) => s + t.montantNet, 0);
  const bienOccupe  = userBiens.filter(b => b.status === "Occupé").length;
  const bienLibre   = userBiens.filter(b => b.status === "Libre").length;
  const bienIncident= userBiens.filter(b => b.status === "Incident").length;
  const notifs      = (mockNotifications[user.id] || []).filter(n => !n.lu);
  const allTx       = mockTransactions.filter(t => t.proprietaireId === user.id);

  const renderers = {
    overview:      () => renderDashP1Overview(user, userBiens, totalBrut, totalNet, totalComm, bienOccupe, bienLibre, bienIncident, notifs, allTx),
    biens:         () => renderDashP1Biens(user),
    finances:      () => renderDashP1Finances(user),
    rapports:      () => renderDashP1Rapports(user),
    notifications: () => renderDashP1Notifications(user),
    profil:        () => renderDashP1Profil(user)
  };

  if (renderers[tab]) {
    main.innerHTML = renderers[tab]();
  }
}

// ──────────────────────────────────────────
// MODAL : RETRAIT DE FONDS
// ──────────────────────────────────────────
window.validateWithdrawalAmount = function(input) {
  const user = state.currentUser;
  if (!user) return;
  const allTx = mockTransactions.filter(t => t.proprietaireId === user.id);
  const totalNetAll = allTx.reduce((s, t) => s + t.montantNet, 0);
  const totalWithdrawn = p1Withdrawals.reduce((s, w) => s + w.montant, 0);
  const solde = totalNetAll - totalWithdrawn;
  
  const val = parseInt(input.value) || 0;
  const btn = document.getElementById("confirm-retrait-btn");
  const errorMsg = document.getElementById("retrait-error-msg");
  
  if (val > solde) {
    if (errorMsg) {
      errorMsg.textContent = `Le montant ne peut pas dépasser le solde disponible (${formatCurrency(solde)})`;
      errorMsg.style.display = "block";
    }
    if (btn) {
      btn.setAttribute("disabled", "true");
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    }
  } else if (val < 5000) {
    if (errorMsg) {
      errorMsg.textContent = "Le montant minimum de retrait est de 5 000 FCFA.";
      errorMsg.style.display = "block";
    }
    if (btn) {
      btn.setAttribute("disabled", "true");
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    }
  } else {
    if (errorMsg) {
      errorMsg.style.display = "none";
    }
    if (btn) {
      btn.removeAttribute("disabled");
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  }
};

function openRetraitModal() {
  const user = state.currentUser;
  const allTx = mockTransactions.filter(t => t.proprietaireId === user.id);
  const totalNetAll = allTx.reduce((s, t) => s + t.montantNet, 0);
  const totalWithdrawn = p1Withdrawals.reduce((s, w) => s + w.montant, 0);
  const solde = totalNetAll - totalWithdrawn;

  showCustomModal(`
    <div style="text-align:left;">
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
        <div style="background:var(--primary-light); color:var(--primary); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div>
          <h3 style="margin:0; font-size:1.1rem;">Retirer mes fonds</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--gray-600);">Solde disponible : <strong id="retrait-max-display">${formatCurrency(solde)}</strong></p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Montant à retirer (XOF)</label>
        <input type="number" class="form-control" id="retrait-montant" value="${solde}" min="5000" max="${solde}" oninput="validateWithdrawalAmount(this)">
        <div id="retrait-error-msg" style="color:#d32f2f; font-size:0.75rem; margin-top:0.25rem; display:none;"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Destination</label>
        <select class="form-control" id="retrait-dest">
          <option>MTN MoMo: +229 01 97 50 22 33</option>
          <option>Moov Flooz: +229 01 96 12 34 56</option>
          <option>Celtiis Cash: +229 01 40 88 99 00</option>
          <option>Virement Bancaire (Ecobank: BJ062010010098765432109)</option>
        </select>
      </div>

      <div style="background:var(--gray-100); border-radius:var(--radius-sm); padding:0.75rem 1rem; font-size:0.82rem; color:var(--gray-600); margin-bottom:1.5rem;">
        <i class="fas fa-info-circle" style="color:var(--primary); margin-right:0.35rem;"></i>
        Les frais d'envoi et la commission de gestion ont déjà été déduits. Le montant saisi sera reçu en intégralité.
      </div>

      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
        <button id="confirm-retrait-btn" class="btn btn-primary" style="flex:2;" onclick="confirmRetrait()">
          <i class="fas fa-check"></i> Confirmer le retrait
        </button>
      </div>
    </div>
  `);
}
window.openRetraitModal = openRetraitModal;

function confirmRetrait() {
  const montantInput = document.getElementById("retrait-montant");
  const destInput = document.getElementById("retrait-dest");
  if (!montantInput || !destInput) return;

  const montant = parseInt(montantInput.value) || 0;
  const dest = destInput.value;

  const user = state.currentUser;
  if (!user) return;

  const allTx = mockTransactions.filter(t => t.proprietaireId === user.id);
  const totalNetAll = allTx.reduce((s, t) => s + t.montantNet, 0);
  const totalWithdrawn = p1Withdrawals.reduce((s, w) => s + w.montant, 0);
  const solde = totalNetAll - totalWithdrawn;

  if (montant > solde || montant < 5000) {
    showAlert("danger", "Erreur", "Montant de retrait invalide.");
    return;
  }

  // Simulate withdrawal transaction
  const newWithdrawal = {
    id: "RET-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('fr-FR'),
    dest: dest,
    montant: montant,
    statut: "En cours"
  };

  p1Withdrawals.push(newWithdrawal);
  closeCustomModal();

  showAlert("success", "Retrait initié !", `Votre demande de retrait de ${formatCurrency(montant)} vers ${dest} a été reçue et est en cours de traitement (24h ouvrées).`);

  // Refresh Finances tab
  dashTab("finances", user.id);
}
window.confirmRetrait = confirmRetrait;

// ──────────────────────────────────────────
// PROFIL 1 : AJOUTER ET RETIRER DES BIENS
// ──────────────────────────────────────────
function openAddListingModalP1(userId) {
  showCustomModal(`
    <div style="text-align:left;">
      <h3 style="margin-bottom:1.5rem; border-bottom:1px solid var(--gray-300); padding-bottom:0.75rem; color:var(--primary);">
        <i class="fas fa-plus-circle"></i> Confier un nouveau bien en Gestion
      </h3>
      <form onsubmit="submitNewListingP1(event, '${userId}')">
        <div class="form-group">
          <label class="form-label" for="add-p1-title">Nom de la propriété</label>
          <input type="text" class="form-control" id="add-p1-title" placeholder="Ex: Résidence Zénith F4" required>
        </div>

        <div class="form-group">
          <label class="form-label">Formule de Gestion Locative</label>
          <div class="form-grid-2col" style="margin-bottom: 0.5rem;">
            <!-- Standard Card -->
            <div id="formula-standard" class="formula-select-card active" onclick="selectFormulaP1('standard')">
              <div class="formula-card-title">Offre Standard</div>
              <div class="formula-card-price">8%<span> du loyer / mois</span></div>
              <ul class="formula-card-features">
                <li><i class="fas fa-check" style="color: var(--primary); font-size:0.65rem; margin-right:3px;"></i> Gestion des loyers</li>
                <li><i class="fas fa-check" style="color: var(--primary); font-size:0.65rem; margin-right:3px;"></i> Suivi temps réel</li>
              </ul>
              <i class="fas fa-check-circle check-icon"></i>
            </div>
            <!-- Premium Card -->
            <div id="formula-premium" class="formula-select-card" onclick="selectFormulaP1('premium')">
              <div class="formula-card-title">Offre Premium</div>
              <div class="formula-card-price">10%<span> du loyer / mois</span></div>
              <ul class="formula-card-features">
                <li><i class="fas fa-check" style="color: var(--primary); font-size:0.65rem; margin-right:3px;"></i> Standard inclus</li>
                <li><i class="fas fa-check" style="color: var(--primary); font-size:0.65rem; margin-right:3px;"></i> Assistance 24/7</li>
              </ul>
              <i class="fas fa-check-circle check-icon"></i>
            </div>
          </div>
          <input type="hidden" id="add-p1-formula" value="standard">
        </div>
        
        <div class="form-grid-2col">
          <div class="form-group">
            <label class="form-label" for="add-p1-type">Type de logement</label>
            <select class="form-control" id="add-p1-type">
              <option value="appartement">Appartement</option>
              <option value="maison">Maison / Villa</option>
              <option value="bureau">Bureau</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="add-p1-city">Ville</label>
            <select class="form-control" id="add-p1-city">
              <option value="Cotonou">Cotonou</option>
              <option value="Abomey-Calavi">Abomey-Calavi</option>
              <option value="Porto-Novo">Porto-Novo</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2col">
          <div class="form-group">
            <label class="form-label" for="add-p1-address">Quartier</label>
            <input type="text" class="form-control" id="add-p1-address" placeholder="Ex: Fidjrossè" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="add-p1-surface">Surface habitable (m²)</label>
            <input type="number" class="form-control" id="add-p1-surface" placeholder="Ex: 110" required>
          </div>
        </div>

        <div class="form-grid-2col">
          <div class="form-group">
            <label class="form-label" for="add-p1-loyer">Loyer demandé (FCFA)</label>
            <input type="number" class="form-control" id="add-p1-loyer" placeholder="Ex: 250000" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="add-p1-chambres">Nombre de chambres</label>
            <input type="number" class="form-control" id="add-p1-chambres" value="3" required>
          </div>
        </div>

        <div style="background:var(--gray-100); border-radius:var(--radius-sm); padding:0.75rem 1rem; font-size:0.8rem; color:var(--gray-600); margin-bottom:1.5rem;" id="p1-modal-desc-box">
          <i class="fas fa-shield-alt" style="color:var(--primary); margin-right:0.35rem;"></i>
          En soumettant ce bien, vous l'enregistrez sous la formule de <strong>Gestion Intégrale Standard BatiBid (8% de commission)</strong>. 
          Un agent BatiBid se déplacera sous 24h pour valider la conformité technique du logement.
        </div>

        <div style="display:flex; gap:0.75rem; margin-top:1.5rem;">
          <button type="button" class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
          <button type="submit" class="btn btn-primary" style="flex:2;">
            <i class="fas fa-check"></i> Enregistrer le bien
          </button>
        </div>
      </form>
    </div>
  `);
}

function selectFormulaP1(type) {
  const formulaInput = document.getElementById("add-p1-formula");
  if (!formulaInput) return;
  formulaInput.value = type;
  
  const cardStandard = document.getElementById("formula-standard");
  const cardPremium = document.getElementById("formula-premium");
  const descBox = document.getElementById("p1-modal-desc-box");
  
  if (type === "standard") {
    if (cardStandard) cardStandard.classList.add("active");
    if (cardPremium) cardPremium.classList.remove("active");
    if (descBox) {
      descBox.innerHTML = `
        <i class="fas fa-shield-alt" style="color:var(--primary); margin-right:0.35rem;"></i>
        En soumettant ce bien, vous l'enregistrez sous la formule de <strong>Gestion Intégrale Standard BatiBid (8% de commission)</strong>. 
        Un agent BatiBid se déplacera sous 24h pour valider la conformité technique du logement.
      `;
    }
  } else {
    if (cardStandard) cardStandard.classList.remove("active");
    if (cardPremium) cardPremium.classList.add("active");
    if (descBox) {
      descBox.innerHTML = `
        <i class="fas fa-shield-alt" style="color:var(--primary); margin-right:0.35rem;"></i>
        En soumettant ce bien, vous l'enregistrez sous la formule de <strong>Gestion Intégrale Premium BatiBid (10% de commission)</strong>. 
        Un agent BatiBid se déplacera sous 24h pour valider la conformité technique du logement.
      `;
    }
  }
}
window.selectFormulaP1 = selectFormulaP1;

function submitNewListingP1(event, userId) {
  event.preventDefault();

  const title = document.getElementById("add-p1-title").value;
  const type = document.getElementById("add-p1-type").value;
  const city = document.getElementById("add-p1-city").value;
  const address = document.getElementById("add-p1-address").value;
  const surface = parseInt(document.getElementById("add-p1-surface").value);
  const loyer = parseInt(document.getElementById("add-p1-loyer").value);
  const bedrooms = parseInt(document.getElementById("add-p1-chambres").value);
  const formula = document.getElementById("add-p1-formula").value;
  const commission = formula === "standard" ? 0.08 : 0.10;

  closeCustomModal();

  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;

  const newBienId = "b_new_p1_" + Math.floor(100 + Math.random() * 900);
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
    bathrooms: 2,
    status: "Libre",
    verified: true,
    image: "./duplex_villa.png",
    dateDebutBail: null,
    dateFinBail: null,
    commission: commission
  };

  mockBiens.push(newBien);
  if (!user.bienIds) user.bienIds = [];
  user.bienIds.push(newBienId);

  mockDb.properties.push({
    id: Math.floor(100 + Math.random() * 900),
    title: title,
    type: type,
    city: city,
    address: address,
    price: loyer,
    bedrooms: bedrooms,
    bathrooms: 2,
    surface: surface,
    status: "À Louer",
    image: "./duplex_villa.png",
    verified: true,
    desc: `Superbe propriété de type ${type} en Gestion Intégrale ${formula === "standard" ? "Standard (8%)" : "Premium (10%)"} BatiBid, située à ${address}, ${city}.`
  });

  showAlert("success", "Bien enregistré !", `Votre propriété "${title}" a été ajoutée en Gestion Intégrale ${formula === "standard" ? "Standard (8%)" : "Premium (10%)"} avec succès.`);
  
  dashTab("biens", userId);
}

window.checkResiliationInput = function(value) {
  const btn = document.getElementById("confirm-resiliation-btn");
  if (btn) {
    if (value === "RÉSILIER") {
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

window.executeRevocationP1 = function(bienId, userId) {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return;

  const bien = mockBiens.find(b => b.id === bienId);
  const bienTitle = bien ? bien.title : "ce bien";

  user.bienIds = user.bienIds.filter(id => id !== bienId);
  
  if (bien) {
    bien.status = "Retiré";
    bien.proprietaireId = null;
  }

  closeCustomModal();
  showAlert("success", "Mandat de gestion révoqué", `Le bien "${bienTitle}" a bien été retiré de la gestion.`);
  
  dashTab("biens", userId);
};

function removePropertyP1(bienId, userId) {
  const bien = mockBiens.find(b => b.id === bienId);
  const bienTitle = bien ? bien.title : "ce bien";

  showCustomModal(`
    <div style="text-align:left;">
      <h3 style="margin-bottom:1rem; border-bottom:1px solid var(--gray-300); padding-bottom:0.75rem; color:#d32f2f;">
        <i class="fas fa-exclamation-triangle"></i> Résiliation de Mandat de Gestion
      </h3>
      
      <p style="font-size:0.9rem; margin-bottom:1rem; line-height:1.4;">
        Vous vous apprêtez à révoquer le mandat de gestion de la propriété : <br>
        <strong>${bienTitle}</strong>
      </p>

      <div style="background:#ffebee; border-left:4px solid #d32f2f; border-radius:var(--radius-sm); padding:0.75rem 1rem; font-size:0.82rem; color:#c62828; margin-bottom:1.25rem;">
        <p style="margin:0 0 0.5rem 0; font-weight:700;"><i class="fas fa-gavel"></i> Avertissements Légaux & Contractuels :</p>
        <ul style="margin:0; padding-left:1.25rem; line-height:1.4;">
          <li><strong>Préavis contractuel de 30 jours :</strong> La résiliation effective interviendra 30 jours après cette demande.</li>
          <li><strong>Respect des baux en cours :</strong> Si le bien est occupé, les locataires actuels restent en place et leurs contrats de bail se poursuivent selon les mêmes termes juridiques.</li>
          <li><strong>Solde de gestion :</strong> Les comptes de gestion de cette propriété seront clôturés sous 15 jours.</li>
        </ul>
      </div>

      <div class="form-group" style="margin-bottom:1.5rem;">
        <label class="form-label" style="font-weight:600;">Veuillez saisir le mot-clé <strong style="color:#d32f2f;">"RÉSILIER"</strong> en majuscules pour confirmer :</label>
        <input type="text" class="form-control" id="resiliation-confirm-input" placeholder="Saisir RÉSILIER ici" oninput="checkResiliationInput(this.value)">
      </div>

      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="closeCustomModal()">Annuler</button>
        <button id="confirm-resiliation-btn" class="btn" style="flex:2; background:#d32f2f; color:#fff; font-weight:600; opacity:0.5; cursor:not-allowed;" disabled onclick="executeRevocationP1('${bienId}', '${userId}')">
          <i class="fas fa-trash-alt"></i> Confirmer la résiliation
        </button>
      </div>
    </div>
  `);
}
window.removePropertyP1 = removePropertyP1;
