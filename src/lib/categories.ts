export const CATEGORIES = [
  "Fitness & Sport",
  "Bäckerei & Konditorei",
  "Friseur & Beauty",
  "Werkstatt & Auto",
  "Gastronomie",
  "Gesundheit & Wellness",
  "Einzelhandel",
  "Sonstiges",
] as const;

export type Category = (typeof CATEGORIES)[number];
