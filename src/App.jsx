import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Common Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Registro from './pages/Registro';
import EsperandoAprobacion from './pages/EsperandoAprobacion';
import HomeCliente from './pages/HomeCliente';
import Subpersonas from './pages/Subpersonas';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import MisPedidos from './pages/MisPedidos';
import Perfil from './pages/Perfil';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClientes from './pages/admin/AdminClientes';
import AdminCuentas from './pages/admin/AdminCuentas';
import AdminSolicitudes from './pages/admin/AdminSolicitudes';
import AdminMunicipios from './pages/admin/AdminMunicipios';
import AdminProductos from './pages/admin/AdminProductos';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminEstadisticas from './pages/admin/AdminEstadisticas';

// --- ROUTE GUARDS ---

// 1. Authenticated Gate
function RequireAuth() {
  const { user, loading } = useApp();
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--accent-gold)' }}>
        <h2>Cargando Galería Café...</h2>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// 2. Client Gate (Checks approval and forces waiting view if needed)
function ClientLayout() {
  const { user } = useApp();

  if (user.rol !== 'cliente') {
    return <Navigate to="/admin" replace />;
  }

  // Force awaiting approval view if status is pending
  if (user.aprobado === 'pendiente') {
    return <Navigate to="/esperando-aprobacion" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}

// 3. Admin Layout Wrapper (Sidebar layout)
function AdminLayout() {
  const { user } = useApp();

  if (user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        paddingLeft: '260px', 
        paddingTop: '0', 
        paddingBottom: '40px',
        backgroundColor: 'var(--bg-primary)',
        minHeight: '100vh',
        transition: 'padding var(--transition-normal)'
      }} className="admin-main-viewport">
        <Outlet />
      </main>
      <style>{`
        @media (max-width: 992px) {
          .admin-main-viewport {
            padding-left: 0 !important;
            padding-top: 60px !important;
          }
        }
      `}</style>
    </div>
  );
}

// 4. Double guard for awaiting approval route itself
function AwaitingApprovalRoute() {
  const { user } = useApp();
  if (user.rol !== 'cliente') return <Navigate to="/admin" replace />;
  if (user.aprobado === 'aprobado') return <Navigate to="/" replace />;
  return <EsperandoAprobacion />;
}

// 5. Global Toast notifier
function ToastNotification() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className={`toast-banner toast-${toast.type}`}>
      <span>{toast.message}</span>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          {/* Client Portal */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<HomeCliente />} />
            <Route path="/subpersonas" element={<Subpersonas />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/pedidos" element={<MisPedidos />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          {/* Pending Approval Screen */}
          <Route path="/esperando-aprobacion" element={<AwaitingApprovalRoute />} />

          {/* Admin Dashboard */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/clientes" element={<AdminClientes />} />
            <Route path="/admin/cuentas" element={<AdminCuentas />} />
            <Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
            <Route path="/admin/municipios" element={<AdminMunicipios />} />
            <Route path="/admin/productos" element={<AdminProductos />} />
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
            <Route path="/admin/estadisticas" element={<AdminEstadisticas />} />
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastNotification />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
