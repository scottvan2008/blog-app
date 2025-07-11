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

// Add import
import CategorySelector from "@/components/category-selector"
import MDEditor from '@uiw/react-md-editor';

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

  // Add state for custom category
  const [customCategoryId, setCustomCategoryId] = useState<string | undefined>()

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
        setCustomCategoryId(post.customCategoryId || undefined) // Add this line
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

    let coverFile = imageFile
    if (!coverFile && imagePreview && imagePreview.startsWith("http")) {
      try {
        coverFile = await urlToFile(imagePreview, "cover.jpg")
      } catch (e) {
        toast({ title: "图片转文件失败", description: String(e), variant: "destructive" })
        setIsLoading(false)
        return
      }
    }

    try {
      await updateBlogPost(
        params.id,
        title,
        content,
        category,
          coverFile || undefined,
        currentImageUrl,
        customCategoryId, // Add this parameter
      )

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

  function extractFirstImageSrc(md: string): string | null {
    const mdImg = md.match(/!\[.*?\]\((.*?)\)/)
    if (mdImg) return mdImg[1]
    const htmlImg = md.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
    if (htmlImg) return htmlImg[1]
    return null
  }

  const handleContentChange = (val: string) => {
    setContent(val)
    if (!imageFile) {
      const imgSrc = extractFirstImageSrc(val)
      setImagePreview(imgSrc || null)
      setCurrentImageUrl(imgSrc || undefined)
    }
  }

  async function urlToFile(url: string, filename?: string): Promise<File> {
    const res = await fetch(url)
    if (!res.ok) throw new Error('图片下载失败')
    const blob = await res.blob()
    let name = filename
    if (!name) {
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg'
      name = `cover.${ext}`
    }
    return new File([blob], name, { type: blob.type })
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
            <CategorySelector
              value={category}
              onValueChange={setCategory}
              customCategoryId={customCategoryId}
              onCustomCategoryChange={setCustomCategoryId}
            />

            {/* Replace the Textarea component with our RichTextEditor */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              {/*<RichTextEditor*/}
              {/*    value={content}*/}
              {/*    onChange={setContent}*/}
              {/*    placeholder="Write your blog post content here..."*/}
              {/*    minHeight="300px"*/}
              {/*/>*/}

              <div className="w-full min-h-[300px] flex flex-col">
                <MDEditor
                    value={content}
                    onChange={handleContentChange}
                    className="w-full min-h-[300px]"
                    style={{flex: 1}}
                />
              </div>

              {/*<MDEditor.Markdown source={content} style={{whiteSpace: 'pre-wrap'}}/>*/}

              {/*<div className="container mt-10">*/}
              {/*  <MDEditor*/}
              {/*      value={content}*/}
              {/*      onChange={setContent}*/}
              {/*  />*/}
              {/*  <MDEditor.Markdown source={content} style={{whiteSpace: 'pre-wrap'}}/>*/}
              {/*</div>*/}
            </div>

            {/*<div className="space-y-2">*/}
            {/*  <Label htmlFor="image">Cover Image (Optional)</Label>*/}
            {/*  <div className="flex items-center gap-4">*/}
            {/*    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>*/}
            {/*      <ImageIcon className="mr-2 h-4 w-4" />*/}
            {/*      {currentImageUrl ? "Change Image" : "Select Image"}*/}
            {/*    </Button>*/}
            {/*    <input*/}
            {/*      ref={fileInputRef}*/}
            {/*      id="image"*/}
            {/*      type="file"*/}
            {/*      accept="image/*"*/}
            {/*      onChange={handleImageChange}*/}
            {/*      className="hidden"*/}
            {/*    />*/}
            {/*    {imagePreview && <span className="text-sm text-muted-foreground">Image selected</span>}*/}
            {/*  </div>*/}

            {/*  {imagePreview && (*/}
            {/*    <div className="relative mt-4 w-full max-w-md">*/}
            {/*      <img*/}
            {/*        src={imagePreview || "/placeholder.svg"}*/}
            {/*        alt="Preview"*/}
            {/*        className="rounded-md max-h-[200px] object-cover"*/}
            {/*      />*/}
            {/*      <Button*/}
            {/*        type="button"*/}
            {/*        variant="destructive"*/}
            {/*        size="icon"*/}
            {/*        className="absolute top-2 right-2 h-8 w-8"*/}
            {/*        onClick={removeImage}*/}
            {/*      >*/}
            {/*        <X className="h-4 w-4" />*/}
            {/*      </Button>*/}
            {/*    </div>*/}
            {/*  )}*/}
            {/*</div>*/}
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
