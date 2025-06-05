"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EnhancedChartProps {
  title: string
  description?: string
  data: any[]
  type: "line" | "bar" | "area"
  className?: string
  colors?: string[]
  showGrid?: boolean
  showTooltip?: boolean
  height?: number
}

export function EnhancedChart({
  title,
  description,
  data,
  type,
  className,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
  showGrid = true,
  showTooltip = true,
  height = 300,
}: EnhancedChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-4">
          <div
            className="flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">No data available</div>
              <div className="text-sm">Data will appear here once available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find the maximum value for scaling
  const maxValue = Math.max(
    ...data.map((item) => {
      if (typeof item === "object") {
        const numericValues = Object.values(item).filter((val) => typeof val === "number")
        return numericValues.length > 0 ? Math.max(...(numericValues as number[])) : 0
      }
      return typeof item === "number" ? item : 0
    }),
  )

  const minValue = Math.min(
    ...data.map((item) => {
      if (typeof item === "object") {
        const numericValues = Object.values(item).filter((val) => typeof val === "number")
        return numericValues.length > 0 ? Math.min(...(numericValues as number[])) : 0
      }
      return typeof item === "number" ? item : 0
    }),
  )

  const chartHeight = height - 80
  const chartWidth = 400
  const padding = { top: 20, right: 40, bottom: 40, left: 60 }

  // Generate Y-axis labels
  const yAxisSteps = 5
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = minValue + (maxValue - minValue) * (i / yAxisSteps)
    return Math.round(value * 100) / 100
  }).reverse()

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative" style={{ height: `${height}px` }}>
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`}
          >
            {/* Background */}
            <rect
              x={padding.left}
              y={padding.top}
              width={chartWidth}
              height={chartHeight}
              fill="transparent"
              stroke="none"
            />

            {/* Grid lines */}
            {showGrid && (
              <g>
                {/* Horizontal grid lines */}
                {yAxisLabels.map((_, index) => {
                  const y = padding.top + (index * chartHeight) / yAxisSteps
                  return (
                    <line
                      key={`h-grid-${index}`}
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartWidth}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  )
                })}
                {/* Vertical grid lines */}
                {data.slice(0, 10).map((_, index) => {
                  const x = padding.left + (index * chartWidth) / Math.max(data.length - 1, 1)
                  return (
                    <line
                      key={`v-grid-${index}`}
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + chartHeight}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  )
                })}
              </g>
            )}

            {/* Y-axis labels */}
            {yAxisLabels.map((label, index) => {
              const y = padding.top + (index * chartHeight) / yAxisSteps
              return (
                <text
                  key={`y-label-${index}`}
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                  fontFamily="system-ui"
                >
                  {label}
                </text>
              )
            })}

            {/* Chart content */}
            {type === "line" && (
              <g>
                {/* Line path */}
                {data.length > 1 && (
                  <path
                    d={data
                      .map((item, index) => {
                        const x = padding.left + (index * chartWidth) / Math.max(data.length - 1, 1)
                        const value =
                          typeof item === "object" ? Object.values(item).find((v) => typeof v === "number") || 0 : item
                        const y =
                          padding.top +
                          chartHeight -
                          (((value as number) - minValue) / (maxValue - minValue)) * chartHeight
                        return `${index === 0 ? "M" : "L"} ${x} ${y}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke={colors[0]}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {data.map((item, index) => {
                  const x = padding.left + (index * chartWidth) / Math.max(data.length - 1, 1)
                  const value =
                    typeof item === "object" ? Object.values(item).find((v) => typeof v === "number") || 0 : item
                  const y =
                    padding.top + chartHeight - (((value as number) - minValue) / (maxValue - minValue)) * chartHeight
                  return (
                    <g key={`point-${index}`}>
                      <circle cx={x} cy={y} r="4" fill="white" stroke={colors[0]} strokeWidth="2" />
                      <circle cx={x} cy={y} r="2" fill={colors[0]} />
                    </g>
                  )
                })}
              </g>
            )}

            {type === "area" && (
              <g>
                {/* Area fill */}
                {data.length > 1 && (
                  <path
                    d={
                      data
                        .map((item, index) => {
                          const x = padding.left + (index * chartWidth) / Math.max(data.length - 1, 1)
                          const value =
                            typeof item === "object"
                              ? Object.values(item).find((v) => typeof v === "number") || 0
                              : item
                          const y =
                            padding.top +
                            chartHeight -
                            (((value as number) - minValue) / (maxValue - minValue)) * chartHeight
                          return `${index === 0 ? "M" : "L"} ${x} ${y}`
                        })
                        .join(" ") +
                      ` L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`
                    }
                    fill={`url(#gradient-${colors[0].replace("#", "")})`}
                    stroke={colors[0]}
                    strokeWidth="2"
                  />
                )}

                {/* Gradient definition */}
                <defs>
                  <linearGradient id={`gradient-${colors[0].replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colors[0]} stopOpacity="0.05" />
                  </linearGradient>
                </defs>
              </g>
            )}

            {type === "bar" && (
              <g>
                {data.slice(0, 10).map((item, index) => {
                  const barWidth = (chartWidth / Math.min(data.length, 10)) * 0.7
                  const x = padding.left + (index * chartWidth) / Math.min(data.length, 10) + barWidth * 0.15
                  const value =
                    typeof item === "object" ? Object.values(item).find((v) => typeof v === "number") || 0 : item
                  const barHeight = (((value as number) - minValue) / (maxValue - minValue)) * chartHeight
                  const y = padding.top + chartHeight - barHeight

                  return (
                    <g key={`bar-${index}`}>
                      {/* Bar shadow */}
                      <rect x={x + 2} y={y + 2} width={barWidth} height={barHeight} fill="black" opacity="0.1" rx="4" />
                      {/* Main bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={colors[index % colors.length]}
                        rx="4"
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      {/* Value label on top of bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#374151"
                        fontWeight="500"
                        fontFamily="system-ui"
                      >
                        {value}
                      </text>
                    </g>
                  )
                })}
              </g>
            )}

            {/* X-axis labels */}
            {data.slice(0, 10).map((item, index) => {
              const x = padding.left + (index * chartWidth) / Math.max(Math.min(data.length, 10) - 1, 1)
              const label =
                typeof item === "object" && "name" in item
                  ? item.name
                  : typeof item === "object" && "date" in item
                    ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : `Item ${index + 1}`

              return (
                <text
                  key={`x-label-${index}`}
                  x={x}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6b7280"
                  fontFamily="system-ui"
                  className="max-w-[60px] truncate"
                >
                  {String(label).length > 8 ? `${String(label).substring(0, 8)}...` : label}
                </text>
              )
            })}
          </svg>

          {/* Legend for multi-line charts */}
          {type === "line" && data.length > 0 && typeof data[0] === "object" && Object.keys(data[0]).length > 2 && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border rounded-lg p-2 shadow-sm">
              {Object.keys(data[0])
                .filter((key) => key !== "date" && key !== "name")
                .slice(0, 4)
                .map((key, index) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
