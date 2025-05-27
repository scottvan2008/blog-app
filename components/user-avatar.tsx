"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  fallbackClassName?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

export default function UserAvatar({ src, name, className, fallbackClassName, size = "md" }: UserAvatarProps) {
  // Size classes for different avatar sizes
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  }

  // Get the first letter of the name for the fallback
  const fallbackText = name ? name.charAt(0).toUpperCase() : "U"

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src || ""} alt={name || "User"} />
      <AvatarFallback className={cn("bg-primary text-primary-foreground font-medium", fallbackClassName)}>
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  )
}
