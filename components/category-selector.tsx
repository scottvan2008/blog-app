"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { categories } from "@/lib/categories"
import { getCustomCategories, type CustomCategory } from "@/lib/category-service"

interface CategorySelectorProps {
  value: string
  onValueChange: (value: string) => void
  customCategoryId?: string
  onCustomCategoryChange?: (customCategoryId: string | undefined) => void
  label?: string
  placeholder?: string
}

export default function CategorySelector({
  value,
  onValueChange,
  customCategoryId,
  onCustomCategoryChange,
  label = "Category",
  placeholder = "Select a category",
}: CategorySelectorProps) {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomCategories = async () => {
      try {
        const customCats = await getCustomCategories()
        setCustomCategories(customCats)
      } catch (error) {
        console.error("Error fetching custom categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomCategories()
  }, [])

  const handleValueChange = (newValue: string) => {
    if (newValue.startsWith("custom_")) {
      // Custom category selected
      const customId = newValue.replace("custom_", "")
      onValueChange("") // Clear default category
      onCustomCategoryChange?.(customId)
    } else {
      // Default category selected
      onValueChange(newValue)
      onCustomCategoryChange?.(undefined)
    }
  }

  // Determine current selection
  const currentValue = customCategoryId ? `custom_${customCategoryId}` : value

  return (
    <div className="space-y-2">
      <Label htmlFor="category">{label}</Label>
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading categories..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Default Categories */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Default Categories</div>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                Custom Categories
              </div>
              {customCategories.map((cat) => (
                <SelectItem key={`custom_${cat.id}`} value={`custom_${cat.id}`}>
                  <div className="flex items-center gap-2">
                    <span>{cat.name}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Custom</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
