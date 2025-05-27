"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getFollowing, type UserWithFollowCounts } from "@/lib/follow-service"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import FollowButton from "@/components/follow-button"
import { ArrowLeft, UserCheck } from "lucide-react"
import UserAvatar from "@/components/user-avatar"

export default function FollowingPage({ params }: { params: { id: string } }) {
  const [following, setFollowing] = useState<UserWithFollowCounts[]>([])
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        // Get user name
        const userDoc = await getDoc(doc(db, "users", params.id))
        if (!userDoc.exists()) {
          router.push("/")
          return
        }

        const userData = userDoc.data()
        setUserName(userData.displayName || "User")

        // Get following
        const followingList = await getFollowing(params.id)
        setFollowing(followingList)
      } catch (error) {
        console.error("Error fetching following:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowing()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Skeleton className="h-8 w-8 mr-2" />
            <Skeleton className="h-6 w-48" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/profile/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              {userName} is Following ({following.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {following.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Not following anyone yet</p>
            ) : (
              following.map((followedUser) => (
                <div key={followedUser.id} className="flex items-center justify-between">
                  <Link href={`/profile/${followedUser.id}`} className="flex items-center group">
                    <UserAvatar src={followedUser.photoURL} name={followedUser.displayName} className="mr-3" />
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {followedUser.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">{followedUser.followersCount} followers</p>
                    </div>
                  </Link>
                  <FollowButton userId={followedUser.id} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
