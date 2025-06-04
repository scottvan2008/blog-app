import { db } from "./firebase"
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore"

// Types for analytics data
export interface AnalyticsData {
  totalPosts: number
  totalUsers: number
  totalComments: number
  totalLikes: number
  postsPerDay: Record<string, number>
  usersPerDay: Record<string, number>
  commentsPerDay: Record<string, number>
  likesPerDay: Record<string, number>
  topCategories: Array<{ name: string; count: number }>
  topAuthors: Array<{ id: string; name: string; count: number }>
  topPosts: Array<{ id: string; title: string; likes: number; comments: number }>
}

export interface TimeRange {
  start: Date
  end: Date
}

// Helper function to get date string
function getDateString(timestamp: any): string {
  if (!timestamp) return new Date().toISOString().split("T")[0]

  try {
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().split("T")[0]
    }
    return new Date(timestamp).toISOString().split("T")[0]
  } catch (error) {
    return new Date().toISOString().split("T")[0]
  }
}

// Get analytics data for a specific time range
export async function getAnalyticsData(timeRange: TimeRange): Promise<AnalyticsData> {
  const startTimestamp = Timestamp.fromDate(timeRange.start)
  const endTimestamp = Timestamp.fromDate(timeRange.end)

  try {
    console.log("Fetching real analytics data...")

    // Get all posts
    const allPostsQuery = query(collection(db, "blogPosts"))
    const allPostsSnapshot = await getDocs(allPostsQuery)
    const totalPosts = allPostsSnapshot.size
    console.log("Total posts:", totalPosts)

    // Get all users
    const allUsersQuery = query(collection(db, "users"))
    const allUsersSnapshot = await getDocs(allUsersQuery)
    const totalUsers = allUsersSnapshot.size
    console.log("Total users:", totalUsers)

    // Get all comments
    const allCommentsQuery = query(collection(db, "comments"))
    const allCommentsSnapshot = await getDocs(allCommentsQuery)
    const totalComments = allCommentsSnapshot.size
    console.log("Total comments:", totalComments)

    // Get all likes
    const allLikesQuery = query(collection(db, "likes"))
    const allLikesSnapshot = await getDocs(allLikesQuery)
    const totalLikes = allLikesSnapshot.size
    console.log("Total likes:", totalLikes)

    // Get posts in time range for daily data
    const postsQuery = query(
      collection(db, "blogPosts"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
    )
    const postsSnapshot = await getDocs(postsQuery)

    // Get users in time range
    const usersQuery = query(
      collection(db, "users"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
    )
    const usersSnapshot = await getDocs(usersQuery)

    // Get comments in time range
    const commentsQuery = query(
      collection(db, "comments"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
    )
    const commentsSnapshot = await getDocs(commentsQuery)

    // Get likes in time range
    const likesQuery = query(
      collection(db, "likes"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
    )
    const likesSnapshot = await getDocs(likesQuery)

    // Process posts per day
    const postsPerDay: Record<string, number> = {}
    postsSnapshot.forEach((doc) => {
      const post = doc.data()
      const date = getDateString(post.createdAt)
      postsPerDay[date] = (postsPerDay[date] || 0) + 1
    })

    // Process users per day
    const usersPerDay: Record<string, number> = {}
    usersSnapshot.forEach((doc) => {
      const user = doc.data()
      const date = getDateString(user.createdAt)
      usersPerDay[date] = (usersPerDay[date] || 0) + 1
    })

    // Process comments per day
    const commentsPerDay: Record<string, number> = {}
    commentsSnapshot.forEach((doc) => {
      const comment = doc.data()
      const date = getDateString(comment.createdAt)
      commentsPerDay[date] = (commentsPerDay[date] || 0) + 1
    })

    // Process likes per day
    const likesPerDay: Record<string, number> = {}
    likesSnapshot.forEach((doc) => {
      const like = doc.data()
      const date = getDateString(like.createdAt)
      likesPerDay[date] = (likesPerDay[date] || 0) + 1
    })

    // Get top categories from all posts
    const categoryMap: Record<string, number> = {}
    const customCategoryMap: Record<string, number> = {}

    // First, get all custom categories for lookup
    const customCategoriesQuery = query(collection(db, "categories"))
    const customCategoriesSnapshot = await getDocs(customCategoriesQuery)
    const customCategories = new Map()
    customCategoriesSnapshot.forEach((doc) => {
      customCategories.set(doc.id, doc.data().name)
    })

    // Process all posts for categories
    allPostsSnapshot.forEach((doc) => {
      const post = doc.data()
      if (post.customCategoryId) {
        const categoryName = customCategories.get(post.customCategoryId) || "Unknown Custom"
        customCategoryMap[categoryName] = (customCategoryMap[categoryName] || 0) + 1
      } else if (post.category) {
        categoryMap[post.category] = (categoryMap[post.category] || 0) + 1
      } else {
        categoryMap["Uncategorized"] = (categoryMap["Uncategorized"] || 0) + 1
      }
    })

    // Combine both category types
    const combinedCategories = { ...categoryMap, ...customCategoryMap }
    const topCategories = Object.entries(combinedCategories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    console.log("Top categories:", topCategories)

    // Get top authors from all posts
    const authorMap: Record<string, { name: string; count: number }> = {}
    allPostsSnapshot.forEach((doc) => {
      const post = doc.data()
      const authorId = post.authorId || "unknown"
      const authorName = post.authorName || "Unknown Author"
      if (!authorMap[authorId]) {
        authorMap[authorId] = { name: authorName, count: 0 }
      }
      authorMap[authorId].count++
    })

    const topAuthors = Object.entries(authorMap)
      .map(([id, { name, count }]) => ({ id, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    console.log("Top authors:", topAuthors)

    // Get top posts with real engagement data
    const postEngagement: Record<string, { id: string; title: string; likes: number; comments: number }> = {}

    // Initialize with all posts
    allPostsSnapshot.forEach((doc) => {
      const post = doc.data()
      postEngagement[doc.id] = {
        id: doc.id,
        title: post.title || "Untitled Post",
        likes: 0,
        comments: 0,
      }
    })

    // Count real likes for each post
    allLikesSnapshot.forEach((doc) => {
      const like = doc.data()
      const postId = like.postId
      if (postEngagement[postId]) {
        postEngagement[postId].likes++
      }
    })

    // Count real comments for each post
    allCommentsSnapshot.forEach((doc) => {
      const comment = doc.data()
      const postId = comment.postId
      if (postEngagement[postId]) {
        postEngagement[postId].comments++
      }
    })

    const topPosts = Object.values(postEngagement)
      .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
      .slice(0, 10)

    console.log("Top posts with real engagement:", topPosts)

    return {
      totalPosts,
      totalUsers,
      totalComments,
      totalLikes,
      postsPerDay,
      usersPerDay,
      commentsPerDay,
      likesPerDay,
      topCategories,
      topAuthors,
      topPosts,
    }
  } catch (error) {
    console.error("Error in getAnalyticsData:", error)
    throw error
  }
}

// Get user growth over time (real data)
export async function getUserGrowthData(timeRange: TimeRange): Promise<{ date: string; count: number }[]> {
  try {
    const startTimestamp = Timestamp.fromDate(timeRange.start)
    const endTimestamp = Timestamp.fromDate(timeRange.end)

    const usersQuery = query(
      collection(db, "users"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
      orderBy("createdAt", "asc"),
    )

    const usersSnapshot = await getDocs(usersQuery)

    // Process cumulative user growth
    const usersByDate: Record<string, number> = {}
    let cumulativeCount = 0

    usersSnapshot.forEach((doc) => {
      const user = doc.data()
      const date = getDateString(user.createdAt)
      cumulativeCount++
      usersByDate[date] = cumulativeCount
    })

    // Convert to array format for charts
    const result = Object.entries(usersByDate).map(([date, count]) => ({ date, count }))
    console.log("Real user growth data:", result)
    return result
  } catch (error) {
    console.error("Error in getUserGrowthData:", error)
    return []
  }
}

// Get content growth over time (real data)
export async function getContentGrowthData(timeRange: TimeRange): Promise<{ date: string; count: number }[]> {
  try {
    const startTimestamp = Timestamp.fromDate(timeRange.start)
    const endTimestamp = Timestamp.fromDate(timeRange.end)

    const postsQuery = query(
      collection(db, "blogPosts"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
      orderBy("createdAt", "asc"),
    )

    const postsSnapshot = await getDocs(postsQuery)

    // Process cumulative content growth
    const contentByDate: Record<string, number> = {}
    let cumulativeCount = 0

    postsSnapshot.forEach((doc) => {
      const post = doc.data()
      const date = getDateString(post.createdAt)
      cumulativeCount++
      contentByDate[date] = cumulativeCount
    })

    // Convert to array format for charts
    const result = Object.entries(contentByDate).map(([date, count]) => ({ date, count }))
    console.log("Real content growth data:", result)
    return result
  } catch (error) {
    console.error("Error in getContentGrowthData:", error)
    return []
  }
}

// Get engagement metrics (real data)
export async function getEngagementMetrics(timeRange: TimeRange): Promise<{
  avgCommentsPerPost: number
  avgLikesPerPost: number
  mostEngagedCategories: Array<{ category: string; engagement: number }>
}> {
  try {
    // Get all posts
    const allPostsQuery = query(collection(db, "blogPosts"))
    const allPostsSnapshot = await getDocs(allPostsQuery)
    const postCount = allPostsSnapshot.size

    if (postCount === 0) {
      return {
        avgCommentsPerPost: 0,
        avgLikesPerPost: 0,
        mostEngagedCategories: [],
      }
    }

    // Get all comments and likes
    const allCommentsQuery = query(collection(db, "comments"))
    const allCommentsSnapshot = await getDocs(allCommentsQuery)
    const commentCount = allCommentsSnapshot.size

    const allLikesQuery = query(collection(db, "likes"))
    const allLikesSnapshot = await getDocs(allLikesQuery)
    const likeCount = allLikesSnapshot.size

    // Calculate averages
    const avgCommentsPerPost = commentCount / postCount
    const avgLikesPerPost = likeCount / postCount

    // Calculate engagement by category
    const categoryEngagement: Record<string, { posts: number; comments: number; likes: number }> = {}
    const postCategories: Record<string, string> = {}

    // Get custom categories
    const customCategoriesQuery = query(collection(db, "categories"))
    const customCategoriesSnapshot = await getDocs(customCategoriesQuery)
    const customCategories = new Map()
    customCategoriesSnapshot.forEach((doc) => {
      customCategories.set(doc.id, doc.data().name)
    })

    // Process posts by category
    allPostsSnapshot.forEach((doc) => {
      const post = doc.data()
      const postId = doc.id
      let categoryName

      if (post.customCategoryId) {
        categoryName = customCategories.get(post.customCategoryId) || "Unknown Custom"
      } else if (post.category) {
        categoryName = post.category
      } else {
        categoryName = "Uncategorized"
      }

      postCategories[postId] = categoryName

      if (!categoryEngagement[categoryName]) {
        categoryEngagement[categoryName] = { posts: 0, comments: 0, likes: 0 }
      }
      categoryEngagement[categoryName].posts++
    })

    // Count comments by category
    allCommentsSnapshot.forEach((doc) => {
      const comment = doc.data()
      const postId = comment.postId
      const categoryName = postCategories[postId]

      if (categoryName && categoryEngagement[categoryName]) {
        categoryEngagement[categoryName].comments++
      }
    })

    // Count likes by category
    allLikesSnapshot.forEach((doc) => {
      const like = doc.data()
      const postId = like.postId
      const categoryName = postCategories[postId]

      if (categoryName && categoryEngagement[categoryName]) {
        categoryEngagement[categoryName].likes++
      }
    })

    // Calculate engagement score for each category
    const mostEngagedCategories = Object.entries(categoryEngagement)
      .map(([category, data]) => {
        const engagement = data.posts > 0 ? (data.comments + data.likes) / data.posts : 0
        return { category, engagement }
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5)

    console.log("Real engagement metrics:", {
      avgCommentsPerPost,
      avgLikesPerPost,
      mostEngagedCategories,
    })

    return {
      avgCommentsPerPost,
      avgLikesPerPost,
      mostEngagedCategories,
    }
  } catch (error) {
    console.error("Error in getEngagementMetrics:", error)
    return {
      avgCommentsPerPost: 0,
      avgLikesPerPost: 0,
      mostEngagedCategories: [],
    }
  }
}
