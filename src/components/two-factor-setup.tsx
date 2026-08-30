"use client";

import { useState, useTransition } from "react";
import { confirmTwoFactorSetup, regenerateBackupCodes, disableTwoFactor } from "@/actions/two-factor";
import { dashInputClass, dashLabelClass, dashPrimaryButtonClass, dashSecondaryButtonClass, dashDangerButtonClass } from "@/components/dashboard/dash-ui";

// MVP-Roadmap Phase 7-Erweiterung, 2FA (siehe [[effivo_mvp_roadmap]]): DIESE
// eine Client-Komponente deckt Einrichtung/Verwaltung/Deaktivierung
// vollstaendig ab und wird IMMER gerendert (nie serverseitig hinter
// user.totpEnabled versteckt) - bewusst so, weil jede Server Action nach
// Abschluss automatisch die aktuelle Route neu rendert. Waere die
// Sichtbarkeit dieser Komponente vom Server aus (user.totpEnabled)
// gesteuert, wuerde sie nach dem Aktivieren SOFORT durch den "Aktiviert"-
// Zweig der Elternseite ersetzt (unmounted), bevor der Nutzer die nur
// EINMAL angezeigten Wiederherstellungscodes ueberhaupt sehen kann - live
// beim ersten Implementierungsversuch reproduziert und hierdurch behoben.
// "enabled" ist deshalb rein lokaler State (nur initial aus dem Server-Prop
// uebernommen), alle Uebergaenge (aktivieren/deaktivieren/neu erzeugen)
// laufen ueber typisierte Actions (kein redirect()), damit die Komponente
// bei keinem Schritt unmounted wird.
export function TwoFactorSetup({ enabled: initialEnabled, secret, qrDataUrl }: { enabled: boolean; secret: string; qrDataUrl: string }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const [code, setCode] = useState("");
  const [confirmPending, startConfirm] = useTransition();
  const [confirmError, setConfirmError] = useState<string | null>(null);

  function handleConfirm() {
    setConfirmError(null);
    startConfirm(async () => {
      const result = await confirmTwoFactorSetup(secret, code);
      if (result.status === "error") {
        setConfirmError(result.message);
        return;
      }
      setEnabled(true);
      setBackupCodes(result.backupCodes);
    });
  }

  if (backupCodes) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-lg bg-dash-green-tint px-3 py-2.5 text-sm text-dash-green">Zwei-Faktor-Authentifizierung ist jetzt aktiv.</p>
        <div>
          <p className="text-sm font-medium text-dash-text">Deine Wiederherstellungscodes</p>
          <p className="mt-1 text-xs text-dash-text-muted">
            Speichere diese Codes an einem sicheren Ort - jeder Code funktioniert einmalig als Ersatz für deine Authenticator-App und wird nach diesem
            Zeitpunkt nicht erneut angezeigt.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-dash-line bg-dash-panel-soft p-4 font-mono text-sm text-dash-text">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
        <button type="button" className={`w-fit ${dashPrimaryButtonClass}`} onClick={() => setBackupCodes(null)}>
          Fertig
        </button>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-dash-text-secondary">
          Scanne den QR-Code mit einer Authenticator-App (z. B. Google Authenticator, Authy, 1Password) und gib den angezeigten 6-stelligen Code ein, um die
          Einrichtung abzuschließen.
        </p>
        <div className="flex flex-wrap items-start gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR-Code für die Authenticator-App" width={180} height={180} className="rounded-lg border border-dash-line" />
          <div className="min-w-0">
            <p className={dashLabelClass}>Manuelle Eingabe (falls Scannen nicht möglich ist)</p>
            <code className="break-all rounded-lg border border-dash-line bg-dash-panel-soft px-3 py-2 text-xs text-dash-text">{secret}</code>
          </div>
        </div>
        <div className="max-w-xs">
          <label className={dashLabelClass} htmlFor="totp-confirm-code">
            Code aus der App
          </label>
          <input
            id="totp-confirm-code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className={dashInputClass}
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" disabled={confirmPending} onClick={handleConfirm} className={`w-fit ${dashPrimaryButtonClass}`}>
            {confirmPending ? "Prüft …" : "Bestätigen und aktivieren"}
          </button>
          {confirmError && <span className="text-sm text-dash-red">{confirmError}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-dash-green-tint px-2.5 py-1 text-xs font-semibold text-dash-green">Aktiviert</p>
      <RegenerateBackupCodesButton onCodes={setBackupCodes} />
      <DisableTwoFactorButton onDisabled={() => setEnabled(false)} />
    </div>
  );
}

function RegenerateBackupCodesButton({ onCodes }: { onCodes: (codes: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateBackupCodes(password);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setOpen(false);
      setPassword("");
      onCodes(result.backupCodes);
    });
  }

  if (!open) {
    return (
      <button type="button" className={`w-fit !px-3.5 !py-1.5 !text-xs ${dashSecondaryButtonClass}`} onClick={() => setOpen(true)}>
        Wiederherstellungscodes neu erstellen
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className={dashLabelClass} htmlFor="regenerate-password">
          Aktuelles Passwort zur Bestätigung
        </label>
        <input
          id="regenerate-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`!w-56 ${dashInputClass}`}
        />
      </div>
      <button type="button" disabled={isPending} onClick={handleSubmit} className={`!px-3.5 !py-1.5 !text-xs ${dashSecondaryButtonClass}`}>
        {isPending ? "…" : "Bestätigen"}
      </button>
      {error && <span className="text-xs text-dash-red">{error}</span>}
    </div>
  );
}

function DisableTwoFactorButton({ onDisabled }: { onDisabled: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!window.confirm("Zwei-Faktor-Authentifizierung wirklich deaktivieren? Dein Konto ist danach nur noch durch dein Passwort geschützt.")) return;
    setError(null);
    startTransition(async () => {
      const result = await disableTwoFactor(password);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      onDisabled();
    });
  }

  if (!open) {
    return (
      <button type="button" className={`w-fit !px-3.5 !py-1.5 !text-xs ${dashDangerButtonClass}`} onClick={() => setOpen(true)}>
        Deaktivieren
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className={dashLabelClass} htmlFor="disable-password">
          Aktuelles Passwort zur Bestätigung
        </label>
        <input id="disable-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`!w-56 ${dashInputClass}`} />
      </div>
      <button type="button" disabled={isPending} onClick={handleSubmit} className={`!px-3.5 !py-1.5 !text-xs ${dashDangerButtonClass}`}>
        {isPending ? "…" : "Deaktivieren"}
      </button>
      {error && <span className="text-xs text-dash-red">{error}</span>}
    </div>
  );
}
