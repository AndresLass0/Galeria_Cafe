import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, Users, ShoppingBag, Coffee, Map } from 'lucide-react';
import styles from './AdminEstadisticas.module.css';

export default function AdminEstadisticas() {
  const { allPedidos, allUsers, productos, municipios, loadAdminData } = useApp();

  useEffect(() => {
    loadAdminData();
  }, []);

  const totalClientes = allUsers.length;
  const clientesActivos = allUsers.filter(u => u.activo).length;
  const totalPedidos = allPedidos.length;

  // 1. Total revenue
  const revenueTotal = allPedidos
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + p.total, 0);

  // 2. Sales per Municipio
  const salesByMunicipio = municipios.map(muni => {
    const muniOrders = allPedidos.filter(p => p.municipioId === muni.id && p.estado === 'completado');
    const totalSales = muniOrders.reduce((sum, p) => sum + p.total, 0);
    return {
      nombre: muni.nombre,
      ventas: totalSales,
      cantidad: muniOrders.length
    };
  }).sort((a, b) => b.ventas - a.ventas);

  const maxMuniSales = Math.max(...salesByMunicipio.map(m => m.ventas), 1);

  // 3. Best selling products
  const productSalesMap = {};
  allPedidos.forEach(pedido => {
    pedido.items.forEach(item => {
      // Only count items in approved or completed state
      if (item.estado === 'aprobado' || pedido.estado === 'completado') {
        productSalesMap[item.productoId] = (productSalesMap[item.productoId] || 0) + item.cantidad;
      }
    });
  });

  const bestSellers = productos.map(prod => {
    return {
      nombre: prod.nombre,
      categoria: prod.categoria,
      cantidad: productSalesMap[p.id] || productSalesMap[prod.id] || 0,
      totalGanado: (productSalesMap[prod.id] || 0) * prod.precio
    };
  }).filter(p => p.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad);

  const maxProductQty = Math.max(...bestSellers.map(p => p.cantidad), 1);

  // 4. Sales by Period (Last 5 Days)
  const last5Days = [...Array(5)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesByDay = last5Days.map(dateStr => {
    const dayOrders = allPedidos.filter(p => p.fecha.startsWith(dateStr));
    const daySales = dayOrders.reduce((sum, p) => sum + p.total, 0);
    
    // format date for display (e.g., "24 Jun")
    const dateObj = new Date(dateStr + 'T00:00:00');
    const displayDate = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });

    return {
      fecha: displayDate,
      ventas: daySales,
      cantidad: dayOrders.length
    };
  });

  const maxDaySales = Math.max(...salesByDay.map(d => d.ventas), 1);

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Reportes e Indicadores</h2>
        <p>Métricas y estadísticas detalladas del rendimiento comercial del negocio.</p>
      </div>

      {/* Overview indicators */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} glass-card`}>
          <div className={styles.kpiIcon}>
            <Users size={20} />
          </div>
          <div className={styles.kpiTexts}>
            <span className={styles.kpiLabel}>Actividad de Clientes</span>
            <h3>{clientesActivos} / {totalClientes}</h3>
            <p>Clientes Activos vs Registrados</p>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-card`}>
          <div className={styles.kpiIcon}>
            <ShoppingBag size={20} />
          </div>
          <div className={styles.kpiTexts}>
            <span className={styles.kpiLabel}>Total Órdenes</span>
            <h3>{totalPedidos}</h3>
            <p>Pedidos enviados en total</p>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-card`}>
          <div className={styles.kpiIcon}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.kpiTexts}>
            <span className={styles.kpiLabel}>Ventas Cerradas</span>
            <h3>${revenueTotal.toLocaleString()}</h3>
            <p>Suma de pedidos completados</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        
        {/* Sales by Municipio */}
        <div className={`${styles.chartCol} glass-card`}>
          <div className={styles.chartHeader}>
            <Map size={18} className={styles.chartIcon} />
            <h3>Ventas por Municipio (Mesa Temática)</h3>
          </div>
          
          <div className={styles.municipioChartList}>
            {salesByMunicipio.length === 0 ? (
              <p className={styles.empty}>Sin ventas registradas.</p>
            ) : (
              salesByMunicipio.map((m, idx) => {
                const percentage = Math.max(10, (m.ventas / maxMuniSales) * 100);
                return (
                  <div key={idx} className={styles.barRow}>
                    <div className={styles.barLabel}>
                      <strong>{m.nombre}</strong>
                      <span>${m.ventas.toLocaleString()} ({m.cantidad} ped.)</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div 
                        className={styles.barFillGold} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className={`${styles.chartCol} glass-card`}>
          <div className={styles.chartHeader}>
            <Coffee size={18} className={styles.chartIcon} />
            <h3>Productos más Vendidos</h3>
          </div>

          <div className={styles.productSalesList}>
            {bestSellers.length === 0 ? (
              <p className={styles.empty}>Aún no hay ventas aprobadas de productos.</p>
            ) : (
              bestSellers.slice(0, 5).map((p, idx) => {
                const percentage = Math.max(10, (p.cantidad / maxProductQty) * 100);
                return (
                  <div key={idx} className={styles.barRow}>
                    <div className={styles.barLabel}>
                      <strong>{p.nombre}</strong>
                      <span>{p.cantidad} u. • ${p.totalGanado.toLocaleString()}</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div 
                        className={styles.barFillTerracota} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sales by Day (Period) */}
        <div className={`${styles.chartCol} glass-card`} style={{ gridColumn: 'span 2' }}>
          <div className={styles.chartHeader}>
            <BarChart3 size={18} className={styles.chartIcon} />
            <h3>Ventas por Período (Últimos 5 Días)</h3>
          </div>

          <div className={styles.daysChartList}>
            {salesByDay.map((d, idx) => {
              const heightPercentage = Math.max(12, (d.ventas / maxDaySales) * 80);
              return (
                <div key={idx} className={styles.dayCol}>
                  <span className={styles.dayAmount}>${d.ventas.toLocaleString()}</span>
                  <div className={styles.verticalBarTrack}>
                    <div 
                      className={styles.verticalBarFill} 
                      style={{ height: `${heightPercentage}%` }}
                    />
                  </div>
                  <span className={styles.dayLabel}>{d.fecha}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
