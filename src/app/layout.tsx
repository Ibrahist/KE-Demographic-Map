import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kenya Demographic Atlas | Interactive Google Maps Choropleth',
  description:
    "Explore Kenya's administrative hierarchy (County, Sub-County, Ward, Village) and public census demographics through interactive Google Maps choropleths.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}

