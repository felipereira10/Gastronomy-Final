import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null)

  useEffect(() => {
    const savedData = localStorage.getItem('authData')
    if (savedData) {
      setAuthData(JSON.parse(savedData))
    }
  }, [])

  useEffect(() => {
    if (authData) {
      localStorage.setItem('authData', JSON.stringify(authData))
    } else {
      localStorage.removeItem('authData')
    }
  }, [authData])

  const logout = () => {
    setAuthData(null)
  }

  return (
    <AuthContext.Provider value={{ authData, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
