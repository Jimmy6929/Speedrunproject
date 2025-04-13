import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Accounting SaaS",
  description: "A powerful accounting software as a service solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <Toaster position="top-right" />
              {children}
            </SettingsProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
