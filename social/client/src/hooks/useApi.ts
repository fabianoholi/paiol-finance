import { useState, useCallback } from 'react'

interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  loading: boolean
}

interface ApiMethods {
  get: <T = any>(url: string) => Promise<T>
  post: <T = any>(url: string, body?: any) => Promise<T>
  put: <T = any>(url: string, body?: any) => Promise<T>
  del: <T = any>(url: string) => Promise<T>
}

async function request<T>(method: string, url: string, body?: any): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
    throw new Error('Sessao expirada')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(err.detail || err.message || `Erro ${res.status}`)
  }

  if (res.status === 204) {
    return null as T
  }

  return res.json()
}

export const api: ApiMethods = {
  get: <T = any>(url: string) => request<T>('GET', url),
  post: <T = any>(url: string, body?: any) => request<T>('POST', url, body),
  put: <T = any>(url: string, body?: any) => request<T>('PUT', url, body),
  del: <T = any>(url: string) => request<T>('DELETE', url),
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  })

  const execute = useCallback(async (promise: Promise<T>) => {
    setState({ data: null, error: null, loading: true })
    try {
      const data = await promise
      setState({ data, error: null, loading: false })
      return data
    } catch (err: any) {
      const error = err.message || 'Erro desconhecido'
      setState({ data: null, error, loading: false })
      throw err
    }
  }, [])

  return { ...state, execute }
}

export default api
