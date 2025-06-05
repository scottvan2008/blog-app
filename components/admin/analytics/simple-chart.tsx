"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SimpleChartProps {
  title: string
  description?: string
  data: any[]
  type: "line" | "bar"
  className?: string
}

export function SimpleChart({ title, description, data, type, className }: SimpleChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find the maximum value for scaling
  const maxValue = Math.max(
    ...data.map((item) => {
      if (typeof item === "object") {
        return Math.max(...Object.values(item).filter((val) => typeof val === "number"))
      }
      return 0
    }),
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] p-4">
          {type === "line" ? (
            <div className="relative h-full">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1="40" y1={40 + i * 32} x2="380" y2={40 + i * 32} stroke="#e5e7eb" strokeWidth="1" />
                ))}

                {/* Data line */}
                {data.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={data
                      .map((item, index) => {
                        const x = 40 + index * (340 / (data.length - 1))
                        const value =
                          typeof item === "object" ? Object.values(item).find((v) => typeof v === "number") || 0 : item
                        const y = 168 - ((value as number) / maxValue) * 128
                        return `${x},${y}`
                      })
                      .join(" ")}
                  />
                )}

                {/* Data points */}
                {data.map((item, index) => {
                  const x = 40 + index * (340 / Math.max(data.length - 1, 1))
                  const value =
                    typeof item === "object" ? Object.values(item).find((v) => typeof v === "number") || 0 : item
                  const y = 168 - ((value as number) / maxValue) * 128
                  return <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" />
                })}
              </svg>
            </div>
          ) : (
            <div className="flex items-end justify-between h-full gap-2">
              {data.slice(0, 10).map((item, index) => {
                const value =
                  typeof item === "object" ? Object.values(item).find((v) => typeof v === "number") || 0 : item
                const height = ((value as number) / maxValue) * 100
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="bg-blue-500 w-full rounded-t" style={{ height: `${height}%`, minHeight: "4px" }} />
                    <span className="text-xs mt-1 truncate w-full text-center">
                      {typeof item === "object" && "name" in item ? item.name : `Item ${index + 1}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
