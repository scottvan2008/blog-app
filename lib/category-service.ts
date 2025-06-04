import { db } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore"

export interface CustomCategory {
  id: string
  name: string
  description?: string
  isCustom: boolean
  createdAt: any
  updatedAt: any
}

// Add a new custom category
export async function addCustomCategory(name: string, description?: string): Promise<string> {
  try {
    const categoryData = {
      name: name.trim(),
      description: description?.trim() || "",
      isCustom: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "categories"), categoryData)
    return docRef.id
  } catch (error) {
    console.error("Error adding custom category:", error)
    throw error
  }
}

// Update a custom category
export async function updateCustomCategory(categoryId: string, name: string, description?: string): Promise<void> {
  try {
    const categoryRef = doc(db, "categories", categoryId)
    await updateDoc(categoryRef, {
      name: name.trim(),
      description: description?.trim() || "",
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating custom category:", error)
    throw error
  }
}

// Delete a custom category
export async function deleteCustomCategory(categoryId: string): Promise<void> {
  try {
    // First check if any posts are using this category
    const postsQuery = query(collection(db, "blogPosts"), where("customCategoryId", "==", categoryId))
    const postsSnapshot = await getDocs(postsQuery)

    if (postsSnapshot.size > 0) {
      throw new Error("Cannot delete category that is being used by posts")
    }

    const categoryRef = doc(db, "categories", categoryId)
    await deleteDoc(categoryRef)
  } catch (error) {
    console.error("Error deleting custom category:", error)
    throw error
  }
}

// Get all custom categories
export async function getCustomCategories(): Promise<CustomCategory[]> {
  try {
    const categoriesQuery = query(collection(db, "categories"), orderBy("name", "asc"))
    const querySnapshot = await getDocs(categoriesQuery)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CustomCategory[]
  } catch (error) {
    console.error("Error fetching custom categories:", error)
    return []
  }
}

// Get category counts (both default and custom)
export async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const counts: Record<string, number> = {}

    // Get all posts
    const postsSnapshot = await getDocs(collection(db, "blogPosts"))

    postsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const category = data.category || "other"
      const customCategoryId = data.customCategoryId

      if (customCategoryId) {
        // Custom category
        counts[`custom_${customCategoryId}`] = (counts[`custom_${customCategoryId}`] || 0) + 1
      } else {
        // Default category
        counts[category] = (counts[category] || 0) + 1
      }
    })

    return counts
  } catch (error) {
    console.error("Error getting category counts:", error)
    return {}
  }
}
