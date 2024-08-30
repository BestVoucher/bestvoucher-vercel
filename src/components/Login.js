import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../Login.css';  // Importa il file CSS

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setMessage({ type: 'success', text: 'Login riuscito!' });

      setTimeout(() => {
        navigate('/personal-area');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore nel login: ' + err.message });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={onSubmit} className="login-form">
        <h2>Accedi al tuo account</h2>
        <input 
          type="email" 
          name="email" 
          value={email} 
          onChange={onChange} 
          placeholder="Email" 
          required 
          className="login-input"
        />
        <input 
          type="password" 
          name="password" 
          value={password} 
          onChange={onChange} 
          placeholder="Password" 
          required 
          className="login-input"
        />
        <button type="submit" className="login-button">Accedi</button>

        {message && (
          <p className={`login-message ${message.type}`}>
            {message.text}
          </p>
        )}
        
        <div className="register-link">
          <p className="NotRegistered">Non hai ancora un account?</p>
          <Link to="/register" className="register-button2">Registrati</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;