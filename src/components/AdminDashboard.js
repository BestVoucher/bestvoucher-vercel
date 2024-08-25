import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import '../AdminDashboard.css';  // Assicurati di creare un file CSS separato

function AdminDashboard() {
  const [companyRequests, setCompanyRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const querySnapshot = await getDocs(collection(db, 'companyRequests'));
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanyRequests(requests);
    };
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const requestRef = doc(db, 'companyRequests', requestId);
      const requestSnap = await getDoc(requestRef);

      if (requestSnap.exists()) {
        const companyData = requestSnap.data();
        
        // Sposta i dati nella collezione 'users'
        await setDoc(doc(db, 'users', requestId), {
          ...companyData,
          role: 'company',
          status: 'approved'
        });

        // Elimina la richiesta dalla collezione 'companyRequests'
        await deleteDoc(requestRef);

        alert('Richiesta approvata e trasferita con successo!');
        setCompanyRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      } else {
        alert('Impossibile trovare la richiesta.');
      }
    } catch (error) {
      console.error('Errore durante l\'approvazione:', error);
      alert('Errore durante l\'approvazione della richiesta.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const requestRef = doc(db, 'companyRequests', requestId);
      await updateDoc(requestRef, { status: 'rejected' });
      alert('Richiesta rifiutata');
      setCompanyRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Errore durante il rifiuto:', error);
      alert('Errore durante il rifiuto della richiesta.');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Amministratore</h2>
      {companyRequests.length > 0 ? (
        <div className="requests-list">
          {companyRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <p><strong>Azienda:</strong> {request.companyName}</p>
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>P.IVA:</strong> {request.piva}</p>
                <p><strong>Indirizzo:</strong> {request.address}</p>
                <p><strong>Città:</strong> {request.city}</p>
              </div>
              <div className="request-actions">
                <button onClick={() => handleApprove(request.id)} className="approve-button">Approva</button>
                <button onClick={() => handleReject(request.id)} className="reject-button">Rifiuta</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-requests">Nessuna richiesta di registrazione in sospeso.</p>
      )}
    </div>
  );
}

export default AdminDashboard;