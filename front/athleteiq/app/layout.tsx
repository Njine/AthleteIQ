import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const DM_Sans = localFont({
  src: "./fonts/DMSans-Bold.ttf",
  variable: "--font-dmsans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AthleteIQ",
  description: "AthleteIQ is a decentralized application designed to help athletes track their performance, manage training data, and receive AI-powered insights while ensuring data privacy through zero-knowledge proofs (ZKPs).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}  ${DM_Sans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
