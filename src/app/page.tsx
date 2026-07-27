import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRightIcon } from "@/components/icons";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function lastMonthLabels(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return d.toLocaleDateString("de-DE", { month: "short" });
  });
}

function formatRegionList(names: string[]) {
  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} und ${names[names.length - 1]}`;
}

export default async function LandingPage() {
  const [pricingTiers, regions] = await Promise.all([
    prisma.pricingTier.findMany({ orderBy: { minEmployees: "asc" } }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
  ]);

  const cheapestTier = pricingTiers[0];
  const regionList = formatRegionList(regions.map((r) => r.name));
  const previewMonths = lastMonthLabels(6);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink-900 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-gold-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-ink-500/30 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-gold-200 backdrop-blur">
              Regionale Mitarbeiter-Benefits
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Der regionale Mitarbeiter-Benefit für Unternehmen
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Ihre Mitarbeitenden erhalten exklusive Vorteile bei Betrieben aus der
              Region – vom Fitnessstudio über Gastronomie bis zur Werkstatt. Einfach
              digital, messbar genutzt und ohne Verwaltungsaufwand für Sie.
            </p>
            <p className="mt-3 max-w-xl text-sm text-white/50">
              Rabatte und Zusatzleistungen bei Betrieben, die Ihre Mitarbeitenden aus
              ihrem Alltag kennen.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/arbeitgeber/registrieren"
                className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-900 shadow-warm hover:bg-gold-400 hover:shadow-warm-lg transition-all"
              >
                Für Arbeitgeber
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#partnerbetriebe"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition-all"
              >
                Für Partnerbetriebe
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            {regionList && (
              <p className="mt-6 text-xs font-medium text-gold-200">
                Jetzt verfügbar in folgenden Regionen: {regionList}
              </p>
            )}
          </div>
        </section>

        {/* Warum Regiovorteile */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-sand-900">
              Warum Regiovorteile?
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-card-border bg-card p-6 shadow-warm-sm">
                <h3 className="font-display text-lg font-bold text-sand-900">
                  Regional und relevant
                </h3>
                <p className="mt-2 text-sm text-sand-600">
                  Angebote bei Betrieben, die Ihre Mitarbeitenden tatsächlich erreichen
                  können.
                </p>
              </div>
              <div className="rounded-2xl border border-card-border bg-card p-6 shadow-warm-sm">
                <h3 className="font-display text-lg font-bold text-sand-900">
                  Einfach für Arbeitgeber
                </h3>
                <p className="mt-2 text-sm text-sand-600">
                  Mitarbeitende einladen, Nutzung anonymisiert verfolgen, fertig.
                </p>
              </div>
              <div className="rounded-2xl border border-card-border bg-card p-6 shadow-warm-sm">
                <h3 className="font-display text-lg font-bold text-sand-900">
                  Mehr Wert als die Kosten
                </h3>
                <p className="mt-2 text-sm text-sand-600">
                  Schon wenige regelmäßig genutzte Vorteile können den monatlichen
                  Preis für Mitarbeitende spürbar übersteigen.
                </p>
              </div>
            </div>
            {cheapestTier && (
              <p className="mt-10 text-center">
                <span className="rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700">
                  Bereits ab {formatPrice(cheapestTier.monthlyPriceCents)} pro Monat
                </span>
              </p>
            )}
          </div>
        </section>

        {/* Vorteile im Überblick */}
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-ink-900 p-6 sm:p-8 text-white">
              <h3 className="font-display text-lg font-bold">Vorteile für Arbeitgeber</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                {[
                  "Fertig eingerichtetes Vorteilsportal für Ihr Unternehmen",
                  "Keine Einrichtung, keine Software nötig",
                  "Mitarbeitende einfach per Link oder Code einladen",
                  "Anonymisierte Nutzungsauswertung",
                  "Preisstufe passend zur Unternehmensgröße",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-0.5 text-gold-400">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-ink-900 p-6 sm:p-8 text-white">
              <h3 className="font-display text-lg font-bold">Vorteile für Mitarbeitende</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                {[
                  "Rabatte bei Betrieben aus der eigenen Region",
                  "Einlösung direkt vor Ort per Code oder QR-Code",
                  "Kein Papierkram, keine zusätzliche App nötig",
                  "Zugang über einen einfachen Einladungscode",
                  "Alle Vorteile der eigenen Region an einem Ort",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-0.5 text-gold-400">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Für Arbeitgeber */}
        <section id="arbeitgeber" className="bg-card py-20 border-y border-card-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-sand-900">
                  Was zufriedene Mitarbeitende mit Ihrem Erfolg zu tun haben
                </h2>
                <p className="mt-4 text-sand-700">
                  Ihre Mitarbeitenden sind Ihre wichtigste Ressource. Ein Team, das sich
                  wertgeschätzt fühlt, ist motivierter, loyaler und empfiehlt Sie eher
                  als Arbeitgeber weiter. Regiovorteile ist dafür ein konkreter, leicht
                  spürbarer Baustein – ohne Aufwand für Sie.
                </p>
                <ul className="mt-6 space-y-3 text-sand-800">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ink-600" />
                    Mitarbeitende einfach per Link oder Code einladen
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ink-600" />
                    Anonymisierte Übersicht über genutzte Vorteile
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ink-600" />
                    Preisstufe passend zur Unternehmensgröße
                  </li>
                </ul>
                <Link
                  href="/arbeitgeber/registrieren"
                  className="mt-8 inline-flex items-center rounded-full bg-ink-600 px-6 py-3 text-sm font-semibold text-white shadow-warm hover:bg-ink-700 hover:shadow-warm-lg hover:-translate-y-0.5 transition-all"
                >
                  Jetzt Abo starten
                </Link>
              </div>

              <div className="rounded-2xl border border-card-border bg-sand-50 p-6 sm:p-8 shadow-warm">
                <h3 className="font-display text-xl font-bold tracking-tight text-sand-900">
                  Preisstufen
                </h3>
                <p className="mt-1 text-sm text-sand-600">
                  Gestaffelt nach Mitarbeiterzahl. Zahlungsabwicklung folgt in Kürze.
                </p>
                <div className="mt-5 space-y-3">
                  {pricingTiers.length === 0 && (
                    <p className="text-sm text-sand-500">
                      Preisstufen werden gerade eingerichtet.
                    </p>
                  )}
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="flex items-center justify-between rounded-xl bg-card border border-card-border px-4 py-3 shadow-warm-sm"
                    >
                      <div>
                        <p className="font-semibold text-sand-900">{tier.label}</p>
                        <p className="text-xs text-sand-500">
                          {tier.minEmployees}
                          {tier.maxEmployees ? `–${tier.maxEmployees}` : "+"} Mitarbeitende
                        </p>
                      </div>
                      <p className="font-display text-lg font-semibold text-gold-700 dark:text-gold-300">
                        {formatPrice(tier.monthlyPriceCents)}
                        <span className="text-xs font-sans font-normal text-sand-500">
                          {" "}
                          /Monat
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Produkt-Vorschau */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-sand-900">
              Kein Konzept, sondern ein fertiges System
            </h2>
            <div className="mt-12 grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <h3 className="font-display text-xl font-bold text-sand-900">
                  Sehen, dass der Benefit wirklich genutzt wird
                </h3>
                <p className="mt-2 text-sand-600">
                  Arbeitgeber sehen Aktivierungsquote, Einlösungen und Entwicklung –
                  ausschließlich anonymisiert und zusammengefasst.
                </p>
              </div>
              <div className="order-1 lg:order-2 rounded-2xl border border-card-border bg-card p-5 shadow-warm-lg">
                <div className="mb-4 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sand-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sand-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sand-300" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-sand-100 p-3">
                    <p className="text-[10px] text-sand-500">Registriert</p>
                    <p className="font-display text-lg font-bold text-sand-900">27/35</p>
                  </div>
                  <div className="rounded-lg bg-sand-100 p-3">
                    <p className="text-[10px] text-sand-500">Aktiv</p>
                    <p className="font-display text-lg font-bold text-sand-900">19</p>
                  </div>
                  <div className="rounded-lg bg-sand-100 p-3">
                    <p className="text-[10px] text-sand-500">Einlösungen</p>
                    <p className="font-display text-lg font-bold text-gold-600">46</p>
                  </div>
                </div>
                <div className="mt-4 flex h-16 items-end gap-1.5">
                  {[30, 50, 40, 70, 55, 90].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gold-400"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  {previewMonths.map((label) => (
                    <span
                      key={label}
                      className="flex-1 text-center text-[10px] font-medium text-sand-500"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="mx-auto w-full max-w-[280px] rounded-2xl border border-card-border bg-card p-5 shadow-warm-lg">
                <div className="mb-4 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sand-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sand-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sand-300" />
                </div>
                <div className="rounded-xl bg-sand-100 p-3">
                  <p className="text-xs font-semibold text-sand-900">
                    FitPunkt Fitnessstudio
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-gold-600">
                    20% Rabatt
                  </p>
                </div>
                <div className="mt-4 flex flex-col items-center rounded-xl bg-sand-100 p-4">
                  <div className="grid grid-cols-6 gap-0.5">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 ${
                          [0, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35].includes(i)
                            ? "bg-ink-800"
                            : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-xs tracking-widest text-sand-900">
                    AB12-CD34
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-sand-900">
                  Vorteil auswählen und direkt vor Ort einlösen
                </h3>
                <p className="mt-2 text-sand-600">
                  Keine Gutscheine, keine Papierkarten und keine komplizierte App.
                  Betrieb auswählen, Code zeigen, Vorteil erhalten.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Für Partnerbetriebe */}
        <section id="partnerbetriebe" className="py-20 bg-card border-t border-card-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1 rounded-2xl border border-gold-200 bg-gold-50 p-6 sm:p-8 shadow-warm">
                <h3 className="font-display text-xl font-bold tracking-tight text-gold-900">
                  So funktioniert die Zusammenarbeit
                </h3>
                <ol className="mt-5 space-y-4 text-gold-800">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-600 text-xs font-bold text-white">
                      1
                    </span>
                    <span>
                      <span className="font-semibold text-gold-900">
                        Sie legen Ihren Vorteil fest.
                      </span>{" "}
                      Zum Beispiel 10 %, eine kostenlose Zusatzleistung oder ein
                      Probeangebot.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-600 text-xs font-bold text-white">
                      2
                    </span>
                    <span>
                      <span className="font-semibold text-gold-900">
                        Wir erstellen Ihr Profil.
                      </span>{" "}
                      Sie müssen keine Software einrichten und nichts programmieren.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-600 text-xs font-bold text-white">
                      3
                    </span>
                    <span>
                      <span className="font-semibold text-gold-900">
                        Mitarbeitende lösen den Vorteil vor Ort ein.
                      </span>{" "}
                      Per Code oder QR-Code, direkt auf dem Smartphone.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-600 text-xs font-bold text-white">
                      4
                    </span>
                    <span>
                      <span className="font-semibold text-gold-900">
                        Sie sehen die Einlösungen.
                      </span>{" "}
                      So erkennen Sie, wie Ihr Angebot angenommen wird.
                    </span>
                  </li>
                </ol>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-sand-900">
                  Für Partnerbetriebe: regionale Mitarbeitende erreichen
                </h2>
                <p className="mt-4 text-sand-700">
                  Präsentieren Sie Ihr Angebot Beschäftigten regionaler Unternehmen und
                  schaffen Sie einen zusätzlichen Anlass für einen Besuch. Sie
                  bestimmen den Vorteil und die Bedingungen – wir übernehmen die
                  Einrichtung.
                </p>
                <a
                  href="mailto:partner@regiovorteile.de"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-900 shadow-warm hover:bg-gold-400 hover:shadow-warm-lg transition-all"
                >
                  Partnerbetrieb werden
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
