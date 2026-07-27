import type { Metadata } from "next";
import "./globals.css";

// 注意：GitHub Pages 项目页面部署在 /sue-today/ 子路径下，
// 图标和 manifest 必须用相对路径（不带前导 /），
// 否则会被解析为 https://tangyushusue-dotcom.github.io/favicon-32.png（404）
const ICON_BASE = "./";

export const metadata: Metadata = {
  title: "Sue",
  description: "女生的一天，从这里开始。规划今天、照顾自己、好好出门。",
  icons: {
    icon: `${ICON_BASE}favicon-32.png`,
    apple: `${ICON_BASE}apple-touch-icon.png`,
    shortcut: `${ICON_BASE}favicon-32.png`,
  },
  manifest: `${ICON_BASE}manifest.json`,
  appleWebApp: {
    capable: true,
    title: "Sue",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
        <link rel="manifest" href="./manifest.json" />
        <meta name="theme-color" content="#F4A6A0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sue" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
