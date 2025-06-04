"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { UserRole } from "@/lib/roles-service"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !displayName) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile
      await updateProfile(user, {
        displayName: displayName,
      })

      // Create user document with super admin role
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName,
        email: user.email,
        role: UserRole.SUPER_ADMIN,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Super Admin created successfully!",
        description: "You can now log in with admin privileges",
      })

      // Redirect to login
      router.push("/login")
    } catch (error: any) {
      console.error("Error creating super admin:", error)
      toast({
        title: "Error creating admin",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Setup Super Admin</CardTitle>
          <CardDescription className="text-center">
            Create the first super admin account for your blog platform
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreateSuperAdmin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Super Admin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yoursite.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? "Creating Admin..." : "Create Super Admin"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
