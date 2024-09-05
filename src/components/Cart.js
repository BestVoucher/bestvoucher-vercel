import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, doc, getDoc, updateDoc, collection, addDoc } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from '@paypal/react-paypal-js';
import '../Cart.css';
import removeIcon from '../assets/remove.png';

function Cart() {
  const { currentUser, updateCartCount } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      setTotalPrice(0);
      updateCartCount(0);
      setIsLoading(false);
      return;
    }

    const fetchCartItems = async () => {
      try {
        const cartDocRef = doc(db, 'carts', currentUser.uid);
        const cartDoc = await getDoc(cartDocRef);

        if (cartDoc.exists()) {
          const cartData = cartDoc.data();
          if (Array.isArray(cartData.products)) {
            const groupedProducts = cartData.products.reduce((acc, product) => {
              const existingProduct = acc.find(item => item.id === product.id);
              if (existingProduct) {
                existingProduct.quantity += 1;
              } else {
                acc.push({ ...product, quantity: 1 });
              }
              return acc;
            }, []);

            setCartItems(groupedProducts);

            const total = groupedProducts.reduce((sum, item) => {
              return sum + item.quantity * parseFloat(item.price);
            }, 0);

            setTotalPrice(total.toFixed(2));

            updateCartCount(cartData.products.length);
          } else {
            setTotalPrice(0);
            updateCartCount(0);
          }
        }
      } catch (error) {
        console.error('Errore durante il recupero dei prodotti del carrello:', error);
        setTotalPrice(0);
        updateCartCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [currentUser, updateCartCount]);

  // Funzione aggiornata per gestire la modifica della quantità
  const handleQuantityChange = async (productId, newQuantity) => {
    if (!currentUser) return;

    try {
      const cartDocRef = doc(db, 'carts', currentUser.uid);
      const cartDoc = await getDoc(cartDocRef);

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        let updatedProducts = cartData.products;

        if (newQuantity === 0) {
          // Se la quantità è 0, rimuovi l'articolo dal carrello
          updatedProducts = updatedProducts.filter(item => item.id !== productId);
        } else {
          // Se la quantità è maggiore di 0, aggiorna la quantità
          const productInCart = updatedProducts.find(item => item.id === productId);

          if (productInCart) {
            updatedProducts = updatedProducts.filter(item => item.id !== productId);
            for (let i = 0; i < newQuantity; i++) {
              updatedProducts.push(productInCart);
            }
          }
        }

        await updateDoc(cartDocRef, { products: updatedProducts });

        const groupedProducts = updatedProducts.reduce((acc, product) => {
          const existingProduct = acc.find(item => item.id === product.id);
          if (existingProduct) {
            existingProduct.quantity += 1;
          } else {
            acc.push({ ...product, quantity: 1 });
          }
          return acc;
        }, []);

        setCartItems(groupedProducts);

        const newTotal = groupedProducts.reduce((sum, item) => {
          return sum + item.quantity * parseFloat(item.price);
        }, 0);

        setTotalPrice(newTotal.toFixed(2));
        updateCartCount(updatedProducts.length);
      }
    } catch (error) {
      console.error('Errore durante l’aggiornamento della quantità:', error);
      setErrorMessage('Si è verificato un errore durante l’aggiornamento della quantità.');
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!currentUser) return;

    try {
      const cartDocRef = doc(db, 'carts', currentUser.uid);
      const cartDoc = await getDoc(cartDocRef);

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        let updatedProducts = cartData.products.filter(item => item.id !== productId);

        await updateDoc(cartDocRef, { products: updatedProducts });

        setCartItems(updatedProducts);

        const newTotal = updatedProducts.reduce((sum, item) => sum + parseFloat(item.price), 0);
        setTotalPrice(newTotal.toFixed(2));
        updateCartCount(updatedProducts.length);
      }
    } catch (error) {
      console.error('Errore durante la rimozione del prodotto dal carrello:', error);
      setErrorMessage('Si è verificato un errore durante la rimozione del prodotto.');
    }
  };

  const generateRandomCode = (length = 15) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateOrderNumber = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    return `BV${randomNumber}`;
  };

  const saveOrderToFirestore = async (orderData) => {
    try {
      await addDoc(collection(db, 'orders'), orderData);
    } catch (error) {
      console.error("Errore durante la registrazione dell'ordine su Firestore:", error);
      throw new Error("Errore durante la registrazione dell'ordine.");
    }
  };

  const saveMultipleOrdersToFirestore = async (multipleOrders) => {
    try {
      const orderCollection = collection(db, 'multipleorders');
      for (const order of multipleOrders) {
        await addDoc(orderCollection, order);
      }
    } catch (error) {
      console.error("Errore durante la registrazione degli ordini su Firestore:", error);
      throw new Error("Errore durante la registrazione degli ordini.");
    }
  };

  const handleCheckout = async (details) => {
    try {
      const orderNumber = generateOrderNumber();
      const orderData = {
        orderNumber,
        email: currentUser.email,
        totalPrice,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      await saveOrderToFirestore(orderData);

      const multipleOrders = cartItems.map((item) => {
        if (!item.id || !item.title || !item.price) {
          throw new Error("Il prodotto nel carrello contiene dati mancanti o non validi.");
        }

        return {
          orderNumber,
          productDocName: item.id,
          productTitle: item.title,
          price: item.price,
          qrCode: generateRandomCode(),
          createdAt: new Date().toISOString(),
        };
      });

      await saveMultipleOrdersToFirestore(multipleOrders);
      navigate(`/order-summary/${orderNumber}`, { state: { ...orderData, multipleOrders } });
    } catch (error) {
      setErrorMessage("Si è verificato un errore durante la registrazione dell'ordine.");
    }
  };

  return (
    <div className="cart-container">
      <h1 className="cart-title">Carrello</h1>
      {!currentUser ? (
        <div className="empty-cart">
          <p>Aggiungi uno o più prodotti al carrello per acquistarli</p>
          <div className="cart-summary">
            <h2>Totale: €0.00</h2>
          </div>
        </div>
      ) : isLoading ? (
        <p>Caricamento in corso...</p>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Aggiungi uno o più prodotti al carrello per acquistarli</p>
          <div className="cart-summary">
            <h2>Totale: €0.00</h2>
          </div>
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.cartItemId} className="cart-item">
                <img src={item.imageUrl} alt={item.title} className="cart-item-image" />
                <div className="cart-item-details">
                  <h2>{item.title}</h2>
                  <p>Prezzo: €{parseFloat(item.price).toFixed(2)}</p>
                  <div className='quantity-box'>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className='quantity-button'>-</button>
                    <span className='quantity-display'>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className='quantity-button'>+</button>
                    <button onClick={() => handleRemoveItem(item.id)} className='cart-item-remove'>
                      <img src={removeIcon} alt="Rimuovi" />
                    </button>
                  </div>
              </div>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <h2>Totale: €{totalPrice}</h2>
            <PayPalScriptProvider options={{ "client-id": "Af7Y9iWFFwOV3tHl8xMQz1_FG6927jMUWk92Ol1cSowunUntDpNgeYgacRSa4OG-jozaNeWDBOL8igGk", currency: "EUR" }}>
              {totalPrice !== null && (
                <div className="paypal-buttons-container">
                  <PayPalButtons
                    fundingSource={FUNDING.PAYPAL}
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          amount: {
                            value: totalPrice.toString(),
                            currency_code: "EUR"
                          }
                        }]
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const details = await actions.order.capture();
                        await handleCheckout(details);
                      } catch (err) {
                        console.error('Errore durante il pagamento:', err);
                        setErrorMessage('Si è verificato un errore durante il pagamento.');
                      }
                    }}
                    onError={(err) => {
                      console.error('Errore durante il pagamento:', err);
                      setErrorMessage('Si è verificato un errore durante il pagamento.');
                    }}
                  />
                </div>
              )}
            </PayPalScriptProvider>
          </div>
        </>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default Cart;