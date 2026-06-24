import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Bell, 
  Users, 
  Utensils, 
  FileText, 
  Home, 
  Menu, 
  X 
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, cart, notifications, logout, markNotificationsAsRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadNotifs > 0) {
      markNotificationsAsRead();
    }
  };

  const isActive = (path) => location.pathname === path;

  if (!user || user.rol === 'admin') return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Brand */}
        <Link to="/" className={styles.brand} onClick={() => setMobileMenuOpen(false)}>
          <span className={styles.brandText}>Galería <span className="gold-gradient-text">Café</span></span>
        </Link>

        {/* Desktop Menu Links */}
        <div className={styles.desktopNav}>
          <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
            <Home size={18} /> Inicio
          </Link>
          
          {user.activo && (
            <>
              <Link to="/catalogo" className={`${styles.navLink} ${isActive('/catalogo') ? styles.active : ''}`}>
                <Utensils size={18} /> Menú
              </Link>
              <Link to="/subpersonas" className={`${styles.navLink} ${isActive('/subpersonas') ? styles.active : ''}`}>
                <Users size={18} /> Mi Grupo
              </Link>
              <Link to="/pedidos" className={`${styles.navLink} ${isActive('/pedidos') ? styles.active : ''}`}>
                <FileText size={18} /> Pedidos
              </Link>
            </>
          )}
        </div>

        {/* Action icons (Cart, Notifications, Profile) */}
        <div className={styles.actions}>
          {user.activo && (
            <Link to="/carrito" className={`${styles.actionBtn} ${isActive('/carrito') ? styles.activeAction : ''}`} title="Ver Carrito">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>
          )}

          {/* Notifications Bell */}
          <div className={styles.notificationWrapper}>
            <button className={styles.actionBtn} onClick={toggleNotifications} title="Notificaciones">
              <Bell size={20} />
              {unreadNotifs > 0 && <span className={`${styles.badge} ${styles.badgeWarn}`}>{unreadNotifs}</span>}
            </button>

            {showNotifications && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>
                  <h4>Notificaciones</h4>
                  {unreadNotifs > 0 && <span className={styles.unreadCount}>{unreadNotifs} nuevas</span>}
                </div>
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>No tienes notificaciones.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}>
                        <p className={styles.notifText}>{n.message}</p>
                        <span className={styles.notifTime}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.userSection}>
            <Link to="/perfil" className={styles.profileLink} title="Mi Perfil">
              <div className={styles.avatar}>
                <User size={16} />
              </div>
              <span className={styles.userName}>{user.nombre.split(' ')[0]}</span>
            </Link>
            
            <button onClick={handleLogout} className={styles.logoutBtn} title="Cerrar Sesión">
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileNav}>
          <Link to="/" className={`${styles.mobileNavLink} ${isActive('/') ? styles.mobileActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <Home size={18} /> Inicio
          </Link>
          
          {user.activo && (
            <>
              <Link to="/catalogo" className={`${styles.mobileNavLink} ${isActive('/catalogo') ? styles.mobileActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <Utensils size={18} /> Menú Catálogo
              </Link>
              <Link to="/subpersonas" className={`${styles.mobileNavLink} ${isActive('/subpersonas') ? styles.mobileActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <Users size={18} /> Gestionar Grupo
              </Link>
              <Link to="/pedidos" className={`${styles.mobileNavLink} ${isActive('/pedidos') ? styles.mobileActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <FileText size={18} /> Mis Pedidos
              </Link>
            </>
          )}
          
          <Link to="/perfil" className={`${styles.mobileNavLink} ${isActive('/perfil') ? styles.mobileActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <User size={18} /> Mi Perfil ({user.nombre})
          </Link>
          
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className={`${styles.mobileNavLink} ${styles.mobileLogout}`}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}
