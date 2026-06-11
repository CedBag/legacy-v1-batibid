/**
 * BatiBid — Mock Database (db.js)
 * Contient : utilisateurs fictifs, biens, transactions, incidents, notifications
 */

// ==========================================
// COMPTES FICTIFS DE DÉMONSTRATION
// ==========================================
// Profil 1 → simplice@batibid.com / Demo@1234
// Profil 2 → marie@batibid.com    / Demo@1234
// Profil 3 → jean@batibid.com     / Demo@1234
// Profil 4 → carine@batibid.com   / Demo@1234

const mockUsers = [
  {
    id: "u1",
    email: "simplice@batibid.com",
    password: "Demo@1234",
    name: "M. Simplice KODJIA",
    phone: "01 97 50 22 33",
    role: "proprietaire",
    formula: "integrale",  // Gestion Intégrale — 10%
    locataireGere: false,
    avatar: "SK",
    bienIds: ["b1", "b2", "b3"],   // Ses 3 biens gérés par BatiBid
    rib: "MTN MoMo — +229 01 97 50 22 33"
  },
  {
    id: "u2",
    email: "marie@batibid.com",
    password: "Demo@1234",
    name: "Mme Marie AGOSSOU",
    phone: "01 96 45 10 20",
    role: "proprietaire",
    formula: "annonce",    // Mise en location — annonce simple
    locataireGere: false,
    avatar: "MA",
    bienIds: ["b4"],
    rib: "Moov Flooz — +229 01 96 45 10 20"
  },
  {
    id: "u3",
    email: "jean@batibid.com",
    password: "Demo@1234",
    name: "M. Jean DOSSOU",
    phone: "01 65 33 44 55",
    role: "locataire",
    formula: "",
    locataireGere: false,  // Locataire chercheur
    avatar: "JD",
    savedProperties: [1, 3],
    candidatures: ["b1"]
  },
  {
    id: "u4",
    email: "carine@batibid.com",
    password: "Demo@1234",
    name: "Mme Carine SOGLO",
    phone: "01 97 88 77 66",
    role: "locataire",
    formula: "",
    locataireGere: true,   // Locataire géré par BatiBid
    avatar: "CS",
    bienLoueId: "b1",      // Loue le bien b1 de Simplice
    proprietaireId: "u1"
  }
];

// ==========================================
// BIENS IMMOBILIERS
// ==========================================
const mockBiens = [
  {
    id: "b1",
    proprietaireId: "u1",
    locataireId: "u4",      // Carine est locataire ici
    title: "Appartement F3 Haut Standing — Haie Vive",
    type: "appartement",
    city: "Cotonou",
    address: "Haie Vive",
    loyer: 350000,
    surface: 120,
    bedrooms: 2,
    bathrooms: 2,
    status: "Occupé",       // Occupé / Libre / Incident
    verified: true,
    image: "./apt_kitchen.png",
    dateDebutBail: "01/01/2026",
    dateFinBail: "31/12/2026",
    commission: 0.10        // 10% BatiBid
  },
  {
    id: "b2",
    proprietaireId: "u1",
    locataireId: null,      // Libre
    title: "Villa Duplex Moderne — Fidjrossè",
    type: "maison",
    city: "Cotonou",
    address: "Fidjrossè",
    loyer: 800000,
    surface: 350,
    bedrooms: 4,
    bathrooms: 3,
    status: "Libre",
    verified: true,
    image: "./duplex_villa.png",
    dateDebutBail: null,
    dateFinBail: null,
    commission: 0.10
  },
  {
    id: "b3",
    proprietaireId: "u1",
    locataireId: "u_ext",   // Locataire externe (sans compte BatiBid)
    title: "Plateau Bureau Open Space — Ganhi",
    type: "bureau",
    city: "Cotonou",
    address: "Ganhi",
    loyer: 1200000,
    surface: 200,
    bedrooms: 0,
    bathrooms: 2,
    status: "Incident",
    verified: true,
    image: "./office_space.png",
    dateDebutBail: "01/03/2026",
    dateFinBail: "28/02/2027",
    commission: 0.10
  },
  {
    id: "b4",
    proprietaireId: "u2",
    locataireId: null,
    title: "Studio Meublé Cadjehoun",
    type: "appartement",
    city: "Cotonou",
    address: "Cadjehoun",
    loyer: 150000,
    surface: 50,
    bedrooms: 1,
    bathrooms: 1,
    status: "En annonce",   // Publié sur BatiBid pour trouver locataire
    verified: false,
    image: "./apt_kitchen.png",
    dateDebutBail: null,
    dateFinBail: null,
    commission: 0           // Pas de gestion, juste annonce
  }
];

// ==========================================
// TRANSACTIONS
// ==========================================
const mockTransactions = [
  // Juin 2026 — b1 — Carine (u4) → Simplice (u1) via BatiBid
  {
    id: "TX-2026-06",
    bienId: "b1",
    locataireId: "u4",
    proprietaireId: "u1",
    mois: "Juin 2026",
    dateEcheance: "05/06/2026",
    datePaiement: "03/06/2026",
    montantBrut: 350000,
    commission: 35000,
    montantNet: 315000,
    methode: "MTN Mobile Money",
    statutLocataire: "payé",
    couvertParBatiBid: false,
    penalite: 0,
    statutRecouvrement: null
  },
  // Mai 2026
  {
    id: "TX-2026-05",
    bienId: "b1",
    locataireId: "u4",
    proprietaireId: "u1",
    mois: "Mai 2026",
    dateEcheance: "05/05/2026",
    datePaiement: "05/05/2026",
    montantBrut: 350000,
    commission: 35000,
    montantNet: 315000,
    methode: "Moov Money",
    statutLocataire: "payé",
    couvertParBatiBid: false,
    penalite: 0,
    statutRecouvrement: null
  },
  // Avril 2026
  {
    id: "TX-2026-04",
    bienId: "b1",
    locataireId: "u4",
    proprietaireId: "u1",
    mois: "Avril 2026",
    dateEcheance: "05/04/2026",
    datePaiement: null,       // Locataire n'a pas payé
    montantBrut: 350000,
    commission: 35000,
    montantNet: 315000,
    methode: null,
    statutLocataire: "impayé",
    couvertParBatiBid: true,  // BatiBid a couvert
    penalite: 0,
    statutRecouvrement: "amiable"
  },
  // Bien b3 — Bureau Ganhi
  {
    id: "TX-B3-06",
    bienId: "b3",
    locataireId: "u_ext",
    proprietaireId: "u1",
    mois: "Juin 2026",
    dateEcheance: "05/06/2026",
    datePaiement: "05/06/2026",
    montantBrut: 1200000,
    commission: 120000,
    montantNet: 1080000,
    methode: "Virement Bancaire",
    statutLocataire: "payé",
    couvertParBatiBid: false,
    penalite: 0,
    statutRecouvrement: null
  }
];

// ==========================================
// INCIDENTS SIGNALÉS
// ==========================================
const mockIncidents = [
  {
    id: "INC-001",
    bienId: "b3",
    signalePar: "u_ext",
    categorie: "Électricité",
    description: "Panne de courant complète dans les bureaux depuis hier soir.",
    statut: "En cours",   // En cours / Résolu / En attente
    priorite: "Haute",
    date: "08/06/2026",
    technicien: "ELEC-Bénin Partenaires"
  },
  {
    id: "INC-002",
    bienId: "b1",
    signalePar: "u4",
    categorie: "Plomberie",
    description: "Fuite d'eau sous le lavabo de la salle de bain principale.",
    statut: "Résolu",
    priorite: "Moyenne",
    date: "20/05/2026",
    technicien: "AquaFix Bénin"
  }
];

// ==========================================
// NOTIFICATIONS
// ==========================================
const mockNotifications = {
  u1: [
    { id: "n1", type: "success", icon: "fa-money-bill-wave", texte: "Loyer Juin 2026 reçu — Appartement Haie Vive (315 000 XOF nets)", date: "03/06/2026", lu: false },
    { id: "n2", type: "success", icon: "fa-money-bill-wave", texte: "Loyer Juin 2026 reçu — Bureau Ganhi (1 080 000 XOF nets)", date: "05/06/2026", lu: false },
    { id: "n3", type: "warning", icon: "fa-tools", texte: "Incident signalé — Bureau Ganhi : Panne électrique (Priorité Haute)", date: "08/06/2026", lu: false },
    { id: "n4", type: "info", icon: "fa-home", texte: "Villa Fidjrossè — Nouveau candidat locataire en attente de validation", date: "07/06/2026", lu: true },
    { id: "n5", type: "warning", icon: "fa-exclamation-triangle", texte: "Avril 2026 — Loyer Haie Vive couvert par BatiBid. Recouvrement en cours.", date: "06/04/2026", lu: true }
  ],
  u4: [
    { id: "n1", type: "success", icon: "fa-check-circle", texte: "Loyer Juin 2026 confirmé — Quittance disponible en téléchargement", date: "03/06/2026", lu: false },
    { id: "n2", type: "success", icon: "fa-tools", texte: "Incident plomberie résolu — Fuite du 20/05 réparée avec succès", date: "22/05/2026", lu: true },
    { id: "n3", type: "warning", icon: "fa-exclamation-triangle", texte: "Rappel : Loyer Avril 2026 non payé — 350 000 XOF dus à BatiBid", date: "20/04/2026", lu: false }
  ]
};

// ==========================================
// CANDIDATURES (Profil 3)
// ==========================================
const mockCandidatures = [
  {
    id: "cand-001",
    bienId: "b2",
    candidatId: "u3",
    statut: "En attente",
    dateEnvoi: "06/06/2026",
    message: "Très intéressé par la villa. Je suis cadre commercial expatrié, revenus stables."
  }
];

// ==========================================
// PROPRIÉTÉS PUBLIQUES (pour Trouver)
// ==========================================
const mockDb = {
  properties: [
    { id: 1, title: "Appartement F3 Haut Standing", type: "appartement", city: "Cotonou", address: "Haie Vive", price: 350000, bedrooms: 2, bathrooms: 2, surface: 120, status: "À Louer", image: "./apt_kitchen.png", verified: true, desc: "Superbe appartement F3 moderne situé en plein cœur de la Haie Vive. Entièrement climatisé avec finitions haut de gamme, cuisine équipée et balcon spacieux." },
    { id: 2, title: "Villa Duplex Moderne", type: "maison", city: "Cotonou", address: "Fidjrossè", price: 800000, bedrooms: 4, bathrooms: 3, surface: 350, status: "À Louer", image: "./duplex_villa.png", verified: false, desc: "Magnifique villa duplex contemporaine avec piscine privée à Fidjrossè. Grand salon lumineux, cuisine américaine, 4 chambres spacieuses, garage." },
    { id: 3, title: "Plateau Bureau Open Space", type: "bureau", city: "Cotonou", address: "Ganhi", price: 1200000, bedrooms: 3, bathrooms: 2, surface: 200, status: "À Louer", image: "./office_space.png", verified: true, desc: "Plateau de bureaux professionnels en open space au cœur du centre d'affaires de Ganhi. Climatisé, fibre optique, parkings." },
    { id: 4, title: "Studio Meublé Cadjehoun", type: "appartement", city: "Cotonou", address: "Cadjehoun", price: 150000, bedrooms: 1, bathrooms: 1, surface: 50, status: "À Louer", image: "./apt_kitchen.png", verified: true, desc: "Studio meublé de charme à Cadjehoun. Connexion Wifi haut débit, climatisation, parking intérieur." },
    { id: 5, title: "Maison Basse Calavi", type: "maison", city: "Abomey-Calavi", address: "Cocotomey", price: 250000, bedrooms: 3, bathrooms: 2, surface: 160, status: "À Louer", image: "./duplex_villa.png", verified: false, desc: "Maison neuve de 3 chambres avec cour arrière et garage. Secteur calme et recherché de Calavi." }
  ],
  testimonials: [
    { quote: "BatiBid a complètement changé ma relation avec mes locataires. Grâce au recouvrement garanti, je reçois mes loyers le 5 de chaque mois, sans exception.", author: "M. Simplice KODJIA", role: "Propriétaire d'un immeuble à Fidjrossè" },
    { quote: "En tant que locataire, pouvoir payer mon loyer par MTN Mobile Money directement depuis l'application est un confort incroyable.", author: "Mme Carine SOGLO", role: "Locataire à Abomey-Calavi" },
    { quote: "Le service client BatiBid est extrêmement réactif. J'ai eu une fuite d'eau un dimanche, j'ai signalé la panne sur mon espace et le plombier partenaire était là en 2 heures.", author: "M. Ghislain TOSSOU", role: "Locataire à Cadjehoun" }
  ],
  transactions: [
    { id: "TX-9021", date: "05 Juin 2026", description: "Loyer Juin 2026 - Appartement Haie Vive", amount: 350000, method: "MTN Mobile Money", status: "Payé" },
    { id: "TX-8834", date: "05 Mai 2026", description: "Loyer Mai 2026 - Appartement Haie Vive", amount: 350000, method: "Moov Money", status: "Payé" },
    { id: "TX-7645", date: "05 Avril 2026", description: "Loyer Avril 2026 - Appartement Haie Vive", amount: 350000, method: "Celtiis Cash", status: "Payé" }
  ],
  savedProperties: []
};
