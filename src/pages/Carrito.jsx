import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Clipboard, 
  ArrowLeft,
  User,
  Send
} from 'lucide-react';
import styles from './Carrito.module.css';

export default function Carrito() {
  const { 
    cart, 
    subpersonas, 
    updateCartQuantity, 
    removeFromCart, 
    checkout 
  } = useApp();
  
  const navigate = useNavigate();
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Group cart items by subpersonaId
  // Group keys: 'main' (for null subpersonaId) or the subpersonaId
  const groupedItems = cart.reduce((acc, item) => {
    const key = item.subpersonaId ? item.subpersonaId : 'main';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const getSubpersonaName = (key) => {
    if (key === 'main') return 'Tú (Cliente Principal)';
    const sub = subpersonas.find(s => s.id === key);
    return sub ? sub.nombre : 'Acompañante Desconocido';
  };

  const calculateGroupSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  };

  const totalGeneral = cart.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await checkout(observaciones);
      navigate('/pedidos');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={`${styles.emptyCard} glass-card animate-fade-in`}>
          <ShoppingBag size={64} className={styles.emptyIcon} />
          <h2>Tu Carrito está Vacío</h2>
          <p>Aún no has agregado platos o bebidas a tu pedido.</p>
          <Link to="/catalogo" className="btn btn-primary" style={{ marginTop: '20px' }}>
            <ArrowLeft size={16} /> Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Mi Carrito</h2>
        <p>Revisa el detalle de los productos asignados a cada integrante de tu mesa.</p>
      </div>

      <div className={styles.layout}>
        {/* Cart items list grouped */}
        <div className={styles.itemsCol}>
          {Object.entries(groupedItems).map(([key, items]) => {
            const personName = getSubpersonaName(key);
            const groupSubtotal = calculateGroupSubtotal(items);

            return (
              <div key={key} className={`${styles.groupCard} glass-card animate-fade-in`}>
                <div className={styles.groupHeader}>
                  <div className={styles.groupUser}>
                    <User size={16} className={styles.userIcon} />
                    <h3>{personName}</h3>
                  </div>
                  <span className={styles.groupSubtotal}>
                    Subtotal: <strong>${groupSubtotal.toLocaleString()}</strong>
                  </span>
                </div>

                <div className={styles.groupList}>
                  {items.map((item) => (
                    <div key={`${item.productoId}-${item.subpersonaId}`} className={styles.cartItem}>
                      <img 
                        src={item.producto.imagen} 
                        alt={item.producto.nombre} 
                        className={styles.itemImage} 
                      />
                      
                      <div className={styles.itemDetails}>
                        <h4>{item.producto.nombre}</h4>
                        <span className={styles.itemPrice}>
                          ${item.producto.precio.toLocaleString()} c/u
                        </span>
                      </div>

                      {/* Quantity controls */}
                      <div className={styles.qtyControls}>
                        <button 
                          onClick={() => updateCartQuantity(item.productoId, item.subpersonaId, item.cantidad - 1)}
                          className={styles.qtyBtn}
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyNum}>{item.cantidad}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.productoId, item.subpersonaId, item.cantidad + 1)}
                          className={styles.qtyBtn}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className={styles.itemTotal}>
                        <span>${(item.producto.precio * item.cantidad).toLocaleString()}</span>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.productoId, item.subpersonaId)}
                        className={styles.deleteBtn}
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary sidebar */}
        <div className={styles.summaryCol}>
          <div className="glass-card p-6" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
            <h3 className={styles.summaryTitle}>Resumen del Pedido</h3>
            
            {/* Breakdowns per person */}
            <div className={styles.breakdownList}>
              {Object.entries(groupedItems).map(([key, items]) => (
                <div key={key} className={styles.breakdownRow}>
                  <span>{key === 'main' ? 'Tú' : subpersonas.find(s => s.id === key)?.nombre || 'Acompañante'}</span>
                  <span>${calculateGroupSubtotal(items).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            {/* General Observations */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clipboard size={14} /> Observaciones / Notas
              </label>
              <textarea
                className="form-control"
                placeholder="Ej. Hamburguesa sin cebolla, Coca Cola sin hielo, etc."
                rows="3"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={submitting}
                style={{ resize: 'none', fontSize: '0.85rem' }}
              />
            </div>

            <div className={styles.totalRow}>
              <span>Total General</span>
              <span className={styles.totalAmount}>${totalGeneral.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '20px' }}
              disabled={submitting}
            >
              {submitting ? (
                'Enviando Pedido...'
              ) : (
                <>
                  Confirmar y Enviar <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
