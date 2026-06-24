import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/db';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // App lists cached for UI
  const [municipios, setMunicipios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [subpersonas, setSubpersonas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [allPedidos, setAllPedidos] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Math.random() });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load notifications from localStorage
  const loadNotifications = (userId) => {
    if (!userId) return;
    const allNotifs = JSON.parse(localStorage.getItem('gc_notifications') || '[]');
    const userNotifs = allNotifs.filter(n => n.userId === userId || (user?.rol === 'admin' && n.userId === 'admin'));
    setNotifications(userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const addNotification = (targetUserId, message, type = 'info') => {
    const allNotifs = JSON.parse(localStorage.getItem('gc_notifications') || '[]');
    const newNotif = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      userId: targetUserId, // 'admin' or specific userId
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    allNotifs.push(newNotif);
    localStorage.setItem('gc_notifications', JSON.stringify(allNotifs));
    
    // If active user is the target, refresh notifications state
    if (user && (user.id === targetUserId || (user.rol === 'admin' && targetUserId === 'admin'))) {
      loadNotifications(user.id);
    }
  };

  const markNotificationsAsRead = () => {
    if (!user) return;
    const allNotifs = JSON.parse(localStorage.getItem('gc_notifications') || '[]');
    const updated = allNotifs.map(n => {
      if (n.userId === user.id || (user.rol === 'admin' && n.userId === 'admin')) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem('gc_notifications', JSON.stringify(updated));
    loadNotifications(user.id);
  };

  // Auth State Listener
  useEffect(() => {
    let unsubscribe = () => {};

    if (!dbService.isMock) {
      // Firebase auth listener
      unsubscribe = dbService.subscribeAuthState((userData) => {
        setUser(userData);
        if (userData) {
          loadNotifications(userData.id);
          loadClientInitialData(userData);
        } else {
          setSubpersonas([]);
          setPedidos([]);
        }
        setLoading(false);
      });
    } else {
      // Mock auth persistent session check
      const savedUserId = localStorage.getItem('gc_current_user_id');
      if (savedUserId) {
        dbService.getUser(savedUserId).then((userData) => {
          if (userData) {
            setUser(userData);
            loadNotifications(userData.id);
            loadClientInitialData(userData);
          } else {
            localStorage.removeItem('gc_current_user_id');
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }

    // Load common public data
    refreshCatalog();

    return () => unsubscribe();
  }, []);

  // Fetch catalog & municipios
  const refreshCatalog = async () => {
    try {
      const p = await dbService.getProductos();
      const m = await dbService.getMunicipios();
      setProductos(p);
      setMunicipios(m);
    } catch (e) {
      console.error("Error loading base catalog data:", e);
    }
  };

  // Fetch client initial data
  const loadClientInitialData = async (currUser) => {
    if (!currUser || currUser.rol === 'admin') return;
    try {
      const subs = await dbService.getSubpersonas(currUser.id);
      const peds = await dbService.getPedidos(currUser.id);
      setSubpersonas(subs);
      setPedidos(peds);
    } catch (e) {
      console.error("Error loading client data:", e);
    }
  };

  // Refresh active user document
  const refreshUserData = async () => {
    if (!user) return;
    try {
      const updated = await dbService.getUser(user.id);
      setUser(updated);
      loadNotifications(user.id);
      return updated;
    } catch (e) {
      console.error(e);
    }
  };

  // --- CLIENT ACTIONS ---

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await dbService.signIn(email, password);
      setUser(userData);
      if (dbService.isMock) {
        localStorage.setItem('gc_current_user_id', userData.id);
      }
      loadNotifications(userData.id);
      if (userData.rol === 'admin') {
        await loadAdminData();
      } else {
        await loadClientInitialData(userData);
      }
      showToast(`¡Bienvenido de nuevo, ${userData.nombre}!`, 'success');
      return userData;
    } catch (error) {
      showToast(error.message || 'Error al iniciar sesión', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData) => {
    setLoading(true);
    try {
      const newUser = await dbService.signUp(email, password, userData);
      showToast('Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.', 'info');
      
      // Notify Admin
      addNotification('admin', `Nuevo registro: ${newUser.nombre} (${newUser.tipoDocumento} ${newUser.documento}) ha solicitado registro.`, 'info');
      
      return newUser;
    } catch (error) {
      showToast(error.message || 'Error al registrarse', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await dbService.signOut();
      setUser(null);
      setCart([]);
      setSubpersonas([]);
      setPedidos([]);
      setAllPedidos([]);
      setAllUsers([]);
      if (dbService.isMock) {
        localStorage.removeItem('gc_current_user_id');
      }
      showToast('Sesión cerrada correctamente.', 'info');
    } catch (error) {
      showToast('Error al cerrar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const requestExperience = async () => {
    if (!user) return;
    try {
      await dbService.requestActivation(user.id);
      const updated = await refreshUserData();
      
      // Notify Admin
      addNotification('admin', `Nueva solicitud de activación: El cliente ${user.nombre} desea comenzar la experiencia.`, 'warning');
      
      showToast('Solicitud de experiencia enviada al administrador. Esperando asignación de municipio.', 'info');
      return updated;
    } catch (error) {
      showToast('Error al enviar la solicitud de experiencia', 'error');
    }
  };

  // --- SUBPERSONAS MANAGEMENT ---

  const handleAddSubpersona = async (nombre) => {
    if (!user) return;
    try {
      const newSub = await dbService.createSubpersona(user.id, nombre);
      setSubpersonas(prev => [...prev, newSub]);
      showToast(`Subpersona "${nombre}" creada.`, 'success');
    } catch (error) {
      showToast('Error al crear subpersona', 'error');
    }
  };

  const handleEditSubpersona = async (id, nombre) => {
    try {
      await dbService.updateSubpersona(id, nombre);
      setSubpersonas(prev => prev.map(s => s.id === id ? { ...s, nombre } : s));
      showToast('Subpersona modificada.', 'success');
    } catch (error) {
      showToast('Error al modificar subpersona', 'error');
    }
  };

  const handleDeleteSubpersona = async (id) => {
    try {
      await dbService.deleteSubpersona(id);
      setSubpersonas(prev => prev.filter(s => s.id !== id));
      // Remove associated items from cart if any
      setCart(prev => prev.filter(item => item.subpersonaId !== id));
      showToast('Subpersona eliminada.', 'info');
    } catch (error) {
      showToast('Error al eliminar subpersona', 'error');
    }
  };

  // --- CART MANAGEMENT ---

  const addToCart = (product, quantity = 1, subpersonaId = null) => {
    setCart(prev => {
      const existing = prev.find(item => item.productoId === product.id && item.subpersonaId === subpersonaId);
      if (existing) {
        return prev.map(item => 
          (item.productoId === product.id && item.subpersonaId === subpersonaId)
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }
      return [...prev, {
        productoId: product.id,
        producto: product,
        cantidad: quantity,
        subpersonaId: subpersonaId
      }];
    });
    showToast(`Agregado al carrito: ${product.nombre}`, 'success');
  };

  const removeFromCart = (productId, subpersonaId = null) => {
    setCart(prev => prev.filter(item => !(item.productoId === productId && item.subpersonaId === subpersonaId)));
    showToast('Producto removido del carrito', 'info');
  };

  const updateCartQuantity = (productId, subpersonaId = null, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productId, subpersonaId);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.productoId === productId && item.subpersonaId === subpersonaId)
        ? { ...item, cantidad }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async (observaciones = '') => {
    if (!user || cart.length === 0) return;
    try {
      const total = cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
      const itemsData = cart.map(item => ({
        productoId: item.productoId,
        subpersonaId: item.subpersonaId,
        cantidad: item.cantidad
      }));

      const newOrder = await dbService.createPedido(user.id, user.municipioId, total, itemsData, observaciones);
      
      // Local updates
      const peds = await dbService.getPedidos(user.id);
      setPedidos(peds);
      setCart([]);
      
      // Notify Admin
      const municipioName = municipios.find(m => m.id === user.municipioId)?.nombre || 'Florencia';
      addNotification('admin', `Nuevo pedido de ${user.nombre} (${municipioName}) por valor de $${total.toLocaleString()}`, 'success');
      // Notify client
      addNotification(user.id, `Tu pedido fue recibido y está en proceso de revisión. Total: $${total.toLocaleString()}`, 'success');

      showToast('¡Pedido enviado con éxito!', 'success');
      return newOrder;
    } catch (error) {
      showToast('Error al enviar el pedido', 'error');
      console.error(error);
    }
  };

  // --- ADMINISTRATOR ACTIONS ---

  const loadAdminData = async () => {
    try {
      const usersList = await dbService.getAllUsers();
      const pedsList = await dbService.getAllPedidos();
      const muniList = await dbService.getMunicipios();
      const prodList = await dbService.getProductos();
      
      setAllUsers(usersList);
      setAllPedidos(pedsList);
      setMunicipios(muniList);
      setProductos(prodList);
    } catch (e) {
      console.error("Error loading admin data:", e);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await dbService.approveUser(userId);
      showToast('Usuario aprobado con éxito.', 'success');
      
      // Notify client
      addNotification(userId, '¡Tu registro ha sido aprobado! Ahora puedes ingresar a la plataforma y comenzar tu experiencia.', 'success');
      
      await loadAdminData();
    } catch (error) {
      showToast('Error al aprobar usuario', 'error');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await dbService.rejectUser(userId);
      showToast('Usuario rechazado.', 'info');
      
      addNotification(userId, 'Tu solicitud de registro ha sido rechazada. Comunícate con soporte si crees que es un error.', 'error');
      
      await loadAdminData();
    } catch (error) {
      showToast('Error al rechazar usuario', 'error');
    }
  };

  const handleApproveActivation = async (userId, municipioId) => {
    try {
      await dbService.approveActivation(userId, municipioId);
      const muniName = municipios.find(m => m.id === municipioId)?.nombre || 'su municipio';
      showToast('Experiencia activada y municipio asignado.', 'success');
      
      // Notify client
      addNotification(userId, `¡Tu experiencia ha sido activada! Se te ha asignado el municipio de ${muniName}. Ya puedes realizar pedidos.`, 'success');
      
      await loadAdminData();
    } catch (error) {
      showToast('Error al activar experiencia', 'error');
    }
  };

  // Municipios CRUD (Admin)
  const handleCreateMunicipio = async (nombre) => {
    try {
      const newMuni = await dbService.createMunicipio(nombre);
      setMunicipios(prev => [...prev, newMuni]);
      showToast(`Municipio "${nombre}" creado.`, 'success');
    } catch (error) {
      showToast('Error al crear municipio', 'error');
    }
  };

  const handleUpdateMunicipio = async (id, nombre) => {
    try {
      await dbService.updateMunicipio(id, nombre);
      setMunicipios(prev => prev.map(m => m.id === id ? { ...m, nombre } : m));
      showToast('Municipio modificado.', 'success');
    } catch (error) {
      showToast('Error al modificar municipio', 'error');
    }
  };

  const handleDeleteMunicipio = async (id) => {
    try {
      await dbService.deleteMunicipio(id);
      setMunicipios(prev => prev.filter(m => m.id !== id));
      showToast('Municipio eliminado.', 'info');
    } catch (error) {
      showToast('Error al eliminar municipio', 'error');
    }
  };

  // Productos CRUD (Admin)
  const handleCreateProducto = async (prodData) => {
    try {
      const newProd = await dbService.createProducto(prodData);
      setProductos(prev => [...prev, newProd]);
      showToast(`Producto "${prodData.nombre}" creado.`, 'success');
    } catch (error) {
      showToast('Error al crear producto', 'error');
    }
  };

  const handleUpdateProducto = async (id, prodData) => {
    try {
      await dbService.updateProducto(id, prodData);
      setProductos(prev => prev.map(p => p.id === id ? { ...p, ...prodData } : p));
      showToast('Producto actualizado.', 'success');
    } catch (error) {
      showToast('Error al actualizar producto', 'error');
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      await dbService.deleteProducto(id);
      setProductos(prev => prev.filter(p => p.id !== id));
      showToast('Producto eliminado.', 'info');
    } catch (error) {
      showToast('Error al eliminar producto', 'error');
    }
  };

  // Pedidos CRUD (Admin)
  const handleUpdatePedidoState = async (pedidoId, estado) => {
    try {
      await dbService.updatePedidoState(pedidoId, estado);
      
      // Fetch order detail to notify client
      const order = allPedidos.find(o => o.id === pedidoId);
      if (order) {
        let msg = '';
        if (estado === 'en_preparacion') msg = 'Tu pedido está ahora en preparación.';
        if (estado === 'completado') msg = '¡Tu pedido ha sido completado y está listo en tu mesa!';
        
        addNotification(order.userId, msg, 'info');
      }

      showToast(`Pedido actualizado a ${estado}.`, 'success');
      await loadAdminData();
    } catch (error) {
      showToast('Error al actualizar estado del pedido', 'error');
    }
  };

  const handleUpdatePedidoItemState = async (pedidoId, itemId, estado, motivoRechazo = '') => {
    try {
      await dbService.updatePedidoItemState(itemId, estado, motivoRechazo);
      
      // Notify client
      const order = allPedidos.find(o => o.id === pedidoId);
      if (order) {
        const item = order.items.find(i => i.id === itemId);
        const prodName = productos.find(p => p.id === item?.productoId)?.nombre || 'Producto';
        const msg = estado === 'aprobado'
          ? `Tu producto "${prodName}" fue APROBADO.`
          : `Tu producto "${prodName}" fue RECHAZADO. Motivo: ${motivoRechazo}`;
        
        addNotification(order.userId, msg, estado === 'aprobado' ? 'success' : 'error');
      }

      showToast(`Ítem de pedido actualizado: ${estado}.`, 'success');
      await loadAdminData();
    } catch (error) {
      showToast('Error al actualizar ítem', 'error');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      cart,
      notifications,
      municipios,
      productos,
      subpersonas,
      pedidos,
      allPedidos,
      allUsers,
      toast,
      showToast,
      loadNotifications,
      markNotificationsAsRead,
      refreshUserData,
      refreshCatalog,
      login,
      register,
      logout,
      requestExperience,
      // Subpersonas
      handleAddSubpersona,
      handleEditSubpersona,
      handleDeleteSubpersona,
      // Cart
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      checkout,
      // Admin
      loadAdminData,
      handleApproveUser,
      handleRejectUser,
      handleApproveActivation,
      handleCreateMunicipio,
      handleUpdateMunicipio,
      handleDeleteMunicipio,
      handleCreateProducto,
      handleUpdateProducto,
      handleDeleteProducto,
      handleUpdatePedidoState,
      handleUpdatePedidoItemState
    }}>
      {children}
    </AppContext.Provider>
  );
};
