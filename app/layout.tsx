import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Arabic UI/editorial text — docs/arabic-web-design.md: "do not substitute
// another Arabic web font."
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
});

// Latin text — docs/DESIGN.md's documented substitute for BMW Type Next
// Latin ("If BMW Type Next Latin is unavailable, Inter... is the closest
// open-source substitute").
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Car Maintenance Tracker",
  description: "Track vehicle maintenance and get WhatsApp reminders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoSansArabic.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-arabic">{children}</body>
    </html>
  );
}
