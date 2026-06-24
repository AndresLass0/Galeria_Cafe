import React from 'react';
import { useApp } from '../context/AppContext';
import { ClipboardList, Calendar, MapPin, CheckCircle2, XCircle, Clock, ShoppingBag } from 'lucide-react';
import styles from './MisPedidos.jsx.module.css';

export default function MisPedidos() {
  const { pedidos, productos, subpersonas, municipios } = useApp();

  const getMunicipioName = (muniId) => {
    return municipios.find(m => m.id === muniId)?.nombre || 'Florencia';
  };

  const getProductName = (prodId) => {
    return productos.find(p => p.id === prodId)?.nombre || 'Producto';
  };

  const getProductPrice = (prodId) => {
    return productos.find(p => p.id === prodId)?.precio || 0;
  };

  const getSubpersonaName = (subId) => {
    if (!subId) return 'Tú (Cliente Principal)';
    return subpersonas.find(s => s.id === subId)?.nombre || 'Acompañante';
  };

  const getOrderStatusBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <span className="badge badge-pending">En revisión</span>;
      case 'en_preparacion':
        return <span className="badge badge-completed">En preparación</span>; // Blue
      case 'completado':
        return <span className="badge badge-approved">Completado</span>; // Green
      default:
        return <span className="badge">{estado}</span>;
    }
  };

  const getItemStatusBadge = (item) => {
    switch (item.estado) {
      case 'pendiente':
        return (
          <span className={`${styles.itemBadge} ${styles.itemPending}`}>
            <Clock size={12} /> Revisando disponibilidad
          </span>
        );
      case 'aprobado':
        return (
          <span className={`${styles.itemBadge} ${styles.itemApproved}`}>
            <CheckCircle2 size={12} /> Aprobado
          </span>
        );
      case 'rechazado':
        return (
          <span className={`${styles.itemBadge} ${styles.itemRejected}`}>
            <XCircle size={12} /> Rechazado
          </span>
        );
      default:
        return <span className={styles.itemBadge}>{item.estado}</span>;
    }
  };

  if (pedidos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={`${styles.emptyCard} glass-card animate-fade-in`}>
          <ClipboardList size={64} className={styles.emptyIcon} />
          <h2>Aún no tienes pedidos</h2>
          <p>Tus pedidos aparecerán aquí una vez que los envíes desde el carrito.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Mis Pedidos</h2>
        <p>Monitorea en tiempo real el estado de tus órdenes y la aprobación de tus platos.</p>
      </div>

      <div className={styles.list}>
        {pedidos.map((pedido) => {
          const orderDate = new Date(pedido.fecha).toLocaleDateString([], {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          const orderTime = new Date(pedido.fecha).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={pedido.id} className={`${styles.orderCard} glass-card animate-fade-in`}>
              {/* Order Top Bar Info */}
              <div className={styles.orderTop}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>
                    Pedido ID: <strong>{pedido.id.toUpperCase()}</strong>
                  </span>
                  
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <Calendar size={14} />
                      <span>{orderDate} a las {orderTime}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <MapPin size={14} />
                      <span>Mesa: {getMunicipioName(pedido.municipioId)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.orderStatusBlock}>
                  <span className={styles.metaLabel}>Estado de Entrega:</span>
                  {getOrderStatusBadge(pedido.estado)}
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className={styles.itemsList}>
                <h4 className={styles.breakdownHeader}>Detalle de Productos</h4>
                
                {pedido.items.map((item) => {
                  const pName = getProductName(item.productoId);
                  const pPrice = getProductPrice(item.productoId);
                  const subName = getSubpersonaName(item.subpersonaId);

                  return (
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemNameWrapper}>
                          <span className={styles.itemName}>{pName}</span>
                          <span className={styles.itemQty}>x{item.cantidad}</span>
                        </div>
                        <span className={styles.itemOwner}>Asignado a: {subName}</span>
                      </div>

                      <div className={styles.itemStatusWrapper}>
                        {getItemStatusBadge(item)}
                        {item.estado === 'rechazado' && item.motivoRechazo && (
                          <span className={styles.rejectReason}>
                            Motivo: <strong>{item.motivoRechazo}</strong>
                          </span>
                        )}
                      </div>

                      <div className={styles.itemPriceBlock}>
                        <span>${(pPrice * item.cantidad).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Footer summary */}
              <div className={styles.orderFooter}>
                {pedido.observaciones && (
                  <div className={styles.observations}>
                    <strong>Notas:</strong> {pedido.observaciones}
                  </div>
                )}
                
                <div className={styles.totalRow}>
                  <span>Total Pagado:</span>
                  <span className={styles.totalAmount}>${pedido.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
