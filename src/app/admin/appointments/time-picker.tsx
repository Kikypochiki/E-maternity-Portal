"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function TimePickerDemo({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const secondRef = React.useRef<HTMLInputElement>(null)

  const [hour, setHour] = React.useState<string>(date ? String(date.getHours()).padStart(2, "0") : "12")
  const [minute, setMinute] = React.useState<string>(date ? String(date.getMinutes()).padStart(2, "0") : "00")
  const [second, setSecond] = React.useState<string>(date ? String(date.getSeconds()).padStart(2, "0") : "00")

  // Update the date when the hour, minute, or second changes
  React.useEffect(() => {
    if (!date) return

    const newDate = new Date(date)
    newDate.setHours(Number.parseInt(hour))
    newDate.setMinutes(Number.parseInt(minute))
    newDate.setSeconds(Number.parseInt(second))
    setDate(newDate)
  }, [hour, minute, second, setDate, date])

  // Update the hour, minute, and second when the date changes
  React.useEffect(() => {
    if (!date) return

    setHour(String(date.getHours()).padStart(2, "0"))
    setMinute(String(date.getMinutes()).padStart(2, "0"))
    setSecond(String(date.getSeconds()).padStart(2, "0"))
  }, [date])

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setHour("")
      return
    }

    const numericValue = Number.parseInt(value)
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue < 24) {
      setHour(String(numericValue).padStart(2, "0"))
      if (value.length === 2) {
        minuteRef.current?.focus()
      }
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setMinute("")
      return
    }

    const numericValue = Number.parseInt(value)
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue < 60) {
      setMinute(String(numericValue).padStart(2, "0"))
      if (value.length === 2) {
        secondRef.current?.focus()
      }
    }
  }

  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setSecond("")
      return
    }

    const numericValue = Number.parseInt(value)
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue < 60) {
      setSecond(String(numericValue).padStart(2, "0"))
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center"
          value={hour}
          onChange={handleHourChange}
          maxLength={2}
        />
      </div>
      <div className="text-center text-2xl mb-2">:</div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center"
          value={minute}
          onChange={handleMinuteChange}
          maxLength={2}
        />
      </div>
      <div className="text-center text-2xl mb-2">:</div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          Seconds
        </Label>
        <Input
          ref={secondRef}
          id="seconds"
          className="w-16 text-center"
          value={second}
          onChange={handleSecondChange}
          maxLength={2}
        />
      </div>
    </div>
  )
}
