import { useState } from 'react'
import { COLUMNS } from '../types'
import type { Card, ColumnId } from '../types'
import { Column } from './Column'

interface BoardProps {
  cards: Card[]
  onMoveCard: (cardId: string, status: ColumnId) => void
  onCardClick: (card: Card) => void
  onAddCard: (status: ColumnId) => void
}

export function Board({ cards, onMoveCard, onCardClick, onAddCard }: BoardProps) {
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)

  return (
    <div className="flex gap-4 overflow-x-auto p-6">
      {COLUMNS.map((column) => (
        <Column
          key={column.id}
          column={column}
          cards={cards.filter((c) => c.status === column.id)}
          draggingCardId={draggingCardId}
          onDragStartCard={(e, cardId) => {
            setDraggingCardId(cardId)
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', cardId)
          }}
          onDragEndCard={() => setDraggingCardId(null)}
          onDropCard={(columnId) => {
            if (draggingCardId) {
              onMoveCard(draggingCardId, columnId)
            }
            setDraggingCardId(null)
          }}
          onCardClick={onCardClick}
          onAddCard={onAddCard}
        />
      ))}
    </div>
  )
}
