import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, UserX, Calendar, Phone, Shield, Search } from 'lucide-react';
import styles from './AdminClientes.module.css';

export default function AdminClientes() {
  const { allUsers, handleApproveUser, handleRejectUser, loadAdminData } = useApp();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const pendingClients = allUsers.filter(u => u.aprobado === 'pendiente' && u.rol !== 'admin');
  const approvedClients = allUsers.filter(u => u.aprobado === 'aprobado' && u.rol !== 'admin');
  const rejectedClients = allUsers.filter(u => u.aprobado === 'rechazado' && u.rol !== 'admin');

  const getFilteredList = () => {
    let list = [];
    if (activeTab === 'pending') list = pendingClients;
    else if (activeTab === 'approved') list = approvedClients;
    else list = rejectedClients;

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter(u => 
      u.nombre.toLowerCase().includes(term) ||
      u.documento.includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const filtered = getFilteredList();

  return (
    <div className={styles.container}>
      <div className={`${styles.header} animate-fade-in`}>
        <h2>Gestión de Clientes</h2>
        <p>Aaprueba o rechaza solicitudes de nuevos registros en el sistema.</p>
      </div>

      {/* Tabs and Search */}
      <div className={styles.actionBar}>
        <div className={styles.tabs}>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          >
            Pendientes ({pendingClients.length})
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`${styles.tabBtn} ${activeTab === 'approved' ? styles.activeTab : ''}`}
          >
            Aprobados ({approvedClients.length})
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`${styles.tabBtn} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
          >
            Rechazados ({rejectedClients.length})
          </button>
        </div>

        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre, documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {/* Clients list/table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No se encontraron clientes en esta sección.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(u => (
              <div key={u.id} className={styles.clientCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{u.nombre}</h3>
                    <span className={styles.email}>{u.email}</span>
                  </div>
                  <span className={`${styles.badge} ${
                    u.aprobado === 'pendiente' ? 'badge-pending' :
                    u.aprobado === 'aprobado' ? 'badge-approved' : 'badge-rejected'
                  }`}>
                    {u.aprobado === 'pendiente' ? 'Pendiente' :
                     u.aprobado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                  </span>
                </div>

                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <Shield size={14} />
                    <span>{u.tipoDocumento} {u.documento}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Phone size={14} />
                    <span>{u.celular}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Calendar size={14} />
                    <span>Nació: {formatDate(u.fechaNacimiento)}</span>
                  </div>
                  {u.createdAt && (
                    <div className={styles.detailItem}>
                      <Calendar size={14} />
                      <span>Registrado: {new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {u.aprobado === 'pendiente' && (
                  <div className={styles.actions}>
                    <button 
                      onClick={() => handleApproveUser(u.id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      <UserCheck size={16} /> Aprobar
                    </button>
                    <button 
                      onClick={() => handleRejectUser(u.id)}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                    >
                      <UserX size={16} /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
