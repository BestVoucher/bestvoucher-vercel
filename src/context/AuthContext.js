import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0); // Nuovo stato per il numero di prodotti nel carrello

  // Funzione per aggiornare il contatore dei prodotti nel carrello
  const updateCartCount = (count) => {
    setCartCount(count);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Recupera i dati utente dalla collezione 'users'
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userDataFromFirestore = userDocSnap.data();
            setUserData(userDataFromFirestore);
          } else {
            // Se non esiste in 'users', controlla nella collezione 'companyRequests'
            const companyRequestRef = doc(db, 'companyRequests', user.uid);
            const companyRequestSnap = await getDoc(companyRequestRef);

            if (companyRequestSnap.exists()) {
              const requestData = companyRequestSnap.data();
              setUserData({
                ...requestData,
                role: 'company',  // Definisci come 'company'
                status: requestData.status  // Lo stato può essere 'pending' o 'rejected'
              });
            } else {
              setUserData(null);
            }
          }

          // Recupera il numero di prodotti nel carrello
          const cartDocRef = doc(db, 'carts', user.uid);
          const cartDocSnap = await getDoc(cartDocRef);
          if (cartDocSnap.exists()) {
            const cartData = cartDocSnap.data();
            setCartCount(cartData.products.length); // Imposta il numero di prodotti nel carrello
          } else {
            setCartCount(0); // Nessun prodotto nel carrello
          }

        } catch (error) {
          console.error("Errore durante il recupero dei dati:", error);
          setUserData(null);
          setCartCount(0); // Resetta il contatore del carrello in caso di errore
        }
      } else {
        setUserData(null);
        setCartCount(0); // Resetta il contatore del carrello quando l'utente non è loggato
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
    cartCount, // Esporta il numero di prodotti nel carrello
    updateCartCount, // Esporta la funzione per aggiornare il contatore del carrello
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}