"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { getUserBlogPosts, type BlogPost } from "@/lib/blog-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PenSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function MyBlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userPosts = await getUserBlogPosts(user.uid)
        setPosts(userPosts)
      } catch (error) {
        console.error("Error fetching user blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPosts()
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">Please log in to view your blog posts.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Blog Posts</h1>
        <Button asChild>
          <Link href="/create">
            <PenSquare className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">You haven't created any blog posts yet</h2>
          <p className="text-muted-foreground mb-6">Start sharing your thoughts with the world!</p>
          <Button asChild>
            <Link href="/create">Create Your First Post</Link>
          </Button>
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
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{post.content.replace(/<[^>]*>/g, "")}</p>
                </CardContent>
                <CardFooter>
                  {post.createdAt && (
                    <span className="text-sm text-muted-foreground">
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
