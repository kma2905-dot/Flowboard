import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { Card, ColumnDef } from '../types'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  column: ColumnDef
  cards: Card[]
  draggingCardId: string | null
  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void
  onDragEndCard: () => void
  onDropCard: (columnId: ColumnDef['id']) => void
  onCardClick: (card: Card) => void
  onAddCard: (columnId: ColumnDef['id']) => void
}

export function Column({
  column,
  cards,
  draggingCardId,
  onDragStartCard,
  onDragEndCard,
  onDropCard,
  onCardClick,
  onAddCard,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false)
        onDropCard(column.id)
      }}
      className={`flex w-[280px] shrink-0 flex-col gap-4 rounded-[10px] bg-[#f3f4f6] p-4 transition-colors ${
        isDragOver ? 'ring-2 ring-[#0369a1]/40' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#0a0a0a]">{column.title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#717182]">
          {cards.length}
        </span>
      </div>

      <div className="flex min-h-[80px] flex-1 flex-col gap-2">
        {cards.map((card) => (
          <TaskCard
            key={card.id}
            card={card}
            isDragging={draggingCardId === card.id}
            onClick={() => onCardClick(card)}
            onDragStart={(e) => onDragStartCard(e, card.id)}
            onDragEnd={onDragEndCard}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddCard(column.id)}
        className="flex items-center gap-2 text-sm font-medium text-[#717182] hover:text-[#0a0a0a]"
      >
        <Plus className="size-4" strokeWidth={2} />
        Add card
      </button>
    </div>
  )
}
