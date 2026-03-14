import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'
import { logActivity } from '../services/logService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('compia_user')) || null }
    catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const res = await api.get(`/users?email=${email}`)
    const found = res.data[0]
    if (!found || found.password !== password) {
      throw new Error('Email ou senha inválidos.')
    }
    const { password: _, ...safeUser } = found
    localStorage.setItem('compia_user', JSON.stringify(safeUser))
    setUser(safeUser)
    await logActivity(`Login realizado por ${email}`)
    return safeUser
  }, [])

  const register = useCallback(async (name, email, password) => {
    const existing = await api.get(`/users?email=${email}`)
    if (existing.data.length > 0) throw new Error('Email já cadastrado.')
    const res = await api.post('/users', {
      name, email, password, role: 'customer',
      createdAt: new Date().toISOString()
    })
    const { password: _, ...safeUser } = res.data
    localStorage.setItem('compia_user', JSON.stringify(safeUser))
    setUser(safeUser)
    await logActivity(`Novo cadastro: ${email}`)
    return safeUser
  }, [])

  const logout = useCallback(async () => {
    if (user) await logActivity(`Logout: ${user.email}`)
    localStorage.removeItem('compia_user')
    setUser(null)
  }, [user])

  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
