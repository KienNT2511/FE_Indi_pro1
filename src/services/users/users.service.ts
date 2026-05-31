import api from '../../api/axios'
import type { CreateUserDto, User } from './users.types'

export const usersService = {
  // POST /users — tạo user (không cần auth)
  create: async (dto: CreateUserDto): Promise<User> => {
    const res = await api.post('/users', dto)
    return res.data
  },

  // GET /users/:id — lấy user theo id (không cần auth)
  getById: async (id: string): Promise<User> => {
    const res = await api.get(`/users/${id}`)
    return res.data
  },
}
