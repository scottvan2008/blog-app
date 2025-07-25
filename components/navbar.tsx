"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, PenSquare, User, UserCheck, Search, Settings } from "lucide-react"
import SearchBar from "./search-bar"
import UserAvatar from "./user-avatar"
import { ThemeSwitcher } from "./theme-switcher"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isAdmin, isSuperAdmin } = useAdmin()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <header className="bg-primary text-primary-foreground border-b">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <span className="text-3xl mr-1">💧</span> InkDrop
        </Link>

        <div className="hidden md:flex items-center gap-6 flex-1 justify-center max-w-md mx-4">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link
                href="/following"
                className={
                  pathname === "/following"
                    ? "text-lg font-bold"
                    : "text-lg text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                }
              >
                Following
              </Link>
              <Link
                href="/my-blogs"
                className={
                  pathname === "/my-blogs"
                    ? "text-lg font-bold"
                    : "text-lg text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                }
              >
                My Posts
              </Link>
              {(isAdmin || isSuperAdmin) && (
                <Link
                  href="/admin"
                  className={
                    pathname.startsWith("/admin")
                      ? "text-lg font-bold"
                      : "text-lg text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  }
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />

          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="secondary" size="default" className="text-gray-800 font-medium text-base">
                <Link href="/create">
                  <PenSquare className="mr-2 h-5 w-5" />
                  Write
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <UserAvatar src={user.photoURL} name={user.displayName} size="sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.uid}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/following">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Following
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin || isSuperAdmin) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-lg text-primary-foreground/80 hover:text-primary-foreground"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white text-primary hover:bg-white/90 border-primary text-base"
                size="default"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
