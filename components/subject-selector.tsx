"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronDown, Plus } from "lucide-react"

interface SubjectSelectorProps {
  values: string[]
  onChange: (values: string[]) => void
  onError?: (error: string) => void
  placeholder?: string
  className?: string
}

export function SubjectSelector({
  values,
  onChange,
  onError,
  placeholder = "Search or add subjects...",
  className = ""
}: SubjectSelectorProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [customSubjects, setCustomSubjects] = useState<Set<string>>(new Set())
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [allSubjects, setAllSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load subjects from public/data/subjects.json
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await fetch('/data/subjects.json')
        if (!response.ok) throw new Error('Failed to load subjects')
        const data = await response.json()
        setAllSubjects(data.subjects)
      } catch (error) {
        console.error('Error loading subjects:', error)
        onError?.('Failed to load subjects list')
      } finally {
        setIsLoading(false)
      }
    }
    loadSubjects()
  }, [])
  const selectedSet = new Set(values)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filterSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setHighlightedIndex(-1)
      return
    }

    const lowerQuery = query.toLowerCase().trim()
    const filtered = allSubjects.filter(
      subject =>
        subject.toLowerCase().includes(lowerQuery) && !selectedSet.has(subject)
    )

    // Check if input could be a custom subject
    const isCustom =
      !allSubjects.some(s => s.toLowerCase() === lowerQuery) &&
      lowerQuery.length > 0 &&
      !selectedSet.has(query.trim())

    setSuggestions(filtered.slice(0, 8)) // Limit to 8 suggestions
    setHighlightedIndex(isCustom ? -2 : -1) // -2 indicates "Add custom"
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    filterSuggestions(value)
    setIsOpen(true)
  }

  const addSubject = (subject: string) => {
    const trimmed = subject.trim()
    if (!trimmed) return

    if (selectedSet.has(trimmed)) {
      onError?.("Subject already added")
      return
    }

    onChange([...values, trimmed])
    setInputValue("")
    setSuggestions([])
    setHighlightedIndex(-1)
  }

  const handleAddCustom = () => {
    if (inputValue.trim()) {
      addSubject(inputValue)
      setCustomSubjects(prev => new Set([...prev, inputValue.trim()]))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== "Enter") return

    const totalOptions = suggestions.length + (inputValue.trim() ? 1 : 0)

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(prev =>
          prev < totalOptions - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex === -2) {
          handleAddCustom()
        } else if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          addSubject(suggestions[highlightedIndex])
        } else if (inputValue.trim()) {
          handleAddCustom()
        }
        setIsOpen(false)
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        setInputValue("")
        setSuggestions([])
        break
      default:
        break
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Input Field */}
        <div className="flex gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 flex-wrap bg-white min-h-[44px]">
          {/* Selected subjects */}
          {values.filter(s => s.trim()).map((subject, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
            >
              {subject}
              <button
                type="button"
                onClick={() => onChange(values.filter(s => s !== subject))}
                className="hover:text-indigo-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setIsOpen(true)}
            placeholder={values.length === 0 ? placeholder : "Add another..."}
            className="flex-1 min-w-[200px] outline-none text-sm py-1 px-2 bg-transparent"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (inputValue || suggestions.length > 0) && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
          >
            {suggestions.length > 0 || inputValue.trim() ? (
              <div className="max-h-64 overflow-y-auto">
                {/* Suggestions */}
                {suggestions.map((subject, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addSubject(subject)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      highlightedIndex === idx
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {subject}
                  </button>
                ))}

                {/* Add Custom Option */}
                {inputValue.trim() &&
                  !allSubjects.includes(inputValue.trim()) && (
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      className={`w-full text-left px-4 py-2.5 text-sm border-t border-gray-200 font-medium transition-colors ${
                        highlightedIndex === -2
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-indigo-600 hover:bg-indigo-50"
                      } flex items-center gap-2`}
                    >
                      <Plus className="w-4 h-4" />
                      Add "{inputValue.trim()}" as custom subject
                    </button>
                  )}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No subjects found. Start typing to search or add a custom subject.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        {values.length === 0
          ? "Search from the list or add custom subjects"
          : `${values.length} subject${values.length !== 1 ? "s" : ""} added`}
      </p>
    </div>
  )
}
