import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Card } from '../types'
import { Board } from './Board'

const cards: Card[] = [
  { id: '1', title: 'Card in backlog', assignee: 'Ada', priority: 'Medium', dueDate: '', status: 'backlog' },
  { id: '2', title: 'Card in progress', assignee: 'Bob', priority: 'Low', dueDate: '', status: 'in-progress' },
]

function fakeDataTransfer() {
  return { setData: vi.fn(), effectAllowed: '' } as unknown as DataTransfer
}

describe('Board', () => {
  it('moves a card to another column on drag and drop', () => {
    const onMoveCard = vi.fn()
    render(
      <Board cards={cards} onMoveCard={onMoveCard} onCardClick={vi.fn()} onAddCard={vi.fn()} />,
    )

    const draggedCard = screen.getByText('Card in backlog')
    const targetColumn = screen.getByText('In Progress').closest('div')
    if (!targetColumn) throw new Error('target column not found')

    fireEvent.dragStart(draggedCard, { dataTransfer: fakeDataTransfer() })
    fireEvent.drop(targetColumn)

    expect(onMoveCard).toHaveBeenCalledWith('1', 'in-progress')
  })

  it('does not call onMoveCard when dropping without an active drag', () => {
    const onMoveCard = vi.fn()
    render(
      <Board cards={cards} onMoveCard={onMoveCard} onCardClick={vi.fn()} onAddCard={vi.fn()} />,
    )

    const targetColumn = screen.getByText('Done').closest('div')
    if (!targetColumn) throw new Error('target column not found')

    fireEvent.drop(targetColumn)

    expect(onMoveCard).not.toHaveBeenCalled()
  })

  it('calls onAddCard with the column id when "Add card" is clicked', async () => {
    const user = userEvent.setup()
    const onAddCard = vi.fn()
    render(<Board cards={cards} onMoveCard={vi.fn()} onCardClick={vi.fn()} onAddCard={onAddCard} />)

    const backlogColumn = screen.getByText('Backlog').closest('div')
    if (!backlogColumn) throw new Error('backlog column not found')
    const addButton = backlogColumn.parentElement?.querySelector('button')
    if (!addButton) throw new Error('add button not found')

    await user.click(addButton)

    expect(onAddCard).toHaveBeenCalledWith('backlog')
  })

  it('calls onCardClick when a card is clicked', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    render(<Board cards={cards} onMoveCard={vi.fn()} onCardClick={onCardClick} onAddCard={vi.fn()} />)

    await user.click(screen.getByText('Card in backlog'))

    expect(onCardClick).toHaveBeenCalledWith(cards[0])
  })
})
