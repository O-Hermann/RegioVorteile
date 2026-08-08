import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
  experimental: {
    serverActions: {
      // Server Actions sind standardmaessig auf 1MB begrenzt - der
      // Datenimport-Upload (Phase 3) erlaubt Dateien bis 10MB, daher hier
      // etwas Spielraum fuer den Multipart-Overhead der uebrigen Formularfelder.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
