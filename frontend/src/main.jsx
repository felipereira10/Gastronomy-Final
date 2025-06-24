import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UsersTerms from "./pages/admin/UsersTerms";
import Home from './pages/home/page.jsx';
import Cart from './pages/cart/page.jsx';
import Profile from './pages/profile/page.jsx';
import Plates from './pages/plates/page.jsx';
import Auth from './pages/auth/page.jsx';
import TermsPage from './pages/terms/TermsPage.jsx';
import EditTerms from './components/editTerms/EditTerms.jsx';

import ProtectedAdminRoute from './components/protectedRoutes/ProtectedAdminRoute.jsx';
// IMPORTA O PROVIDER
import { AuthProvider } from './contexts/AuthContext.jsx';

const pages = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/cart', element: <Cart /> },
      { path: '/profile', element: <Profile /> },
      { path: '/plates', element: <Plates /> },
      { path: '/auth', element: <Auth /> },

      // Rotas dos termos:
      { path: '/terms', element: <TermsPage /> },
      { path: '/admin/terms', element: <EditTerms /> },
      { path: '/admin/users-terms', element: <UsersTerms /> },
      
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={pages} />
  </React.StrictMode>
);
