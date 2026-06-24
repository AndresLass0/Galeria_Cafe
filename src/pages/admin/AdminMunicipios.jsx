import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Check, X, MapPin } from 'lucide-react';
import styles from './AdminMunicipios.module.css';

export default function AdminMunicipios() {
  const { 
    municipios, 
    handleCreateMunicipio, 
    handleUpdateMunicipio, 
    handleDeleteMunicipio,
    loadAdminData
  } = useApp();

  const [newNombre, setNewNombre] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    handleCreateMunicipio(newNombre.trim());
    setNewNombre('');
  };

  const startEdit = (muni) => {
    setEditingId(muni.id);
    setEditNombre(muni.nombre);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNombre('');
  };

  const saveEdit = (id) => {
    if (!editNombre.trim()) return;
    handleUpdateMunicipio(id, editNombre.trim());
    setEditingId(null);
    setEditNombre('');
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Configuración de Municipios / Ubicaciones</h2>
        <p>Edita o agrega municipios de Florencia que se asignarán a los clientes activos.</p>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Form */}
        <div className={styles.formCol}>
          <div className="glass-card p-6" style={{ padding: '24px' }}>
            <h3 className={styles.formTitle}>Agregar Ubicación</h3>
            <form onSubmit={handleAdd} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Nombre del Municipio</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Puerto Rico, Albania..."
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    <Plus size={18} /> Agregar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className={styles.listCol}>
          <div className="glass-card p-6" style={{ padding: '24px', minHeight: '300px' }}>
            <h3 className={styles.listTitle}>
              <MapPin size={20} /> Municipios Configurados ({municipios.length})
            </h3>

            {municipios.length === 0 ? (
              <div className={styles.emptyState}>
                <MapPin size={48} className={styles.emptyIcon} />
                <p>No hay municipios creados.</p>
                <span>Usa el formulario de la izquierda para agregar uno nuevo.</span>
              </div>
            ) : (
              <div className={styles.list}>
                {municipios.map((muni) => (
                  <div key={muni.id} className={styles.item}>
                    {editingId === muni.id ? (
                      <div className={styles.editWrapper}>
                        <input
                          type="text"
                          className="form-control"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          required
                        />
                        <button onClick={() => saveEdit(muni.id)} className={`${styles.actionBtn} ${styles.saveBtn}`} title="Guardar">
                          <Check size={18} />
                        </button>
                        <button onClick={cancelEdit} className={`${styles.actionBtn} ${styles.cancelBtn}`} title="Cancelar">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={styles.name}>{muni.nombre}</span>
                        <div className={styles.itemActions}>
                          <button onClick={() => startEdit(muni)} className={styles.actionBtn} title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteMunicipio(muni.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Eliminar">
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
