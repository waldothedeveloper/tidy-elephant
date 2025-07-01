import "./globals.css";

import { AuthProvider } from "@/provider/auth-provider";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Navigation from "./_custom_components/navigation";

// const spaceMono = Space_Mono({
//   subsets: ["latin"],
//   variable: "--font-space-mono",
//   display: "swap",
//   weight: ["400", "700"],
// });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <AuthProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <Navigation />
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
