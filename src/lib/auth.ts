import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Nodemailer from 'next-auth/providers/nodemailer';
import { prisma } from './prisma';
import { audit } from './audit';

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email?: string | null) =>
  !!email && adminEmails.includes(email.toLowerCase());

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  trustHost: true,
  pages: { signIn: '/login', verifyRequest: '/login?sent=1' },
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 1025),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
      },
      from: process.env.EMAIL_FROM ?? 'Atelier Abaya <no-reply@atelier-abaya.local>',
      maxAge: 10 * 60, // single-use link valid 10 minutes
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      // Admin if DB role is ADMIN or email is allow-listed.
      session.user.role = isAdminEmail(user.email) ? 'ADMIN' : (user as any).role ?? 'CUSTOMER';
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Promote allow-listed emails to ADMIN in the DB on login.
      if (isAdminEmail(user.email) && user.id) {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } }).catch(() => {});
      }
      await audit({ actor: user.id, action: 'AUTH_LOGIN', target: user.email });
    },
    async signOut() {
      await audit({ action: 'AUTH_LOGOUT' });
    },
  },
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session.user;
}
