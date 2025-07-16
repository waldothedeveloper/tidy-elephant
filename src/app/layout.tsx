import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "./_custom_components/footer";
import { IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import NavigationMenuPage from "@/app/_custom_components/real-navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ease & Arrange",
  description: "A marketplace to connect expert declutters with clients.",
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
      waitlistUrl="/waitlist/join-us"
    >
      <html lang="en">
        <body className={`${ibmPlexSans.className} antialiased`}>
          <NavigationMenuPage />
          {children}
          <Analytics />
          <SpeedInsights />
          <Footer />
          <Toaster
            richColors
            position="bottom-right"
            closeButton
            // duration={20000}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
