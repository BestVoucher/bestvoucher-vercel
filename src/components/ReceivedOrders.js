import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Usa il contesto di autenticazione
import { collection, getDocs, query, where } from 'firebase/firestore'; // Importa Firestore
import { db } from '../firebase'; // Importa Firestore
import '../ReceivedOrders.css';  // Importa il nuovo file CSS

function ReceivedOrders() {
  const { currentUser } = useAuth(); // Ottieni l'utente corrente
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Recupera tutti gli ordini ricevuti da questa azienda (companyId uguale a currentUser.uid)
        const q = query(collection(db, 'orders'), where('companyId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(doc => doc.data());
        setOrders(ordersList);
      } catch (error) {
        console.error('Errore durante il recupero degli ordini:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  if (loading) {
    return <p>Caricamento in corso...</p>;
  }

  if (orders.length === 0) {
    return <p>Non ci sono ordini ricevuti.</p>;
  }

  return (
    <div className="received-orders">
      <h2>Ordini Ricevuti</h2>
      <ul className="received-orders-list">
        {orders.map((order, index) => (
          <li key={index} className="received-order-item">
            <p><strong>Numero Ordine:</strong> {order.orderNumber}</p>
            <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Prodotto Acquistato:</strong> {order.productTitle}</p>
            <p><strong>Prezzo:</strong> €{order.price}</p>
            <p><strong>Email Acquirente:</strong> {order.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReceivedOrders;