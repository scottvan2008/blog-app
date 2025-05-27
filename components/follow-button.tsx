"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { followUser, unfollowUser, isFollowing } from "@/lib/follow-service"
import { UserPlus, UserMinus } from "lucide-react"

interface FollowButtonProps {
  userId: string
  onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const followStatus = await isFollowing(user.uid, userId)
        setFollowing(followStatus)
      } catch (error) {
        console.error("Error checking follow status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkFollowStatus()
  }, [user, userId])

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (following) {
        await unfollowUser(user.uid, userId)
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user",
        })
        setFollowing(false)
        if (onFollowChange) onFollowChange(false)
      } else {
        await followUser(user.uid, userId)
        toast({
          title: "Following",
          description: "You are now following this user",
        })
        setFollowing(true)
        if (onFollowChange) onFollowChange(true)
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

  if (!user || user.uid === userId) {
    return null
  }

  return (
    <Button onClick={handleFollowToggle} variant={following ? "outline" : "default"} size="sm" disabled={loading}>
      {following ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  )
}
