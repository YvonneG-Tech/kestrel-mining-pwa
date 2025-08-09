import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, we'll use simple hardcoded users
        // In production, this would hash passwords and verify against database
        const demoUsers = [
          {
            id: '1',
            email: 'admin@kestrelmining.com',
            name: 'Admin User',
            role: 'ADMIN' as UserRole,
            password: 'admin123', // In production, use bcrypt
          },
          {
            id: '2', 
            email: 'supervisor@kestrelmining.com',
            name: 'Site Supervisor',
            role: 'SUPERVISOR' as UserRole,
            password: 'supervisor123',
          },
          {
            id: '3',
            email: 'user@kestrelmining.com', 
            name: 'Field User',
            role: 'USER' as UserRole,
            password: 'user123',
          },
        ];

        const user = demoUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          // Create user in database if doesn't exist
          try {
            await prisma.user.upsert({
              where: { email: user.email },
              update: { name: user.name, role: user.role },
              create: {
                email: user.email,
                name: user.name,
                role: user.role,
              },
            });
          } catch (error) {
            console.error('Error upserting user:', error);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};