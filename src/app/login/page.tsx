import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRightIcon } from "@/components/icons";
import { cardClass } from "@/lib/ui";

const OPTIONS = [
  {
    href: "/arbeitgeber/login",
    title: "Arbeitgeber",
    description: "Mitarbeitende verwalten, Rabatt-Nutzung einsehen, Abo verwalten.",
  },
  {
    href: "/mitarbeiter/login",
    title: "Mitarbeiter",
    description: "Mit deinem Einladungscode anmelden und Vorteile in deiner Region nutzen.",
  },
];

export default function LoginChooserPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="text-center font-display text-3xl font-semibold text-sand-900">
            Anmelden als...
          </h1>
          <p className="mt-2 text-center text-sand-600">
            Wähle aus, in welcher Rolle du dich anmelden möchtest.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {OPTIONS.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className={`${cardClass} group flex flex-col hover:border-ink-300 transition-colors`}
              >
                <h2 className="font-display text-xl font-semibold text-sand-900">
                  {option.title}
                </h2>
                <p className="mt-2 text-sm text-sand-600 flex-1">{option.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sand-900">
                  Anmelden
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-sand-500">
            Noch kein Arbeitgeber-Account?{" "}
            <Link href="/arbeitgeber/registrieren" className="text-sand-900 hover:underline">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
