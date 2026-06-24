import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Info, Check, Filter } from 'lucide-react';
import styles from './Catalogo.module.css';

export default function Catalogo() {
  const { productos, subpersonas, addToCart } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Selection states per product ID
  const [allocations, setAllocations] = useState({});

  const handleSelectionChange = (prodId, field, value) => {
    setAllocations(prev => ({
      ...prev,
      [prodId]: {
        ...prev[prodId],
        [field]: value
      }
    }));
  };

  const handleAddToCart = (product) => {
    const alloc = allocations[product.id] || { subpersonaId: '', quantity: 1 };
    const subId = alloc.subpersonaId === '' ? null : alloc.subpersonaId;
    const qty = parseInt(alloc.quantity || 1, 10);

    addToCart(product, qty, subId);
    
    // Reset inputs for this product
    setAllocations(prev => ({
      ...prev,
      [product.id]: {
        subpersonaId: '',
        quantity: 1
      }
    }));
  };

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'comidas', name: 'Comidas' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'eventos', name: 'Eventos' }
  ];

  const filteredProducts = activeCategory === 'all'
    ? productos
    : productos.filter(p => p.categoria === activeCategory);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Menú de la Casa</h2>
        <p>Selecciona tus platos y bebidas favoritas, o reserva tus entradas para eventos.</p>
      </div>

      {/* Category filter */}
      <div className={styles.filterBar}>
        <div className={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.activeFilter : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion notice about subpersonas */}
      {subpersonas.length === 0 && (
        <div className={styles.infoBanner}>
          <Info size={18} />
          <span>
            ¿Estás acompañado? Puedes <Link to="/subpersonas">crear acompañantes aquí</Link> para ordenar productos individualmente y dividir la cuenta fácilmente.
          </span>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No se encontraron productos en esta categoría.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProducts.map(product => {
            const alloc = allocations[product.id] || { subpersonaId: '', quantity: 1 };
            const isAvailable = product.disponible;

            return (
              <div key={product.id} className={`${styles.card} glass-card`}>
                <div className={styles.imageWrapper}>
                  <img src={product.imagen} alt={product.nombre} className={styles.productImage} />
                  <span className={`${styles.categoryBadge} ${styles['cat_' + product.categoria]}`}>
                    {product.categoria}
                  </span>
                </div>

                <div className={styles.details}>
                  <div className={styles.namePrice}>
                    <h3>{product.nombre}</h3>
                    <span className={styles.price}>${product.precio.toLocaleString()}</span>
                  </div>
                  <p className={styles.description}>{product.descripcion}</p>

                  <div className={styles.availability}>
                    {isAvailable ? (
                      <span className={`${styles.badge} ${styles.badgeAvailable}`}>
                        <Check size={12} /> Disponible
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeUnavailable}`}>
                        Agotado
                      </span>
                    )}
                  </div>

                  {isAvailable && (
                    <div className={styles.orderControls}>
                      {/* Subpersona Selector */}
                      <div className={styles.controlGroup}>
                        <label>¿Para quién es?</label>
                        <select
                          className="form-control"
                          value={alloc.subpersonaId}
                          onChange={(e) => handleSelectionChange(product.id, 'subpersonaId', e.target.value)}
                        >
                          <option value="">Para Mí (Principal)</option>
                          {subpersonas.map(s => (
                            <option key={s.id} value={s.id}>Para {s.nombre}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity and button row */}
                      <div className={styles.btnRow}>
                        <div className={styles.qtyBox}>
                          <label>Cant.</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            className="form-control"
                            value={alloc.quantity || 1}
                            onChange={(e) => handleSelectionChange(product.id, 'quantity', parseInt(e.target.value, 10))}
                          />
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                        >
                          <Plus size={16} /> Pedir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
