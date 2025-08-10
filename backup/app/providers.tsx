"use client";
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { AuthProvider } from './components/RoleBasedAccess';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}