"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { collection, getCountFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FileText, Users, MessageSquare, ThumbsUp } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useAdmin()
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    comments: 0,
    likes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get post count
        const postsSnapshot = await getCountFromServer(collection(db, "blogPosts"))

        // Get user count
        const usersSnapshot = await getCountFromServer(collection(db, "users"))

        // Get comment count
        const commentsSnapshot = await getCountFromServer(collection(db, "comments"))

        // Get like count
        const likesSnapshot = await getCountFromServer(collection(db, "likes"))

        setStats({
          posts: postsSnapshot.data().count,
          users: usersSnapshot.data().count,
          comments: commentsSnapshot.data().count,
          likes: likesSnapshot.data().count,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!roleLoading && (isAdmin || isSuperAdmin)) {
      fetchStats()
    }
  }, [isAdmin, isSuperAdmin, roleLoading])

  if (roleLoading) {
    return null // AdminLayout will show loading state
  }

  if (!isAdmin && !isSuperAdmin) {
    router.push("/")
    return null
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the InkDrop admin dashboard.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Posts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-bold">{stats.posts}</div>}
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-bold">{stats.users}</div>}
          </CardContent>
        </Card>

        {/* Comments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-bold">{stats.comments}</div>}
          </CardContent>
        </Card>

        {/* Likes Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-bold">{stats.likes}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity to display.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Use the sidebar to navigate to different admin sections.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
