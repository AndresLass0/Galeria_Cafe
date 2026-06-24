import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Check, X, Coffee, Image, DollarSign } from 'lucide-react';
import styles from './AdminProductos.module.css';

export default function AdminProductos() {
  const { 
    productos, 
    handleCreateProducto, 
    handleUpdateProducto, 
    handleDeleteProducto,
    loadAdminData
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null); // null means creating

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'comidas',
    imagen: '',
    disponible: true
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenCreate = () => {
    setCurrentId(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: 'comidas',
      imagen: '',
      disponible: true
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (prod) => {
    setCurrentId(prod.id);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      categoria: prod.categoria,
      imagen: prod.imagen,
      disponible: prod.disponible
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      precio: parseFloat(formData.precio)
    };

    // Fallback image if empty
    if (!data.imagen) {
      data.imagen = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60';
    }

    try {
      if (currentId === null) {
        await handleCreateProducto(data);
      } else {
        await handleUpdateProducto(currentId, data);
      }
      setIsEditing(false);
      setCurrentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Catálogo de Productos</h2>
        <p>Administra las comidas, bebidas y eventos disponibles para los clientes.</p>
      </div>

      <div className={styles.topActions}>
        {!isEditing && (
          <button onClick={handleOpenCreate} className="btn btn-primary animate-fade-in">
            <Plus size={18} /> Crear Producto
          </button>
        )}
      </div>

      {/* Expandable Form Card */}
      {isEditing && (
        <div className={`${styles.formCard} glass-card animate-fade-in`}>
          <h3>{currentId === null ? 'Agregar Nuevo Producto' : 'Editar Producto'}</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Nombre del Producto</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  placeholder="Ej. Hamburguesa de Res"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Precio ($)</label>
                <input
                  type="number"
                  name="precio"
                  className="form-control"
                  placeholder="20000"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Categoría</label>
                <select
                  name="categoria"
                  className="form-control"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="comidas">Comidas</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="eventos">Eventos</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-control"
                placeholder="Detalla los ingredientes o características..."
                rows="2"
                value={formData.descripcion}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className="form-group" style={{ flex: 3 }}>
                <label className="form-label">URL de Imagen</label>
                <input
                  type="url"
                  name="imagen"
                  className="form-control"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imagen}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleChange}
                  />
                  <span>Disponible</span>
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className={styles.grid}>
        {productos.map(p => (
          <div key={p.id} className={`${styles.card} glass-card`}>
            <div className={styles.imageWrapper}>
              <img src={p.imagen} alt={p.nombre} className={styles.productImage} />
              <span className={`${styles.categoryBadge} ${styles['cat_' + p.categoria]}`}>
                {p.categoria}
              </span>
            </div>

            <div className={styles.details}>
              <div className={styles.titlePrice}>
                <h3>{p.nombre}</h3>
                <span className={styles.price}>${p.precio.toLocaleString()}</span>
              </div>
              <p className={styles.description}>{p.descripcion}</p>

              <div className={styles.availability}>
                <span className={`${styles.availabilityBadge} ${p.disponible ? styles.avail : styles.notAvail}`}>
                  {p.disponible ? 'Disponible' : 'Agotado'}
                </span>
              </div>

              <div className={styles.actions}>
                <button 
                  onClick={() => handleOpenEdit(p)}
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '8px' }}
                >
                  <Edit2 size={14} /> Editar
                </button>
                <button 
                  onClick={() => handleDeleteProducto(p.id)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
