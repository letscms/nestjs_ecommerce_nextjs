import type { Metadata } from "next";
import "./globals.css";
import BootstrapClient from '@/components/BootstrapClient';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/lib/fontawesome';

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "E-commerce Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        {children}
        </AuthProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}