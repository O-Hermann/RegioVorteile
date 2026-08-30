import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Echte Erkennungslogik fuer die "Doppelzahlungen"-Fund-Kategorie (siehe
// findings-list.tsx). Im Gegensatz zu den anderen drei Fund-Kategorien
// (Skonto nicht genutzt / Offene Gutschriften / Moegliche Ueberzahlung)
// tatsaechlich aus importierten DataImportRecord-Zeilen berechnet, nicht aus
// Referenz-Demowerten. Die anderen drei bleiben bewusst Demo-Werte: dem
// Datenmodell fehlen dafuer die noetigen Informationen (keine Skonto-%/
// -Frist, kein Belegtyp zur Unterscheidung Rechnung/Gutschrift, kein
// separates "tatsaechlich gezahlt"-Feld getrennt vom Rechnungsbetrag - siehe
// src/lib/import-fields.ts, dort existiert nur ein einziger generischer
// "amount"-Container je Zeile). Sobald diese Felder im Import-Mapping
// existieren, kann hier nach demselben Muster erweitert werden.
//
// Erkennungsregel (bewusst konservativ - wenige, aber verlaessliche Treffer
// statt viele falsche): zwei oder mehr als bezahlt (Status "PAID")
// importierte Zeilen mit derselben Referenz-/Rechnungsnummer UND demselben
// Betrag gelten als eine Doppelzahlung. Unterschiedliche Betraege bei
// gleicher Rechnungsnummer werden NICHT gewertet (koennten legitime
// Teilzahlungen sein - eine Annahme ohne Beleg im Datenmodell waere hier
// riskant). Referenznummern werden getrimmt/kleingeschrieben verglichen,
// analog zu dedupeByReference() in company-metrics.ts - dort werden
// Duplikate bewusst zusammengefuehrt (fuer korrekte Umsatzsummen), hier ist
// die Duplizierung selbst das Signal, das gemeldet werden soll.
//
// Die AELTESTE Zeile je Gruppe gilt als die urspruengliche, legitime
// Zahlung; alle weiteren als die faelschlich zusaetzlich gezahlten Betraege.
// Der ausgewiesene Betrag ist daher der VERLORENE Anteil (Anzahl-1 × Betrag),
// nicht die Summe aller Zahlungen zusammen.
//
// MVP-Roadmap Phase 4 (siehe [[effivo_mvp_roadmap]]) - Re-Import-Sicherheit:
// bisher verhinderte nur ein Byte-identischer Datei-Checksum-Vergleich
// (siehe confirmDuplicate in actions/data-import.ts) den erneuten Import
// EXAKT derselben Datei. Zwei UNTERSCHIEDLICHE, aber inhaltlich
// ueberlappende Exporte desselben Zeitraums (z.B. derselbe DATEV-Export an
// zwei Tagen mit leicht anderer Formatierung) legen dieselbe Rechnung als
// zwei separate DataImportRecord-Zeilen aus zwei verschiedenen DataImports
// an - ohne Gegenmassnahme wuerde das hier faelschlich als Doppelzahlung
// erscheinen. Loesung: pro (periodMonth, periodYear) zaehlt fuer die
// Doppelzahlungs-Erkennung nur der ZULETZT verarbeitete DataImport dieses
// Zeitraums (siehe latestImportIdsPerPeriod() unten) - ein Re-Import
// desselben Zeitraums ERSETZT den vorherigen fuer diesen Zweck, statt beide
// zu addieren. Echte Doppelzahlungen bleiben davon unberuehrt: sowohl
// mehrfache Treffer INNERHALB eines einzelnen Imports (weiterhin
// eingeschlossen) als auch ueber ZWEI VERSCHIEDENE Zeitraeume hinweg
// (jeweils deren eigener "letzter Import" bleibt eingeschlossen) werden
// weiterhin erkannt.
// "key" ist die stabile Identitaet dieses Falls fuer case-sync.ts (Phase 2) -
// hier bewusst dieselbe (Referenznummer, Betrag)-Gruppierung wie oben, NICHT
// eine einzelne DataImportRecord-Id, da ein Doppelzahlungs-Fall ja aus
// mehreren Zeilen besteht und ueber Sync-Laeufe hinweg stabil bleiben muss,
// auch wenn eine der beteiligten Zeilen (z.B. durch einen erneuten Import
// derselben Datei) eine neue Id bekommt.
export type DuplicatePaymentCase = {
  key: string;
  who: string;
  what: string;
  amount: Prisma.Decimal;
  // MVP-Roadmap Phase 5 (siehe [[effivo_mvp_roadmap]]): ALLE Zeilen der
  // Gruppe (nicht nur die "zusaetzlichen"), damit die Case-Detail-Ansicht
  // auch die urspruengliche, legitime Zahlung als Vergleich zeigen kann.
  sourceRecordIds: string[];
};

export type DuplicatePaymentResult = {
  totalAmount: Prisma.Decimal;
  caseCount: number;
  topCases: DuplicatePaymentCase[];
  allCases: DuplicatePaymentCase[];
};

type DuplicateRow = {
  id: string;
  referenceNumber: string | null;
  name: string | null;
  organization: string | null;
  grossAmount: Prisma.Decimal | null;
  amount: Prisma.Decimal | null;
  primaryDate: Date | null;
  bookingDate: Date | null;
  dataImport: { processedAt: Date | null };
};

// Siehe ausfuehrliche Begruendung im Kommentar oberhalb von
// detectDuplicatePayments(). Liefert die Id-Menge aller DataImports, die
// fuer den Doppelzahlungs-Scan beruecksichtigt werden sollen: pro
// (periodMonth, periodYear) nur der zuletzt verarbeitete. "Zuletzt"
// bemisst sich an processedAt (faellt auf createdAt zurueck, falls
// processedAt aus irgendeinem Grund fehlt) - NICHT am periodMonth/Year
// selbst, da zwei Imports desselben Zeitraums per Definition denselben
// Zeitraum tragen und sich nur im tatsaechlichen Upload-/
// Verarbeitungszeitpunkt unterscheiden koennen.
async function latestImportIdsPerPeriod(companyId: string): Promise<Set<string>> {
  const imports = await prisma.dataImport.findMany({
    where: { companyId, category: "FINANCE", status: "PROCESSED" },
    select: { id: true, periodMonth: true, periodYear: true, processedAt: true, createdAt: true },
  });

  const latestByPeriod = new Map<string, { id: string; time: number }>();
  for (const imp of imports) {
    const periodKey = `${imp.periodYear}-${imp.periodMonth}`;
    const time = (imp.processedAt ?? imp.createdAt).getTime();
    const current = latestByPeriod.get(periodKey);
    if (!current || time > current.time) {
      latestByPeriod.set(periodKey, { id: imp.id, time });
    }
  }
  return new Set([...latestByPeriod.values()].map((v) => v.id));
}

export async function detectDuplicatePayments(companyId: string): Promise<DuplicatePaymentResult> {
  const activeImportIds = await latestImportIdsPerPeriod(companyId);

  const rows: DuplicateRow[] = await prisma.dataImportRecord.findMany({
    where: {
      companyId,
      status: "PAID",
      referenceNumber: { not: null },
      dataImportId: { in: [...activeImportIds] },
      dataImport: { category: "FINANCE", status: "PROCESSED" },
    },
    select: {
      id: true,
      referenceNumber: true,
      name: true,
      organization: true,
      grossAmount: true,
      amount: true,
      primaryDate: true,
      bookingDate: true,
      dataImport: { select: { processedAt: true } },
    },
  });

  // Gruppierung nach (normalisierte Referenznummer, Betrag) - siehe
  // Kommentar oben zur bewusst engen Erkennungsregel. Der Gruppenschluessel
  // ist zugleich der stabile "key" fuer case-sync.ts.
  const groups = new Map<string, DuplicateRow[]>();
  for (const row of rows) {
    const ref = row.referenceNumber?.trim();
    if (!ref) continue;
    const amount = row.grossAmount ?? row.amount;
    if (!amount) continue;
    const key = `${ref.toLowerCase()}::${amount.toFixed(2)}`;
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }

  const cases: DuplicatePaymentCase[] = [];
  let totalAmount = new Prisma.Decimal(0);

  for (const [key, groupRows] of groups) {
    if (groupRows.length < 2) continue;
    const sorted = [...groupRows].sort((a, b) => {
      const at = (a.primaryDate ?? a.bookingDate ?? a.dataImport.processedAt)?.getTime() ?? 0;
      const bt = (b.primaryDate ?? b.bookingDate ?? b.dataImport.processedAt)?.getTime() ?? 0;
      return at - bt;
    });
    const [first, ...extras] = sorted;
    const amount = (first.grossAmount ?? first.amount)!;
    const excessAmount = amount.times(extras.length);
    totalAmount = totalAmount.plus(excessAmount);
    const who = first.name?.trim() || first.organization?.trim() || "Unbekannt";
    const ref = first.referenceNumber!.trim();
    cases.push({ key, who, what: `${sorted.length}× ${ref}`, amount: excessAmount, sourceRecordIds: sorted.map((r) => r.id) });
  }

  cases.sort((a, b) => b.amount.comparedTo(a.amount));

  return {
    totalAmount,
    caseCount: cases.length,
    topCases: cases.slice(0, 3),
    allCases: cases,
  };
}
