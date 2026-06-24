import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Edit2, Trash2, Check, X, Info } from 'lucide-react';
import styles from './Subpersonas.module.css';

export default function Subpersonas() {
  const { subpersonas, handleAddSubpersona, handleEditSubpersona, handleDeleteSubpersona } = useApp();
  
  const [newNombre, setNewNombre] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    handleAddSubpersona(newNombre.trim());
    setNewNombre('');
  };

  const startEdit = (sub) => {
    setEditingId(sub.id);
    setEditNombre(sub.nombre);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNombre('');
  };

  const saveEdit = (id) => {
    if (!editNombre.trim()) return;
    handleEditSubpersona(id, editNombre.trim());
    setEditingId(null);
    setEditNombre('');
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Mi Mesa & Acompañantes</h2>
        <p>Administra los integrantes de tu grupo para asociarles productos individualmente.</p>
      </div>

      <div className={styles.layout}>
        {/* Form and info column */}
        <div className={styles.infoCol}>
          <div className="glass-card p-6" style={{ padding: '24px' }}>
            <div className={styles.infoBox}>
              <Info className={styles.infoIcon} size={20} />
              <div>
                <h4>¿Cómo funciona?</h4>
                <p>
                  Agrega los nombres de tus amigos o familiares en la mesa. Al seleccionar productos en el menú, podrás elegir para quién es cada plato o bebida.
                </p>
                <p style={{ marginTop: '8px' }}>
                  El carrito mostrará el pedido ordenado por persona y calculará subtotales individuales para facilitar la cuenta.
                </p>
              </div>
            </div>

            <form onSubmit={handleAdd} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Nombre del Acompañante</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Carlos, María, Andrés..."
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    required
                  />
                  <button type="submit" className={`btn btn-primary ${styles.addBtn}`}>
                    <Plus size={20} /> Agregar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* List column */}
        <div className={styles.listCol}>
          <div className="glass-card p-6" style={{ padding: '24px', minHeight: '300px' }}>
            <h3 className={styles.listTitle}>
              <Users size={20} /> Grupo Actual ({subpersonas.length})
            </h3>
            
            {subpersonas.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={48} className={styles.emptyIcon} />
                <p>No has agregado acompañantes a tu mesa todavía.</p>
                <span>¡Agrega personas en el formulario de la izquierda!</span>
              </div>
            ) : (
              <div className={styles.list}>
                {subpersonas.map((sub) => (
                  <div key={sub.id} className={styles.item}>
                    {editingId === sub.id ? (
                      <div className={styles.editWrapper}>
                        <input
                          type="text"
                          className="form-control"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          required
                        />
                        <button onClick={() => saveEdit(sub.id)} className={`${styles.actionBtn} ${styles.saveBtn}`} title="Guardar">
                          <Check size={18} />
                        </button>
                        <button onClick={cancelEdit} className={`${styles.actionBtn} ${styles.cancelBtn}`} title="Cancelar">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={styles.name}>{sub.nombre}</span>
                        <div className={styles.itemActions}>
                          <button onClick={() => startEdit(sub)} className={styles.actionBtn} title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteSubpersona(sub.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
