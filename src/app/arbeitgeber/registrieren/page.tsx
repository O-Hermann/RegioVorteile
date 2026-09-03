import { redirect } from "next/navigation";

// Kundensicht-Audit (2026-08-30, siehe [[effivo_mvp_roadmap]]): diese Seite
// legte bisher einen User + Employer nach dem alten Regiovorteile-Modell an
// (registerEmployer() in actions/employer.ts) - NIE ein Company/
// CompanyMembership-Paar, auf dem das heutige Effivo-Dashboard basiert.
// "Employer.approved" wurde an keiner einzigen Stelle der Anwendung gesetzt
// - jeder, der sich hier registrierte, blieb fuer immer bei
// "Ihr Account wird noch von uns geprueft" haengen, ohne jede Chance auf
// einen Login. Effivo befindet sich aktuell bewusst in einer persoenlich
// begleiteten Pilotphase (siehe Startseite/final-cta-section.tsx) - der
// tatsaechlich vorgesehene Weg ist /kontakt ("Pilotunternehmen werden"),
// nicht Selbstregistrierung. Diese Seite leitet daher dorthin um, statt ein
// funktional totes Formular weiter anzuzeigen.
export default function ArbeitgeberRegistrierenPage() {
  redirect("/kontakt");
}
