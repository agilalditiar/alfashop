import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlfaShop",
  description: "Aplikasi Warung Kelontong Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-200 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}