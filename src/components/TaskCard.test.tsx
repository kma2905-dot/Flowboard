import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Card } from '../types'
import { TaskCard } from './TaskCard'

const baseCard: Card = {
  id: '1',
  title: 'Ship feature',
  assignee: 'Ada Lovelace',
  priority: 'Medium',
  dueDate: '',
  status: 'backlog',
}

function formatExpected(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function renderCard(card: Card) {
  return render(
    <TaskCard card={card} onClick={vi.fn()} onDragStart={vi.fn()} onDragEnd={vi.fn()} isDragging={false} />,
  )
}

describe('TaskCard isOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Pinned "today" for deterministic overdue comparisons.
    vi.setSystemTime(new Date(2026, 9, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is not overdue when due today', () => {
    renderCard({ ...baseCard, dueDate: '2026-10-15' })

    const dueDateEl = screen.getByText(formatExpected(2026, 10, 15))
    expect(dueDateEl).toHaveClass('text-[#717182]')
    expect(dueDateEl).not.toHaveClass('text-[#d4183d]')
  })

  it('is overdue when due yesterday and not done', () => {
    renderCard({ ...baseCard, dueDate: '2026-10-14', status: 'in-progress' })

    const dueDateEl = screen.getByText(formatExpected(2026, 10, 14))
    expect(dueDateEl).toHaveClass('font-medium')
    expect(dueDateEl).toHaveClass('text-[#d4183d]')
  })

  it('is not overdue when due tomorrow', () => {
    renderCard({ ...baseCard, dueDate: '2026-10-16' })

    const dueDateEl = screen.getByText(formatExpected(2026, 10, 16))
    expect(dueDateEl).toHaveClass('text-[#717182]')
  })

  it('is never overdue when status is done, even if the due date is in the past', () => {
    renderCard({ ...baseCard, dueDate: '2026-10-14', status: 'done' })

    const dueDateEl = screen.getByText(formatExpected(2026, 10, 14))
    expect(dueDateEl).toHaveClass('text-[#717182]')
    expect(dueDateEl).not.toHaveClass('text-[#d4183d]')
  })

  it('renders no due date element when dueDate is empty', () => {
    const { container } = renderCard({ ...baseCard, dueDate: '' })

    expect(container.querySelector('.shrink-0.text-xs')).toBeNull()
  })
})
