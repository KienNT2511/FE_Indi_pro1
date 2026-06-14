import { describe, it, expect, vi, beforeEach } from 'vitest'
import { suppliersService } from './suppliers.service'
import api from '../../api/axios'

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('suppliersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll() gọi GET /suppliers kèm query và trả về data', async () => {
    const payload = { data: [{ id: 's1', name: 'NCC A' }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } }
    mockedApi.get.mockResolvedValue({ data: payload })

    const res = await suppliersService.getAll({ search: 'A', page: 1 })

    expect(mockedApi.get).toHaveBeenCalledWith('/suppliers', { params: { search: 'A', page: 1 } })
    expect(res).toEqual(payload)
  })

  it('create() gọi POST /suppliers với dto', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 's2', name: 'NCC B' } })

    const res = await suppliersService.create({ name: 'NCC B' })

    expect(mockedApi.post).toHaveBeenCalledWith('/suppliers', { name: 'NCC B' })
    expect(res).toMatchObject({ id: 's2' })
  })

  it('remove() gọi DELETE /suppliers/:id', async () => {
    mockedApi.delete.mockResolvedValue({ data: undefined })
    await suppliersService.remove('s1')
    expect(mockedApi.delete).toHaveBeenCalledWith('/suppliers/s1')
  })
})
