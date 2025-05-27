"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { searchPostsByTitle, searchPostsByCategory } from "@/lib/search-service"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCategoryName } from "@/lib/categories"
import { Search } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        let searchResults = []

        if (category) {
          searchResults = await searchPostsByCategory(category)
        } else if (query) {
          searchResults = await searchPostsByTitle(query)
        }

        setResults(searchResults)
      } catch (error) {
        console.error("Error searching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, category])

  const searchTitle = category
    ? `Posts in "${getCategoryName(category)}"`
    : query
      ? `Search results for "${query}"`
      : "Search"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Search className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">{searchTitle}</h1>
      </div>

      {loading ? (
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
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {category
              ? `We couldn't find any posts in the "${getCategoryName(category)}" category.`
              : `We couldn't find any posts matching "${query}". Try a different search term.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((post) => (
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
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {post.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
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
