import { supabase } from './lib/supabase'
import type { Card } from './types'

interface CardRow {
  id: string
  title: string
  assignee: string
  priority: Card['priority']
  due_date: string | null
  status: Card['status']
}

function fromRow(row: CardRow): Card {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    priority: row.priority,
    dueDate: row.due_date ?? '',
    status: row.status,
  }
}

export async function loadCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as CardRow[]).map(fromRow)
}

export async function insertCard(card: Omit<Card, 'id'>): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .insert({
      title: card.title,
      assignee: card.assignee,
      priority: card.priority,
      due_date: card.dueDate || null,
      status: card.status,
    })
    .select()
    .single()
  if (error) throw error
  return fromRow(data as CardRow)
}

export async function updateCard(id: string, card: Omit<Card, 'id'>): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({
      title: card.title,
      assignee: card.assignee,
      priority: card.priority,
      due_date: card.dueDate || null,
      status: card.status,
    })
    .eq('id', id)
  if (error) throw error
}

export async function updateCardStatus(id: string, status: Card['status']): Promise<void> {
  const { error } = await supabase.from('cards').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}
