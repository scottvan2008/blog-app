"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { getFollowingPosts } from "@/lib/follow-service"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { UserCheck, Users } from "lucide-react"
import UserAvatar from "@/components/user-avatar"

export default function FollowingPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchFollowingPosts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const followingPosts = await getFollowingPosts(user.uid, 20)
        setPosts(followingPosts)
      } catch (error) {
        console.error("Error fetching following posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowingPosts()
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">Please log in to view posts from users you follow.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <UserCheck className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Following Feed</h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No posts from people you follow</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Follow more users to see their posts in your feed, or explore the home page to discover new content.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/">Explore Posts</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id}>
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                {post.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-muted-foreground line-clamp-3">{post.content.replace(/<[^>]*>/g, "")}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center">
                    <UserAvatar src={post.authorPhotoURL} name={post.authorName} size="xs" className="mr-2" />
                    <span className="text-sm">{post.authorName}</span>
                  </div>
                  {post.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
