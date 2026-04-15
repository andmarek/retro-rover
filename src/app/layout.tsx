
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import "./globals.css"
import NavBar from "@/app/navbar"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Retrospective - Better Team Retrospectives",
  description:
    "Run engaging agile retrospectives with your team. Create boards, collaborate in real-time, and drive continuous improvement.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Theme>
          <NavBar />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Toaster />
        </Theme>
      </body>
    </html>
  )
}
