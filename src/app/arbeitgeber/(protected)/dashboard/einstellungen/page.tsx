import Link from "next/link";
import QRCode from "qrcode";
import { requireCompanyMember } from "@/lib/auth";
import { COMPANY_MANAGER_ROLES, COMPANY_IMPORT_UPLOAD_ROLES } from "@/lib/company";
import { getNotificationPreference, getMappingTemplates, SETTINGS_ERROR_MESSAGES } from "@/lib/settings";
import { updateCompanyProfile, updateNotificationPreference, changeOwnPassword, deleteOwnAccount } from "@/actions/settings";
import { deleteMappingTemplate } from "@/actions/mapping-templates";
import { generateTotpSecret, totpAuthUri } from "@/lib/totp";
import { DATA_IMPORT_CATEGORY_LABELS } from "@/lib/data-import";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { TwoFactorSetup } from "@/components/two-factor-setup";
import { PageNav } from "@/components/page-nav";
import {
  dashCardClass,
  dashSecondaryTextClass,
  dashMutedTextClass,
  dashInputClass,
  dashLabelClass,
  dashPrimaryButtonClass,
  dashSecondaryButtonClass,
  dashDangerButtonClass,
} from "@/components/dashboard/dash-ui";

type SettingsTab = "firma" | "vorlagen" | "benachrichtigungen" | "konto";

const TABS: { value: SettingsTab; label: string }[] = [
  { value: "firma", label: "Firmenprofil" },
  { value: "vorlagen", label: "Mapping-Vorlagen" },
  { value: "benachrichtigungen", label: "Benachrichtigungen" },
  { value: "konto", label: "Konto & Sicherheit" },
];

function isSettingsTab(value: string | undefined): value is SettingsTab {
  return !!value && TABS.some((t) => t.value === value);
}

// Reihenfolge/Labels wie auf dem Dashboard (findings-list.tsx), damit die
// gleiche Fund-Kategorie ueberall gleich heisst.
const NOTIFY_CATEGORY_FIELDS = [
  { key: "notifyDuplicatePayment", label: "Doppelzahlungen" },
  { key: "notifyMissedDiscount", label: "Skonto nicht genutzt" },
  { key: "notifyOpenCreditNote", label: "Offene Gutschriften" },
  { key: "notifyOverpayment", label: "Mögliche Überzahlung" },
] as const;

export default async function EinstellungenPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; saved?: string; deleted?: string }>;
}) {
  const { company, membership, user } = await requireCompanyMember();
  const { tab, error, saved, deleted } = await searchParams;
  const activeTab: SettingsTab = isSettingsTab(tab) ? tab : "firma";

  const canManageCompany = COMPANY_MANAGER_ROLES.includes(membership.role);
  const canManageImports = COMPANY_IMPORT_UPLOAD_ROLES.includes(membership.role);

  const [notificationPref, templates] = await Promise.all([
    activeTab === "benachrichtigungen" ? getNotificationPreference(company.id) : Promise.resolve(null),
    activeTab === "vorlagen" ? getMappingTemplates(company.id) : Promise.resolve([]),
  ]);

  // Nur bei Bedarf (Konto-Tab) ein frisches Secret + QR-Bild erzeugen - wird
  // auch bei bereits aktivem 2FA generiert (billig, wird dann von
  // TwoFactorSetup einfach nicht angezeigt), damit ein spaeteres lokales
  // Deaktivieren+Neueinrichten ohne Seiten-Reload funktioniert. Erst
  // confirmTwoFactorSetup() nach einem gueltigen Code schreibt es in die DB
  // (siehe Kommentar in two-factor-setup.tsx).
  let totpSetup: { secret: string; qrDataUrl: string } | null = null;
  if (activeTab === "konto") {
    const secret = generateTotpSecret();
    const qrDataUrl = await QRCode.toDataURL(totpAuthUri(user.email, secret), { margin: 1, width: 220 });
    totpSetup = { secret, qrDataUrl };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageNav />
      <div className="mt-2">
        <h1 className="text-3xl font-semibold text-dash-text">Einstellungen</h1>
        <p className={`mt-2 max-w-xl ${dashSecondaryTextClass}`}>Firmenprofil, Mapping-Vorlagen, Benachrichtigungen und dein Konto verwalten.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/arbeitgeber/dashboard/einstellungen?tab=${t.value}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t.value
                ? "border-dash-gold/50 bg-dash-panel-soft text-dash-gold shadow-[inset_0_0_0_1px_rgba(226,188,107,0.12)]"
                : "border-dash-line bg-dash-panel text-dash-text-secondary hover:bg-dash-panel-soft"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {SETTINGS_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}
      {saved === "1" && <p className="mt-4 rounded-lg bg-dash-green-tint px-3 py-2 text-sm text-dash-green">Gespeichert.</p>}
      {deleted === "1" && <p className="mt-4 rounded-lg bg-dash-green-tint px-3 py-2 text-sm text-dash-green">Mapping-Vorlage wurde gelöscht.</p>}

      {activeTab === "firma" && (
        <div className={`mt-6 p-6 ${dashCardClass}`}>
          {!canManageCompany && (
            <p className={`mb-4 text-sm ${dashMutedTextClass}`}>Nur Inhaber und Unternehmensadmins können das Firmenprofil bearbeiten.</p>
          )}
          <form action={updateCompanyProfile} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="hidden" name="companyId" value={company.id} />
            <div className="sm:col-span-2">
              <label className={dashLabelClass} htmlFor="name">
                Firmenname
              </label>
              <input id="name" name="name" type="text" required defaultValue={company.name} disabled={!canManageCompany} className={dashInputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={dashLabelClass} htmlFor="contactName">
                Ansprechpartner
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                defaultValue={company.contactName ?? ""}
                disabled={!canManageCompany}
                className={dashInputClass}
              />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="contactEmail">
                Kontakt-E-Mail
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={company.contactEmail ?? ""}
                disabled={!canManageCompany}
                className={dashInputClass}
              />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="contactPhone">
                Telefon
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={company.contactPhone ?? ""}
                disabled={!canManageCompany}
                className={dashInputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={dashLabelClass} htmlFor="street">
                Straße & Hausnummer
              </label>
              <input id="street" name="street" type="text" defaultValue={company.street ?? ""} disabled={!canManageCompany} className={dashInputClass} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="zipCode">
                PLZ
              </label>
              <input id="zipCode" name="zipCode" type="text" defaultValue={company.zipCode ?? ""} disabled={!canManageCompany} className={dashInputClass} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="city">
                Ort
              </label>
              <input id="city" name="city" type="text" defaultValue={company.city ?? ""} disabled={!canManageCompany} className={dashInputClass} />
            </div>
            {canManageCompany && (
              <div className="sm:col-span-2">
                <button type="submit" className={dashPrimaryButtonClass}>
                  Speichern
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {activeTab === "vorlagen" && (
        <div className="mt-6">
          <p className={`mb-4 text-sm ${dashSecondaryTextClass}`}>
            Beim erfolgreichen Verarbeiten eines Datenimports merkt sich Effivo automatisch, welche Spalte welchem Feld entspricht - beim nächsten Import
            derselben Spaltenstruktur wird das automatisch vorgeschlagen. Hier kannst du bestehende Vorlagen einsehen, korrigieren oder löschen.
          </p>
          {!canManageImports && (
            <p className={`mb-4 text-sm ${dashMutedTextClass}`}>Nur Nutzer mit Datenimport-Berechtigung können Mapping-Vorlagen bearbeiten oder löschen.</p>
          )}
          {templates.length === 0 ? (
            <div className={`p-10 text-center ${dashCardClass}`}>
              <p className={dashSecondaryTextClass}>Noch keine Mapping-Vorlagen vorhanden - sie entstehen automatisch beim ersten erfolgreichen Import.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {templates.map((t) => (
                <div key={t.id} className={`flex flex-wrap items-center justify-between gap-4 p-4 ${dashCardClass}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-dash-panel-soft px-2.5 py-0.5 text-xs font-semibold text-dash-text-secondary">
                        {DATA_IMPORT_CATEGORY_LABELS[t.category]}
                      </span>
                      {t.sourceSystem && <span className={`text-xs ${dashMutedTextClass}`}>{t.sourceSystem}</span>}
                    </div>
                    <p className="mt-1.5 text-sm text-dash-text">
                      {t.mappedColumnCount} von {t.columnCount} Spalten zugeordnet
                    </p>
                    <p className={`text-xs ${dashMutedTextClass}`}>Zuletzt aktualisiert: {t.updatedAt.toLocaleDateString("de-DE")}</p>
                  </div>
                  {canManageImports && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/arbeitgeber/dashboard/einstellungen/mapping-vorlagen/${t.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dash-line px-3 py-1.5 text-xs font-semibold text-dash-text hover:border-dash-gold/40 hover:text-dash-gold transition-colors"
                      >
                        Bearbeiten
                      </Link>
                      <form action={deleteMappingTemplate}>
                        <input type="hidden" name="templateId" value={t.id} />
                        <ConfirmSubmitButton
                          confirmMessage="Diese Mapping-Vorlage wirklich löschen? Zukünftige Importe mit dieser Spaltenstruktur müssen dann erneut manuell zugeordnet werden."
                          className={`!px-3 !py-1.5 !text-xs ${dashDangerButtonClass}`}
                        >
                          Löschen
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "benachrichtigungen" && (
        <div className={`mt-6 p-6 ${dashCardClass}`}>
          <p className={`mb-4 rounded-lg bg-dash-gold-glow px-3 py-2.5 text-sm text-dash-gold`}>
            Diese Einstellung wird gespeichert, löst aber noch keinen tatsächlichen E-Mail-Versand aus - der Versandmechanismus ist noch nicht angebunden.
          </p>
          {!canManageCompany && (
            <p className={`mb-4 text-sm ${dashMutedTextClass}`}>Nur Inhaber und Unternehmensadmins können diese Einstellung ändern.</p>
          )}
          <form action={updateNotificationPreference} className="flex flex-col gap-4">
            <input type="hidden" name="companyId" value={company.id} />
            <div className="max-w-sm">
              <label className={dashLabelClass} htmlFor="email">
                Empfänger-E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={notificationPref?.email ?? ""}
                disabled={!canManageCompany}
                placeholder="benachrichtigungen@firma.de"
                className={dashInputClass}
              />
            </div>
            <div>
              <span className={dashLabelClass}>Bei neuen Fällen dieser Kategorien benachrichtigen</span>
              <div className="mt-1 flex flex-col gap-2">
                {NOTIFY_CATEGORY_FIELDS.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm text-dash-text">
                    <input
                      type="checkbox"
                      name={f.key}
                      defaultChecked={notificationPref?.[f.key] ?? false}
                      disabled={!canManageCompany}
                      className="h-4 w-4 rounded border-dash-line accent-dash-gold"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
            {canManageCompany && (
              <div>
                <button type="submit" className={dashPrimaryButtonClass}>
                  Speichern
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {activeTab === "konto" && (
        <div className={`mt-6 p-6 ${dashCardClass}`}>
          <h2 className="text-lg font-semibold text-dash-text">Passwort ändern</h2>
          <form action={changeOwnPassword} className="mt-4 flex max-w-sm flex-col gap-4">
            <div>
              <label className={dashLabelClass} htmlFor="currentPassword">
                Aktuelles Passwort
              </label>
              <input id="currentPassword" name="currentPassword" type="password" required className={dashInputClass} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="password">
                Neues Passwort
              </label>
              <input id="password" name="password" type="password" required minLength={8} className={dashInputClass} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="passwordConfirm">
                Neues Passwort bestätigen
              </label>
              <input id="passwordConfirm" name="passwordConfirm" type="password" required minLength={8} className={dashInputClass} />
            </div>
            <div>
              <button type="submit" className={dashPrimaryButtonClass}>
                Passwort ändern
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-dash-line pt-6">
            <h2 className="text-lg font-semibold text-dash-text">Zwei-Faktor-Authentifizierung</h2>
            <p className={`mt-1 max-w-lg text-sm ${dashSecondaryTextClass}`}>
              Schützt dein Konto zusätzlich mit einem Code aus einer Authenticator-App, selbst wenn dein Passwort bekannt wird.
            </p>

            {totpSetup && (
              <div className="mt-4">
                <TwoFactorSetup enabled={user.totpEnabled} secret={totpSetup.secret} qrDataUrl={totpSetup.qrDataUrl} />
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-dash-line pt-6">
            <h2 className="text-lg font-semibold text-dash-text">Meine Daten</h2>
            <p className={`mt-1 max-w-lg text-sm ${dashSecondaryTextClass}`}>
              Lade eine Kopie deiner persönlichen Kontodaten herunter (Name, E-Mail, Mitgliedschaften) - keine Firmen- oder Geschäftsdaten.
            </p>
            <a
              href="/arbeitgeber/dashboard/einstellungen/export"
              className={`mt-3 inline-flex ${dashSecondaryButtonClass}`}
            >
              Meine Daten exportieren
            </a>
          </div>

          <div className="mt-8 border-t border-dash-line pt-6">
            <h2 className="text-lg font-semibold text-dash-red">Konto löschen</h2>
            <p className={`mt-1 max-w-lg text-sm ${dashSecondaryTextClass}`}>
              Löscht deinen persönlichen Zugang unwiderruflich - du wirst aus allen Unternehmen entfernt und kannst dich danach nicht mehr anmelden. Bereits
              importierte Daten und Fälle deines Unternehmens bleiben unverändert bestehen. Bist du der letzte Inhaber eines Unternehmens, bestimme zuerst
              einen neuen Inhaber.
            </p>
            <form action={deleteOwnAccount} className="mt-3 flex flex-wrap items-end gap-2">
              <div>
                <label className={dashLabelClass} htmlFor="deleteAccountPassword">
                  Aktuelles Passwort zur Bestätigung
                </label>
                <input id="deleteAccountPassword" name="currentPassword" type="password" required className={`!w-56 ${dashInputClass}`} />
              </div>
              <ConfirmSubmitButton
                confirmMessage="Dein Konto wirklich unwiderruflich löschen? Du wirst sofort abgemeldet und kannst dich danach nicht mehr einloggen."
                className={dashDangerButtonClass}
              >
                Konto endgültig löschen
              </ConfirmSubmitButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
