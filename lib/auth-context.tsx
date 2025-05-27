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
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
        setUser(user)

        try {
          // Check if user exists in Firestore
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)

          // If user doesn't exist in Firestore, create a new document
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: user.displayName || user.email?.split("@")[0] || "User",
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
        } catch (error) {
          console.error("Error checking/creating user document:", error)
        }
      } else {
        setUser(null)
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
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
      }
    } catch (error) {
      console.error("Error with Google login:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error logging out:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
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
