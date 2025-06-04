import AdminLayout from "@/components/admin/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Overview Stats Skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    </AdminLayout>
  )
}
