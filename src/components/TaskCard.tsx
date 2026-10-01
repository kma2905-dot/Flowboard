import type { Card, Priority } from '../types'

interface TaskCardProps {
  card: Card
  onClick: () => void
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  isDragging: boolean
}

const PRIORITY_STYLES: Record<Priority, string> = {
  High: 'bg-red-50 text-red-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-green-50 text-green-700',
}

function formatDueDate(dueDate: string): string {
  if (!dueDate) return ''
  const [year, month, day] = dueDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function isOverdue(card: Card): boolean {
  if (!card.dueDate || card.status === 'done') return false
  const [year, month, day] = card.dueDate.split('-').map(Number)
  const due = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function initials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function TaskCard({ card, onClick, onDragStart, onDragEnd, isDragging }: TaskCardProps) {
  const overdue = isOverdue(card)

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className={`w-full cursor-pointer rounded-[10px] border border-black/10 bg-white px-3.5 py-3 text-left shadow-sm transition-opacity hover:border-black/20 ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <p className="text-sm leading-tight text-[#0a0a0a] break-words">{card.title}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-[10px] font-medium text-white">
            {initials(card.assignee)}
          </span>
          <span className="truncate text-xs text-[#717182]">{card.assignee}</span>
        </div>
        {card.dueDate && (
          <span
            className={`shrink-0 text-xs ${overdue ? 'font-medium text-[#d4183d]' : 'text-[#717182]'}`}
          >
            {formatDueDate(card.dueDate)}
          </span>
        )}
      </div>

      <span
        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[card.priority]}`}
      >
        {card.priority}
      </span>
    </div>
  )
}
