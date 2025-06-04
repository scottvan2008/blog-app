"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LayoutDashboard, FileText, MessageSquare, Tag, Users, BarChart, ShieldAlert, LogOut } from "lucide-react"
import UserAvatar from "@/components/user-avatar"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const { isAdmin, isSuperAdmin, loading } = useAdmin()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <div className="w-64 bg-card p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this area.</p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/admin/posts", label: "Posts", icon: <FileText className="h-5 w-5" /> },
    { href: "/admin/comments", label: "Comments", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/admin/categories", label: "Categories", icon: <Tag className="h-5 w-5" /> },
  ]

  const superAdminItems = [
    { href: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { href: "/admin/analytics", label: "Analytics", icon: <BarChart className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-card text-card-foreground flex flex-col border-r">
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-2xl">💧</span>
              <span className="font-bold text-lg">InkDrop Admin</span>
            </Link>
            <ThemeSwitcher />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {isSuperAdmin && (
              <>
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Super Admin
                </div>
                {superAdminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserAvatar src={user?.photoURL} name={user?.displayName} size="sm" className="mr-2" />
              <div className="text-sm">
                <p className="font-medium">{user?.displayName || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-background">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
