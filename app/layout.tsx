import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import FirebaseWrapper from "@/components/firebase-wrapper"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "InkDrop - Write, Share, Discover",
  description: "A simple and elegant blogging platform",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-950`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <FirebaseWrapper>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 bg-gray-100 dark:bg-gray-950">{children}</main>
                <footer className="py-8 border-t bg-gray-50 dark:bg-gray-900">
                  <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                      <div className="flex items-center mb-4 md:mb-0">
                        <span className="text-xl mr-1">💧</span>
                        <span className="font-semibold">InkDrop</span>
                      </div>
                      <div className="flex flex-wrap gap-6">
                        <Link
                          href="/terms"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Terms of Service
                        </Link>
                        <Link
                          href="/privacy"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Privacy Policy
                        </Link>
                        <Link
                          href="/content-policy"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Content Policy
                        </Link>
                      </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      © {new Date().getFullYear()} InkDrop. All rights reserved.
                    </div>
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
