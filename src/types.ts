export type Priority = 'High' | 'Medium' | 'Low'

export type ColumnId = 'backlog' | 'in-progress' | 'in-review' | 'done'

export interface Card {
  id: string
  title: string
  assignee: string
  priority: Priority
  dueDate: string
  status: ColumnId
}

export interface ColumnDef {
  id: ColumnId
  title: string
}

export const COLUMNS: ColumnDef[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'in-review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']
