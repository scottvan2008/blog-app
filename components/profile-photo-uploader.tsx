"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { updateProfilePhoto, deleteProfilePhoto } from "@/lib/profile-service"
import { Camera, Trash2, Loader2 } from "lucide-react"
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
import UserAvatar from "./user-avatar"

interface ProfilePhotoUploaderProps {
  userId: string
  currentPhotoURL?: string | null
  displayName?: string | null
  onPhotoUpdate: (newPhotoURL: string) => void
  size?: "sm" | "md" | "lg" | "xl"
}

export default function ProfilePhotoUploader({
  userId,
  currentPhotoURL,
  displayName,
  onPhotoUpdate,
  size = "lg",
}: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      try {
        const photoURL = await updateProfilePhoto(userId, file)
        onPhotoUpdate(photoURL)

        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been updated successfully",
        })
      } catch (error) {
        console.error("Error uploading profile photo:", error)
        toast({
          title: "Upload failed",
          description: "There was an error uploading your profile photo",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  // Handle photo deletion
  const handleDeletePhoto = async () => {
    if (!currentPhotoURL) {
      toast({
        title: "No photo to delete",
        description: "There is no profile photo to delete",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      await deleteProfilePhoto(userId, currentPhotoURL)
      onPhotoUpdate("")

      toast({
        title: "Profile photo removed",
        description: "Your profile photo has been removed",
      })
    } catch (error) {
      console.error("Error deleting profile photo:", error)
      toast({
        title: "Deletion failed",
        description: "There was an error removing your profile photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <UserAvatar
          src={currentPhotoURL}
          name={displayName}
          size={size as "sm" | "md" | "lg" | "xl"}
          className="border-2 border-background"
        />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || isDeleting}
        />
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
        >
          <Camera className="mr-2 h-4 w-4" />
          {currentPhotoURL ? "Change Photo" : "Add Photo"}
        </Button>

        {currentPhotoURL && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm" disabled={isUploading || isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove your current profile photo. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePhoto} disabled={isDeleting}>
                  {isDeleting ? "Removing..." : "Remove"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
