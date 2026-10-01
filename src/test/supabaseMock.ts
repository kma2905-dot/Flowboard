import { vi } from 'vitest'

export interface MockResult<T = unknown> {
  data: T
  error: { message: string } | null
}

export interface QueryBuilder<T> extends PromiseLike<MockResult<T>> {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
}

export function createQueryBuilder<T>(result: MockResult<T>): QueryBuilder<T> {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => builder),
    then: <TResult1 = MockResult<T>, TResult2 = never>(
      onfulfilled?: ((value: MockResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) => Promise.resolve(result).then(onfulfilled, onrejected),
  } as QueryBuilder<T>
  return builder
}
