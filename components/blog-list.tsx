"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getAllBlogPosts, type BlogPost } from "@/lib/blog-service"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

// Add imports
import { categories, getCategoryName } from "@/lib/categories"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  // Add state for category filter
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getAllBlogPosts()
        setPosts(allPosts)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Add filtered posts logic
  const filteredPosts = categoryFilter ? posts.filter((post) => post.category === categoryFilter) : posts

  if (loading) {
    return (
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
    )
  }

  // Add category filter UI above the grid
  // After the loading check and before the posts.length === 0 check:
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Posts</h2>
          <div className="w-[200px]">
            <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Update the empty state check to use filteredPosts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">
            {categoryFilter ? `No posts found in ${getCategoryName(categoryFilter)}` : "No blog posts yet"}
          </h2>
          <p className="text-muted-foreground">
            {categoryFilter ? "Try selecting a different category" : "Be the first to create a post!"}
          </p>
        </div>
      ) : (
        // Update the rendering to use filteredPosts instead of posts
        // And add category badge to each post card
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
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
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">By {post.authorName}</span>
                  <div className="flex items-center gap-2">
                    {post.category && (
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(post.category)}
                      </Badge>
                    )}
                    {post.createdAt && (
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
