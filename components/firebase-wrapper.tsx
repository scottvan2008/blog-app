"use client"

import { useState, useEffect, type ReactNode } from "react"
import { getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

interface FirebaseWrapperProps {
  children: ReactNode
}

export default function FirebaseWrapper({ children }: FirebaseWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only initialize Firebase on the client
    if (typeof window !== "undefined") {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      // Initialize Firebase app if it hasn't been initialized yet
      if (!getApps().length) {
        const app = initializeApp(firebaseConfig)
        const auth = getAuth(app)
        const db = getFirestore(app)
        const storage = getStorage(app)

        // You can do additional setup here if needed
      }

      setIsInitialized(true)
    }
  }, [])

  // Don't render children until Firebase is initialized on the client
  if (!isInitialized && typeof window !== "undefined") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
