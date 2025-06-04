"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  icon?: React.ReactNode
  color?: "blue" | "green" | "orange" | "red" | "purple"
  className?: string
}

const colorVariants = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    accent: "bg-blue-600",
    trend: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    accent: "bg-green-600",
    trend: "text-green-600",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    accent: "bg-orange-600",
    trend: "text-orange-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    accent: "bg-red-600",
    trend: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    accent: "bg-purple-600",
    trend: "text-purple-600",
  },
}

export function MetricCard({ title, value, change, icon, color = "blue", className }: MetricCardProps) {
  const colors = colorVariants[color]
  const isPositive = change ? change.value > 0 : null
  const isNegative = change ? change.value < 0 : null

  return (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {change && (
              <div className="flex items-center mt-2 text-sm">
                {isPositive && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
                {isNegative && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
                {!isPositive && !isNegative && <Minus className="h-4 w-4 text-gray-400 mr-1" />}
                <span
                  className={cn(
                    "font-medium",
                    isPositive && "text-green-600",
                    isNegative && "text-red-600",
                    !isPositive && !isNegative && "text-gray-400",
                  )}
                >
                  {isPositive && "+"}
                  {change.value}%
                </span>
                <span className="text-muted-foreground ml-1">{change.period}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("p-3 rounded-full", colors.bg)}>
              <div className={cn("h-6 w-6", colors.icon)}>{icon}</div>
            </div>
          )}
        </div>
        <div className={cn("h-1 w-full rounded-full mt-4", colors.bg)}>
          <div className={cn("h-1 rounded-full transition-all duration-500", colors.accent)} style={{ width: "75%" }} />
        </div>
      </CardContent>
    </Card>
  )
}
