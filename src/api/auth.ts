/**
 * Authentication API client
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface User {
  id: string
  username: string
}

/**
 * Decode JWT token to extract user info
 */
function decodeJWT(token: string): { sub: string; user_id: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const authApi = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/api/auth/login`,
      credentials
    )

    const { access_token } = response.data
    const decoded = decodeJWT(access_token)

    const user: User = {
      id: decoded?.user_id?.toString() || '1',
      username: decoded?.sub || credentials.username,
    }

    return { token: access_token, user }
  },

  /**
   * Verify token and get current user info
   */
  async verifyToken(token: string): Promise<User> {
    const response = await axios.get<{ id: number; username: string }>(
      `${API_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return {
      id: response.data.id.toString(),
      username: response.data.username,
    }
  },

  /**
   * Logout - clear local state
   */
  async logout(): Promise<void> {
    return Promise.resolve()
  },
}

/**
 * Set up axios interceptor to add auth token to all requests
 */
export const setupAuthInterceptor = (token: string | null) => {
  axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}
