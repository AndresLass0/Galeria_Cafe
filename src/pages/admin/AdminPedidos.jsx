import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ClipboardList, 
  MapPin, 
  User, 
  Calendar, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Clock
} from 'lucide-react';
import styles from './AdminPedidos.module.css';

export default function AdminPedidos() {
  const { 
    allPedidos, 
    allUsers, 
    productos, 
    subpersonas, 
    municipios, 
    handleUpdatePedidoState, 
    handleUpdatePedidoItemState,
    loadAdminData 
  } = useApp();

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // State for rejection text field per item ID
  const [rejectingItemId, setRejectingItemId] = useState(null);
  const [rejectReason, setRejectReason] = useState('Sin disponibilidad');

  useEffect(() => {
    loadAdminData();
  }, []);

  const getClientName = (uid) => {
    return allUsers.find(u => u.id === uid)?.nombre || 'Cliente';
  };

  const getMunicipioName = (muniId) => {
    return municipios.find(m => m.id === muniId)?.nombre || 'Florencia';
  };

  const getProductName = (prodId) => {
    return productos.find(p => p.id === prodId)?.nombre || 'Producto';
  };

  const getSubpersonaName = (subId) => {
    if (!subId) return 'Tú (Cliente Principal)';
    return subpersonas.find(s => s.id === subId)?.nombre || 'Acompañante';
  };

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
    setRejectingItemId(null);
  };

  const handleItemRejectSubmit = async (orderId, itemId) => {
    if (!rejectReason.trim()) return;
    await handleUpdatePedidoItemState(orderId, itemId, 'rechazado', rejectReason.trim());
    setRejectingItemId(null);
    setRejectReason('Sin disponibilidad');
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Gestión de Pedidos</h2>
        <p>Aaprueba o rechaza productos individuales y cambia el estado de preparación de los pedidos.</p>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        {allPedidos.length === 0 ? (
          <div className={styles.emptyState}>
            <ClipboardList size={48} className={styles.emptyIcon} />
            <p>No se han registrado pedidos en la aplicación.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {allPedidos.map(pedido => {
              const clientName = getClientName(pedido.userId);
              const muniName = getMunicipioName(pedido.municipioId);
              const isExpanded = expandedOrderId === pedido.id;
              
              const orderDate = new Date(pedido.fecha).toLocaleDateString();
              const orderTime = new Date(pedido.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={pedido.id} className={`${styles.orderCard} ${isExpanded ? styles.orderCardExpanded : ''}`}>
                  {/* Order header row summary */}
                  <div className={styles.orderSummary} onClick={() => toggleExpandOrder(pedido.id)}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>
                        # Pedido: <strong>{pedido.id.substring(2).toUpperCase()}</strong>
                      </span>
                      <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                          <User size={14} /> <span>{clientName}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <MapPin size={14} /> <span>{muniName}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar size={14} /> <span>{orderDate} - {orderTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orderSummaryRight}>
                      <span className={styles.total}>${pedido.total.toLocaleString()}</span>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`${styles.statusSelect} ${styles['select_' + pedido.estado]}`}
                          value={pedido.estado}
                          onChange={(e) => handleUpdatePedidoState(pedido.id, e.target.value)}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_preparacion">En Preparación</option>
                          <option value="completado">Completado</option>
                        </select>
                      </div>

                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Expandable Order Detail Area */}
                  {isExpanded && (
                    <div className={styles.orderDetail}>
                      {pedido.observaciones && (
                        <div className={styles.observations}>
                          <MessageSquare size={16} />
                          <span><strong>Observaciones:</strong> {pedido.observaciones}</span>
                        </div>
                      )}

                      <h4 className={styles.itemsTitle}>Control de Productos</h4>
                      <div className={styles.itemsTable}>
                        <div className={styles.tableHeader}>
                          <div className={styles.thCol}>Producto</div>
                          <div className={styles.thCol}>Para Quién</div>
                          <div className={styles.thCol}>Cantidad</div>
                          <div className={styles.thCol} style={{ textAlign: 'right' }}>Aprobación</div>
                        </div>

                        {pedido.items.map(item => {
                          const prodName = getProductName(item.productoId);
                          const subName = getSubpersonaName(item.subpersonaId);
                          const isRejecting = rejectingItemId === item.id;

                          return (
                            <div key={item.id} className={styles.itemRow}>
                              <div className={styles.tdCol}>
                                <strong className={styles.prodName}>{prodName}</strong>
                              </div>
                              <div className={styles.tdCol}>
                                <span className={styles.subName}>{subName}</span>
                              </div>
                              <div className={styles.tdCol}>x{item.cantidad}</div>
                              
                              <div className={styles.tdCol} style={{ textAlign: 'right' }}>
                                {item.estado === 'pendiente' ? (
                                  isRejecting ? (
                                    <div className={styles.rejectForm} onClick={(e) => e.stopPropagation()}>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        style={{ padding: '6px 10px', fontSize: '0.85rem', width: '150px' }}
                                        placeholder="Motivo de rechazo"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                      />
                                      <button 
                                        onClick={() => handleItemRejectSubmit(pedido.id, item.id)}
                                        className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                        title="Confirmar"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button 
                                        onClick={() => setRejectingItemId(null)}
                                        className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                        title="Cancelar"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className={styles.actionButtons}>
                                      <button
                                        onClick={() => handleUpdatePedidoItemState(pedido.id, item.id, 'aprobado')}
                                        className={`${styles.stateBtn} ${styles.btnApprove}`}
                                      >
                                        <Check size={14} /> Aceptar
                                      </button>
                                      <button
                                        onClick={() => setRejectingItemId(item.id)}
                                        className={`${styles.stateBtn} ${styles.btnReject}`}
                                      >
                                        <X size={14} /> Rechazar
                                      </button>
                                    </div>
                                  )
                                ) : (
                                  <div className={styles.resolvedState}>
                                    <span className={`${styles.itemBadge} ${
                                      item.estado === 'aprobado' ? styles.badgeApprove : styles.badgeReject
                                    }`}>
                                      {item.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                                    </span>
                                    {item.estado === 'rechazado' && item.motivoRechazo && (
                                      <span className={styles.rejectText}>({item.motivoRechazo})</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
