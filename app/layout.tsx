import type { Metadata } from "next";
import { Suspense } from "react";
import { Zen_Maru_Gothic, Noto_Sans_JP } from "next/font/google";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "とろあま | TL・乙女向けASMR＆ゲームまとめ",
  description:
    "TL・乙女向けASMR・ゲームの厳選作品を紹介。評価・ランキング・セール情報もまとめてチェック。",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-256.png", type: "image/png", sizes: "256x256" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${zenMaruGothic.variable} ${notoSansJP.variable} font-body antialiased`}
      >
        {children}
        <Suspense>
          <MobileNav />
        </Suspense>
      </body>
    </html>
  );
}
