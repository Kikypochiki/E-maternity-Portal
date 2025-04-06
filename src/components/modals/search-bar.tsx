"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export const SearchBar = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get the current search query from URL
  const query = searchParams.get("query") || ""

  // Update the URL with the search query
  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams)
      if (term) {
        params.set("query", term)
      } else {
        params.delete("query")
      }
      router.push(`dashboard/?${params.toString()}`)
    },
    [searchParams, router],
  )
    return (
      <div>
      <div className="flex items-center space-x-2 max-w-xs w-full">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search..."
            className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400 pr-10 w-full"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
        </div>
      </div>
    </div>
    )
}