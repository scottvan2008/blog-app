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
