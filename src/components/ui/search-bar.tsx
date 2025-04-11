"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { debounce } from "lodash"

export const SearchBar = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams?.get("query") || "")

  const handleSearch = useCallback(
    debounce((term: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "")
      if (term) {
        params.set("query", term)
      } else {
        params.delete("query")
      }
      router.push(`dashboard/?${params.toString()}`)
    }, 300),
    [searchParams, router],
  )

  return (
    <div>
      <div className="flex items-center space-x-2 max-w-xs w-full">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search..."
            className="pr-10 w-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              handleSearch(e.target.value)
            }}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
        </div>
      </div>
    </div>
  )
}

