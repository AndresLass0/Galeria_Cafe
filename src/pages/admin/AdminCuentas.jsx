import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  MapPin, 
  User, 
  Users, 
  Check, 
  X, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Plus,
  Minus,
  Utensils
} from 'lucide-react';
import styles from './AdminCuentas.module.css';

export default function AdminCuentas() {
  const { 
    allUsers, 
    allPedidos, 
    productos, 
    subpersonas, 
    municipios, 
    handleDeactivateUserSession,
    handleUpdatePedidoItemQuantity,
    handleTogglePedidoItemCheckedOff,
    loadAdminData 
  } = useApp();

  const [activeClientId, setActiveClientId] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filter active clients (exclude admins)
  const activeClients = allUsers.filter(
    u => u.activo && u.rol === 'cliente'
  );

  const activeClient = allUsers.find(u => u.id === activeClientId);

  // Get orders for the active client in this session (matching the assigned table/municipio)
  const clientOrders = activeClient 
    ? allPedidos.filter(p => p.userId === activeClient.id && p.municipioId === activeClient.municipioId)
    : [];

  const getProductName = (prodId) => {
    return productos.find(p => p.id === prodId)?.nombre || 'Producto';
  };

  const getProductPrice = (prodId) => {
    return productos.find(p => p.id === prodId)?.precio || 0;
  };

  const getProductImage = (prodId) => {
    return productos.find(p => p.id === prodId)?.imagen || '';
  };

  // Group items by subpersona
  const groupedItems = {};
  if (activeClient) {
    // Initialize main client and companions in groups
    groupedItems['main'] = [];
    const clientSubs = subpersonas.filter(s => s.userId === activeClient.id);
    clientSubs.forEach(s => {
      groupedItems[s.id] = [];
    });

    clientOrders.forEach(pedido => {
      pedido.items.forEach(item => {
        // Skip rejected items in bill breakdown
        if (item.estado === 'rechazado') return;

        const key = item.subpersonaId ? item.subpersonaId : 'main';
        if (!groupedItems[key]) {
          groupedItems[key] = [];
        }
        
        // Find if this product is already in the list for this subpersona
        // To allow direct update on that specific database item, we keep them as individual entries
        groupedItems[key].push({
          ...item,
          pedidoId: pedido.id,
          pedidoEstado: pedido.estado,
          fecha: pedido.fecha
        });
      });
    });
  }

  const getSubpersonaName = (key) => {
    if (key === 'main') return 'Cliente Principal (Mesa)';
    const sub = subpersonas.find(s => s.id === key);
    return sub ? sub.nombre : 'Acompañante';
  };

  const calculateGroupSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (getProductPrice(item.productoId) * item.cantidad), 0);
  };

  const calculateTableTotal = () => {
    let total = 0;
    Object.values(groupedItems).forEach(items => {
      total += calculateGroupSubtotal(items);
    });
    return total;
  };

  // Check if session has pending items or unpaid items
  const checkPendingConsumptions = () => {
    let hasPending = false;
    clientOrders.forEach(pedido => {
      // Pedido not completed yet
      if (pedido.estado !== 'completado') {
        hasPending = true;
      }
      pedido.items.forEach(item => {
        if (item.estado === 'rechazado') return;
        // Item is not delivered/paid yet
        if (!item.checkedOff) {
          hasPending = true;
        }
      });
    });
    return hasPending;
  };

  const handleTerminateSessionClick = () => {
    const hasPending = checkPendingConsumptions();
    if (hasPending) {
      setShowWarningModal(true);
    } else {
      confirmTerminateSession();
    }
  };

  const confirmTerminateSession = async () => {
    if (!activeClient) return;
    await handleDeactivateUserSession(activeClient.id);
    setActiveClientId(null);
    setShowWarningModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Cuentas Activas</h2>
        <p>Gestiona los consumos en mesa en tiempo real y finaliza las sesiones de clientes.</p>
      </div>

      <div className={styles.layout}>
        {/* Active Tables Map / List */}
        <div className={styles.tablesCol}>
          <div className="glass-card p-6" style={{ padding: '24px' }}>
            <h3 className={styles.colTitle}>Mesas Ocupadas</h3>
            {activeClients.length === 0 ? (
              <div className={styles.emptyState}>
                <MapPin size={32} className={styles.emptyIcon} />
                <p>No hay mesas activas en este momento.</p>
              </div>
            ) : (
              <div className={styles.tablesList}>
                {activeClients.map(client => {
                  const muniName = municipios.find(m => m.id === client.municipioId)?.nombre || 'Mesa';
                  const isSelected = client.id === activeClientId;
                  
                  // Compute active orders count for badge
                  const userOrders = allPedidos.filter(p => p.userId === client.id && p.municipioId === client.municipioId);
                  const pendingOrdersCount = userOrders.filter(p => p.estado !== 'completado').length;

                  return (
                    <div 
                      key={client.id}
                      onClick={() => {
                        setActiveClientId(client.id);
                        setShowWarningModal(false);
                      }}
                      className={`${styles.tableItem} ${isSelected ? styles.tableItemActive : ''}`}
                    >
                      <div className={styles.tableMeta}>
                        <div className={styles.tableBadge}>
                          <Utensils size={16} />
                        </div>
                        <div className={styles.tableInfo}>
                          <strong>{muniName}</strong>
                          <span>{client.nombre}</span>
                        </div>
                      </div>
                      <div className={styles.tableRight}>
                        {pendingOrdersCount > 0 && (
                          <span className={styles.pendingBadge}>{pendingOrdersCount} Pedidos</span>
                        )}
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Table Account breakdown detail */}
        <div className={styles.accountCol}>
          {activeClient ? (
            <div className={`${styles.accountCard} glass-card animate-fade-in`}>
              <div className={styles.accountHeader}>
                <div>
                  <span className={styles.tableNumberLabel}>Mesa Activa</span>
                  <h3>{municipios.find(m => m.id === activeClient.municipioId)?.nombre || 'Florencia'}</h3>
                  <p className={styles.clientName}>Cliente Principal: <strong>{activeClient.nombre}</strong></p>
                </div>
                
                <button 
                  onClick={handleTerminateSessionClick}
                  className="btn btn-danger"
                >
                  <X size={16} /> Terminar Cuenta
                </button>
              </div>

              {/* Consumption List */}
              <div className={styles.consumptionContainer}>
                {Object.entries(groupedItems).map(([key, items]) => {
                  const subpersonaName = getSubpersonaName(key);
                  const subtotal = calculateGroupSubtotal(items);
                  const isCompanion = key !== 'main';

                  return (
                    <div key={key} className={styles.subpersonaBlock}>
                      <div className={styles.subpersonaBlockHeader}>
                        <div className={styles.subpersonaTitle}>
                          {isCompanion ? <Users size={16} /> : <User size={16} />}
                          <h4>{subpersonaName}</h4>
                        </div>
                        <span className={styles.subtotalText}>
                          Subtotal: <strong>${subtotal.toLocaleString()}</strong>
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <p className={styles.emptyConsumptions}>No ha ordenado consumos todavía.</p>
                      ) : (
                        <div className={styles.consumptionsList}>
                          {items.map(item => {
                            const price = getProductPrice(item.productoId);
                            const name = getProductName(item.productoId);
                            const img = getProductImage(item.productoId);
                            const isChecked = item.checkedOff;

                            return (
                              <div key={item.id} className={`${styles.consumptionItem} ${isChecked ? styles.itemCheckedOff : ''}`}>
                                <div className={styles.itemMain}>
                                  {img && <img src={img} alt={name} className={styles.itemThumb} />}
                                  <div className={styles.itemMeta}>
                                    <strong>{name}</strong>
                                    <span>${price.toLocaleString()} c/u • Pedido: #{item.pedidoId.substring(2, 6).toUpperCase()}</span>
                                  </div>
                                </div>

                                <div className={styles.itemControls}>
                                  {/* Quantity adjustments */}
                                  <div className={styles.qtyAdjust}>
                                    <button 
                                      onClick={() => handleUpdatePedidoItemQuantity(item.pedidoId, item.id, item.cantidad - 1)}
                                      className={styles.adjustBtn}
                                      title="Restar cantidad"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className={styles.qtyVal}>{item.cantidad}</span>
                                    <button 
                                      onClick={() => handleUpdatePedidoItemQuantity(item.pedidoId, item.id, item.cantidad + 1)}
                                      className={styles.adjustBtn}
                                      title="Sumar cantidad"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>

                                  <div className={styles.itemPriceCol}>
                                    <span>${(price * item.cantidad).toLocaleString()}</span>
                                  </div>

                                  {/* Check-off toggle */}
                                  <button
                                    onClick={() => handleTogglePedidoItemCheckedOff(item.id, !isChecked)}
                                    className={`${styles.checkoffBtn} ${isChecked ? styles.checkoffBtnActive : ''}`}
                                    title={isChecked ? "Marcar como pendiente" : "Marcar como pagado/entregado"}
                                  >
                                    <Check size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Consolidado footer */}
              <div className={styles.accountFooter}>
                <div className={styles.consolidadoRow}>
                  <span>Total General de Mesa</span>
                  <span className={styles.totalValue}>${calculateTableTotal().toLocaleString()} COP</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.noSelectionCard} glass-card`}>
              <CreditCard size={48} className={styles.noSelectionIcon} />
              <h3>Selecciona una mesa</h3>
              <p>Haz clic en una mesa del listado izquierdo para auditar los consumos, marcar cuentas y cerrar sesiones.</p>
            </div>
          )}
        </div>
      </div>

      {/* Critical Warning Modal */}
      {showWarningModal && activeClient && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.warningCard} glass-card animate-fade-in`}>
            <div className={styles.warningHeader}>
              <AlertTriangle size={36} className={styles.warningIcon} />
              <h3>¡Advertencia Crítica de Cierre!</h3>
            </div>
            
            <div className={styles.modalBody}>
              <p>
                Estás intentando cerrar la cuenta de la mesa de <strong>{activeClient.nombre}</strong>.
              </p>
              <div className={styles.warningBox}>
                <p><strong>Motivo de alerta:</strong> Esta mesa aún tiene consumos pendientes de cobro (sin marcar) o pedidos en preparación en la cocina.</p>
              </div>
              <p className={styles.modalText}>
                Si finalizas la cuenta, se desactivará la mesa y ya no se podrán realizar más pedidos en esta sesión. ¿Deseas proceder de todos modos?
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowWarningModal(false)} 
                className="btn btn-secondary"
              >
                Cancelar y Revisar
              </button>
              <button 
                onClick={confirmTerminateSession} 
                className="btn btn-danger"
              >
                Terminar Cuenta de Todos Modos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
