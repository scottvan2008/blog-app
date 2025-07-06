"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { BlogPost } from "@/lib/blog-service"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

// Add imports
import { categories, getCategoryName } from "@/lib/categories"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Add imports
import { getAllBlogPostsWithCategories } from "@/lib/enhanced-blog-service"
import { getCustomCategories, type CustomCategory } from "@/lib/category-service"

export default function BlogList() {
  // Update state
  const [posts, setPosts] = useState<(BlogPost & { categoryName: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])

  // Add state for category filter
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Update the useEffect to fetch enhanced posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [allPosts, customCats] = await Promise.all([getAllBlogPostsWithCategories(), getCustomCategories()])
        setPosts(allPosts)
        setCustomCategories(customCats)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Update the filtered posts logic
  const filteredPosts = categoryFilter
    ? posts.filter((post) => {
        if (categoryFilter.startsWith("custom_")) {
          const customId = categoryFilter.replace("custom_", "")
          return post.customCategoryId === customId
        } else {
          return post.category === categoryFilter
        }
      })
    : posts

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden max-w-xs mx-auto">
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
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>

                {/* Default Categories */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Default Categories</div>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}

                {/* Custom Categories */}
                {customCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                      Custom Categories
                    </div>
                    {customCategories.map((cat) => (
                      <SelectItem key={`custom_${cat.id}`} value={`custom_${cat.id}`}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </>
                )}
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredPosts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id}>
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow max-w-xs mx-auto">
                {post.imageUrl && (
                  <div className="relative h-48 w-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title} fill className="object-contain" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 leading-normal min-h-[3rem]">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{post.content.replace(/<[^>]*>/g, "")}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">By {post.authorName}</span>
                  <div className="flex items-center gap-2">
                    {post.categoryName && (
                      <Badge variant="secondary" className="text-xs">
                        {post.categoryName}
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
