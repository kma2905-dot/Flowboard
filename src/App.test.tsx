import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Card } from './types'

vi.mock('./storage', () => ({
  loadCards: vi.fn(),
  insertCard: vi.fn(),
  updateCard: vi.fn(),
  updateCardStatus: vi.fn(),
  deleteCard: vi.fn(),
}))

const { loadCards, insertCard, updateCard, updateCardStatus, deleteCard } = await import(
  './storage'
)
const App = (await import('./App')).default

const initialCards: Card[] = [
  { id: '1', title: 'First card', assignee: 'Ada', priority: 'High', dueDate: '2026-10-05', status: 'backlog' },
  { id: '2', title: 'Second card', assignee: 'Bob', priority: 'Low', dueDate: '', status: 'in-progress' },
]

async function renderApp() {
  render(<App />)
  await screen.findByText('First card')
}

beforeEach(() => {
  vi.mocked(loadCards).mockResolvedValue(initialCards)
  vi.mocked(insertCard).mockReset()
  vi.mocked(updateCard).mockReset()
  vi.mocked(updateCardStatus).mockReset()
  vi.mocked(deleteCard).mockReset()
})

describe('App - load', () => {
  it('shows a spinner while loading, then the board', async () => {
    render(<App />)
    expect(screen.getByText('Loading board…')).toBeInTheDocument()
    await screen.findByText('First card')
    expect(screen.queryByText('Loading board…')).not.toBeInTheDocument()
  })

  it('shows an error banner if loading fails', async () => {
    vi.mocked(loadCards).mockRejectedValue(new Error('down'))
    render(<App />)

    expect(
      await screen.findByText('Failed to load the board. Check your connection and try again.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loading board…')).not.toBeInTheDocument()
  })
})

describe('App - move card (regression: rollback on failure)', () => {
  it('keeps the move when updateCardStatus succeeds', async () => {
    vi.mocked(updateCardStatus).mockResolvedValue(undefined)
    await renderApp()

    // Drag "First card" (backlog) into the "In Progress" column.
    const { fireEvent } = await import('@testing-library/react')
    const draggedCard = screen.getByText('First card')
    const targetColumn = screen.getByText('In Progress').closest('div')
    if (!targetColumn) throw new Error('target column not found')

    fireEvent.dragStart(draggedCard, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
    fireEvent.drop(targetColumn)

    await waitFor(() => expect(updateCardStatus).toHaveBeenCalledWith('1', 'in-progress'))
    expect(screen.queryByText(/Failed to move/)).not.toBeInTheDocument()
  })

  it('rolls back the move and shows an error banner when updateCardStatus fails', async () => {
    vi.mocked(updateCardStatus).mockRejectedValue(new Error('offline'))
    await renderApp()

    const { fireEvent } = await import('@testing-library/react')
    const draggedCard = screen.getByText('First card')
    const targetColumn = screen.getByText('In Progress').closest('div')
    if (!targetColumn) throw new Error('target column not found')

    fireEvent.dragStart(draggedCard, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
    fireEvent.drop(targetColumn)

    expect(
      await screen.findByText('Failed to move the card. Please try again.'),
    ).toBeInTheDocument()

    // The card must be back in its original (backlog) column, not stuck in "in-progress".
    const backlogColumn = screen.getByText('Backlog').closest('div')?.parentElement
    if (!backlogColumn) throw new Error('backlog column not found')
    expect(backlogColumn.textContent).toContain('First card')
  })
})

describe('App - save card (regression: rollback on failure)', () => {
  it('keeps the update when updateCard succeeds', async () => {
    vi.mocked(updateCard).mockResolvedValue(undefined)
    await renderApp()

    await userEvent.setup().click(screen.getByText('First card'))
    const titleInput = screen.getByPlaceholderText('Enter card title...')
    await userEvent.setup().clear(titleInput)
    await userEvent.setup().type(titleInput, 'Updated title')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(updateCard).toHaveBeenCalled())
    expect(await screen.findByText('Updated title')).toBeInTheDocument()
    expect(screen.queryByText(/Failed to save/)).not.toBeInTheDocument()
  })

  it('rolls back the edit and shows an error banner when updateCard fails', async () => {
    vi.mocked(updateCard).mockRejectedValue(new Error('offline'))
    await renderApp()

    const user = userEvent.setup()
    await user.click(screen.getByText('First card'))
    const titleInput = screen.getByPlaceholderText('Enter card title...')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated title')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('Failed to save your changes. Please try again.'),
    ).toBeInTheDocument()
    expect(screen.getByText('First card')).toBeInTheDocument()
    expect(screen.queryByText('Updated title')).not.toBeInTheDocument()
  })

  it('does not add a card when insertCard fails', async () => {
    vi.mocked(insertCard).mockRejectedValue(new Error('offline'))
    await renderApp()

    const user = userEvent.setup()
    const backlogColumn = screen.getByText('Backlog').closest('div')?.parentElement
    if (!backlogColumn) throw new Error('backlog column not found')
    const addButton = Array.from(backlogColumn.querySelectorAll('button')).find(
      (b) => b.textContent === 'Add card',
    )
    if (!addButton) throw new Error('add button not found')
    await user.click(addButton)

    await user.type(screen.getByPlaceholderText('Enter card title...'), 'New card')
    await user.type(screen.getByPlaceholderText('Enter assignee name...'), 'Grace')
    const dueDateInput = document.querySelector('input[type="date"]')
    if (!dueDateInput) throw new Error('due date input not found')
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(dueDateInput, { target: { value: '2026-11-01' } })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('Failed to create the card. Please try again.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('New card')).not.toBeInTheDocument()
  })
})

describe('App - delete card (regression: rollback on failure)', () => {
  it('removes the card when deleteCard succeeds', async () => {
    vi.mocked(deleteCard).mockResolvedValue(undefined)
    await renderApp()

    const user = userEvent.setup()
    await user.click(screen.getByText('First card'))
    await user.click(screen.getByRole('button', { name: 'Delete card' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))

    await waitFor(() => expect(screen.queryByText('First card')).not.toBeInTheDocument())
    expect(screen.queryByText(/Failed to delete/)).not.toBeInTheDocument()
  })

  it('restores the card and shows an error banner when deleteCard fails', async () => {
    vi.mocked(deleteCard).mockRejectedValue(new Error('offline'))
    await renderApp()

    const user = userEvent.setup()
    await user.click(screen.getByText('First card'))
    await user.click(screen.getByRole('button', { name: 'Delete card' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))

    expect(
      await screen.findByText('Failed to delete the card. Please try again.'),
    ).toBeInTheDocument()
    expect(screen.getByText('First card')).toBeInTheDocument()
  })
})

describe('App - error banner auto-dismiss', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('auto-dismisses the error banner after 6 seconds', async () => {
    vi.mocked(loadCards).mockRejectedValue(new Error('down'))
    render(<App />)

    await vi.waitFor(() =>
      expect(
        screen.getByText('Failed to load the board. Check your connection and try again.'),
      ).toBeInTheDocument(),
    )

    vi.advanceTimersByTime(6000)

    await vi.waitFor(() =>
      expect(
        screen.queryByText('Failed to load the board. Check your connection and try again.'),
      ).not.toBeInTheDocument(),
    )
  })

  it('dismisses the error banner immediately when the dismiss button is clicked', async () => {
    vi.mocked(loadCards).mockRejectedValue(new Error('down'))
    const user = userEvent.setup({ delay: null })
    render(<App />)

    await vi.waitFor(() =>
      expect(
        screen.getByText('Failed to load the board. Check your connection and try again.'),
      ).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(
      screen.queryByText('Failed to load the board. Check your connection and try again.'),
    ).not.toBeInTheDocument()
  })
})
