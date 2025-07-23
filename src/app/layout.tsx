import "./globals.css";

import NavigationMenuPage from "@/app/_custom_components/real-navigation";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Footer from "./_custom_components/footer";

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
            duration={10000}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
