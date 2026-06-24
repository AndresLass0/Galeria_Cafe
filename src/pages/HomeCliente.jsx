import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  Play, 
  MapPin, 
  ShoppingBag, 
  Users, 
  History, 
  Calendar, 
  Bell, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  Award
} from 'lucide-react';
import styles from './HomeCliente.module.css';

export default function HomeCliente() {
  const { user, requestExperience, municipios, notifications, pedidos } = useApp();
  const [loading, setLoading] = useState(false);

  const handleStartExperience = async () => {
    setLoading(true);
    await requestExperience();
    setLoading(false);
  };

  const activeMunicipio = municipios.find(m => m.id === user?.municipioId)?.nombre || '';

  // Get recent unread notifications
  const recentNotifs = notifications.slice(0, 3);
  
  // Get active orders count
  const activeOrders = pedidos.filter(p => p.estado !== 'completado');

  // Case 1 & 2: User is not active yet
  if (!user?.activo) {
    const isPending = user?.solicitudActivacion === 'pendiente';

    return (
      <div className={styles.container}>
        <div className={`${styles.activationCard} glass-card animate-fade-in`}>
          <div className={styles.sparkleIcon}>
            <Sparkles size={32} />
          </div>
          
          <h1 className={styles.title}>
            Bienvenido a <span className="gold-gradient-text">Galería Café</span>
          </h1>
          <p className={styles.subtitle}>
            Una fusión de arte, cultura y la tradición de nuestra tierra.
          </p>

          <div className={styles.experienceBox}>
            {isPending ? (
              <div className={styles.pendingState}>
                <div className={styles.pulseContainer}>
                  <div className={styles.pulseCircle} />
                  <Loader2 size={36} className={styles.spinner} />
                </div>
                <h3>Solicitud de Activación Pendiente</h3>
                <p>
                  Por favor, avisa a tu mesero o administrador. Están asignándote una mesa y un municipio en el sistema.
                </p>
                <div className={styles.instructionBadge}>
                  Esperando asignación de mesa...
                </div>
              </div>
            ) : (
              <div className={styles.startState}>
                <p className={styles.desc}>
                  Para comenzar a ordenar platos deliciosos, bebidas heladas y participar en nuestras actividades culturales, presiona el siguiente botón:
                </p>
                
                <button 
                  onClick={handleStartExperience} 
                  className={`btn btn-primary ${styles.startBtn}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className={styles.spinner} />
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      Comenzar Experiencia <Play size={18} fill="currentColor" />
                    </>
                  )}
                </button>
                <p className={styles.hint}>
                  * Esto notificará al personal del establecimiento para validar tu mesa.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: User is active
  return (
    <div className={styles.container}>
      {/* Hero Welcome banner */}
      <div className={`${styles.heroBanner} glass-card animate-fade-in`}>
        <div className={styles.heroDetails}>
          <span className={styles.welcomeText}>¡Hola, {user.nombre.split(' ')[0]}!</span>
          <h2>Experiencia Activa</h2>
          <div className={styles.municipioTag}>
            <MapPin size={18} />
            <span>Mesa Asignada: <strong className="gold-gradient-text">{activeMunicipio}</strong></span>
          </div>
        </div>
        <div className={styles.heroImageOverlay} />
      </div>

      {/* Grid Quick Actions */}
      <div className={styles.gridContainer}>
        <Link to="/catalogo" className={`${styles.gridCard} glass-card`}>
          <div className={`${styles.cardIcon} ${styles.iconGold}`}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Ver Menú & Pedir</h3>
            <p>Explora nuestras comidas, bebidas y compra entradas para eventos.</p>
          </div>
          <ChevronRight className={styles.arrowIcon} size={20} />
        </Link>

        <Link to="/subpersonas" className={`${styles.gridCard} glass-card`}>
          <div className={`${styles.cardIcon} ${styles.iconTerracota}`}>
            <Users size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Gestionar Grupo</h3>
            <p>Agrega amigos o acompañantes en tu mesa para dividir el pedido por persona.</p>
          </div>
          <ChevronRight className={styles.arrowIcon} size={20} />
        </Link>

        <Link to="/pedidos" className={`${styles.gridCard} glass-card`}>
          <div className={`${styles.cardIcon} ${styles.iconBlue}`}>
            <History size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Mis Pedidos</h3>
            <p>Mira el estado de tus compras e ítems pendientes por entregar.</p>
            {activeOrders.length > 0 && (
              <span className={styles.cardBadge}>{activeOrders.length} activos</span>
            )}
          </div>
          <ChevronRight className={styles.arrowIcon} size={20} />
        </Link>
      </div>

      {/* Banner / Info Grid */}
      <div className={styles.infoGrid}>
        {/* Cultural Billboard */}
        <div className={`${styles.infoCard} glass-card`}>
          <div className={styles.cardHeader}>
            <Calendar size={20} className={styles.headerIcon} />
            <h3>Agenda Cultural de la Semana</h3>
          </div>
          <div className={styles.eventList}>
            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>Vier</span>
                <span className={styles.eventNum}>26</span>
              </div>
              <div className={styles.eventText}>
                <h4>Noche de Acústico: Jazz & Poesía</h4>
                <p>Desde las 8:30 PM en el salón principal. Entrada libre consumo mínimo.</p>
              </div>
            </div>
            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>Sáb</span>
                <span className={styles.eventNum}>27</span>
              </div>
              <div className={styles.eventText}>
                <h4>Exposición de Pintores Amazónicos</h4>
                <p>Galería abierta todo el día. Charla de curaduría a las 6:00 PM.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className={`${styles.infoCard} glass-card`}>
          <div className={styles.cardHeader}>
            <Bell size={20} className={styles.headerIcon} />
            <h3>Actividad Reciente</h3>
          </div>
          <div className={styles.notificationList}>
            {recentNotifs.length === 0 ? (
              <p className={styles.noNotifs}>No hay actualizaciones recientes.</p>
            ) : (
              recentNotifs.map(n => (
                <div key={n.id} className={styles.notificationItem}>
                  <div className={`${styles.notifIndicator} ${!n.read ? styles.unreadDot : ''}`} />
                  <div className={styles.notifBody}>
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleDateString()} a las {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
