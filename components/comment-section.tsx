"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getCommentsForPost, addComment, deleteComment, type Comment } from "@/lib/comment-service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import UserAvatar from "./user-avatar"

interface CommentSectionProps {
  postId: string
  onCommentCountChange?: (count: number) => void
}

export default function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const fetchedComments = await getCommentsForPost(postId)
        setComments(fetchedComments)
        if (onCommentCountChange) {
          onCommentCountChange(fetchedComments.length)
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId, toast, onCommentCountChange])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const commentId = await addComment(
        postId,
        user.uid,
        user.displayName || user.email?.split("@")[0] || "Anonymous",
        newComment,
        user.photoURL || undefined,
      )

      // Add the new comment to the list
      const newCommentObj: Comment = {
        id: commentId,
        postId,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        userPhotoURL: user.photoURL || undefined,
        content: newComment,
        createdAt: { toDate: () => new Date() } as any, // Temporary date until refresh
      }

      setComments((prev) => [...prev, newCommentObj])
      setNewComment("")

      if (onCommentCountChange) {
        onCommentCountChange(comments.length + 1)
      }

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId)

    try {
      await deleteComment(commentId)

      // Remove the comment from the list
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))

      if (onCommentCountChange) {
        onCommentCountChange(comments.length - 1)
      }

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingCommentId(null)
    }
  }

  if (isLoading) {
    return <div className="py-4">Loading comments...</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex items-start gap-3">
            <UserAvatar src={user.photoURL} name={user.displayName} size="sm" />
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-muted/30 rounded-md p-4 text-center">
          <p className="text-muted-foreground">Please log in to comment</p>
        </div>
      )}

      <div className="space-y-4 pt-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <UserAvatar src={comment.userPhotoURL} name={comment.userName} size="sm" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{comment.userName}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
                    </span>
                  </div>

                  {user && user.uid === comment.userId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                          >
                            {deletingCommentId === comment.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
