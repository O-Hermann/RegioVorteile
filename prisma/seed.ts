import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  console.log("Loesche bestehende Daten...");
  await prisma.redemption.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.partnerBusiness.deleteMany();
  await prisma.user.deleteMany();
  await prisma.pricingTier.deleteMany();
  await prisma.region.deleteMany();

  console.log("Lege Region an...");
  const region = await prisma.region.create({
    data: { name: "Region Musterstadt", plzCodes: "12345,12347,12350,12352" },
  });

  console.log("Lege Preisstufen an...");
  const [tierS, tierM, tierL, tierXL] = await Promise.all([
    prisma.pricingTier.create({
      data: { label: "Bis 20 Mitarbeitende", minEmployees: 1, maxEmployees: 20, monthlyPriceCents: 4900 },
    }),
    prisma.pricingTier.create({
      data: { label: "21-50 Mitarbeitende", minEmployees: 21, maxEmployees: 50, monthlyPriceCents: 9900 },
    }),
    prisma.pricingTier.create({
      data: { label: "51-100 Mitarbeitende", minEmployees: 51, maxEmployees: 100, monthlyPriceCents: 17900 },
    }),
    prisma.pricingTier.create({
      data: { label: "Ab 101 Mitarbeitende", minEmployees: 101, maxEmployees: null, monthlyPriceCents: 29900 },
    }),
  ]);

  console.log("Lege Admin-Account an...");
  await prisma.user.create({
    data: {
      email: "admin@regiovorteile.de",
      passwordHash: await bcrypt.hash("admin1234", 10),
      role: "ADMIN",
    },
  });

  console.log("Lege Partnerbetriebe an...");
  const partners = await Promise.all([
    prisma.partnerBusiness.create({
      data: {
        name: "FitPunkt Fitnessstudio",
        category: "Fitness & Sport",
        description: "Modernes Fitnessstudio mit Kursen, Geraeten und Sauna-Bereich.",
        discountText: "20% auf die Monatsmitgliedschaft",
        regionId: region.id,
        street: "Bahnhofstraße 4",
        plz: "12345",
        city: "Musterstadt",
        contractEndDate: daysFromNow(400),
      },
    }),
    prisma.partnerBusiness.create({
      data: {
        name: "Backstube Krumm",
        category: "Bäckerei & Konditorei",
        description: "Familienbaeckerei mit taeglich frischen Backwaren und Konditorei.",
        discountText: "10% auf alle Backwaren",
        regionId: region.id,
        street: "Marktplatz 7",
        plz: "12347",
        city: "Musterstadt",
        contractEndDate: daysFromNow(20),
      },
    }),
    prisma.partnerBusiness.create({
      data: {
        name: "Haarwerk Friseursalon",
        category: "Friseur & Beauty",
        description: "Friseursalon fuer Damen und Herren, Farb- und Stylingberatung.",
        discountText: "15% auf alle Dienstleistungen",
        regionId: region.id,
        street: "Hauptstraße 22",
        plz: "12345",
        city: "Musterstadt",
        contractEndDate: daysFromNow(200),
      },
    }),
    prisma.partnerBusiness.create({
      data: {
        name: "KFZ Meister Bode",
        category: "Werkstatt & Auto",
        description: "Kfz-Werkstatt fuer Inspektion, Reparatur und Reifenwechsel.",
        discountText: "10% auf Inspektion und Reparatur",
        regionId: region.id,
        street: "Industriering 9",
        plz: "12350",
        city: "Musterstadt",
        contractEndDate: daysFromNow(-15),
      },
    }),
    prisma.partnerBusiness.create({
      data: {
        name: "Trattoria Sole",
        category: "Gastronomie",
        description: "Italienisches Restaurant mit Terrasse in der Innenstadt.",
        discountText: "1 Gratis-Getraenk zum Hauptgericht",
        regionId: region.id,
        street: "Kirchgasse 3",
        plz: "12347",
        city: "Musterstadt",
        contractEndDate: daysFromNow(365),
      },
    }),
    prisma.partnerBusiness.create({
      data: {
        name: "Praxis Beweglich",
        category: "Gesundheit & Wellness",
        description: "Physiotherapie-Praxis mit Termin auch kurzfristig moeglich.",
        discountText: "Kostenlose Erstberatung",
        regionId: region.id,
        street: "Lindenallee 15",
        plz: "12352",
        city: "Musterstadt",
        contractEndDate: daysFromNow(180),
      },
    }),
    prisma.partnerBusiness.create({
      data: {
        name: "Buchhandlung Leselust",
        category: "Einzelhandel",
        description: "Inhabergefuehrte Buchhandlung mit persoenlicher Beratung.",
        discountText: "10% auf alle Bücher",
        regionId: region.id,
        street: "Hauptstraße 5",
        plz: "12345",
        city: "Musterstadt",
        contractEndDate: daysFromNow(90),
      },
    }),
    prisma.partnerBusiness.create({
      data: {
        name: "Sehcomfort Optiker",
        category: "Sonstiges",
        description: "Optiker mit grosser Brillenauswahl und Sehtest vor Ort.",
        discountText: "15% auf Brillenfassungen",
        regionId: region.id,
        street: "Poststraße 11",
        plz: "12350",
        city: "Musterstadt",
        contractEndDate: daysFromNow(10),
      },
    }),
  ]);

  console.log("Lege Arbeitgeber an...");
  const employer1User = await prisma.user.create({
    data: {
      email: "arbeitgeber1@example.com",
      passwordHash: await bcrypt.hash("test1234", 10),
      role: "EMPLOYER",
      employer: {
        create: {
          companyName: "Nordlicht Software GmbH",
          employeeCount: 35,
          regionId: region.id,
          pricingTierId: tierM.id,
          subscriptionStatus: "aktiv",
          contractEndDate: daysFromNow(300),
        },
      },
    },
    include: { employer: true },
  });

  const employer2User = await prisma.user.create({
    data: {
      email: "arbeitgeber2@example.com",
      passwordHash: await bcrypt.hash("test1234", 10),
      role: "EMPLOYER",
      employer: {
        create: {
          companyName: "Metallbau Schmidt & Söhne",
          employeeCount: 12,
          regionId: region.id,
          pricingTierId: tierS.id,
          subscriptionStatus: "aktiv",
          contractEndDate: daysFromNow(25),
        },
      },
    },
    include: { employer: true },
  });

  const employer3User = await prisma.user.create({
    data: {
      email: "arbeitgeber3@example.com",
      passwordHash: await bcrypt.hash("test1234", 10),
      role: "EMPLOYER",
      employer: {
        create: {
          companyName: "Klinikum Musterstadt",
          employeeCount: 130,
          regionId: region.id,
          pricingTierId: tierXL.id,
          subscriptionStatus: "ausstehend",
          contractEndDate: daysFromNow(-5),
        },
      },
    },
    include: { employer: true },
  });

  console.log("Lege Mitarbeitende an...");
  const anna = await prisma.employee.create({
    data: {
      employerId: employer1User.employer!.id,
      name: "Anna Nordmann",
      email: "anna@nordlicht.example",
      inviteCode: "NORD-ANNA",
      status: "ACTIVE",
    },
  });
  await prisma.employee.create({
    data: {
      employerId: employer1User.employer!.id,
      name: "Ben Nordmann",
      email: "ben@nordlicht.example",
      inviteCode: "NORD-BEN1",
      status: "INVITED",
    },
  });

  const petra = await prisma.employee.create({
    data: {
      employerId: employer2User.employer!.id,
      name: "Petra Schmidt",
      email: "petra@metallbau.example",
      inviteCode: "META-PETRA",
      status: "ACTIVE",
    },
  });
  await prisma.employee.create({
    data: {
      employerId: employer2User.employer!.id,
      name: "Jonas Weber",
      email: "jonas@metallbau.example",
      inviteCode: "META-JONAS",
      status: "INVITED",
    },
  });

  const julia = await prisma.employee.create({
    data: {
      employerId: employer3User.employer!.id,
      name: "Julia Berger",
      email: "julia@klinikum.example",
      inviteCode: "KLIN-JULIA",
      status: "ACTIVE",
    },
  });
  await prisma.employee.create({
    data: {
      employerId: employer3User.employer!.id,
      name: "Tom Fischer",
      email: "tom@klinikum.example",
      inviteCode: "KLIN-TOM1",
      status: "INVITED",
    },
  });
  await prisma.employee.create({
    data: {
      employerId: employer3User.employer!.id,
      name: "Sara Klein",
      email: "sara@klinikum.example",
      inviteCode: "KLIN-SARA",
      status: "ACTIVE",
    },
  });

  console.log("Lege Beispiel-Redemptions an...");
  const [fitpunkt, backstube, kfz, trattoria, praxis] = partners;
  await prisma.redemption.createMany({
    data: [
      { employeeId: anna.id, partnerBusinessId: fitpunkt.id, code: "AB12-CD34" },
      { employeeId: anna.id, partnerBusinessId: backstube.id, code: "EF56-GH78" },
      { employeeId: petra.id, partnerBusinessId: kfz.id, code: "IJ90-KL12" },
      { employeeId: julia.id, partnerBusinessId: trattoria.id, code: "MN34-OP56" },
      { employeeId: julia.id, partnerBusinessId: praxis.id, code: "QR78-ST90" },
    ],
  });

  console.log("\nFertig! Zugangsdaten fuer den Test-Durchlauf:");
  console.log("Admin:       admin@regiovorteile.de / admin1234");
  console.log("Arbeitgeber: arbeitgeber1@example.com / test1234 (Nordlicht Software GmbH)");
  console.log("Arbeitgeber: arbeitgeber2@example.com / test1234 (Metallbau Schmidt & Söhne)");
  console.log("Arbeitgeber: arbeitgeber3@example.com / test1234 (Klinikum Musterstadt)");
  console.log("Mitarbeiter-Codes: NORD-ANNA, META-PETRA, KLIN-JULIA (aktiv) / NORD-BEN1, META-JONAS, KLIN-TOM1 (eingeladen)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
