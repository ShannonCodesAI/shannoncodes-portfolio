import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-main",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shannon Madden | Autonomous Agents, Cybersecurity, Reverse Engineering",
  description:
    "Shannon Madden — Autonomous Agent Developer, Cybersecurity Engineer, and Reverse-Engineering Specialist. Building secure autonomous systems by day, analyzing binaries by night.",
  authors: [{ name: "Shannon Madden" }],
  keywords:
    "autonomous agents,cybersecurity,reverse engineering,AI,malware analysis,DevSecOps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
