import { db } from "./firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import type { BlogPost } from "./blog-service"

// Search posts by title
export async function searchPostsByTitle(searchTerm: string, limitCount = 20): Promise<BlogPost[]> {
  // Firebase doesn't support native full-text search, so we'll use a simple contains query
  // For production, consider using Algolia, Elasticsearch, or Firebase Extensions for search

  // Get all posts (this is inefficient but works for demo purposes)
  const postsQuery = query(
    collection(db, "blogPosts"),
    orderBy("createdAt", "desc"),
    limit(100), // Limit to prevent loading too many posts
  )

  const querySnapshot = await getDocs(postsQuery)
  const allPosts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BlogPost[]

  // Filter posts client-side
  const searchTermLower = searchTerm.toLowerCase()
  const filteredPosts = allPosts.filter((post) => post.title.toLowerCase().includes(searchTermLower))

  return filteredPosts.slice(0, limitCount)
}

// Search posts by category/tag
export async function searchPostsByCategory(category: string, limitCount = 20): Promise<BlogPost[]> {
  const postsQuery = query(
    collection(db, "blogPosts"),
    where("category", "==", category),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  const querySnapshot = await getDocs(postsQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BlogPost[]
}
