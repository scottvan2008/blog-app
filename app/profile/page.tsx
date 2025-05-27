"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LogOut, PenSquare } from "lucide-react"
import Link from "next/link"
import ProfilePhotoUploader from "@/components/profile-photo-uploader"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [photoURL, setPhotoURL] = useState<string | null | undefined>(user?.photoURL)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      })
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handlePhotoUpdate = (newPhotoURL: string) => {
    setPhotoURL(newPhotoURL)
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">Please log in to view your profile.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center text-center">
          <CardTitle className="text-2xl mb-4">Profile Settings</CardTitle>
          <CardDescription>Manage your account and profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo Uploader */}
          <div className="flex justify-center">
            <ProfilePhotoUploader
              userId={user.uid}
              currentPhotoURL={photoURL}
              displayName={user.displayName}
              onPhotoUpdate={handlePhotoUpdate}
              size="lg"
            />
          </div>

          <div className="space-y-1 text-center">
            <h3 className="text-xl font-semibold">{user.displayName || "User"}</h3>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/my-blogs">
                <PenSquare className="mr-2 h-4 w-4" />
                My Blog Posts
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                <AlertDialogDescription>You will need to log in again to access your account.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  )
}
