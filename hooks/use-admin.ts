"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/roles-service"

export function useAdmin() {
  const { user, userRole, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("useAdmin - user:", user?.email, "userRole:", userRole) // Debug log

    if (authLoading) {
      return // Still loading auth
    }

    if (!user || !userRole) {
      setIsAdmin(false)
      setIsSuperAdmin(false)
      setLoading(false)
      return
    }

    // Check roles
    const isSuperAdminRole = userRole === UserRole.SUPER_ADMIN
    const isAdminRole = userRole === UserRole.ADMIN || isSuperAdminRole

    console.log("Role check - isSuperAdmin:", isSuperAdminRole, "isAdmin:", isAdminRole) // Debug log

    setIsSuperAdmin(isSuperAdminRole)
    setIsAdmin(isAdminRole)
    setLoading(false)
  }, [user, userRole, authLoading])

  return { isAdmin, isSuperAdmin, loading }
}
