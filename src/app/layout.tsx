import type { Metadata } from "next";
import { Montserrat, Instrument_Serif } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "FYRE Automação & I.A | Arquitetura de Crescimento",
  description:
    "A FYRE Automação & I.A não é uma agência. É uma empresa de tecnologia focada em automação e inteligência artificial para negócios que querem escalar com sistemas inteligentes.",
  keywords: [
    "automação",
    "inteligência artificial",
    "sistemas",
    "tecnologia",
    "consultoria",
    "escala",
    "FYRE",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${instrumentSerif.variable}`}>
      <body className="grain-overlay">
        {children}
      </body>
    </html>
  );
}
