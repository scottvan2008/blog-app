import { db } from "./firebase"
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore"

export interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  userPhotoURL?: string
  content: string
  createdAt: any
}

export async function addComment(
  postId: string,
  userId: string,
  userName: string,
  userPhotoURL: string | null,
  content: string,
): Promise<void> {
  try {
    // Create the base comment data
    const commentData: any = {
      postId,
      userId,
      userName,
      content,
      createdAt: Timestamp.now(),
    }

    // Only add userPhotoURL if it has a value (not null or undefined)
    if (userPhotoURL) {
      commentData.userPhotoURL = userPhotoURL
    }

    await addDoc(collection(db, "comments"), commentData)
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[]
  } catch (error) {
    console.error("Error getting comments:", error)
    return []
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "comments", commentId))
  } catch (error) {
    console.error("Error deleting comment:", error)
    throw error
  }
}
