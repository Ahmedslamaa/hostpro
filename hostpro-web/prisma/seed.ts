import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  // Tenant démo
  const tenant = await db.tenant.upsert({
    where: { slug: "demo-hostpro" },
    update: {},
    create: {
      name: "HostPro Demo",
      slug: "demo-hostpro",
      plan: "enterprise",
      is_active: true,
    },
  });

  // User admin démo
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const user = await db.user.upsert({
    where: { email: "demo@hostpro.fr" },
    update: {},
    create: {
      email: "demo@hostpro.fr",
      password_hash: passwordHash,
      full_name: "Ahmed Demo",
      is_active: true,
      gdpr_consent_at: new Date(),
    },
  });

  // Lien user-tenant
  await db.userTenant.upsert({
    where: { user_id_tenant_id: { user_id: user.id, tenant_id: tenant.id } },
    update: {},
    create: { user_id: user.id, tenant_id: tenant.id, role: "admin" },
  });

  // Propriétés démo
  const property1 = await db.property.upsert({
    where: { id: "prop-villa-azur" },
    update: {},
    create: {
      id: "prop-villa-azur",
      tenant_id: tenant.id,
      name: "Appartement Vue Mer - Nice",
      description:
        "Magnifique appartement avec vue panoramique sur la Méditerranée",
      property_type: "apartment",
      status: "active",
      address: "3 Promenade des Anglais",
      city: "Nice",
      postal_code: "06000",
      country: "FR",
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      surface_m2: 65,
      base_price_night: 180,
      cleaning_fee: 60,
      security_deposit: 500,
    },
  });

  const property2 = await db.property.upsert({
    where: { id: "prop-villa-cannes" },
    update: {},
    create: {
      id: "prop-villa-cannes",
      tenant_id: tenant.id,
      name: "Villa Provençale - Cannes",
      description: "Villa avec piscine à 5 min des plages de Cannes",
      property_type: "villa",
      status: "active",
      address: "12 Rue de la Croisette",
      city: "Cannes",
      postal_code: "06400",
      country: "FR",
      max_guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      surface_m2: 180,
      base_price_night: 450,
      cleaning_fee: 120,
      security_deposit: 1500,
    },
  });

  // Propriétés supplémentaires
  await db.property.upsert({
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
  });

  await db.property.upsert({
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
  });

  await db.property.upsert({
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
  });

  // Réservations démo
  await db.reservation.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "res-demo-001",
        tenant_id: tenant.id,
        property_id: property1.id,
        guest_name: "Marie Dupont",
        guest_email: "marie.dupont@email.com",
        guest_nationality: "FR",
        check_in: "2026-06-01",
        check_out: "2026-06-08",
        nights: 7,
        adults: 2,
        total_amount: 1320,
        cleaning_fee: 60,
        net_revenue: 1260,
        source: "airbnb",
        status: "confirmed",
      },
      {
        id: "res-demo-002",
        tenant_id: tenant.id,
        property_id: property2.id,
        guest_name: "John Smith",
        guest_email: "john.smith@email.com",
        guest_nationality: "GB",
        check_in: "2026-06-15",
        check_out: "2026-06-22",
        nights: 7,
        adults: 4,
        children: 2,
        total_amount: 3270,
        cleaning_fee: 120,
        net_revenue: 3150,
        source: "booking",
        status: "confirmed",
      },
    ],
  });

  // Tâches démo
  await db.task.createMany({
    skipDuplicates: true,
    data: [
      {
        tenant_id: tenant.id,
        property_id: property1.id,
        title: "Ménage complet avant arrivée Marie Dupont",
        type: "cleaning",
        status: "pending",
        priority: "high",
        due_date: "2026-05-31",
      },
      {
        tenant_id: tenant.id,
        property_id: property2.id,
        title: "Vérification piscine et équipements",
        type: "maintenance",
        status: "in_progress",
        priority: "normal",
        due_date: "2026-06-14",
      },
      {
        tenant_id: tenant.id,
        property_id: property1.id,
        title: "Check-in John Smith - Remise des clés",
        type: "checkin",
        status: "pending",
        priority: "urgent",
        due_date: "2026-06-15",
      },
    ],
  });

  // iCal feeds
  await db.icalFeed
    .create({
      data: {
        property_id: property1.id,
        platform: "airbnb",
        url: "https://www.airbnb.com/calendar/ical/12345.ics?s=abc123",
        direction: "import",
        is_active: true,
      },
    })
    .catch(() => null);

  // Message thread
  const thread = await db.messageThread
    .create({
      data: {
        tenant_id: tenant.id,
        guest_name: "Marie Dupont",
        guest_email: "marie.dupont@email.com",
        property_id: property1.id,
        platform_thread_ids: JSON.stringify({ airbnb: "external-thread-123" }),
        status: "open",
      },
    })
    .catch(() => null);

  if (thread) {
    await db.message
      .createMany({
        data: [
          {
            thread_id: thread.id,
            sender: "guest",
            sender_name: "Marie Dupont",
            platform: "airbnb",
            body: "Bonjour, est-ce que la piscine est disponible tout le séjour ?",
          },
          {
            thread_id: thread.id,
            sender: "host",
            sender_name: "Ahmed Demo",
            platform: "airbnb",
            body: "Bonjour Marie ! Oui, la piscine est disponible 24h/24 pendant tout votre séjour. À bientôt !",
          },
        ],
      })
      .catch(() => null);
  }

  console.log("Seed terminé !");
  console.log("Login: demo@hostpro.fr / Demo1234!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
