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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Recupera i dati utente dalla collezione 'users'
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // L'utente esiste nella collezione 'users'
            const userDataFromFirestore = userDocSnap.data();
            setUserData(userDataFromFirestore);
          } else {
            // Se non esiste in 'users', controlla nella collezione 'companyRequests'
            const companyRequestRef = doc(db, 'companyRequests', user.uid);
            const companyRequestSnap = await getDoc(companyRequestRef);

            if (companyRequestSnap.exists()) {
              // L'utente esiste nella collezione 'companyRequests'
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
        } catch (error) {
          console.error("Errore durante il recupero dei dati:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}