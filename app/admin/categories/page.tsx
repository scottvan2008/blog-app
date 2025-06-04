"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import AdminLayout from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { categories } from "@/lib/categories"
import {
  addCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  getCustomCategories,
  getCategoryCounts,
  type CustomCategory,
} from "@/lib/category-service"
import { Tag, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function AdminCategories() {
  const router = useRouter()
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useAdmin()
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CustomCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch custom categories and counts
        const [customCats, counts] = await Promise.all([getCustomCategories(), getCategoryCounts()])

        setCustomCategories(customCats)
        setCategoryCounts(counts)
      } catch (error) {
        console.error("Error fetching category data:", error)
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!roleLoading && (isAdmin || isSuperAdmin)) {
      fetchData()
    }
  }, [isAdmin, isSuperAdmin, roleLoading, toast])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a category name",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCategory) {
        // Update existing category
        await updateCustomCategory(editingCategory.id, newCategoryName, newCategoryDescription)

        // Update local state
        setCustomCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id
              ? { ...cat, name: newCategoryName, description: newCategoryDescription }
              : cat,
          ),
        )

        toast({
          title: "Category updated",
          description: "The category has been updated successfully",
        })
      } else {
        // Add new category
        const categoryId = await addCustomCategory(newCategoryName, newCategoryDescription)

        // Add to local state
        const newCategory: CustomCategory = {
          id: categoryId,
          name: newCategoryName,
          description: newCategoryDescription,
          isCustom: true,
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
        }
        setCustomCategories((prev) => [...prev, newCategory])

        toast({
          title: "Category added",
          description: "The new category has been created successfully",
        })
      }

      // Reset form
      setDialogOpen(false)
      setNewCategoryName("")
      setNewCategoryDescription("")
      setEditingCategory(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      await deleteCustomCategory(categoryToDelete.id)

      // Remove from local state
      setCustomCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id))

      // Remove from counts
      setCategoryCounts((prev) => {
        const newCounts = { ...prev }
        delete newCounts[`custom_${categoryToDelete.id}`]
        return newCounts
      })

      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const openEditDialog = (category: CustomCategory) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryDescription(category.description || "")
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingCategory(null)
    setNewCategoryName("")
    setNewCategoryDescription("")
    setDialogOpen(true)
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Categories</h1>
          <p className="text-muted-foreground">View default categories and manage custom categories.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Category
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Default Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Default Categories</h2>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{category.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.id}</Badge>
                      </TableCell>
                      <TableCell>{categoryCounts[category.id] || 0}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Default</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Custom Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Custom Categories</h2>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No custom categories yet. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{category.name}</span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {category.description || "No description"}
                        </TableCell>
                        <TableCell>{categoryCounts[`custom_${category.id}`] || 0}</TableCell>
                        <TableCell>
                          <Badge variant="default">Custom</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCategoryToDelete(category)
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
          </div>
        </div>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category information below."
                : "Create a new custom category for blog posts."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Science & Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Brief description of this category..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={isSubmitting}>
              {isSubmitting
                ? editingCategory
                  ? "Updating..."
                  : "Adding..."
                : editingCategory
                  ? "Update Category"
                  : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "{categoryToDelete?.name}".
              {categoryCounts[`custom_${categoryToDelete?.id}`] > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This category is currently being used by {categoryCounts[`custom_${categoryToDelete?.id}`]}{" "}
                  post(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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
