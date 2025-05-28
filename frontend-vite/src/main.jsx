import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import React from 'react'

import Home from './pages/home/page.jsx'
import Cart from './pages/cart/page.jsx'
import Profile from './pages/profile/page.jsx'
import Plates from './pages/plates/page.jsx'
import Auth from './pages/auth/page.jsx'
import { AuthProvider } from './contexts/AuthContext'

const pages = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/cart', element: <Cart /> },
      { path: '/profile', element: <Profile /> },
      { path: '/plates', element: <Plates /> },
      { path: '/auth', element: <Auth /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* AQUI! */}
      <RouterProvider router={pages} />
    </AuthProvider>
  </StrictMode>
)
