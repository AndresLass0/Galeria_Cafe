import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  const { user, notifications, logout } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const adminNotifications = notifications.filter(n => !n.read);
  const unreadCount = adminNotifications.length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || user.rol !== 'admin') return null;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileBrand}>
          Panel <span className="gold-gradient-text">Admin</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className={styles.toggleBtn}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar container */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <h3>Galería <span className="gold-gradient-text">Café</span></h3>
          <span className={styles.subBrand}>Panel de Administración</span>
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
