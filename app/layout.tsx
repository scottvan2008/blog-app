import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import FirebaseWrapper from "@/components/firebase-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "InkDrop - Write, Share, Discover",
  description: "A simple and elegant blogging platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseWrapper>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <footer className="py-6 border-t">
                  <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-xl mr-1">💧</span>
                      <span className="font-semibold">InkDrop</span>
                    </div>
                    © {new Date().getFullYear()} InkDrop. All rights reserved.
                  </div>
                </footer>
              </div>
              <Toaster />
            </AuthProvider>
          </FirebaseWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
