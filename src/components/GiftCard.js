import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, addDoc, doc, getDoc } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from '@paypal/react-paypal-js';
import '../GiftCard.css'; // Puoi creare il tuo file CSS

function GiftCardPurchase() {
  const { currentUser, userData } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(50); // Importo predefinito
  const [errorMessage, setErrorMessage] = useState('');
  const [createOrder, setCreateOrder] = useState(null); // Stato per gestire il callback
  const navigate = useNavigate();

  // Funzione per generare un codice regalo univoco
  const generateGiftCardCode = async () => {
    const prefix = 'BVGF';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
      code = `${prefix}${randomNumber}`;

      // Verifica se il codice esiste già
      const giftCardRef = collection(db, 'giftCard');
      const snapshot = await getDoc(doc(giftCardRef, code));
      if (!snapshot.exists()) {
        isUnique = true;
      }
    }

    return code;
  };

  // Funzione per salvare i dati della carta regalo su Firestore
  const saveGiftCardToFirestore = async (code, amount) => {
    const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(purchaseDate.getDate() + 90); // Scadenza a 90 giorni

    const giftCardData = {
      code,
      amount,
      purchaseDate: purchaseDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      userId: currentUser.uid,
    };

    try {
      await addDoc(collection(db, 'giftCard'), giftCardData);
    } catch (error) {
      console.error('Errore durante la registrazione della carta regalo:', error);
      throw new Error("Errore durante la registrazione della carta regalo.");
    }
  };

  // Funzione per salvare l'ordine su Firestore
  const saveOrderToFirestore = async (orderNumber, price) => {
    const orderData = {
      orderNumber,
      userId: currentUser.uid,
      price,
      productTitle: "Gift Card",
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
    } catch (error) {
      console.error('Errore durante la registrazione dell\'ordine su Firestore:', error);
      throw new Error("Errore durante la registrazione dell'ordine.");
    }
  };

  // Funzione per generare il numero dell'ordine
  const generateOrderNumber = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    return `BV${randomNumber}`;
  };

  const handleCheckout = async (details) => {
    try {
      const giftCardCode = await generateGiftCardCode();
      await saveGiftCardToFirestore(giftCardCode, selectedAmount);
  
      const orderNumber = generateOrderNumber();
      const productTitle = "Gift Card";
      await saveOrderToFirestore(orderNumber, selectedAmount);
  
      navigate(`/order-summary/${orderNumber}`, {
        state: { 
          orderNumber, 
          giftCardCode, 
          selectedAmount, 
          productTitle, 
          price: selectedAmount,
          userId: currentUser.uid  // Passa anche userId
        },
      });
    } catch (error) {
      setErrorMessage("Si è verificato un errore durante l'acquisto della carta regalo.");
    }
  };

  // useEffect per gestire il callback di PayPal quando cambia selectedAmount
  useEffect(() => {
    setCreateOrder(() => (data, actions) => {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: selectedAmount.toString(),
              currency_code: 'EUR',
            },
          },
        ],
      });
    });
  }, [selectedAmount]);

  return (
    <div className="gift-card-container">
      <h1>Acquista una Carta Regalo</h1>
      <div className="gift-card-options">
        <label>Seleziona un importo:</label>
        <select
          value={selectedAmount}
          onChange={(e) => setSelectedAmount(parseInt(e.target.value))}
        >
          <option value={50}>€50</option>
          <option value={100}>€100</option>
          <option value={150}>€150</option>
          <option value={250}>€250</option>
        </select>
      </div>

      <div className="paypal-buttons-container">
        <PayPalScriptProvider
          options={{
            "client-id": "Af7Y9iWFFwOV3tHl8xMQz1_FG6927jMUWk92Ol1cSowunUntDpNgeYgacRSa4OG-jozaNeWDBOL8igGk",
            currency: "EUR",
          }}
        >
          {createOrder && (
            <PayPalButtons
              fundingSource={FUNDING.PAYPAL}
              createOrder={createOrder}
              onApprove={async (data, actions) => {
                const details = await actions.order.capture();
                await handleCheckout(details);
              }}
              onError={(err) => {
                console.error('Errore durante il pagamento:', err);
                setErrorMessage('Si è verificato un errore durante il pagamento.');
              }}
            />
          )}
        </PayPalScriptProvider>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default GiftCardPurchase;