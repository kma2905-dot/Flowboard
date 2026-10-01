import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockResult } from './test/supabaseMock'
import { createQueryBuilder } from './test/supabaseMock'

vi.mock('./lib/supabase', () => ({ supabase: { from: vi.fn() } }))

const { supabase } = await import('./lib/supabase')
const { loadCards, insertCard, updateCard, updateCardStatus, deleteCard } = await import(
  './storage'
)

const from = vi.mocked(supabase.from)

function mockFrom<T>(result: MockResult<T>) {
  const builder = createQueryBuilder(result)
  from.mockReturnValue(builder as never)
  return builder
}

beforeEach(() => {
  from.mockReset()
})

describe('loadCards', () => {
  it('maps rows and turns a null due_date into an empty string', async () => {
    mockFrom({
      data: [
        {
          id: '1',
          title: 'Write docs',
          assignee: 'Ada',
          priority: 'High',
          due_date: null,
          status: 'backlog',
        },
      ],
      error: null,
    })

    const cards = await loadCards()

    expect(from).toHaveBeenCalledWith('cards')
    expect(cards).toEqual([
      { id: '1', title: 'Write docs', assignee: 'Ada', priority: 'High', dueDate: '', status: 'backlog' },
    ])
  })

  it('preserves a non-null due_date', async () => {
    mockFrom({
      data: [
        {
          id: '2',
          title: 'Ship release',
          assignee: 'Grace',
          priority: 'Medium',
          due_date: '2026-10-05',
          status: 'in-progress',
        },
      ],
      error: null,
    })

    const cards = await loadCards()

    expect(cards[0].dueDate).toBe('2026-10-05')
  })

  it('throws the supabase error on failure', async () => {
    mockFrom({ data: null, error: { message: 'network down' } })

    await expect(loadCards()).rejects.toEqual({ message: 'network down' })
  })
})

describe('insertCard', () => {
  it('coerces an empty dueDate to null when writing', async () => {
    const builder = mockFrom({
      data: {
        id: '3',
        title: 'New task',
        assignee: 'Bob',
        priority: 'Low',
        due_date: null,
        status: 'backlog',
      },
      error: null,
    })

    const card = await insertCard({
      title: 'New task',
      assignee: 'Bob',
      priority: 'Low',
      dueDate: '',
      status: 'backlog',
    })

    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({ due_date: null }))
    expect(card.dueDate).toBe('')
  })

  it('throws the supabase error on failure', async () => {
    mockFrom({ data: null, error: { message: 'insert failed' } })

    await expect(
      insertCard({ title: 'x', assignee: 'y', priority: 'Low', dueDate: '', status: 'backlog' }),
    ).rejects.toEqual({ message: 'insert failed' })
  })
})

describe('updateCard', () => {
  it('updates by id and coerces an empty dueDate to null', async () => {
    const builder = mockFrom({ data: null, error: null })

    await updateCard('5', {
      title: 'Updated',
      assignee: 'Ada',
      priority: 'High',
      dueDate: '',
      status: 'done',
    })

    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ due_date: null }))
    expect(builder.eq).toHaveBeenCalledWith('id', '5')
  })

  it('throws the supabase error on failure', async () => {
    mockFrom({ data: null, error: { message: 'update failed' } })

    await expect(
      updateCard('5', { title: 'x', assignee: 'y', priority: 'Low', dueDate: '', status: 'backlog' }),
    ).rejects.toEqual({ message: 'update failed' })
  })
})

describe('updateCardStatus', () => {
  it('updates only the status by id', async () => {
    const builder = mockFrom({ data: null, error: null })

    await updateCardStatus('7', 'in-review')

    expect(builder.update).toHaveBeenCalledWith({ status: 'in-review' })
    expect(builder.eq).toHaveBeenCalledWith('id', '7')
  })

  it('throws the supabase error on failure', async () => {
    mockFrom({ data: null, error: { message: 'move failed' } })

    await expect(updateCardStatus('7', 'done')).rejects.toEqual({ message: 'move failed' })
  })
})

describe('deleteCard', () => {
  it('deletes by id', async () => {
    const builder = mockFrom({ data: null, error: null })

    await deleteCard('9')

    expect(builder.eq).toHaveBeenCalledWith('id', '9')
  })

  it('throws the supabase error on failure', async () => {
    mockFrom({ data: null, error: { message: 'delete failed' } })

    await expect(deleteCard('9')).rejects.toEqual({ message: 'delete failed' })
  })
})
