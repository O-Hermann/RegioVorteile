import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.userId || session.userRole !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

export async function requireEmployer() {
  const session = await getSession();
  if (!session.userId || session.userRole !== "EMPLOYER") {
    redirect("/arbeitgeber/login");
  }
  const employer = await prisma.employer.findUnique({
    where: { userId: session.userId },
  });
  if (!employer) {
    redirect("/arbeitgeber/login");
  }
  if (!employer.approved) {
    session.destroy();
    redirect("/arbeitgeber/login?error=pending");
  }
  return { session, employer };
}

export async function requireEmployee() {
  const session = await getSession();
  if (!session.employeeId) {
    redirect("/mitarbeiter/login");
  }
  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    include: { employer: { include: { region: true } } },
  });
  if (!employee) {
    redirect("/mitarbeiter/login");
  }
  return { session, employee };
}
