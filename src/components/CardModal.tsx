import { X } from 'lucide-react'
import { useState } from 'react'
import type { Card, ColumnId, Priority } from '../types'
import { PRIORITIES } from '../types'

interface CardModalProps {
  card: Card | null
  defaultStatus: ColumnId
  onClose: () => void
  onSave: (data: Omit<Card, 'id' | 'status'> & { status: ColumnId }) => void
  onDelete: (id: string) => void
}

const inputClass =
  'w-full rounded-[10px] border border-black/10 bg-white px-3 py-2.5 text-base text-[#0a0a0a] placeholder:text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#0369a1]/40'

const labelClass = 'text-sm font-medium text-[#0a0a0a]'

export function CardModal({ card, defaultStatus, onClose, onSave, onDelete }: CardModalProps) {
  const [title, setTitle] = useState(card?.title ?? '')
  const [assignee, setAssignee] = useState(card?.assignee ?? '')
  const [priority, setPriority] = useState<Priority>(card?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(card?.dueDate ?? '')

  const isValid = title.trim().length > 0 && assignee.trim().length > 0 && dueDate.length > 0

  const handleSave = () => {
    if (!isValid) return
    onSave({ title: title.trim(), assignee: assignee.trim(), priority, dueDate, status: card?.status ?? defaultStatus })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[512px] flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#0a0a0a]">{card ? 'Edit Card' : 'New Card'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#717182] hover:text-[#0a0a0a]"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Title</span>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Assignee</span>
            <input
              className={inputClass}
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter assignee name..."
            />
          </label>

          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>Priority</span>
              <select
                className={inputClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>Due Date</span>
              <input
                type="date"
                className={inputClass}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-4">
            {card ? (
              <button
                type="button"
                onClick={() => onDelete(card.id)}
                className="text-sm font-medium text-[#d4183d] hover:underline"
              >
                Delete card
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[10px] px-4 py-2.5 text-base font-medium text-[#0a0a0a] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="rounded-[10px] bg-[#0369a1] px-4 py-2.5 text-base font-medium text-white disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
