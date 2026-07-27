const DAY_MS = 1000 * 60 * 60 * 24;

export function getContractStatus(contractEndDate: Date) {
  const daysLeft = Math.ceil((contractEndDate.getTime() - Date.now()) / DAY_MS);

  if (daysLeft < 0) {
    return {
      label: `Abgelaufen seit ${Math.abs(daysLeft)} Tagen`,
      className: "bg-red-50 text-red-700",
    };
  }
  if (daysLeft <= 30) {
    return {
      label: `Läuft in ${daysLeft} Tagen aus`,
      className: "bg-gold-100 text-gold-700",
    };
  }
  return {
    label: `Läuft bis ${contractEndDate.toLocaleDateString("de-DE")}`,
    className: "bg-ink-100 text-ink-800",
  };
}
