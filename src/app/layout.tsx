import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QuorumAI - Multi-Agent Investment Committee Deliberation',
  description: 'Four sharp minds. One honest verdict — dissent included. AI investment committee analysis that preserves genuine disagreement.',
  keywords: ['investment analysis', 'AI committee', 'venture capital', 'deal evaluation', 'multi-agent AI'],
  openGraph: {
    title: 'QuorumAI',
    description: 'Four AI committee personas independently analyze deals and preserve genuine dissent',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
