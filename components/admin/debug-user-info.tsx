"use client"

import { useAuth } from "@/lib/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugUserInfo() {
  const { user, userRole, refreshUserRole } = useAuth()
  const { isAdmin, isSuperAdmin, loading } = useAdmin()

  if (!user) {
    return (
      <Card className="mb-4 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug: User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No user logged in</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm">Debug: User Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Display Name:</strong> {user.displayName}
        </p>
        <p>
          <strong>User ID:</strong> {user.uid}
        </p>
        <p>
          <strong>Role from Context:</strong> {userRole || "null"}
        </p>
        <p>
          <strong>Is Admin:</strong> {isAdmin ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is Super Admin:</strong> {isSuperAdmin ? "Yes" : "No"}
        </p>
        <p>
          <strong>Loading:</strong> {loading ? "Yes" : "No"}
        </p>
        <Button size="sm" onClick={refreshUserRole} className="mt-2">
          Refresh Role
        </Button>
      </CardContent>
    </Card>
  )
}
