import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  useEffect(() => {
    async function restore() {
      if (token) {
        localStorage.setItem('token', token)
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try { setUser(JSON.parse(savedUser)); return } catch (e) { /* continue to fetch */ }
        }
        // If no saved user, attempt to fetch from backend
        try {
          const res = await fetch('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const data = await res.json()
            if (data && data.user) {
              setUser(data.user)
              try { localStorage.setItem('user', JSON.stringify(data.user)) } catch (e) {}
              return
            }
          }
        } catch (e) {
          // ignore fetch errors — user stays null
        }
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    restore()
  }, [token])

  const login = (userData, tokenValue) => {
    setUser(userData || null)
    setToken(tokenValue || null)
    if (userData) {
      try { localStorage.setItem('user', JSON.stringify(userData)) } catch (e) {}
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
