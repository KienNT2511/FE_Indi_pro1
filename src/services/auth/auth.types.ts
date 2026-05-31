export interface AuthUser {
  sub: string
  email: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
