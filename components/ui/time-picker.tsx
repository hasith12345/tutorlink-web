"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronUp, ChevronDown, Clock } from "lucide-react"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TimePicker({ value, onChange, placeholder = "Select time..." }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hour, setHour] = useState("11")
  const [minute, setMinute] = useState("00")
  const [period, setPeriod] = useState("AM")
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      const hNum = parseInt(h)
      const p = hNum >= 12 ? "PM" : "AM"
      const h12 = hNum % 12 || 12
      setHour(String(h12).padStart(2, "0"))
      setMinute(m)
      setPeriod(p)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleConfirm = () => {
    let h24 = parseInt(hour)
    if (period === "PM" && h24 !== 12) h24 += 12
    if (period === "AM" && h24 === 12) h24 = 0
    onChange(`${String(h24).padStart(2, "0")}:${minute}`)
    setIsOpen(false)
  }

  const adjustHour = (delta: number) => {
    let h = parseInt(hour) + delta
    if (h > 12) h = 1
    if (h < 1) h = 12
    setHour(String(h).padStart(2, "0"))
  }

  const adjustMinute = (delta: number) => {
    let m = parseInt(minute) + delta
    if (m > 59) m = 0
    if (m < 0) m = 59
    setMinute(String(m).padStart(2, "0"))
  }

  const displayValue = value ? `${hour}:${minute} ${period}` : placeholder

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900 flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          {displayValue}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
          <div className="flex gap-4 items-center justify-center mb-4">
            {/* Hour */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => adjustHour(1)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value.padStart(2, "0").slice(-2))}
                className="w-16 text-center text-2xl font-bold border-2 border-indigo-500 rounded py-2 outline-none"
                maxLength={2}
              />
              <button
                type="button"
                onClick={() => adjustHour(-1)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Separator */}
            <span className="text-2xl font-bold">:</span>

            {/* Minute */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => adjustMinute(15)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value.padStart(2, "0").slice(-2))}
                className="w-16 text-center text-2xl font-bold border-2 border-indigo-500 rounded py-2 outline-none"
                maxLength={2}
              />
              <button
                type="button"
                onClick={() => adjustMinute(-15)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Period */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPeriod(period === "AM" ? "PM" : "AM")}
                className="px-3 py-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setPeriod(period === "AM" ? "PM" : "AM")}
                className="w-16 text-center text-2xl font-bold border-2 border-indigo-500 rounded py-2 transition-colors hover:bg-gray-50"
              >
                {period}
              </button>
              <button
                type="button"
                onClick={() => setPeriod(period === "AM" ? "PM" : "AM")}
                className="px-3 py-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
