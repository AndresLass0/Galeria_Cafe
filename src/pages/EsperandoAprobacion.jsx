import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Coffee, RefreshCw, LogOut, Loader2, Hourglass } from 'lucide-react';
import styles from './EsperandoAprobacion.module.css';

export default function EsperandoAprobacion() {
  const { user, refreshUserData, logout } = useApp();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      const updated = await refreshUserData();
      if (updated && updated.aprobado === 'aprobado') {
        navigate('/');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.card} glass-card animate-fade-in`}>
        <div className={styles.iconWrapper}>
          <Hourglass size={48} className={styles.animatedHourglass} />
        </div>
        
        <h2>Esperando Aprobación</h2>
        
        <p className={styles.intro}>
          ¡Hola, <strong className="gold-gradient-text">{user?.nombre}</strong>! Tu registro ha sido recibido con éxito.
        </p>
        
        <p className={styles.detail}>
          Por políticas de seguridad y aforo de <strong>Galería Café</strong>, tu cuenta debe ser aprobada por el administrador antes de poder ordenar o gestionar tu grupo.
        </p>

        <div className={styles.statusBox}>
          <span className={styles.statusLabel}>Estado actual:</span>
          <span className="badge badge-pending">Pendiente de Aprobación</span>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleRefresh} 
            className="btn btn-primary"
            disabled={checking}
          >
            {checking ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Comprobar Estado
              </>
            )}
          </button>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
