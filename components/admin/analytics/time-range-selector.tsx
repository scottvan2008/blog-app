"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TimeRange {
  start: Date
  end: Date
}

interface TimeRangeSelectorProps {
  onChange: (range: TimeRange) => void
  defaultRange: TimeRange
}

export function TimeRangeSelector({ onChange, defaultRange }: TimeRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState("30d")
  const [customStart, setCustomStart] = useState<Date>(defaultRange.start)
  const [customEnd, setCustomEnd] = useState<Date>(defaultRange.end)

  const handlePresetChange = (value: string) => {
    setSelectedRange(value)
    const end = new Date()
    const start = new Date()

    switch (value) {
      case "7d":
        start.setDate(end.getDate() - 7)
        break
      case "30d":
        start.setDate(end.getDate() - 30)
        break
      case "90d":
        start.setDate(end.getDate() - 90)
        break
      case "1y":
        start.setFullYear(end.getFullYear() - 1)
        break
      case "custom":
        return // Don't update dates for custom
    }

    onChange({ start, end })
  }

  const handleCustomDateChange = () => {
    if (customStart && customEnd) {
      onChange({ start: customStart, end: customEnd })
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select value={selectedRange} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {selectedRange === "custom" && (
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[140px] justify-start text-left font-normal", !customStart && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStart ? format(customStart, "PPP") : <span>Start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customStart}
                onSelect={(date) => date && setCustomStart(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[140px] justify-start text-left font-normal", !customEnd && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customEnd ? format(customEnd, "PPP") : <span>End date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customEnd}
                onSelect={(date) => date && setCustomEnd(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleCustomDateChange}>Apply</Button>
        </div>
      )}
    </div>
  )
}
