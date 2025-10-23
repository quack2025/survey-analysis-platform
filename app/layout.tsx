import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Survey Analysis Platform",
  description: "Automated survey response analysis with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
