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
  Coffee
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

  // Case 1 & 2: User is not active yet (Keep same layout but update styling slightly to match the theme)
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

  // Case 3: User is active (Aligned with the Admin Dashboard style)
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.headerTitle}>Experiencia Activa</h1>
          <p className={styles.headerSubtitle}>
            ¡Hola, {user.nombre.split(' ')[0]}! • Mesa Asignada: <strong>{activeMunicipio}</strong>
          </p>
        </div>
      </header>

      {/* Action cards resembling admin KPIs */}
      <section className={styles.kpiGrid}>
        {/* Ver Menú & Pedir (Red Card) */}
        <Link to="/catalogo" className={`${styles.kpiCard} ${styles.kpiCardRed}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Catálogo</span>
            <Coffee size={20} className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiValueText}>Ver Menú & Pedir</span>
          <span className={styles.kpiSub}>Explora nuestros platos, bebidas y eventos.</span>
        </Link>

        {/* Gestionar Grupo (Dark Coffee Card) */}
        <Link to="/subpersonas" className={`${styles.kpiCard} ${styles.kpiCardDark}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Grupo / Mesa</span>
            <Users size={20} className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiValueText}>Gestionar Grupo</span>
          <span className={styles.kpiSub}>Agrega acompañantes en tu mesa y divide cuentas.</span>
        </Link>

        {/* Mis Pedidos (Camel Card) */}
        <Link to="/pedidos" className={`${styles.kpiCard} ${styles.kpiCardCamel}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Mis Compras</span>
            <History size={20} className={styles.kpiIcon} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span className={styles.kpiValueText}>Mis Pedidos</span>
            {activeOrders.length > 0 && (
              <span className={styles.activeBadge}>{activeOrders.length} activos</span>
            )}
          </div>
          <span className={styles.kpiSub}>Mira tus platos y bebidas en proceso de entrega.</span>
        </Link>
      </section>

      {/* Main Grid Content (Restored 2 columns layout matching admin dashboard) */}
      <div className={styles.dashboardGrid}>
        {/* Left Column: Agenda Cultural */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} className={styles.headerIcon} />
              <h2 className={styles.cardTitle}>Agenda Cultural de la Semana</h2>
            </div>
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

        {/* Right Column: Actividad Reciente */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={20} className={styles.headerIcon} />
              <h2 className={styles.cardTitle}>Actividad Reciente</h2>
            </div>
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
