import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Card } from '../types'
import { CardModal } from './CardModal'

const existingCard: Card = {
  id: '1',
  title: 'Write tests',
  assignee: 'Ada',
  priority: 'Medium',
  dueDate: '2026-10-20',
  status: 'backlog',
}

describe('CardModal', () => {
  it('passes the edited status through to onSave (status is editable from the modal)', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(
      <CardModal
        card={existingCard}
        defaultStatus="backlog"
        onClose={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Status'), 'in-review')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in-review', title: 'Write tests' }),
    )
  })

  it('requires confirmation before deleting: a single click does not call onDelete', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <CardModal
        card={existingCard}
        defaultStatus="backlog"
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete card' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByText('Delete this card?')).toBeInTheDocument()
  })

  it('calls onDelete only after the delete is confirmed', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <CardModal
        card={existingCard}
        defaultStatus="backlog"
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete card' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('cancelling the delete confirmation reverts without calling onDelete', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <CardModal
        card={existingCard}
        defaultStatus="backlog"
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete card' }))
    const confirmRow = screen.getByText('Delete this card?').closest('div')
    if (!confirmRow) throw new Error('confirm row not found')
    await user.click(within(confirmRow).getByRole('button', { name: 'Cancel' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Delete card' })).toBeInTheDocument()
  })

  it('does not render a delete button in create mode (no card)', () => {
    render(
      <CardModal card={null} defaultStatus="backlog" onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(screen.queryByRole('button', { name: 'Delete card' })).not.toBeInTheDocument()
  })

  it('disables Save until title, assignee and due date are all filled', async () => {
    const user = userEvent.setup()
    render(
      <CardModal card={null} defaultStatus="backlog" onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />,
    )

    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Enter card title...'), 'New card')
    expect(saveButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Enter assignee name...'), 'Grace')
    expect(saveButton).toBeDisabled()

    const dueDateInput = document.querySelector('input[type="date"]')
    if (!dueDateInput) throw new Error('due date input not found')
    fireEvent.change(dueDateInput, { target: { value: '2026-11-01' } })

    expect(saveButton).toBeEnabled()
  })

  it('calls onClose when the overlay is clicked but not when the panel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(
      <CardModal card={existingCard} defaultStatus="backlog" onClose={onClose} onSave={vi.fn()} onDelete={vi.fn()} />,
    )

    await user.click(screen.getByText('Edit Card'))
    expect(onClose).not.toHaveBeenCalled()

    const overlay = container.firstElementChild
    if (!(overlay instanceof HTMLElement)) throw new Error('overlay not found')
    await user.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
