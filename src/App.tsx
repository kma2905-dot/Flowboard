import { useEffect, useState } from 'react'
import { Board } from './components/Board'
import { CardModal } from './components/CardModal'
import { Navbar } from './components/Navbar'
import { deleteCard, insertCard, loadCards, updateCard, updateCardStatus } from './storage'
import type { Card, ColumnId } from './types'

interface ModalState {
  card: Card | null
  defaultStatus: ColumnId
}

function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [modal, setModal] = useState<ModalState | null>(null)

  useEffect(() => {
    loadCards()
      .then(setCards)
      .catch((err) => console.error('Failed to load cards', err))
  }, [])

  const handleMoveCard = (cardId: string, status: ColumnId) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status } : c)))
    updateCardStatus(cardId, status).catch((err) => console.error('Failed to move card', err))
  }

  const handleSave: React.ComponentProps<typeof CardModal>['onSave'] = (data) => {
    if (modal?.card) {
      const id = modal.card.id
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
      updateCard(id, data).catch((err) => console.error('Failed to update card', err))
    } else {
      insertCard(data)
        .then((card) => setCards((prev) => [...prev, card]))
        .catch((err) => console.error('Failed to create card', err))
    }
    setModal(null)
  }

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    deleteCard(id).catch((err) => console.error('Failed to delete card', err))
    setModal(null)
  }

  return (
    <div className="min-h-svh bg-[#f3f4f6]">
      <Navbar />
      <Board
        cards={cards}
        onMoveCard={handleMoveCard}
        onCardClick={(card) => setModal({ card, defaultStatus: card.status })}
        onAddCard={(status) => setModal({ card: null, defaultStatus: status })}
      />
      {modal && (
        <CardModal
          card={modal.card}
          defaultStatus={modal.defaultStatus}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default App
