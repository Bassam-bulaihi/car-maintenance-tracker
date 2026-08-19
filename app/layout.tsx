import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { getLocale } from "@/lib/i18n/locale";
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

const SITE_NAME = "Car Auto";
const SITE_DESCRIPTION =
  "Register your car and get WhatsApp reminders when a service is due — oil, filters, brakes, tracked by odometer and by date.";

export const metadata: Metadata = {
  metadataBase: new URL("https://car-auto-app.vercel.app"),
  title: {
    default: `${SITE_NAME} — WhatsApp car maintenance reminders`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — WhatsApp car maintenance reminders`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — WhatsApp car maintenance reminders`,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${notoSansArabic.variable} ${inter.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col ${locale === "ar" ? "font-arabic" : "font-latin"}`}
      >
        {children}
      </body>
    </html>
  );
}
