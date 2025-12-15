// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ClientNavbar from "@/components/ClientNavbar";



export const metadata: Metadata = {
  title: "MrShrek Phone Shop",
  description: "Find all Your phone accessories Here!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body >
        <ClientNavbar />
        {children}
      </body>
    </html>
  );
}
