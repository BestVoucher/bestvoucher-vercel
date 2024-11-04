import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, doc as firestoreDoc, getDoc, setDoc, updateDoc, collection, addDoc, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from '@paypal/react-paypal-js';
import '../Cart.css';
import logo from '../assets/logo.png';
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
        const cartDocRef = firestoreDoc(db, 'carts', currentUser.uid);
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

  const generateOrderNumber = async () => {
    const counterRef = firestoreDoc(db, 'counters', 'orderAndInvoiceCounter');

    let newOrderNumber;

    await updateDoc(counterRef, {
      currentOrderNumber: (await getDoc(counterRef)).data().currentOrderNumber + 1,
    });
    
    const counterDoc = await getDoc(counterRef);
    newOrderNumber = `BV${counterDoc.data().currentOrderNumber}`;

    return newOrderNumber;
  };

  const generateInvoiceNumber = async () => {
    const counterRef = firestoreDoc(db, 'counters', 'orderAndInvoiceCounter');

    let newInvoiceNumber;

    await updateDoc(counterRef, {
      currentInvoiceNumber: (await getDoc(counterRef)).data().currentInvoiceNumber + 1,
    });
    
    const counterDoc = await getDoc(counterRef);
    newInvoiceNumber = counterDoc.data().currentInvoiceNumber.toString();

    return newInvoiceNumber;
  };

  const getUserData = async (userId) => {
    try {
      const userRef = firestoreDoc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.error("Dati dell'utente non trovati.");
        return null;
      }
    } catch (error) {
      console.error("Errore durante il recupero dei dati dell'utente:", error);
      return null;
    }
  };

  const generateAndUploadPDF = async (invoiceNumber, orderNumber, cartItems, userData) => {
    try {
      const pdfDoc = new jsPDF();
      const oggi = new Date().toLocaleDateString('it-IT');

      // Dati statici "Venduto da"
      const venditore = {
        nome: "BestVoucher srls",
        indirizzo: "Viale Edmondo de Amicis 17",
        citta: "Firenze",
        provincia: "FI",
        cap: "50137",
        paese: "IT",
        partitaIva: "IT00000000000",
      };

      // Aggiunta del logo ridimensionato a 15x15
      pdfDoc.addImage(logo, 'PNG', 10, 10, 15, 15);
      pdfDoc.setFontSize(18);
      pdfDoc.text('Fattura', 105, 30, { align: 'center' });

      pdfDoc.setFontSize(10);
      pdfDoc.text(`Venduto da: ${venditore.nome}`, 10, 40);
      pdfDoc.text(venditore.indirizzo, 10, 45);
      pdfDoc.text(`${venditore.citta} ${venditore.provincia} ${venditore.cap} ${venditore.paese}`, 10, 50);
      pdfDoc.text(`P.IVA: ${venditore.partitaIva}`, 10, 55);

      const nomeUtente = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "Nome non disponibile";
      const indirizzoUtente = userData.address || "Indirizzo non disponibile";
      const cittaUtente = `${userData.city || ''}, ${userData.cap || ''}`.trim();
      pdfDoc.text('Acquirente:', 130, 40);
      pdfDoc.text(nomeUtente, 130, 45);
      pdfDoc.text(indirizzoUtente, 130, 50);
      pdfDoc.text(cittaUtente, 130, 55);

      pdfDoc.text(`Numero Fattura: ${invoiceNumber}`, 10, 70);
      pdfDoc.text(`Numero Ordine: ${orderNumber}`, 10, 75);
      pdfDoc.text(`Data: ${oggi}`, 10, 80);

      const prodotti = cartItems.map((item) => [
        item.title,
        item.quantity,
        `€${parseFloat(item.price).toFixed(2)}`,
        `€${(item.quantity * parseFloat(item.price)).toFixed(2)}`
      ]);

      pdfDoc.autoTable({
        head: [['Descrizione', 'Quantità', 'Prezzo', 'Totale']],
        body: prodotti,
        startY: 90,
        theme: 'grid',
        headStyles: { fillColor: [255, 140, 0] },
        bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      pdfDoc.text(`Totale: €${totalPrice}`, 150, pdfDoc.lastAutoTable.finalY + 10);
      const pdfBlob = pdfDoc.output('blob');
      const pdfRef = ref(storage, `invoices/fattura-${invoiceNumber}.pdf`);
      const snapshot = await uploadBytes(pdfRef, pdfBlob);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error('Errore durante la generazione e il caricamento del PDF:', error);
      throw error;
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (!currentUser) return;

    try {
      const cartDocRef = firestoreDoc(db, 'carts', currentUser.uid);
      const cartDoc = await getDoc(cartDocRef);

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        let updatedProducts = cartData.products;

        if (newQuantity === 0) {
          updatedProducts = updatedProducts.filter(item => item.id !== productId);
        } else {
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
      const cartDocRef = firestoreDoc(db, 'carts', currentUser.uid);
      const cartDoc = await getDoc(cartDocRef);

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        let updatedProducts = cartData.products.filter(item => item.id !== productId);

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

        const newTotal = groupedProducts.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0);
        setTotalPrice(newTotal.toFixed(2));
        updateCartCount(updatedProducts.length);
      }
    } catch (error) {
      console.error('Errore durante la rimozione del prodotto dal carrello:', error);
      setErrorMessage('Si è verificato un errore durante la rimozione del prodotto.');
    }
  };

  const handleCheckout = async (details) => {
    try {
      const orderNumber = await generateOrderNumber();
      const invoiceNumber = await generateInvoiceNumber();
      const userData = await getUserData(currentUser.uid);
      const orderData = {
        orderNumber,
        email: currentUser.email,
        totalPrice,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);

      const multipleOrdersWithQRCodes = await Promise.all(
        cartItems.map(async (item) => {
          const qrCodes = Array.from({ length: item.quantity }, () => ({
            code: `QR_${Math.random().toString(36).substr(2, 9)}`,
            productDocName: item.id,
            userId: currentUser.uid,
            createdAt: new Date().toISOString(),
          }));

          await Promise.all(qrCodes.map((qrData) => addDoc(collection(db, 'newqrcodes'), qrData)));

          return {
            ...item,
            qrCodes: qrCodes.map((qr) => qr.code),
            productTitle: item.title,
          };
        })
      );

      await Promise.all(multipleOrdersWithQRCodes.map((order) => addDoc(collection(db, 'multipleorders'), order)));

      const pdfUrl = await generateAndUploadPDF(invoiceNumber, orderNumber, cartItems, userData);

      const invoiceData = {
        invoiceNumber,
        orderId: orderNumber,
        userId: currentUser.uid,
        invoiceDate: new Date().toISOString(),
        pdfUrl,
      };
      
      await setDoc(firestoreDoc(db, 'invoices', orderNumber), invoiceData);

      const cartDocRef = firestoreDoc(db, 'carts', currentUser.uid);
      await updateDoc(cartDocRef, { products: [] });

      setCartItems([]);
      setTotalPrice(0);
      updateCartCount(0);

      navigate(`/order-summary/${orderNumber}`, { state: { pdfUrl, orderData, multipleOrders: multipleOrdersWithQRCodes } });
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
                    key={totalPrice}
                    fundingSource={FUNDING.PAYPAL}
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          amount: {
                            value: totalPrice,
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