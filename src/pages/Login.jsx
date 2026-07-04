import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, LogIn, Coffee } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setSubmitting(true);
    try {
      let loggedUser;
      if (role === 'admin') {
        loggedUser = await login('admin@galeriacafe.com', 'admin123');
        navigate('/admin');
      } else {
        // Try to log in with a default client or preset
        loggedUser = await login('test@cliente.com', '123456');
        navigate('/');
      }
    } catch (err) {
      // If client doesn't exist, we explain they can register
      if (role === 'client') {
        alert('Para probar la cuenta de cliente, por favor regístrate en la pestaña "Regístrate aquí" primero.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.loginCard} glass-card animate-fade-in`}>
        <div className={styles.header}>
          <div className={styles.logoCircle}>
            <Coffee size={28} />
          </div>
          <h2>Galería <span className="gold-gradient-text">Café</span></h2>
          <p>Arte, Cultura & Sabor</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                type="email"
                className="form-control"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Iniciando sesión...' : 'Ingresar'} <LogIn size={18} />
          </button>
        </form>

        <div className={styles.divider}>
          <span>O prueba rápida con</span>
        </div>

        <div className={styles.quickAccess}>
          <button 
            onClick={() => handleQuickLogin('admin')} 
            className="btn btn-secondary"
            disabled={submitting}
          >
            Admin Demo
          </button>
          <button 
            onClick={() => handleQuickLogin('client')} 
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cliente Demo
          </button>
        </div>

        <div className={styles.registerLink}>
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
