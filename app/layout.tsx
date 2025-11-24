import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Football ERP System',
  description: 'Football team management and ERP system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
