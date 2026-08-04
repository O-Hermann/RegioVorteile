import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";

export type SessionData = {
  userId?: string;
  userRole?: "ADMIN" | "EMPLOYER";
  employeeId?: string;
};

const sessionOptions: SessionOptions = {
  cookieName: "regiovorteile_session",
  password: process.env.SESSION_SECRET as string,
  ttl: 60 * 60 * 24 * 30, // 30 Tage
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession(options?: { persistent?: boolean }): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const persistent = options?.persistent ?? true;
  return getIronSession<SessionData>(cookieStore, {
    ...sessionOptions,
    cookieOptions: {
      ...sessionOptions.cookieOptions,
      // persistent: Cookie ueberlebt Browser-Neustart (ueber "Angemeldet bleiben").
      // nicht persistent: reines Session-Cookie, verschwindet beim Schliessen des Browsers.
      maxAge: persistent ? sessionOptions.ttl : undefined,
    },
  });
}
