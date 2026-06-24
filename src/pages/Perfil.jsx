import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, Mail, Calendar, Shield, MapPin, Bell } from 'lucide-react';
import styles from './Perfil.module.css';

export default function Perfil() {
  const { user, municipios, notifications } = useApp();

  const activeMunicipio = municipios.find(m => m.id === user?.municipioId)?.nombre || 'Ninguno';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Mi Perfil</h2>
        <p>Gestiona tus datos personales y consulta el registro de notificaciones.</p>
      </div>

      <div className={styles.layout}>
        {/* Profile Card */}
        <div className={styles.profileCol}>
          <div className="glass-card p-6" style={{ padding: '30px' }}>
            <div className={styles.userHeader}>
              <div className={styles.avatarLarge}>
                <User size={36} />
              </div>
              <div className={styles.userTitle}>
                <h3>{user?.nombre}</h3>
                <span className="badge badge-approved" style={{ marginTop: '4px' }}>
                  Cliente Activo
                </span>
              </div>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Shield className={styles.infoIcon} size={18} />
                <div className={styles.infoTexts}>
                  <label>Identificación</label>
                  <span>{user?.tipoDocumento} {user?.documento}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Phone className={styles.infoIcon} size={18} />
                <div className={styles.infoTexts}>
                  <label>Celular</label>
                  <span>{user?.celular}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Calendar className={styles.infoIcon} size={18} />
                <div className={styles.infoTexts}>
                  <label>Fecha de Nacimiento</label>
                  <span>{formatDate(user?.fechaNacimiento)}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Mail className={styles.infoIcon} size={18} />
                <div className={styles.infoTexts}>
                  <label>Correo Electrónico</label>
                  <span>{user?.email}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <MapPin className={styles.infoIcon} size={18} />
                <div className={styles.infoTexts}>
                  <label>Mesa / Municipio Asignado</label>
                  <span className="gold-gradient-text" style={{ fontWeight: '600' }}>
                    {activeMunicipio}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Column */}
        <div className={styles.notifCol}>
          <div className="glass-card p-6" style={{ padding: '30px', minHeight: '400px' }}>
            <h3 className={styles.notifTitle}>
              <Bell size={20} className={styles.bellIcon} /> Historial de Notificaciones
            </h3>

            {notifications.length === 0 ? (
              <div className={styles.emptyNotifs}>
                <Bell size={40} className={styles.emptyBell} />
                <p>No tienes notificaciones registradas.</p>
              </div>
            ) : (
              <div className={styles.notifList}>
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`${styles.notifCard} ${!n.read ? styles.notifUnread : ''}`}
                  >
                    <div className={styles.notifHeader}>
                      <span className={styles.notifDate}>
                        {new Date(n.createdAt).toLocaleDateString()} a las {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={styles.notifText}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
