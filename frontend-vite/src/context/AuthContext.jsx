import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null)

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
