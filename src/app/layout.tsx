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

export const metadata = {
  title: {
    default: "Scripts.AI — Gerador de Roteiros para Reels e TikTok",
    template: "%s • Scripts.AI",
  },
  description:
    "Gere roteiros curtos e envolventes para Reels e TikTok usando inteligência artificial. Escolha o tema, persona e tom ideal.",
  metadataBase: new URL("https://scriptsai.vercel.app"), // substitua pelo seu domínio
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
        <footer className="py-8 text-center text-sm text-slate-400">
  <p>
    🎙 Dê voz profissional aos seus roteiros com{" "}
    <a
      href="https://try.elevenlabs.io/jwv2p8j618ir"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:underline"
    >
      ElevenLabs
    </a>{" "}
    (voz com IA).
  </p>
</footer>

      </body>
    </html>
  );
}
