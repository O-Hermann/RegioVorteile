import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-card-border bg-sand-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-display text-lg font-semibold text-sand-900">
            Regio<span className="text-gold-600">vorteile</span>
          </p>
          <p className="mt-2 text-sand-600">
            Mitarbeiter-Rabatte bei Betrieben aus der Region – gut für Mitarbeitende,
            gut für den lokalen Handel.
          </p>
        </div>
        <div>
          <p className="font-semibold text-sand-800 mb-2">Zugänge</p>
          <ul className="space-y-1 text-sand-600">
            <li>
              <Link href="/arbeitgeber/login" className="hover:text-sand-900">
                Arbeitgeber-Login
              </Link>
            </li>
            <li>
              <Link href="/mitarbeiter/login" className="hover:text-sand-900">
                Mitarbeiter-Zugang
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sand-800 mb-2">Partnerbetrieb werden</p>
          <p className="text-sand-600">
            Ihr wollt eure Rabatte regionalen Mitarbeitenden anbieten?{" "}
            <a
              href="mailto:partner@regiovorteile.de"
              className="text-gold-600 hover:underline"
            >
              partner@regiovorteile.de
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-card-border py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-xs text-sand-500">
        <span>© {new Date().getFullYear()} Regiovorteile</span>
        <span className="hidden sm:inline">·</span>
        <Link href="/impressum" className="hover:text-sand-800">
          Impressum
        </Link>
        <span className="hidden sm:inline">·</span>
        <Link href="/datenschutz" className="hover:text-sand-800">
          Datenschutz
        </Link>
      </div>
    </footer>
  );
}
