"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth, db } from "./firebase"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUserRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to get user data from Firestore
  const getUserData = async (userId: string): Promise<{ role: string | null; isBanned: boolean }> => {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        return {
          role: userData.role || "user",
          isBanned: userData.isBanned || false,
        }
      }
      return { role: "user", isBanned: false }
    } catch (error) {
      console.error("Error getting user data:", error)
      return { role: "user", isBanned: false }
    }
  }

  // Function to refresh user role
  const refreshUserRole = async () => {
    if (user) {
      const { role } = await getUserData(user.uid)
      setUserRole(role)
    }
  }

  // Function to check if user is banned and sign them out if they are
  const checkUserBanStatus = async (user: User) => {
    const { isBanned } = await getUserData(user.uid)
    if (isBanned) {
      await signOut(auth)
      const error = new Error("Your account has been banned. Please contact support for assistance.")
      error.name = "UserBannedError"
      throw error
    }
  }

  useEffect(() => {
    // Skip auth initialization if not in browser
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    if (!auth) {
      console.error("Firebase auth not initialized")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is banned first
          await checkUserBanStatus(user)

          setUser(user)

          // Get user role and ban status
          const { role } = await getUserData(user.uid)
          setUserRole(role)

          // Check if user exists in Firestore
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)

          // If user doesn't exist in Firestore, create a new document
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: user.displayName || user.email?.split("@")[0] || "User",
              email: user.email,
              photoURL: user.photoURL,
              role: "user", // Default role
              isBanned: false, // Default not banned
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
            setUserRole("user")
          }
        } catch (error) {
          // If user is banned, they'll be signed out and we set user to null
          // No need to log this as it's expected behavior for banned users
          setUser(null)
          setUserRole(null)
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Update the user's profile with the display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        })

        // Create user document in Firestore
        const userRef = doc(db, "users", userCredential.user.uid)
        await setDoc(userRef, {
          displayName: displayName,
          email: userCredential.user.email,
          photoURL: userCredential.user.photoURL,
          role: "user", // Default role
          isBanned: false, // Default not banned
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setUserRole("user")
      }
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Check if user is banned immediately after login
      if (userCredential.user) {
        await checkUserBanStatus(userCredential.user)
      }
    } catch (error) {
      // Only log actual errors, not ban messages
      if (error instanceof Error && error.name !== "UserBannedError") {
        console.error("Error logging in:", error)
      }
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Check if user is banned immediately after Google login
      if (result.user) {
        await checkUserBanStatus(result.user)

        // Create or update user document in Firestore
        const userRef = doc(db, "users", result.user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          // New user, create with default role
          await setDoc(userRef, {
            displayName: result.user.displayName || result.user.email?.split("@")[0] || "User",
            email: result.user.email,
            photoURL: result.user.photoURL,
            role: "user", // Default role
            isBanned: false, // Default not banned
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          setUserRole("user")
        } else {
          // Existing user, just update timestamp
          await setDoc(
            userRef,
            {
              displayName: result.user.displayName || result.user.email?.split("@")[0] || "User",
              email: result.user.email,
              photoURL: result.user.photoURL,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
          // Get existing role
          const { role } = await getUserData(result.user.uid)
          setUserRole(role)
        }
      }
    } catch (error) {
      // Only log actual errors, not ban messages
      if (error instanceof Error && error.name !== "UserBannedError") {
        console.error("Error with Google login:", error)
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUserRole(null)
    } catch (error) {
      console.error("Error logging out:", error)
      throw error
    }
  }

  const value = {
    user,
    userRole,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
