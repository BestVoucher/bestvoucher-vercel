import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Importa Firestore
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importa le funzioni necessarie per Firestore
import '../Orders.css'; // Puoi creare un file CSS per lo styling

function Orders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersList);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  if (orders.length === 0) {
    return <div>Non hai effettuato ordini.</div>;
  }

  return (
    <div className="orders-page">
      <h2>I tuoi ordini</h2>
      <ul className="orders-list">
        {orders.map(order => (
          <li key={order.id} className="order-item">
            <p><strong>Numero d'ordine:</strong> {order.orderNumber}</p>
            <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Prodotto:</strong> {order.productTitle}</p>
            <p><strong>Prezzo:</strong> €{order.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Orders;