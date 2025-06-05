import { db } from "./firebase"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { getCategoryName } from "./categories"
import { getCustomCategories } from "./category-service"
import type { BlogPost } from "./blog-service"

// Enhanced function to get category display name
export async function getPostCategoryName(post: BlogPost): Promise<string> {
  if (post.customCategoryId) {
    try {
      const customCategories = await getCustomCategories()
      const customCategory = customCategories.find((cat) => cat.id === post.customCategoryId)
      return customCategory ? customCategory.name : "Custom Category"
    } catch (error) {
      console.error("Error fetching custom category:", error)
      return "Custom Category"
    }
  }

  return getCategoryName(post.category || "other")
}

// Enhanced function to get all posts with category names resolved
export async function getAllBlogPostsWithCategories(): Promise<(BlogPost & { categoryName: string })[]> {
  try {
    const postsQuery = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(postsQuery)
    const posts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BlogPost[]

    // Get custom categories once
    const customCategories = await getCustomCategories()

    // Resolve category names
    const postsWithCategories = posts.map((post) => {
      let categoryName = "Uncategorized"

      if (post.customCategoryId) {
        const customCategory = customCategories.find((cat) => cat.id === post.customCategoryId)
        categoryName = customCategory ? customCategory.name : "Custom Category"
      } else if (post.category) {
        categoryName = getCategoryName(post.category)
      }

      return {
        ...post,
        categoryName,
      }
    })

    return postsWithCategories
  } catch (error) {
    console.error("Error fetching posts with categories:", error)
    return []
  }
}

// Enhanced function to filter posts by category (supports both default and custom)
export async function getPostsByCategory(categoryId: string, isCustom = false): Promise<BlogPost[]> {
  try {
    let postsQuery

    if (isCustom) {
      postsQuery = query(
        collection(db, "blogPosts"),
        where("customCategoryId", "==", categoryId),
        orderBy("createdAt", "desc"),
      )
    } else {
      postsQuery = query(collection(db, "blogPosts"), where("category", "==", categoryId), orderBy("createdAt", "desc"))
    }

    const querySnapshot = await getDocs(postsQuery)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BlogPost[]
  } catch (error) {
    console.error("Error fetching posts by category:", error)
    return []
  }
}
