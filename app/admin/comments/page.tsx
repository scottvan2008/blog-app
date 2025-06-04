"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAdmin } from "@/hooks/use-admin"
import AdminLayout from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { deleteComment } from "@/lib/comment-service"
import { formatDistanceToNow } from "date-fns"
import { Search, MoreHorizontal, Eye, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  content: string
  createdAt: any
}

export default function AdminComments() {
  const router = useRouter()
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useAdmin()
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsQuery = query(collection(db, "comments"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(commentsQuery)

        const fetchedComments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]

        setComments(fetchedComments)
        setFilteredComments(fetchedComments)
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!roleLoading && (isAdmin || isSuperAdmin)) {
      fetchComments()
    }
  }, [isAdmin, isSuperAdmin, roleLoading])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredComments(comments)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = comments.filter(
        (comment) => comment.content.toLowerCase().includes(query) || comment.userName.toLowerCase().includes(query),
      )
      setFilteredComments(filtered)
    }
  }, [searchQuery, comments])

  const handleDeleteComment = async () => {
    if (!commentToDelete) return

    setIsDeleting(true)
    try {
      await deleteComment(commentToDelete.id)

      // Remove the comment from the lists
      const updatedComments = comments.filter((comment) => comment.id !== commentToDelete.id)
      setComments(updatedComments)
      setFilteredComments(
        updatedComments.filter(
          (comment) =>
            comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            comment.userName.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )

      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete the comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCommentToDelete(null)
    }
  }

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
        <h1 className="text-3xl font-bold mb-2">Manage Comments</h1>
        <p className="text-muted-foreground">View and manage all comments.</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search comments by content or author..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No comments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="max-w-[300px] truncate">{comment.content}</TableCell>
                    <TableCell>{comment.userName}</TableCell>
                    <TableCell>
                      <Link href={`/blog/${comment.postId}`} className="text-primary hover:underline">
                        View Post
                      </Link>
                    </TableCell>
                    <TableCell>
                      {comment.createdAt && formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${comment.postId}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View in Context
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCommentToDelete(comment)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
