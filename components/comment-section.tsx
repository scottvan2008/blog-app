"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getComments, addComment, deleteComment, type Comment } from "@/lib/comment-service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, MessageCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      const fetchedComments = await getComments(postId)
      setComments(fetchedComments)
    } catch (error) {
      console.error("Error loading comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      await addComment(
        postId,
        user.uid,
        user.displayName || "Anonymous",
        user.photoURL || null, // Pass null instead of undefined
        newComment.trim(),
      )
      setNewComment("")
      await loadComments()
      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await deleteComment(commentId)
      await loadComments()
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return ""
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                <AvatarFallback>{(user.displayName || "A")[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" disabled={!newComment.trim() || submitting} size="sm">
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Please sign in to leave a comment.</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.userPhotoURL || ""} alt={comment.userName} />
                  <AvatarFallback>{comment.userName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    </div>
                    {user && comment.userId === user.uid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
