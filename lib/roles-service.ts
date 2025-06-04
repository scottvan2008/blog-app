import { db } from "./firebase"
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"

// Define user roles
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

// Check if a user has a specific role
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (!userDoc.exists()) return false

    const userData = userDoc.data()
    return userData.role === role || (role === UserRole.ADMIN && userData.role === UserRole.SUPER_ADMIN)
  } catch (error) {
    console.error("Error checking user role:", error)
    return false
  }
}

// Get a user's role
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (!userDoc.exists()) return UserRole.USER

    const userData = userDoc.data()
    return userData.role || UserRole.USER
  } catch (error) {
    console.error("Error getting user role:", error)
    return UserRole.USER
  }
}

// Update a user's role (super admin only)
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      role: newRole,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

// Get all users with admin or super admin roles
export async function getAdminUsers(): Promise<any[]> {
  try {
    const adminQuery = query(collection(db, "users"), where("role", "in", [UserRole.ADMIN, UserRole.SUPER_ADMIN]))

    const querySnapshot = await getDocs(adminQuery)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting admin users:", error)
    return []
  }
}

// Get all users
export async function getAllUsers(limit = 100): Promise<any[]> {
  try {
    const usersQuery = query(collection(db, "users"))
    const querySnapshot = await getDocs(usersQuery)

    return querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .slice(0, limit)
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

// Ban or unban a user
export async function updateUserBanStatus(userId: string, isBanned: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      isBanned: isBanned,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating user ban status:", error)
    throw error
  }
}
