import * as React from "react"
import { Search, Package } from "lucide-react"
import { Button } from "@/components/ui"
import { cn } from "@/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title = "No items found",
  message = "We couldn't find any items matching your criteria.",
  action,
  className,
}: EmptyStateProps) {
  const defaultIcon = icon || <Package className="h-12 w-12 text-muted-foreground" />

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="mb-4">{defaultIcon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Specialized empty states
export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12 text-muted-foreground" />}
      title="No results found"
      message={`We couldn't find any items matching "${query}". Try adjusting your search terms.`}
    />
  )
}
