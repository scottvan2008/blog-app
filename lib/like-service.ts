import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  getDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore"

// Interface for like
export interface Like {
  id: string
  userId: string
  postId: string
  createdAt: any
}

// Like a post
export async function likePost(userId: string, postId: string): Promise<void> {
  const likeId = `${userId}_${postId}`
  const likeRef = doc(db, "likes", likeId)

  await setDoc(likeRef, {
    userId,
    postId,
    createdAt: serverTimestamp(),
  })
}

// Unlike a post
export async function unlikePost(userId: string, postId: string): Promise<void> {
  const likeId = `${userId}_${postId}`
  const likeRef = doc(db, "likes", likeId)

  await deleteDoc(likeRef)
}

// Check if a user has liked a post
export async function hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
  const likeId = `${userId}_${postId}`
  const likeRef = doc(db, "likes", likeId)
  const likeDoc = await getDoc(likeRef)

  return likeDoc.exists()
}

// Get like count for a post
export async function getLikeCount(postId: string): Promise<number> {
  const likesQuery = query(collection(db, "likes"), where("postId", "==", postId))
  const likesSnapshot = await getDocs(likesQuery)

  return likesSnapshot.size
}

// Get users who liked a post
export async function getUsersWhoLikedPost(postId: string): Promise<string[]> {
  const likesQuery = query(collection(db, "likes"), where("postId", "==", postId), orderBy("createdAt", "desc"))
  const likesSnapshot = await getDocs(likesQuery)

  return likesSnapshot.docs.map((doc) => doc.data().userId)
}

// Get posts liked by a user
export async function getPostsLikedByUser(userId: string): Promise<string[]> {
  const likesQuery = query(collection(db, "likes"), where("userId", "==", userId), orderBy("createdAt", "desc"))
  const likesSnapshot = await getDocs(likesQuery)

  return likesSnapshot.docs.map((doc) => doc.data().postId)
}
