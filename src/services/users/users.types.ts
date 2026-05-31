export interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  password: string
  name?: string
}
