import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "./_custom_components/footer";
import { IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import NavigationMenu from "./_custom_components/navigation-menu";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tidy Elephant",
  description: "A marketplace to connect expert organizers with clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${ibmPlexSans.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavigationMenu />
            {children}
            <Analytics />
            <SpeedInsights />
            <Footer />
            <Toaster
              richColors
              position="bottom-right"
              closeButton
              duration={10000}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
