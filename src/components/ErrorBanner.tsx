import { X } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-red-700 hover:text-red-900"
      >
        <X className="size-4" strokeWidth={2} />
      </button>
    </div>
  )
}
