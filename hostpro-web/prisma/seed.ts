import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HOST PRO demo data...");

  // Tenant
  const tenant = await db.tenant.upsert({
    where: { slug: "demo-hostpro" },
    update: {},
    create: { name: "HOST PRO Démo", slug: "demo-hostpro", plan: "enterprise" },
  });

  // User admin
  const user = await db.user.upsert({
    where: { email: "demo@hostpro.fr" },
    update: {},
    create: {
      email: "demo@hostpro.fr",
      password_hash: await bcrypt.hash("demo1234", 12),
      full_name: "Ahmed — Démo",
      is_active: true,
    },
  });

  await db.userTenant.upsert({
    where: { user_id_tenant_id: { user_id: user.id, tenant_id: tenant.id } },
    update: {},
    create: { user_id: user.id, tenant_id: tenant.id, role: "admin" },
  });

  // Properties
  const props = await Promise.all([
    db.property.upsert({
      where: { id: "prop-villa-azur" },
      update: {},
      create: {
        id: "prop-villa-azur",
        tenant_id: tenant.id,
        name: "Villa Azur",
        property_type: "villa",
        status: "active",
        address: "12 Promenade des Anglais",
        city: "Nice",
        postal_code: "06000",
        country: "FR",
        max_guests: 8,
        bedrooms: 4,
        bathrooms: 3,
        surface_m2: 180,
        base_price_night: 185,
        cleaning_fee: 80,
        check_in_time: "16:00",
        check_out_time: "11:00",
        amenities: JSON.stringify(["WiFi", "Piscine", "Climatisation", "Parking", "Terrasse"]),
      },
    }),
    db.property.upsert({
      where: { id: "prop-apt-bellevue" },
      update: {},
      create: {
        id: "prop-apt-bellevue",
        tenant_id: tenant.id,
        name: "Apt. Bellevue",
        property_type: "apartment",
        status: "active",
        address: "7 Rue d'Antibes",
        city: "Cannes",
        postal_code: "06400",
        country: "FR",
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        surface_m2: 65,
        base_price_night: 120,
        cleaning_fee: 50,
        amenities: JSON.stringify(["WiFi", "Climatisation", "Vue mer"]),
      },
    }),
    db.property.upsert({
      where: { id: "prop-studio-monaco" },
      update: {},
      create: {
        id: "prop-studio-monaco",
        tenant_id: tenant.id,
        name: "Studio Monaco",
        property_type: "studio",
        status: "maintenance",
        address: "3 Avenue Princess Grace",
        city: "Monaco",
        postal_code: "98000",
        country: "MC",
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        surface_m2: 35,
        base_price_night: 250,
        cleaning_fee: 40,
        amenities: JSON.stringify(["WiFi", "Climatisation", "Parking"]),
      },
    }),
    db.property.upsert({
      where: { id: "prop-mas-provencal" },
      update: {},
      create: {
        id: "prop-mas-provencal",
        tenant_id: tenant.id,
        name: "Mas Provençal",
        property_type: "house",
        status: "active",
        address: "Chemin des Lavandes",
        city: "Gordes",
        postal_code: "84220",
        country: "FR",
        max_guests: 10,
        bedrooms: 5,
        bathrooms: 3,
        surface_m2: 250,
        base_price_night: 300,
        cleaning_fee: 120,
        amenities: JSON.stringify(["WiFi", "Piscine", "Jardin", "Barbecue", "Parking"]),
      },
    }),
    db.property.upsert({
      where: { id: "prop-loft-paris" },
      update: {},
      create: {
        id: "prop-loft-paris",
        tenant_id: tenant.id,
        name: "Loft Marais",
        property_type: "loft",
        status: "active",
        address: "14 Rue de Bretagne",
        city: "Paris",
        postal_code: "75003",
        country: "FR",
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        surface_m2: 90,
        base_price_night: 210,
        cleaning_fee: 70,
        amenities: JSON.stringify(["WiFi", "Cuisine équipée", "Netflix"]),
      },
    }),
  ]);

  // Compliance records
  const complianceData = [
    { property_id: "prop-villa-azur", registration_number: "069440A01234", registration_city: "Nice", dpe_class: "B", nuitees_year: 87, is_compliant: true, alerts: "[]" },
    { property_id: "prop-apt-bellevue", registration_number: "060630B05678", registration_city: "Cannes", dpe_class: "C", nuitees_year: 102, is_compliant: true, alerts: "[]" },
    { property_id: "prop-studio-monaco", registration_number: null, registration_city: null, dpe_class: "C", nuitees_year: 45, is_compliant: false, alerts: '["Numéro d\'enregistrement manquant"]' },
    { property_id: "prop-mas-provencal", registration_number: "084220C09012", registration_city: "Gordes", dpe_class: "E", nuitees_year: 60, is_compliant: false, alerts: '["DPE classe E — mise à niveau recommandée"]' },
    { property_id: "prop-loft-paris", registration_number: "075003D03456", registration_city: "Paris", dpe_class: "D", nuitees_year: 78, is_compliant: true, alerts: "[]" },
  ];

  for (const c of complianceData) {
    await db.complianceRecord.upsert({
      where: { property_id: c.property_id },
      update: {},
      create: c,
    });
  }

  // Reservations
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  const reservations = [
    { property_id: "prop-villa-azur", guest_name: "Marie Dupont", guest_email: "marie.dupont@email.fr", check_in: fmt(addDays(today, 3)), check_out: fmt(addDays(today, 8)), nights: 5, total_amount: 925, source: "airbnb", status: "confirmed", reference: "HP-2026-001" },
    { property_id: "prop-apt-bellevue", guest_name: "Jean-Paul Martin", guest_email: "jp.martin@email.fr", check_in: fmt(addDays(today, 5)), check_out: fmt(addDays(today, 12)), nights: 7, total_amount: 840, source: "booking", status: "confirmed", reference: "HP-2026-002" },
    { property_id: "prop-studio-monaco", guest_name: "Sophie & Luc Bernard", guest_email: "sophie.bernard@email.fr", check_in: fmt(addDays(today, 9)), check_out: fmt(addDays(today, 14)), nights: 5, total_amount: 1250, source: "direct", status: "confirmed", reference: "HP-2026-003" },
    { property_id: "prop-mas-provencal", guest_name: "Claire Fontaine", guest_email: "claire.fontaine@email.fr", check_in: fmt(addDays(today, 17)), check_out: fmt(addDays(today, 24)), nights: 7, total_amount: 2100, source: "airbnb", status: "pending", reference: "HP-2026-004" },
    { property_id: "prop-villa-azur", guest_name: "Thomas & Emma Weber", guest_email: "thomas.weber@gmail.de", check_in: fmt(addDays(today, 25)), check_out: fmt(addDays(today, 32)), nights: 7, total_amount: 1295, source: "booking", status: "confirmed", reference: "HP-2026-005" },
    { property_id: "prop-loft-paris", guest_name: "Isabella Romano", guest_email: "i.romano@email.it", check_in: fmt(addDays(today, -5)), check_out: fmt(addDays(today, -1)), nights: 4, total_amount: 840, source: "airbnb", status: "completed", reference: "HP-2026-006" },
    { property_id: "prop-apt-bellevue", guest_name: "Alexandre Petit", guest_email: "a.petit@email.fr", check_in: fmt(addDays(today, -10)), check_out: fmt(addDays(today, -6)), nights: 4, total_amount: 480, source: "direct", status: "completed", reference: "HP-2026-007" },
    { property_id: "prop-loft-paris", guest_name: "John & Sarah Smith", guest_email: "john.smith@email.co.uk", check_in: fmt(addDays(today, 40)), check_out: fmt(addDays(today, 47)), nights: 7, total_amount: 1470, source: "airbnb", status: "confirmed", reference: "HP-2026-008" },
  ];

  for (const r of reservations) {
    await db.reservation.upsert({
      where: { id: r.reference },
      update: {},
      create: { id: r.reference, tenant_id: tenant.id, adults: 2, ...r },
    });
  }

  // Tasks
  const tasks = [
    { property_id: "prop-villa-azur", title: "Ménage complet avant arrivée Dupont", type: "cleaning", status: "pending", priority: "high", due_date: fmt(addDays(today, 2)) },
    { property_id: "prop-studio-monaco", title: "Vérification chaudière", type: "maintenance", status: "in_progress", priority: "high", due_date: fmt(addDays(today, 1)) },
    { property_id: "prop-apt-bellevue", title: "Renouvellement contrat ménage", type: "other", status: "pending", priority: "normal", due_date: fmt(addDays(today, 7)) },
    { property_id: "prop-villa-azur", title: "Remplacement ampoules salle de bain", type: "maintenance", status: "pending", priority: "low" },
    { property_id: "prop-mas-provencal", title: "Mise à niveau DPE — devis artisan", type: "other", status: "pending", priority: "high" },
    { property_id: "prop-villa-azur", title: "Ménage avant arrivée Dupont", type: "cleaning", status: "done", priority: "high" },
    { property_id: "prop-studio-monaco", title: "Mise à jour guide de la maison", type: "other", status: "done", priority: "low" },
  ];

  for (const t of tasks) {
    await db.task.create({ data: { tenant_id: tenant.id, ...t } }).catch(() => null);
  }

  // iCal feeds
  await db.icalFeed.create({
    data: {
      property_id: "prop-villa-azur",
      platform: "airbnb",
      url: "https://www.airbnb.com/calendar/ical/12345.ics?s=abc123",
      direction: "import",
      is_active: true,
    },
  }).catch(() => null);

  // Message thread
  const thread = await db.messageThread.create({
    data: {
      tenant_id: tenant.id,
      guest_name: "Marie Dupont",
      guest_email: "marie.dupont@email.fr",
      property_id: "prop-villa-azur",
      platform_thread_ids: JSON.stringify({ airbnb: "external-thread-123" }),
      status: "open",
    },
  }).catch(() => null);

  if (thread) {
    await db.message.createMany({
      data: [
        { thread_id: thread.id, sender: "guest", sender_name: "Marie Dupont", platform: "airbnb", body: "Bonjour, est-ce que la piscine est disponible tout le séjour ?" },
        { thread_id: thread.id, sender: "host", sender_name: "Property Owner", platform: "airbnb", body: "Bonjour Marie ! Oui, la piscine est disponible 24h/24 pendant tout votre séjour. À bientôt !" },
      ],
    }).catch(() => null);
  }

  console.log(" Seed terminé !");
  console.log(" Email: demo@hostpro.fr");
  console.log("🔑 Mot de passe: demo1234");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
