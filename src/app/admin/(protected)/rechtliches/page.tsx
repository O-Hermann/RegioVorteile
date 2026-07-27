import { prisma } from "@/lib/prisma";
import { updateLegalPage } from "@/actions/legal";
import { LEGAL_DEFAULTS } from "@/lib/legal";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default async function AdminRechtlichesPage() {
  const pages = await prisma.legalPage.findMany();
  const impressum = pages.find((p) => p.slug === "IMPRESSUM");
  const datenschutz = pages.find((p) => p.slug === "DATENSCHUTZ");

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Rechtliches</h1>
      <p className="mt-2 text-sand-600">
        Inhalt von Impressum und Datenschutzerklärung, öffentlich sichtbar unter{" "}
        <code>/impressum</code> und <code>/datenschutz</code>.
      </p>
      <p className="mt-2 rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-700">
        Die vorausgefüllten Texte sind nur Platzhalter-Vorlagen und müssen vor dem
        Live-Betrieb durch rechtlich geprüfte Inhalte ersetzt werden.
      </p>

      <div className={`${cardClass} mt-6`}>
        <h2 className="font-display text-lg font-semibold text-sand-900">Impressum</h2>
        <form action={updateLegalPage} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value="IMPRESSUM" />
          <div>
            <label className={labelClass} htmlFor="impressum-title">
              Überschrift
            </label>
            <input
              className={inputClass}
              name="title"
              id="impressum-title"
              defaultValue={impressum?.title ?? LEGAL_DEFAULTS.IMPRESSUM.title}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="impressum-content">
              Inhalt
            </label>
            <textarea
              className={`${inputClass} font-mono text-sm`}
              name="content"
              id="impressum-content"
              rows={14}
              defaultValue={impressum?.content ?? LEGAL_DEFAULTS.IMPRESSUM.content}
              required
            />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Impressum speichern
          </button>
        </form>
      </div>

      <div className={`${cardClass} mt-6`}>
        <h2 className="font-display text-lg font-semibold text-sand-900">
          Datenschutzerklärung
        </h2>
        <form action={updateLegalPage} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value="DATENSCHUTZ" />
          <div>
            <label className={labelClass} htmlFor="datenschutz-title">
              Überschrift
            </label>
            <input
              className={inputClass}
              name="title"
              id="datenschutz-title"
              defaultValue={datenschutz?.title ?? LEGAL_DEFAULTS.DATENSCHUTZ.title}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="datenschutz-content">
              Inhalt
            </label>
            <textarea
              className={`${inputClass} font-mono text-sm`}
              name="content"
              id="datenschutz-content"
              rows={14}
              defaultValue={datenschutz?.content ?? LEGAL_DEFAULTS.DATENSCHUTZ.content}
              required
            />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Datenschutzerklärung speichern
          </button>
        </form>
      </div>
    </div>
  );
}
