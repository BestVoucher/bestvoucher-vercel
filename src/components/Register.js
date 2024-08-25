import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../Register.css';  // Importa il file CSS

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',  // Aggiungi conferma password
    role: '',  // Imposta come vuoto per gestire la prima opzione non valida
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',  // Aggiungi gestione per genere
    companyName: '',
    piva: '',  // Aggiungi P.IVA
    address: '',
    postalCode: '',
    city: ''
  });

  const [message, setMessage] = useState(null);

  const { email, password, confirmPassword, role, firstName, lastName, birthDate, gender, companyName, piva, address, postalCode, city } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();

    // Validazione dei campi
    if (role === '') {
      setMessage({ type: 'error', text: 'Seleziona un tipo di registrazione valido.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Le password non coincidono.' });
      return;
    }

    if (role === 'user' && gender === '') {  // Verifica che un genere valido sia selezionato
      setMessage({ type: 'error', text: 'Seleziona un genere valido.' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (role === 'user') {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          firstName: firstName,
          lastName: lastName,
          birthDate: birthDate,
          gender: gender
        });
      } else if (role === 'company') {
        await setDoc(doc(db, 'companyRequests', user.uid), {
          email: user.email,
          companyName: companyName,
          piva: piva,  // Salva P.IVA su Firestore
          address: address,
          postalCode: postalCode,
          city: city,
          status: 'pending'
        });
      }

      setMessage({ type: 'success', text: 'Registrazione riuscita! Se sei un\'azienda, attendi l\'approvazione.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore nella registrazione: ' + err.message });
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={onSubmit} className="register-form">
        <h2>Registrati</h2>
        <select name="role" value={role} onChange={onChange} className="register-input" required>
          <option value="">Tipo di registrazione</option> {/* Opzione non valida */}
          <option value="user">Utente</option>
          <option value="company">Azienda</option>
        </select>

        {role === 'user' && (
          <>
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={onChange}
              placeholder="Nome"
              required
              className="register-input"
            />
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={onChange}
              placeholder="Cognome"
              required
              className="register-input"
            />
            <input
              type="date"
              name="birthDate"
              value={birthDate}
              onChange={onChange}
              required
              className="register-input"
            />
            <select name="gender" value={gender} onChange={onChange} required className="register-input">
              <option value="">Genere</option> {/* Non permette di inviare il modulo con questa opzione */}
              <option value="male">Uomo</option>
              <option value="female">Donna</option>
              <option value="other">Altro</option>
            </select>
          </>
        )}

        {role === 'company' && (
          <>
            <input
              type="text"
              name="companyName"
              value={companyName}
              onChange={onChange}
              placeholder="Nome Azienda"
              required
              className="register-input"
            />
            <input
              type="text"
              name="piva"
              value={piva}
              onChange={onChange}
              placeholder="P.IVA"
              required
              className="register-input"
            />
            <input
              type="text"
              name="address"
              value={address}
              onChange={onChange}
              placeholder="Indirizzo"
              required
              className="register-input"
            />
            <input
              type="text"
              name="postalCode"
              value={postalCode}
              onChange={onChange}
              placeholder="CAP"
              required
              className="register-input"
            />
            <input
              type="text"
              name="city"
              value={city}
              onChange={onChange}
              placeholder="Città"
              required
              className="register-input"
            />
          </>
        )}

        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Email"
          required
          className="register-input"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Password"
          required
          className="register-input"
        />
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={onChange}
          placeholder="Conferma Password"
          required
          className="register-input"
        />

        <button type="submit" className="register-button">Registrati</button>

        {message && (
          <p className={`register-message ${message.type}`}>
            {message.text}
          </p>
        )}

        <div className="login-link">
          <p>Hai già un account?</p>
          <Link to="/login" className="login-button">Accedi</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;