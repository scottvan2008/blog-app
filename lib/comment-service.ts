import { db } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"

export interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  userPhotoURL?: string
  content: string
  createdAt: Timestamp
}

// Add a comment to a post
export async function addComment(
  postId: string,
  userId: string,
  userName: string,
  content: string,
  userPhotoURL?: string,
): Promise<string> {
  const commentData = {
    postId,
    userId,
    userName,
    userPhotoURL,
    content,
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, "comments"), commentData)
  return docRef.id
}

// Update a comment
export async function updateComment(commentId: string, content: string): Promise<void> {
  const commentRef = doc(db, "comments", commentId)
  await updateDoc(commentRef, {
    content,
    updatedAt: serverTimestamp(),
  })
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const commentRef = doc(db, "comments", commentId)

    // Check if the comment exists before deleting
    const commentDoc = await getDoc(commentRef)
    if (!commentDoc.exists()) {
      throw new Error("Comment not found")
    }

    await deleteDoc(commentRef)
  } catch (error) {
    console.error("Error deleting comment:", error)
    throw error
  }
}

// Get a single comment
export async function getComment(commentId: string): Promise<Comment | null> {
  const commentRef = doc(db, "comments", commentId)
  const commentSnap = await getDoc(commentRef)

  if (commentSnap.exists()) {
    return { id: commentSnap.id, ...commentSnap.data() } as Comment
  } else {
    return null
  }
}

// Get all comments for a post
export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"))

  const querySnapshot = await getDocs(commentsQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[]
}

// Get comment count for a post
export async function getCommentCount(postId: string): Promise<number> {
  const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId))
  const commentsSnapshot = await getDocs(commentsQuery)

  return commentsSnapshot.size
}
