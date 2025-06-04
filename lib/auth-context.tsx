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

  // Function to get user role from Firestore
  const getUserRole = async (userId: string): Promise<string | null> => {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        console.log("User data from Firestore:", userData) // Debug log
        return userData.role || "user"
      }
      return "user"
    } catch (error) {
      console.error("Error getting user role:", error)
      return "user"
    }
  }

  // Function to refresh user role
  const refreshUserRole = async () => {
    if (user) {
      const role = await getUserRole(user.uid)
      console.log("Refreshed user role:", role) // Debug log
      setUserRole(role)
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
      console.log("Auth state changed:", user?.email) // Debug log

      if (user) {
        setUser(user)

        try {
          // Get user role
          const role = await getUserRole(user.uid)
          console.log("User role:", role) // Debug log
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
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
            setUserRole("user")
          }
        } catch (error) {
          console.error("Error checking/creating user document:", error)
          setUserRole("user")
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
      // Role will be set in the onAuthStateChanged listener
    } catch (error) {
      console.error("Error logging in:", error)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Create or update user document in Firestore
      if (result.user) {
        const userRef = doc(db, "users", result.user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          // New user, create with default role
          await setDoc(userRef, {
            displayName: result.user.displayName || result.user.email?.split("@")[0] || "User",
            email: result.user.email,
            photoURL: result.user.photoURL,
            role: "user", // Default role
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
          const role = await getUserRole(result.user.uid)
          setUserRole(role)
        }
      }
    } catch (error) {
      console.error("Error with Google login:", error)
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
