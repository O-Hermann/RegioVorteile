const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTimeDe(date: Date) {
  const diff = Date.now() - date.getTime();

  if (diff < MINUTE) return "gerade eben";
  if (diff < HOUR) return `vor ${Math.floor(diff / MINUTE)} Min.`;
  if (diff < DAY) return `vor ${Math.floor(diff / HOUR)} Std.`;
  const days = Math.floor(diff / DAY);
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  return date.toLocaleDateString("de-DE");
}
