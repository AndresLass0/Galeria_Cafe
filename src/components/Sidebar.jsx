import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/logo.png';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  MapPin, 
  Coffee, 
  ClipboardList, 
  BarChart3, 
  LogOut,
  Bell,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { user, notifications, logout, markNotificationsAsRead } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const adminNotifications = notifications.filter(n => !n.read);
  const unreadCount = adminNotifications.length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  if (!user || user.rol !== 'admin') return null;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileBrand}>
          <img src={logoImg} alt="Galería Café" className={styles.logoMobile} />
        </div>

        {/* Notifications Bell for Mobile */}
        <div className={styles.notifWrapperMobile}>
          <button onClick={toggleNotifications} className={styles.bellBtn} title="Notificaciones">
            <Bell size={20} />
            {unreadCount > 0 && <span className={styles.bellBadge}>{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h4>Notificaciones</h4>
                {unreadCount > 0 && <span className={styles.countBadge}>{unreadCount} nuevas</span>}
              </div>
              <div className={styles.dropdownList}>
                {notifications.length === 0 ? (
                  <div className={styles.empty}>No tienes notificaciones.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`${styles.item} ${!n.read ? styles.unreadItem : ''}`}>
                      <p>{n.message}</p>
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className={styles.toggleBtn}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar container */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <img src={logoImg} alt="Galería Café" className={styles.logo} />
          
          {/* Notifications Bell for Desktop */}
          <div className={styles.notifWrapper}>
            <button onClick={toggleNotifications} className={styles.bellBtn} title="Notificaciones">
              <Bell size={20} />
              {unreadCount > 0 && <span className={styles.bellBadge}>{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <h4>Notificaciones</h4>
                  {unreadCount > 0 && <span className={styles.countBadge}>{unreadCount} nuevas</span>}
                </div>
                <div className={styles.dropdownList}>
                  {notifications.length === 0 ? (
                    <div className={styles.empty}>No tienes notificaciones.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`${styles.item} ${!n.read ? styles.unreadItem : ''}`}>
                        <p>{n.message}</p>
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className={styles.navMenu}>
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Inicio</span>
          </NavLink>

          <NavLink 
            to="/admin/clientes" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <Users size={20} />
            <span>Clientes</span>
          </NavLink>

          <NavLink 
            to="/admin/cuentas" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <CreditCard size={20} />
            <span>Cuentas Activas</span>
          </NavLink>

          <NavLink 
            to="/admin/solicitudes" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <UserCheck size={20} />
            <span>Solicitudes</span>
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </NavLink>

          <NavLink 
            to="/admin/municipios" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <MapPin size={20} />
            <span>Municipios</span>
          </NavLink>

          <NavLink 
            to="/admin/productos" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <Coffee size={20} />
            <span>Productos</span>
          </NavLink>

          <NavLink 
            to="/admin/pedidos" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <ClipboardList size={20} />
            <span>Pedidos</span>
          </NavLink>

          <NavLink 
            to="/admin/estadisticas" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <BarChart3 size={20} />
            <span>Estadísticas</span>
          </NavLink>
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.nombre}</span>
            <span className={styles.userRole}>Administrador</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </>
  );
}
