import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  ChevronRight,
  Search,
  ChevronDown
} from 'lucide-react';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const { 
    allUsers, 
    allPedidos, 
    productos, 
    municipios, 
    loadAdminData,
    user 
  } = useApp();

  useEffect(() => {
    loadAdminData();
  }, []);

  // Compute metrics
  const totalClientes = allUsers.length;
  const clientesActivos = allUsers.filter(u => u.activo).length;
  const totalPedidos = allPedidos.length;
  
  // Pedidos del día (today)
  const todayStr = new Date().toISOString().split('T')[0];
  const pedidosHoy = allPedidos.filter(p => p.fecha.startsWith(todayStr));
  const ventasHoy = pedidosHoy.reduce((sum, p) => sum + p.total, 0);

  const ventasTotales = allPedidos
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + p.total, 0);

  // Recent 5 orders
  const recentOrders = allPedidos.slice(0, 5);

  // Recent 5 registered users waiting approval
  const pendingUsers = allUsers.filter(u => u.aprobado === 'pendiente');

  // Pending activations
  const pendingActivations = allUsers.filter(u => u.solicitudActivacion === 'pendiente');

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.headerTitle}>Panel de Control</h1>
          <p className={styles.headerSubtitle}>Resumen general del estado de Galería Café.</p>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className={styles.kpiGrid}>
        {/* Total Clientes (Neutral Oscura) */}
        <div className={`${styles.kpiCard} ${styles.kpiCardDark}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Total Clientes</span>
            <Users size={20} className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiValue}>{totalClientes}</span>
        </div>

        {/* Clientes Activos (KPI Clave - Blood Red) */}
        <div className={`${styles.kpiCard} ${styles.kpiCardRed}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Clientes Activos</span>
            <CheckCircle size={20} className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiValue}>{clientesActivos}</span>
        </div>

        {/* Pedidos Hoy (Neutral Clara) */}
        <div className={`${styles.kpiCard} ${styles.kpiCardLight}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Pedidos Hoy</span>
            <ShoppingBag size={20} className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiValue}>{pedidosHoy.length}</span>
          <span className={styles.kpiSub}>${ventasHoy.toLocaleString()} COP</span>
        </div>

        {/* Ventas Totales (Acento - Camel) */}
        <div className={`${styles.kpiCard} ${styles.kpiCardCamel}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Ventas Totales</span>
            <DollarSign size={20} className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiValue}>${ventasTotales.toLocaleString()}</span>
          <span className={styles.kpiSub}>Pedidos entregados</span>
        </div>
      </section>

      {/* Main Grid Content (Restored 2 columns layout) */}
      <div className={styles.dashboardGrid}>
        {/* Left Column: Recent Orders */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pedidos Recientes</h2>
            <Link to="/admin/pedidos" className={styles.viewAllLink}>
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className={styles.emptyText}>No hay pedidos registrados.</p>
          ) : (
            <div className={styles.orderList}>
              {recentOrders.map(o => {
                const orderUser = allUsers.find(u => u.id === o.userId)?.nombre || 'Cliente';
                const muniName = municipios.find(m => m.id === o.municipioId)?.nombre || 'Florencia';
                
                return (
                  <div key={o.id} className={styles.orderItem}>
                    <div className={styles.orderMain}>
                      <span className={styles.orderUser}>{orderUser}</span>
                      <span className={styles.orderSub}>Mesa: {muniName} • {new Date(o.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.orderTotal}>${o.total.toLocaleString()}</span>
                      <span className={`${styles.statusDot} ${styles['dot_' + o.estado]}`} title={o.estado} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Attention needed list */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Acción Requerida</h2>
          </div>

          <div className={styles.alertsList}>
            {/* Pending approvals */}
            <Link to="/admin/clientes" className={styles.alertItem}>
              <div className={`${styles.alertIcon} ${styles.alertIconYellow}`}>
                <Users size={20} />
              </div>
              <div className={styles.alertContent}>
                <h4 className={styles.alertTitle}>Aprobaciones de Registro</h4>
                <p className={styles.alertDesc}>{pendingUsers.length} clientes esperando ser aprobados en el sistema.</p>
              </div>
              <ChevronRight size={18} className={styles.alertArrow} />
            </Link>

            {/* Pending activations */}
            <Link to="/admin/solicitudes" className={styles.alertItem}>
              <div className={`${styles.alertIcon} ${styles.alertIconOrange}`}>
                <Clock size={20} />
              </div>
              <div className={styles.alertContent}>
                <h4 className={styles.alertTitle}>Solicitudes de Mesa</h4>
                <p className={styles.alertDesc}>{pendingActivations.length} clientes esperando asignación de municipio/mesa.</p>
              </div>
              <ChevronRight size={18} className={styles.alertArrow} />
            </Link>

            {/* Active order reviewer */}
            <Link to="/admin/pedidos" className={styles.alertItem}>
              <div className={`${styles.alertIcon} ${styles.alertIconBlue}`}>
                <ShoppingBag size={20} />
              </div>
              <div className={styles.alertContent}>
                <h4 className={styles.alertTitle}>Pedidos por Entregar</h4>
                <p className={styles.alertDesc}>
                  {allPedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_preparacion').length} pedidos activos en proceso de preparación.
                </p>
              </div>
              <ChevronRight size={18} className={styles.alertArrow} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
