import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrainPod",
  description: "Adaptive learning for every mind — with mindful breaks.",
  keywords: ["adaptive learning", "education", "mindful breaks", "NGSS standards", "personalized education"],
  authors: [{ name: "BrainPod Team" }],
  openGraph: {
    title: "BrainPod - Adaptive Learning for Every Mind",
    description: "Blending standards-aligned curriculum with mindful breaks to create personalized learning experiences.",
    url: "https://brainpod.org",
    siteName: "BrainPod",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BrainPod - Adaptive Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainPod - Adaptive Learning for Every Mind",
    description: "Blending standards-aligned curriculum with mindful breaks to create personalized learning experiences.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-radial from-blue-50/30 to-indigo-100/30 dark:from-gray-900/30 dark:to-indigo-900/30`}
      >
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
