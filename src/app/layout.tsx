import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kenya Demographic Map | OpenGIS Powered Choropleth Atlas',
  description:
    "Explore Kenya's administrative hierarchy (County, Sub-County, Ward, Village) and public census demographics through interactive Google Maps choropleths styled with OpenGIS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
