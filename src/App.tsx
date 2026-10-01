import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Board } from './components/Board'
import { CardModal } from './components/CardModal'
import { ErrorBanner } from './components/ErrorBanner'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCards()
      .then(setCards)
      .catch((err) => {
        console.error('Failed to load cards', err)
        setError('Failed to load the board. Check your connection and try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 6000)
    return () => clearTimeout(timer)
  }, [error])

  const handleMoveCard = (cardId: string, status: ColumnId) => {
    const previous = cards
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status } : c)))
    updateCardStatus(cardId, status).catch((err) => {
      console.error('Failed to move card', err)
      setCards(previous)
      setError('Failed to move the card. Please try again.')
    })
  }

  const handleSave: React.ComponentProps<typeof CardModal>['onSave'] = (data) => {
    if (modal?.card) {
      const id = modal.card.id
      const previous = cards
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
      updateCard(id, data).catch((err) => {
        console.error('Failed to update card', err)
        setCards(previous)
        setError('Failed to save your changes. Please try again.')
      })
    } else {
      insertCard(data)
        .then((card) => setCards((prev) => [...prev, card]))
        .catch((err) => {
          console.error('Failed to create card', err)
          setError('Failed to create the card. Please try again.')
        })
    }
    setModal(null)
  }

  const handleDelete = (id: string) => {
    const previous = cards
    setCards((prev) => prev.filter((c) => c.id !== id))
    deleteCard(id).catch((err) => {
      console.error('Failed to delete card', err)
      setCards(previous)
      setError('Failed to delete the card. Please try again.')
    })
    setModal(null)
  }

  return (
    <div className="min-h-svh bg-[#f3f4f6]">
      <Navbar />
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-16 text-[#717182]">
          <Loader2 className="size-5 animate-spin" strokeWidth={2} />
          <span className="text-sm">Loading board…</span>
        </div>
      ) : (
        <Board
          cards={cards}
          onMoveCard={handleMoveCard}
          onCardClick={(card) => setModal({ card, defaultStatus: card.status })}
          onAddCard={(status) => setModal({ card: null, defaultStatus: status })}
        />
      )}
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
