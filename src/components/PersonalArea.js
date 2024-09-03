import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../PersonalArea.css';  // Importa il file CSS

function PersonalArea() {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return (
      <div className="personal-area-container">
        <h2 className="personal-area-title">Effettua l'accesso</h2>
      </div>
    );
  }

  return (
    <div className="personal-area-container">
      <h2 className="personal-area-title">Area Personale</h2>
      {userData ? (
        <div className="personal-area-content">
          <p className="personal-area-info"><strong>Email:</strong> {currentUser.email}</p>

          {/* Gestione delle aziende */}
          {userData.role === 'company' && (
            <>
              <p className="personal-area-info"><strong>Nome Azienda:</strong> {userData.companyName}</p>
              {userData.status === 'pending' && (
                <p className="personal-area-warning">La tua richiesta di registrazione come azienda è in attesa di approvazione.</p>
              )}
              {userData.status === 'rejected' && (
                <p className="personal-area-error">La tua richiesta di registrazione come azienda è stata rifiutata. Invia un email a info@bestvoucher.it per maggiori informazioni.</p>
              )}
            </>
          )}
        </div>
      ) : (
        <p className="personal-area-loading">Caricamento dei dati...</p>
      )}
    </div>
  );
}

export default PersonalArea;