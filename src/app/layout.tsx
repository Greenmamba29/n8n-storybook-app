import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "N8N Interactive Storybook | AI-Powered Educational Platform",
  description: "Transform your N8N automation workflows into engaging, accessible, interactive educational experiences with AI-generated storybooks, video tutorials, and hands-on learning.",
  keywords: "n8n, automation, workflows, interactive learning, accessibility, ai, storybook, education, tutorial",
  authors: [{ name: "N8N Storybook Platform" }],
  openGraph: {
    title: "N8N Interactive Storybook Platform",
    description: "Create accessible, interactive educational content from N8N workflows",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "N8N Interactive Storybook Platform",
    description: "AI-powered educational platform for N8N workflows",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
