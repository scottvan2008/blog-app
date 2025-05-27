"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { likePost, unlikePost, hasUserLikedPost, getLikeCount } from "@/lib/like-service"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  postId: string
  initialLikeCount?: number
  onLikeChange?: (isLiked: boolean, newCount: number) => void
}

export default function LikeButton({ postId, initialLikeCount = 0, onLikeChange }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Check if user has liked the post
        const hasLiked = await hasUserLikedPost(user.uid, postId)
        setLiked(hasLiked)

        // Get the current like count
        const count = await getLikeCount(postId)
        setLikeCount(count)
      } catch (error) {
        console.error("Error checking like status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkLikeStatus()
  }, [user, postId])

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (liked) {
        await unlikePost(user.uid, postId)
        setLiked(false)
        setLikeCount((prev) => prev - 1)
        if (onLikeChange) onLikeChange(false, likeCount - 1)
      } else {
        await likePost(user.uid, postId)
        setLiked(true)
        setLikeCount((prev) => prev + 1)
        if (onLikeChange) onLikeChange(true, likeCount + 1)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLikeToggle}
      variant="ghost"
      size="sm"
      disabled={loading}
      className={`gap-1 ${liked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span>{likeCount}</span>
    </Button>
  )
}
