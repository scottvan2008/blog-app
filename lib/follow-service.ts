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
  limit,
} from "firebase/firestore"

// Interface for follow relationship
export interface FollowRelationship {
  id: string
  followerId: string
  followingId: string
  createdAt: any
}

// Interface for user with follow counts
export interface UserWithFollowCounts {
  id: string
  displayName: string
  email: string
  photoURL?: string
  followersCount: number
  followingCount: number
}

// Follow a user
export async function followUser(followerId: string, followingId: string): Promise<void> {
  // Don't allow users to follow themselves
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself")
  }

  const followId = `${followerId}_${followingId}`
  const followRef = doc(db, "follows", followId)

  await setDoc(followRef, {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  })
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const followId = `${followerId}_${followingId}`
  const followRef = doc(db, "follows", followId)

  await deleteDoc(followRef)
}

// Check if a user is following another user
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const followId = `${followerId}_${followingId}`
  const followRef = doc(db, "follows", followId)
  const followDoc = await getDoc(followRef)

  return followDoc.exists()
}

// Get followers of a user
export async function getFollowers(userId: string): Promise<UserWithFollowCounts[]> {
  const followsQuery = query(
    collection(db, "follows"),
    where("followingId", "==", userId),
    orderBy("createdAt", "desc"),
  )

  const querySnapshot = await getDocs(followsQuery)
  const followerIds = querySnapshot.docs.map((doc) => doc.data().followerId)

  // Get user details for each follower
  const followers = await Promise.all(
    followerIds.map(async (followerId) => {
      const userDoc = await getDoc(doc(db, "users", followerId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const followerCounts = await getUserFollowCounts(followerId)

        return {
          id: followerId,
          displayName: userData.displayName || "User",
          email: userData.email || "",
          photoURL: userData.photoURL || "",
          ...followerCounts,
        }
      }
      return null
    }),
  )

  return followers.filter((follower): follower is UserWithFollowCounts => follower !== null)
}

// Get users that a user is following
export async function getFollowing(userId: string): Promise<UserWithFollowCounts[]> {
  const followsQuery = query(collection(db, "follows"), where("followerId", "==", userId), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(followsQuery)
  const followingIds = querySnapshot.docs.map((doc) => doc.data().followingId)

  // Get user details for each following
  const following = await Promise.all(
    followingIds.map(async (followingId) => {
      const userDoc = await getDoc(doc(db, "users", followingId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const followCounts = await getUserFollowCounts(followingId)

        return {
          id: followingId,
          displayName: userData.displayName || "User",
          email: userData.email || "",
          photoURL: userData.photoURL || "",
          ...followCounts,
        }
      }
      return null
    }),
  )

  return following.filter((follow): follow is UserWithFollowCounts => follow !== null)
}

// Get follower and following counts for a user
export async function getUserFollowCounts(userId: string): Promise<{ followersCount: number; followingCount: number }> {
  const followersQuery = query(collection(db, "follows"), where("followingId", "==", userId))
  const followingQuery = query(collection(db, "follows"), where("followerId", "==", userId))

  const [followersSnapshot, followingSnapshot] = await Promise.all([getDocs(followersQuery), getDocs(followingQuery)])

  return {
    followersCount: followersSnapshot.size,
    followingCount: followingSnapshot.size,
  }
}

// Get blog posts from users that a user is following
export async function getFollowingPosts(userId: string, limitCount = 10) {
  const followingQuery = query(collection(db, "follows"), where("followerId", "==", userId))
  const followingSnapshot = await getDocs(followingQuery)
  const followingIds = followingSnapshot.docs.map((doc) => doc.data().followingId)

  // If not following anyone, return empty array
  if (followingIds.length === 0) {
    return []
  }

  // Get posts from users that the current user is following
  const postsQuery = query(
    collection(db, "blogPosts"),
    where("authorId", "in", followingIds),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  const postsSnapshot = await getDocs(postsQuery)
  return postsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}
