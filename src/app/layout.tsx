import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Timetable Generator',
  description: 'Generate optimized academic timetables with TQI scoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}