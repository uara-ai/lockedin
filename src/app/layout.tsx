import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import {
  AuthKitProvider,
  Impersonation,
} from "@workos-inc/authkit-nextjs/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lockedin",
  description: "Open-Source LinkedIn alternative for people who ship",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <OpenPanelComponent
            clientId={process.env.NEXT_PUBLIC_OPEN_PANEL_CLIENT_ID!}
            clientSecret={process.env.OPEN_PANEL_CLIENT_SECRET!}
            trackScreenViews={true}
            disabled={process.env.NODE_ENV !== "production"}
          />
          <AuthKitProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
            <Impersonation />
          </AuthKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
