import React, { createContext, useState, useCallback, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load token from localStorage and validate it on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        if (savedToken) {
          setToken(savedToken)
          // Validate token by fetching user data
          const response = await fetch('http://localhost:5000/auth/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setUser(data.user)
            } else {
              // Token invalid, clear it
              localStorage.removeItem('token')
              setToken(null)
              setUser(null)
            }
          } else {
            // Token expired or invalid
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
        }
      } catch (err) {
        console.error('Auth initialization failed:', err)
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
    setError(null)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    setError(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    setError,
    login,
    logout,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}