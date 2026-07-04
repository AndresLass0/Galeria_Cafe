import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Info, Check, Filter, X, Minus, User as UserIcon } from 'lucide-react';
import styles from './Catalogo.module.css';

export default function Catalogo() {
  const { productos, subpersonas, addToCart } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);

  const handleConfirmSelection = (subpersonaId) => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, orderQuantity, subpersonaId);
    setSelectedProduct(null);
    setOrderQuantity(1);
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
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setOrderQuantity(1);
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        <Plus size={16} /> Pedir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Subperson Selection Modal */}
      {selectedProduct && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glass-card animate-fade-in`}>
            <button 
              className={styles.closeBtn} 
              onClick={() => setSelectedProduct(null)}
              title="Cerrar"
            >
              <X size={20} />
            </button>
            
            <div className={styles.modalProductInfo}>
              <img src={selectedProduct.imagen} alt={selectedProduct.nombre} className={styles.modalProductImage} />
              <div className={styles.modalProductText}>
                <h3>{selectedProduct.nombre}</h3>
                <span className={styles.modalProductPrice}>${selectedProduct.precio.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.qtySelector}>
              <span className={styles.qtyLabel}>Cantidad:</span>
              <div className={styles.qtyControls}>
                <button 
                  onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                  className={styles.qtyBtn}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.qtyValue}>{orderQuantity}</span>
                <button 
                  onClick={() => setOrderQuantity(prev => Math.min(20, prev + 1))}
                  className={styles.qtyBtn}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className={styles.assignmentHeader}>
              <h4>¿Para quién es?</h4>
              <p>Asigna este producto a un miembro de la mesa con un solo clic:</p>
            </div>

            <div className={styles.subpersonasGrid}>
              {/* Main Client Card */}
              <div 
                className={styles.subpersonaTile} 
                onClick={() => handleConfirmSelection(null)}
              >
                <div className={`${styles.avatarCircle} ${styles.avatarMain}`}>
                  <UserIcon size={20} />
                </div>
                <div className={styles.subpersonaInfo}>
                  <span className={styles.subName}>Para Mí</span>
                  <span className={styles.subRole}>Principal</span>
                </div>
              </div>

              {/* Companions Cards */}
              {subpersonas.map(s => (
                <div 
                  key={s.id} 
                  className={styles.subpersonaTile} 
                  onClick={() => handleConfirmSelection(s.id)}
                >
                  <div className={`${styles.avatarCircle} ${styles.avatarComp}`}>
                    {s.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.subpersonaInfo}>
                    <span className={styles.subName}>{s.nombre}</span>
                    <span className={styles.subRole}>Acompañante</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
