import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import '../Register.css';  // Importa il file CSS

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    companyName: '',
    piva: '',
    address: '',
    postalCode: '',
    city: '',
    category: '',  // Nuovo campo categoria
    description: '',  // Nuovo campo descrizione
    website: '',  // Nuovo campo sito web
    logoUrl: null,  // Nuovo campo logo
    acceptedTerms: false,
  });

  const [message, setMessage] = useState(null);

  const { email, password, confirmPassword, role, firstName, lastName, birthDate, gender, companyName, piva, address, postalCode, city, category, description, website, logo, acceptedTerms } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onFileChange = e => setFormData({ ...formData, logo: e.target.files[0] });
  const onCheckboxChange = e => setFormData({ ...formData, [e.target.name]: e.target.checked });

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

    if (role === 'user' && gender === '') {
      setMessage({ type: 'error', text: 'Seleziona un genere valido.' });
      return;
    }

    if (role === 'company' && (!category || !description || !website || !logo)) {
      setMessage({ type: 'error', text: 'Tutti i campi sono obbligatori per la registrazione aziendale.' });
      return;
    }

    if (!acceptedTerms) {
      setMessage({ type: 'error', text: 'Devi accettare i termini e le condizioni per registrarti.' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const timestamp = new Date().toISOString();

      const userData = {
        email: user.email,
        role: role,
        acceptedTerms: true,
        termsAcceptedAt: timestamp,
      };

      if (role === 'user') {
        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          firstName: firstName,
          lastName: lastName,
          birthDate: birthDate,
          gender: gender,
        });
      } else if (role === 'company') {
        let logoUrl = '';
        if (logo) {
          const logoRef = ref(storage, `CompaniesLogo/${logo.name}`);
          await uploadBytes(logoRef, logo);
          logoUrl = await getDownloadURL(logoRef);
        }

        await setDoc(doc(db, 'companyRequests', user.uid), {
          ...userData,
          companyName: companyName,
          piva: piva,
          address: address,
          postalCode: postalCode,
          city: city,
          category: category,
          description: description,
          website: website,
          logoUrl: logoUrl,
          status: 'pending',
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
          <option value="">Tipo di registrazione</option>
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
              <option value="">Genere</option>
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
            <select name="category" value={category} onChange={onChange} required className="register-input">
              <option value="">Categoria attività</option>
              <option value="Trattamenti estetici">Trattamenti estetici</option>
              <option value="Parrucchieri">Parrucchieri</option>
              <option value="Fisioterapia">Fisioterapia</option>
              <option value="Benessere mentale">Benessere mentale</option>
            </select>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              placeholder="Descrizione dell'attività"
              required
              className="register-textarea"
            />
            <input
              type="url"
              name="website"
              value={website}
              onChange={onChange}
              placeholder="Sito web o social network"
              required
              className="register-input"
            />
            <label className="labelLogo" htmlFor="image">Logo azienda</label>
            <input
              type="file"
              name="logo"
              onChange={onFileChange}
              required
              className="register-input-logo"
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

        <div className="terms-container">
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={acceptedTerms}
            onChange={onCheckboxChange}
            required
          />
          <label>
            Ho letto e accetto i <Link to="/terms">termini e condizioni</Link>
          </label>
        </div>

        <button type="submit" className="register-button">Registrati</button>

        {message && (
          <p className={`register-message ${message.type}`}>
            {message.text}
          </p>
        )}

        <div className="login-link">
          <p className="AlreadyRegistered">Hai già un account?</p>
          <Link to="/login" className="login-button2">Accedi</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;