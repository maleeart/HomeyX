import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HomeyX — เช็คสต๊อกของใช้ในบ้าน ไม่พลาด ไม่ซื้อซ้ำ",
  description: "Smart Home Stock & Grocery List Management Application",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased selection:bg-[#C25E40]/20 selection:text-[#C25E40]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
