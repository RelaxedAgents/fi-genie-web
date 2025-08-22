import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ArthaAI - Your AI-Powered Financial Genius",
  description: "Transform your financial future with intelligent insights, personalized recommendations, and automated wealth management powered by cutting-edge AI technology.",
  keywords: "AI finance, personal finance, financial assistant, money management, investment tracking, automated savings",
  authors: [{ name: "ArthaAI Team" }],
  openGraph: {
    title: "ArthaAI - Your AI-Powered Financial Genius",
    description: "Transform your financial future with intelligent insights and automated wealth management.",
    type: "website",
    locale: "en_US",
    url: "https://arthaai.com",
    siteName: "ArthaAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArthaAI - Your AI-Powered Financial Genius",
    description: "Transform your financial future with intelligent insights and automated wealth management.",
    creator: "@arthaai",
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
