import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { currentUser, userData } = useAuth();

  if (!currentUser || userData?.role !== 'admin') {
    // Se l'utente non è loggato o non è un admin, reindirizzalo alla home page
    return <Navigate to="/" />;
  }

  // Se l'utente è un admin, mostra il contenuto della pagina
  return children;
}

export default AdminRoute;