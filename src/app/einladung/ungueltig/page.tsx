import Link from "next/link";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site-config";

export default function EinladungUngueltigPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm text-center ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">{SITE_NAME}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Einladung ungültig oder abgelaufen
        </h1>
        <p className="mt-2 text-sm text-sand-600">
          Dieser Einladungslink wurde bereits verwendet, ist abgelaufen oder existiert nicht mehr.
          Bitten Sie den Unternehmensadmin um eine neue Einladung.
        </p>
        <Link href="/login" className={`mt-6 block w-full text-center ${primaryButtonClass}`}>
          Zum Login
        </Link>
      </div>
    </main>
  );
}
