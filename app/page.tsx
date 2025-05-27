"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import BlogList from "@/components/blog-list"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="text-6xl mb-2">💧</div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to InkDrop</h1>
        <p className="text-muted-foreground max-w-[700px]">
          A simple and elegant blogging platform where you can write, share, and discover stories.
        </p>
        <div className="flex gap-4">
          {user ? (
            <Button asChild>
              <Link href="/create">Create New Post</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <BlogList />
    </div>
  )
}
