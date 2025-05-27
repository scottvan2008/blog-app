"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getBlogPost, deleteBlogPost, type BlogPost } from "@/lib/blog-service"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
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
import { ArrowLeft, Edit, MessageSquare, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Add imports for new components
import { getCategoryName } from "@/lib/categories"
import { Badge } from "@/components/ui/badge"
import FollowButton from "@/components/follow-button"
import LikeButton from "@/components/like-button"
import CommentSection from "@/components/comment-section"
import UserAvatar from "@/components/user-avatar"

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getBlogPost(params.id)
        setPost(postData)
      } catch (error) {
        console.error("Error fetching blog post:", error)
        toast({
          title: "Error",
          description: "Failed to load the blog post",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, toast])

  const handleDelete = async () => {
    if (!post) return

    setIsDeleting(true)
    try {
      await deleteBlogPost(post.id, post.imageUrl)

      toast({
        title: "Blog post deleted",
        description: "Your blog post has been deleted successfully",
      })

      // Close the dialog and navigate away
      setShowDeleteDialog(false)
      router.push("/")
    } catch (error) {
      console.error("Error deleting blog post:", error)
      toast({
        title: "Error",
        description: "Failed to delete the blog post. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const handleCommentCount = (count: number) => {
    setCommentCount(count)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    )
  }

  const isAuthor = user && user.uid === post.authorId

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {/* Author info with follow button */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <Link href={`/profile/${post.authorId}`} className="flex items-center group">
          <UserAvatar src={post.authorPhotoURL} name={post.authorName} className="mr-3" />
          <div>
            <p className="font-medium group-hover:text-primary transition-colors">{post.authorName}</p>
            {post.createdAt && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
              </p>
            )}
          </div>
        </Link>

        {!isAuthor && user && <FollowButton userId={post.authorId} />}
      </div>

      {/* Category badge and interaction buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {post.category && (
            <Link href={`/search?category=${post.category}`}>
              <Badge variant="secondary">{getCategoryName(post.category)}</Badge>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LikeButton postId={post.id} />
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{commentCount}</span>
          </Button>
        </div>
      </div>

      {isAuthor && (
        <div className="flex gap-2 mb-6">
          <Button variant="outline" asChild size="sm">
            <Link href={`/edit/${post.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your blog post and all associated comments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
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
        </div>
      )}

      {post.imageUrl && (
        <Card className="mb-8 overflow-hidden">
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
          </div>
        </Card>
      )}

      <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Comments section */}
      <div className="border-t pt-8">
        <CommentSection postId={post.id} onCommentCountChange={handleCommentCount} />
      </div>
    </div>
  )
}
