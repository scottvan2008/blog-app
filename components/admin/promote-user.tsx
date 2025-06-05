"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { updateUserRole, UserRole } from "@/lib/roles-service"

export default function PromoteUser() {
  const [userId, setUserId] = useState("")
  const [isPromoting, setIsPromoting] = useState(false)
  const { toast } = useToast()

  const handlePromote = async () => {
    if (!userId.trim()) {
      toast({
        title: "Missing User ID",
        description: "Please enter a user ID",
        variant: "destructive",
      })
      return
    }

    setIsPromoting(true)
    try {
      await updateUserRole(userId, UserRole.SUPER_ADMIN)
      toast({
        title: "User promoted",
        description: "User has been promoted to Super Admin",
      })
      setUserId("")
    } catch (error) {
      console.error("Error promoting user:", error)
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      })
    } finally {
      setIsPromoting(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-semibold">Promote User to Super Admin</h3>
      <div className="flex gap-2">
        <Input placeholder="Enter User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <Button onClick={handlePromote} disabled={isPromoting}>
          {isPromoting ? "Promoting..." : "Promote"}
        </Button>
      </div>
    </div>
  )
}
