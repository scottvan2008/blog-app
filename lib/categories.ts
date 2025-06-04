export const categories = [
  { id: "technology", name: "Technology" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "travel", name: "Travel" },
  { id: "food", name: "Food & Cooking" },
  { id: "health", name: "Health & Fitness" },
  { id: "business", name: "Business" },
  { id: "education", name: "Education" },
  { id: "entertainment", name: "Entertainment" },
  { id: "personal", name: "Personal" },
  { id: "other", name: "Other" },
]

export function getCategoryName(categoryId: string): string {
  const category = categories.find((cat) => cat.id === categoryId)
  return category ? category.name : "Uncategorized"
}

// Enhanced function to get category name (supports custom categories)
export function getCategoryDisplayName(categoryId: string, customCategories: any[] = []): string {
  // Check if it's a custom category
  if (categoryId.startsWith("custom_")) {
    const customId = categoryId.replace("custom_", "")
    const customCategory = customCategories.find((cat) => cat.id === customId)
    return customCategory ? customCategory.name : "Custom Category"
  }

  // Default category
  return getCategoryName(categoryId)
}
