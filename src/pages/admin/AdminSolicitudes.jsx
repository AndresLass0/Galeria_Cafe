import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, MapPin, User, Calendar, X, AlertTriangle } from 'lucide-react';
import styles from './AdminSolicitudes.module.css';

export default function AdminSolicitudes() {
  const { 
    allUsers, 
    municipios, 
    handleApproveActivation, 
    loadAdminData 
  } = useApp();

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMuniId, setSelectedMuniId] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const pendingActivations = allUsers.filter(
    u => u.solicitudActivacion === 'pendiente' && u.rol !== 'admin'
  );

  const openActivationModal = (userObj) => {
    setSelectedUser(userObj);
    setSelectedMuniId(municipios[0]?.id || '');
    setShowModal(true);
  };

  const closeActivationModal = () => {
    setSelectedUser(null);
    setSelectedMuniId('');
    setShowModal(false);
  };

  const handleConfirmActivation = async () => {
    if (!selectedUser || !selectedMuniId) return;
    try {
      await handleApproveActivation(selectedUser.id, selectedMuniId);
      closeActivationModal();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Solicitudes de Activación</h2>
        <p>Asigna un municipio a los clientes que desean comenzar su experiencia en el local.</p>
      </div>

      <div className="glass-card" style={{ padding: '24px', minHeight: '350px' }}>
        {pendingActivations.length === 0 ? (
          <div className={styles.emptyState}>
            <MapPin size={48} className={styles.emptyIcon} />
            <h3>No hay solicitudes pendientes</h3>
            <p>Los clientes verán un botón de "Comenzar Experiencia" y al presionarlo aparecerán en este listado.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Identificación</th>
                  <th>Celular</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendingActivations.map(u => (
                  <tr key={u.id} className={styles.row}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          <User size={16} />
                        </div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{u.nombre}</span>
                          <span className={styles.userEmail}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{u.tipoDocumento} {u.documento}</td>
                    <td>{u.celular}</td>
                    <td>
                      <button 
                        onClick={() => openActivationModal(u)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <Check size={14} /> Activar Mesa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Municipio Assignment Modal */}
      {showModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glass-card animate-fade-in`}>
            <div className={styles.modalHeader}>
              <h3>Asignar Ubicación / Municipio</h3>
              <button onClick={closeActivationModal} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Selecciona la mesa/municipio temática que se le asignará a <strong>{selectedUser.nombre}</strong>.
              </p>
              
              <div className="form-group" style={{ margin: '20px 0' }}>
                <label className="form-label">Municipio de Florencia a Asignar</label>
                {municipios.length === 0 ? (
                  <div className={styles.warningBox}>
                    <AlertTriangle size={18} />
                    <span>No hay municipios configurados. Ve a la sección de Municipios primero.</span>
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedMuniId}
                    onChange={(e) => setSelectedMuniId(e.target.value)}
                  >
                    {municipios.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={closeActivationModal} className="btn btn-secondary">
                Cancelar
              </button>
              <button 
                onClick={handleConfirmActivation} 
                className="btn btn-primary"
                disabled={municipios.length === 0}
              >
                Confirmar Activación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
