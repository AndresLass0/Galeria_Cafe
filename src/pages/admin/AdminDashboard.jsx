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
  TrendingUp
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { 
    allUsers, 
    allPedidos, 
    productos, 
    municipios, 
    loadAdminData 
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
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Panel de Control</h2>
        <p>Resumen general del estado de Galería Café.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} glass-card`}>
          <div className={`${styles.kpiIcon} ${styles.iconGold}`}>
            <Users size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Clientes</span>
            <span className={styles.kpiValue}>{totalClientes}</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-card`}>
          <div className={`${styles.kpiIcon} ${styles.iconGreen}`}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Clientes Activos</span>
            <span className={styles.kpiValue}>{clientesActivos}</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-card`}>
          <div className={`${styles.kpiIcon} ${styles.iconBlue}`}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pedidos Hoy</span>
            <span className={styles.kpiValue}>{pedidosHoy.length}</span>
            <span className={styles.kpiSub}>${ventasHoy.toLocaleString()} COP</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-card`}>
          <div className={`${styles.kpiIcon} ${styles.iconGold}`}>
            <DollarSign size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Ventas Totales</span>
            <span className={styles.kpiValue}>${ventasTotales.toLocaleString()}</span>
            <span className={styles.kpiSub}>Pedidos entregados</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className={styles.dashboardGrid}>
        {/* Left Column: Recent Orders */}
        <div className={`${styles.gridCol} glass-card`}>
          <div className={styles.colHeader}>
            <h3>Pedidos Recientes</h3>
            <Link to="/admin/pedidos" className={styles.viewAll}>
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
                      <strong>{orderUser}</strong>
                      <span>Mesa: {muniName} • {new Date(o.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
        <div className={`${styles.gridCol} glass-card`}>
          <div className={styles.colHeader}>
            <h3>Acción Requerida</h3>
          </div>

          <div className={styles.alertsList}>
            {/* Pending approvals */}
            <Link to="/admin/clientes" className={styles.alertItem}>
              <div className={`${styles.alertIcon} ${styles.alertIconYellow}`}>
                <Users size={20} />
              </div>
              <div className={styles.alertContent}>
                <h4>Aprobaciones de Registro</h4>
                <p>{pendingUsers.length} clientes esperando ser aprobados en el sistema.</p>
              </div>
              <ChevronRight size={18} className={styles.alertArrow} />
            </Link>

            {/* Pending activations */}
            <Link to="/admin/solicitudes" className={styles.alertItem}>
              <div className={`${styles.alertIcon} ${styles.alertIconOrange}`}>
                <Clock size={20} />
              </div>
              <div className={styles.alertContent}>
                <h4>Solicitudes de Mesa (Activación)</h4>
                <p>{pendingActivations.length} clientes esperando asignación de municipio/mesa.</p>
              </div>
              <ChevronRight size={18} className={styles.alertArrow} />
            </Link>

            {/* Active order reviewer */}
            <Link to="/admin/pedidos" className={styles.alertItem}>
              <div className={`${styles.alertIcon} ${styles.alertIconBlue}`}>
                <ShoppingBag size={20} />
              </div>
              <div className={styles.alertContent}>
                <h4>Pedidos por Entregar</h4>
                <p>
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
