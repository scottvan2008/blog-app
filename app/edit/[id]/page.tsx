"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getBlogPost, updateBlogPost } from "@/lib/blog-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { ImageIcon, X } from "lucide-react"

// Update the imports to include our new RichTextEditor
import RichTextEditor from "@/components/rich-text-editor"

// Add import for categories
import { categories } from "@/lib/categories"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Add state for category
  const [category, setCategory] = useState("other")

  // Update the useEffect to set the category
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await getBlogPost(params.id)

        if (!post) {
          toast({
            title: "Post not found",
            description: "The blog post you're trying to edit doesn't exist",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Check if user is the author
        if (user && post.authorId !== user.uid) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this post",
            variant: "destructive",
          })
          router.push(`/blog/${params.id}`)
          return
        }

        setTitle(post.title)
        setContent(post.content)
        setCategory(post.category || "other")
        setCurrentImageUrl(post.imageUrl)
        if (post.imageUrl) {
          setImagePreview(post.imageUrl)
        }
      } catch (error) {
        console.error("Error fetching blog post:", error)
        toast({
          title: "Error",
          description: "Failed to load the blog post",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    if (user) {
      fetchPost()
    } else {
      setIsFetching(false)
    }
  }, [params.id, user, router, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Update the handleSubmit function to include category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit this blog post",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content for your blog post",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await updateBlogPost(params.id, title, content, category, imageFile || undefined, currentImageUrl)

      toast({
        title: "Blog post updated",
        description: "Your blog post has been updated successfully",
      })

      router.push(`/blog/${params.id}`)
    } catch (error) {
      console.error("Error updating blog post:", error)
      toast({
        title: "Error updating blog post",
        description: "There was an error updating your post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">Please log in to edit blog posts.</p>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Blog Post</CardTitle>
          <CardDescription>Update your blog post</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a captivating title"
                required
              />
            </div>

            {/* Add category selection field after the title field */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Replace the Textarea component with our RichTextEditor */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog post content here..."
                minHeight="300px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Cover Image (Optional)</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {currentImageUrl ? "Change Image" : "Select Image"}
                </Button>
                <input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && <span className="text-sm text-muted-foreground">Image selected</span>}
              </div>

              {imagePreview && (
                <div className="relative mt-4 w-full max-w-md">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="rounded-md max-h-[200px] object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/blog/${params.id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Blog Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
