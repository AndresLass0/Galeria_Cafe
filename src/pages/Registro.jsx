import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Phone, Calendar, ArrowLeft, Shield } from 'lucide-react';
import styles from './Registro.module.css';

export default function Registro() {
  const { register } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    tipoDocumento: 'CC',
    documento: '',
    celular: '',
    fechaNacimiento: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { email, password, ...rest } = formData;
      await register(email, password, rest);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.registerCard} glass-card animate-fade-in`}>
        <div className={styles.header}>
          <Link to="/login" className={styles.backBtn}>
            <ArrowLeft size={18} /> Volver
          </Link>
          <h2>Crear Cuenta</h2>
          <p>Únete a la experiencia Galería Café</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tipo Documento</label>
              <select
                name="tipoDocumento"
                className="form-control"
                value={formData.tipoDocumento}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="TI">Tarjeta de Identidad (TI)</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label">Identificación</label>
              <div className={styles.inputWrapper}>
                <Shield className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  name="documento"
                  className="form-control"
                  placeholder="1005xxxxxx"
                  value={formData.documento}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Celular</label>
              <div className={styles.inputWrapper}>
                <Phone className={styles.inputIcon} size={18} />
                <input
                  type="tel"
                  name="celular"
                  className="form-control"
                  placeholder="320xxxxxxx"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha Nacimiento</label>
              <div className={styles.inputWrapper}>
                <Calendar className={styles.inputIcon} size={18} />
                <input
                  type="date"
                  name="fechaNacimiento"
                  className="form-control"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="juan@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div className={styles.loginLink}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}
