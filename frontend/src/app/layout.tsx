import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/siteConfig";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Runs before paint so the theme is correct with zero flash, without a
// per-request cookies() read — that would force every route to render
// dynamically, which is what made navigation between pages feel slow.
const noFlashThemeScript = `
(function () {
  try {
    var theme = document.cookie.match(/(?:^|; )theme=(light|dark)/);
    if (theme) document.documentElement.dataset.theme = theme[1];
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.siteName} · ${siteConfig.assessmentTitle}`,
    template: `%s · ${siteConfig.siteName}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body>
        <ThemeProvider initialTheme={null}>
          <a className="skip-link" href="#main">
            Skip to main content
          </a>
          <Header />
          <main id="main" className="container main-content">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
