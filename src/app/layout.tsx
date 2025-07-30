import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FiGenie - Your AI-Powered Financial Genius",
  description: "Transform your financial future with intelligent insights, personalized recommendations, and automated wealth management powered by cutting-edge AI technology.",
  keywords: "AI finance, personal finance, financial assistant, money management, investment tracking, automated savings",
  authors: [{ name: "FiGenie Team" }],
  openGraph: {
    title: "FiGenie - Your AI-Powered Financial Genius",
    description: "Transform your financial future with intelligent insights and automated wealth management.",
    type: "website",
    locale: "en_US",
    url: "https://figenie.com",
    siteName: "FiGenie",
  },
  twitter: {
    card: "summary_large_image",
    title: "FiGenie - Your AI-Powered Financial Genius",
    description: "Transform your financial future with intelligent insights and automated wealth management.",
    creator: "@figenie",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
