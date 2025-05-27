"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserFollowCounts } from "@/lib/follow-service"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import FollowButton from "@/components/follow-button"
import { getUserBlogPosts, type BlogPost } from "@/lib/blog-service"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import ProfilePhotoUploader from "@/components/profile-photo-uploader"
import UserAvatar from "@/components/user-avatar"

interface UserProfile {
  id: string
  displayName: string
  email: string
  photoURL?: string
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0 })
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const isOwnProfile = user && user.uid === params.id

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", params.id))

        if (!userDoc.exists()) {
          router.push("/")
          return
        }

        const userData = userDoc.data()
        setProfile({
          id: params.id,
          displayName: userData.displayName || "User",
          email: userData.email || "",
          photoURL: userData.photoURL || "",
        })

        // Get follow counts
        const counts = await getUserFollowCounts(params.id)
        setFollowCounts(counts)

        // Get user's blog posts
        const userPosts = await getUserBlogPosts(params.id)
        setPosts(userPosts)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [params.id, router])

  const handleFollowChange = (isFollowing: boolean) => {
    // Update follower count when follow status changes
    setFollowCounts((prev) => ({
      ...prev,
      followersCount: isFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
    }))
  }

  const handlePhotoUpdate = (newPhotoURL: string) => {
    if (profile) {
      setProfile({
        ...profile,
        photoURL: newPhotoURL,
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex flex-col items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-8">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-muted-foreground mb-8">The user you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-col items-center text-center">
          {isOwnProfile ? (
            <ProfilePhotoUploader
              userId={params.id}
              currentPhotoURL={profile.photoURL}
              displayName={profile.displayName}
              onPhotoUpdate={handlePhotoUpdate}
              size="lg"
            />
          ) : (
            <UserAvatar src={profile.photoURL} name={profile.displayName} size="xl" className="mb-4" />
          )}

          <CardTitle className="text-2xl mt-4">{profile.displayName}</CardTitle>
          <CardDescription>{profile.email}</CardDescription>

          <div className="mt-4 flex items-center gap-4">
            {!isOwnProfile && <FollowButton userId={params.id} onFollowChange={handleFollowChange} />}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex justify-center gap-8 mb-6">
            <Link href={`/profile/${params.id}/followers`} className="flex flex-col items-center">
              <span className="text-2xl font-bold">{followCounts.followersCount}</span>
              <span className="text-muted-foreground text-sm">Followers</span>
            </Link>
            <Link href={`/profile/${params.id}/following`} className="flex flex-col items-center">
              <span className="text-2xl font-bold">{followCounts.followingCount}</span>
              <span className="text-muted-foreground text-sm">Following</span>
            </Link>
          </div>

          <Tabs defaultValue="posts">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link href={`/blog/${post.id}`} key={post.id}>
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex">
                          {post.imageUrl && (
                            <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                              <Image
                                src={post.imageUrl || "/placeholder.svg"}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4 flex-1">
                            <h3 className="font-medium line-clamp-1">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {post.content.replace(/<[^>]*>/g, "")}
                            </p>
                            {post.createdAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "This is your profile." : `This is ${profile.displayName}'s profile.`}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {isOwnProfile && (
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/profile">Go to My Profile Settings</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
