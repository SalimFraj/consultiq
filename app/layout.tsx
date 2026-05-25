import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const viewport: Viewport = {
  themeColor: "#07111f",
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  title: "ConsultIQ | AI Builder Workbench",
  description:
    "A governed enterprise AI workbench prototype for designing agentic workflows from messy internal business problems.",
  openGraph: {
    title: "ConsultIQ | AI Builder Workbench",
    description:
      "Turn messy internal workflow problems into governed, reusable agentic capability prototypes.",
    type: "website",
    locale: "en_CA",
    siteName: "ConsultIQ"
  },
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
