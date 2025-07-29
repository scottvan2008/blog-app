"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createBlogPost } from "@/lib/blog-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ImageIcon, X } from "lucide-react"
// Update the imports to include our new RichTextEditor
import RichTextEditor from "@/components/rich-text-editor"
import CategorySelector from "@/components/category-selector"
import MDEditor from '@uiw/react-md-editor';
import { FileUploader } from "react-drag-drop-files";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  // Add state for category
  const [category, setCategory] = useState("other")
  // Add state for custom category
  const [customCategoryId, setCustomCategoryId] = useState<string | undefined>()


  //audio stuff

  const fileTypes = ["MP3", "WAV"]

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const handleChange = (audioFile: File) => {
    setAudioFile(audioFile);
  };


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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Update the handleSubmit function to include category and authorPhotoURL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a blog post",
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

    let coverFile = imageFile;
    if (!coverFile && imagePreview) {
      // src to file
      coverFile = await urlToFile(imagePreview, "cover.jpg");
    }

    try {
      const postId = await createBlogPost(
        title,
        content,
        user.uid,
        user.displayName || user.email?.split("@")[0] || "Anonymous",
        category,
        user.photoURL || undefined,
          coverFile || undefined,
        audioFile || undefined,
        customCategoryId, // Add this parameter
      )

      toast({
        title: "Blog post created",
        description: "Your blog post has been published successfully",
      })

      router.push(`/blog/${postId}`)
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast({
        title: "Error creating blog post",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function urlToFile(url: string, filename?: string): Promise<File> {
    const res = await fetch(url);
    if (!res.ok) throw new Error('download image failed');
    const blob = await res.blob();

    let name = filename;
    if (!name) {
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      name = `cover.${ext}`;
    }
    const file = new File([blob], name, { type: blob.type });
    return file;
  }


  const handleContentChange = (val: string = "") => {
    setContent(val);
    const imgSrc = extractFirstImageSrc(val);
    setImagePreview(imgSrc || null);
    setImageFile(null);
  };


  function extractFirstImageSrc(md: string): string | null {
    // find md img
    const mdImg = md.match(/!\[.*?\]\((.*?)\)/);
    if (mdImg) return mdImg[1];

    // find html img
    const htmlImg = md.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (htmlImg) return htmlImg[1];

    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>Share your thoughts with the world</CardDescription>
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

            {/* Replace the category selection section with: */}
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

              <div
                  className="col-span-4 row-span-4">
                <div className="w-full min-h-[300px] flex flex-col">
                  <MDEditor
                      value={content}
                      onChange={handleContentChange}
                      className="w-full min-h-[300px]"
                      style={{flex: 1}}
                  />
                </div>
              </div>
            </div>

            {/*<div className="space-y-2">*/}
            {/*  <Label htmlFor="image">Cover Image (Optional)</Label>*/}
            {/*  <div className="flex items-center gap-4">*/}
            {/*    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>*/}
            {/*      <ImageIcon className="mr-2 h-4 w-4"/>*/}
            {/*      Select Image*/}
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

            {imagePreview && (
                <div className="relative mt-4 w-full max-w-md">
                  <img
                      src={imagePreview}
                      alt="Cover Preview"
                      className="rounded-md max-h-[200px] object-cover"
                  />
                </div>
            )}
            <FileUploader handleChange={handleChange} name="file" multiple={false} types={fileTypes} />
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Publishing..." : "Publish Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
