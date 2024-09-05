import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole, companyApproved = false }) {
  const { currentUser, userData, loading } = useAuth();  // Usa lo stato di loading

  // Se stiamo ancora caricando i dati utente, mostriamo un caricamento o uno spinner
  if (loading) {
    return <div>Caricamento...</div>;  // Potresti sostituire con uno spinner
  }

  // Permetti l'accesso se non c'è utente loggato e la rotta non richiede un ruolo specifico
  if (!currentUser && !requiredRole) {
    return children;
  }

  // Permetti l'accesso a utenti non loggati o utenti con ruolo "user" per la pagina del carrello
  if (!currentUser || userData?.role === 'user') {
    return children;
  }

  // Impedisci l'accesso agli utenti con ruolo admin o company
  if (currentUser && (userData?.role === 'admin' || (userData?.role === 'company' && !companyApproved))) {
    return <Navigate to="/" />;
  }

  // Se l'utente ha il ruolo richiesto, permetti l'accesso
  if (userData?.role === requiredRole) {
    return children;
  }

  // In caso contrario, reindirizza alla homepage
  return <Navigate to="/" />;
}

export default ProtectedRoute;