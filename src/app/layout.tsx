import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Emoji Picker',
  description: 'Blazing-fast emoji picker by Pavel Svitek',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        <Toaster />
      </body>
    </html>
  );
}
