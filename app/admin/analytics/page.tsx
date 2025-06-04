"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/admin-layout"
import { MetricCard } from "@/components/admin/analytics/metric-card"
import { TimeRangeSelector } from "@/components/admin/analytics/time-range-selector"
import { EnhancedChart } from "@/components/admin/analytics/enhanced-chart"
import { DataTable } from "@/components/admin/analytics/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  BarChart3,
  FileText,
  MessageSquare,
  ThumbsUp,
  Users,
  Eye,
  Calendar,
  TrendingUp,
} from "lucide-react"
import {
  getAnalyticsData,
  getUserGrowthData,
  getContentGrowthData,
  getEngagementMetrics,
  type TimeRange,
} from "@/lib/analytics-service"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [userGrowthData, setUserGrowthData] = useState<any[]>([])
  const [contentGrowthData, setContentGrowthData] = useState<any[]>([])
  const [engagementData, setEngagementData] = useState<any>(null)
  const [activityData, setActivityData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        console.log("Fetching analytics data for range:", timeRange)

        // Fetch all analytics data in parallel
        const [analytics, userGrowth, contentGrowth, engagement] = await Promise.all([
          getAnalyticsData(timeRange),
          getUserGrowthData(timeRange),
          getContentGrowthData(timeRange),
          getEngagementMetrics(timeRange),
        ])

        console.log("Analytics data received:", analytics)

        setAnalyticsData(analytics)
        setUserGrowthData(userGrowth)
        setContentGrowthData(contentGrowth)
        setEngagementData(engagement)

        // Process activity data for the line chart
        const dates = new Set<string>()

        // Collect all dates from all metrics
        if (analytics.postsPerDay) {
          Object.keys(analytics.postsPerDay).forEach((date) => dates.add(date))
        }
        if (analytics.commentsPerDay) {
          Object.keys(analytics.commentsPerDay).forEach((date) => dates.add(date))
        }
        if (analytics.likesPerDay) {
          Object.keys(analytics.likesPerDay).forEach((date) => dates.add(date))
        }
        if (analytics.usersPerDay) {
          Object.keys(analytics.usersPerDay).forEach((date) => dates.add(date))
        }

        // Create sorted array of dates
        const sortedDates = Array.from(dates).sort()

        // Create activity data array with all metrics
        const activity = sortedDates.map((date) => ({
          date,
          posts: analytics.postsPerDay?.[date] || 0,
          comments: analytics.commentsPerDay?.[date] || 0,
          likes: analytics.likesPerDay?.[date] || 0,
          users: analytics.usersPerDay?.[date] || 0,
        }))

        setActivityData(activity)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange)
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your blog's performance and user engagement</p>
          </div>
          <TimeRangeSelector onChange={handleTimeRangeChange} defaultRange={timeRange} />
        </div>

        {/* Overview Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            <>
              <MetricCard
                title="Total Posts"
                value={analyticsData?.totalPosts || 0}
                icon={<FileText className="h-6 w-6" />}
                color="blue"
                change={{ value: 12, period: "vs last month" }}
              />
              <MetricCard
                title="Total Users"
                value={analyticsData?.totalUsers || 0}
                icon={<Users className="h-6 w-6" />}
                color="green"
                change={{ value: 8, period: "vs last month" }}
              />
              <MetricCard
                title="Total Comments"
                value={analyticsData?.totalComments || 0}
                icon={<MessageSquare className="h-6 w-6" />}
                color="orange"
                change={{ value: -3, period: "vs last month" }}
              />
              <MetricCard
                title="Total Likes"
                value={analyticsData?.totalLikes || 0}
                icon={<ThumbsUp className="h-6 w-6" />}
                color="purple"
                change={{ value: 15, period: "vs last month" }}
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            {loading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <EnhancedChart
                title="Daily Activity Overview"
                description="Track daily posts, comments, likes, and new user registrations"
                data={activityData}
                type="line"
                colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
                height={400}
              />
            )}

            {loading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <DataTable
                title="Activity Breakdown"
                description="Detailed daily activity metrics"
                data={activityData}
                columns={[
                  { header: "Date", accessorKey: "date" },
                  { header: "Posts", accessorKey: "posts" },
                  { header: "Comments", accessorKey: "comments" },
                  { header: "Likes", accessorKey: "likes" },
                  { header: "New Users", accessorKey: "users" },
                ]}
                searchable
                exportable
              />
            )}
          </TabsContent>

          {/* Growth Tab */}
          <TabsContent value="growth" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {loading ? (
                <>
                  <Skeleton className="h-[400px]" />
                  <Skeleton className="h-[400px]" />
                </>
              ) : (
                <>
                  <EnhancedChart
                    title="User Growth"
                    description="Cumulative user registrations over time"
                    data={userGrowthData}
                    type="area"
                    colors={["#10b981"]}
                    height={400}
                  />
                  <EnhancedChart
                    title="Content Growth"
                    description="Cumulative blog posts published over time"
                    data={contentGrowthData}
                    type="area"
                    colors={["#3b82f6"]}
                    height={400}
                  />
                </>
              )}
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {loading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </>
              ) : (
                <>
                  <MetricCard
                    title="Avg. Comments Per Post"
                    value={engagementData?.avgCommentsPerPost.toFixed(1) || "0"}
                    icon={<MessageSquare className="h-6 w-6" />}
                    color="green"
                  />
                  <MetricCard
                    title="Avg. Likes Per Post"
                    value={engagementData?.avgLikesPerPost.toFixed(1) || "0"}
                    icon={<ThumbsUp className="h-6 w-6" />}
                    color="purple"
                  />
                  <MetricCard
                    title="Total Engagement"
                    value={(analyticsData?.totalComments || 0) + (analyticsData?.totalLikes || 0)}
                    icon={<BarChart3 className="h-6 w-6" />}
                    color="orange"
                  />
                </>
              )}
            </div>

            {loading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <EnhancedChart
                title="Category Engagement"
                description="Average engagement per post by category"
                data={
                  engagementData?.mostEngagedCategories.map((item: any) => ({
                    name: item.category,
                    value: Number.parseFloat(item.engagement.toFixed(1)),
                  })) || []
                }
                type="bar"
                colors={["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]}
                height={400}
              />
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {loading ? (
                <>
                  <Skeleton className="h-[400px]" />
                  <Skeleton className="h-[400px]" />
                </>
              ) : (
                <>
                  <EnhancedChart
                    title="Popular Categories"
                    description="Number of posts by category"
                    data={analyticsData?.topCategories || []}
                    type="bar"
                    colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
                    height={400}
                  />
                  <EnhancedChart
                    title="Top Authors"
                    description="Most active content creators"
                    data={
                      analyticsData?.topAuthors.map((author: any) => ({
                        name: author.name,
                        value: author.count,
                      })) || []
                    }
                    type="bar"
                    colors={["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"]}
                    height={400}
                  />
                </>
              )}
            </div>

            {loading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <DataTable
                title="Top Performing Posts"
                description="Posts ranked by total engagement (likes + comments)"
                data={
                  analyticsData?.topPosts.map((post: any, index: number) => ({
                    rank: index + 1,
                    title: post.title,
                    likes: post.likes,
                    comments: post.comments,
                    engagement: post.likes + post.comments,
                  })) || []
                }
                columns={[
                  { header: "Rank", accessorKey: "rank" },
                  { header: "Title", accessorKey: "title" },
                  { header: "Likes", accessorKey: "likes" },
                  { header: "Comments", accessorKey: "comments" },
                  { header: "Total Engagement", accessorKey: "engagement" },
                ]}
                searchable
                exportable
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
