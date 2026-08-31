import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hai Dent Clinic - Klinik Gigi Modern Kota Bekasi | Perawatan Gigi Nyaman",
  description: "Hai Dent Clinic Kota Bekasi - Klinik gigi modern dengan dokter berpengalaman dan teknologi terkini. Layanan scaling, tambal gigi, cabut gigi, behel, whitening dengan harga transparan dan minim rasa sakit.",
  keywords: ["klinik gigi", "dokter gigi", "scaling", "tambal gigi", "cabut gigi", "behel", "whitening", "klinik gigi bekasi", "perawatan gigi", "hai dent clinic"],
  authors: [{ name: "Hai Dent Clinic" }],
  openGraph: {
    title: "Hai Dent Clinic - Klinik Gigi Modern Kota Bekasi",
    description: "Perawatan gigi nyaman dan minim rasa sakit dengan dokter berpengalaman di Kota Bekasi",
    url: "https://haidentclinic.com",
    siteName: "Hai Dent Clinic",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hai Dent Clinic - Klinik Gigi Modern Bekasi",
    description: "Perawatan gigi nyaman dan minim rasa sakit",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
