import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseConfig = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY'
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Error initializing Firebase, falling back to mock mode:', error);
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

export { app, auth, db, storage, hasFirebaseConfig };

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  orderBy
} from 'firebase/firestore';

// ==========================================
// MOCK DATA INITIALIZATION (localStorage)
// ==========================================

const SEED_MUNICIPIOS = [
  { id: 'm1', nombre: 'Florencia' },
  { id: 'm2', nombre: 'Morelia' },
  { id: 'm3', nombre: 'Belén de los Andaquíes' },
  { id: 'm4', nombre: 'La Montañita' },
  { id: 'm5', nombre: 'Milán' },
  { id: 'm6', nombre: 'Solano' },
  { id: 'm7', nombre: 'Solita' },
  { id: 'm8', nombre: 'Valparaíso' },
  { id: 'm9', nombre: 'Albania' },
  { id: 'm10', nombre: 'Curillo' },
  { id: 'm11', nombre: 'Cartagena del Chairá' },
  { id: 'm12', nombre: 'El Doncello' },
  { id: 'm13', nombre: 'El Paujil' },
  { id: 'm14', nombre: 'Puerto Rico' },
  { id: 'm15', nombre: 'San José del Fragua' }
];

const SEED_PRODUCTOS = [
  {
    id: 'p1',
    nombre: 'Pizza Especial Galería',
    descripcion: 'Masa artesanal con salsa napolitana, queso mozzarella premium, jamón ahumado, piña caramelizada y cereza.',
    precio: 26000,
    categoria: 'comidas',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    disponible: true
  },
  {
    id: 'p2',
    nombre: 'Nachos con Queso & Guacamole',
    descripcion: 'Nachos crujientes bañados en salsa de cheddar fundido con jalapeños, guacamole fresco y pico de gallo.',
    precio: 18000,
    categoria: 'comidas',
    imagen: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    disponible: true
  },
  {
    id: 'p3',
    nombre: 'Hamburguesa Artesanal Caqueteña',
    descripcion: '150g de carne premium, queso costeño asado, cebolla caramelizada, lechuga, tomate y salsa tártara de la casa.',
    precio: 22000,
    categoria: 'comidas',
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    disponible: true
  },
  {
    id: 'p4',
    nombre: 'Café Americano Origen',
    descripcion: 'Filtrado de granos cultivados en el Caquetá, tueste medio y notas dulces frutales.',
    precio: 4500,
    categoria: 'bebidas',
    imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    disponible: true
  },
  {
    id: 'p5',
    nombre: 'Cerveza Club Colombia Dorada',
    descripcion: 'Cerveza lager premium nacional bien helada, perfecta para acompañar la noche de concierto.',
    precio: 7000,
    categoria: 'bebidas',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    disponible: true
  },
  {
    id: 'p6',
    nombre: 'Entrada Concierto: Noche de Jazz',
    descripcion: 'Acceso para el concierto acústico de jazz en vivo del viernes por la noche. Incluye bebida de cortesía.',
    precio: 35000,
    categoria: 'eventos',
    imagen: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    disponible: true
  }
];

const SEED_USERS = [
  {
    id: 'u_admin',
    nombre: 'Administrador Galería Café',
    documento: '12345678',
    tipoDocumento: 'CC',
    celular: '3201234567',
    fechaNacimiento: '1990-01-01',
    email: 'admin@galeriacafe.com',
    aprobado: 'aprobado',
    activo: true,
    solicitudActivacion: 'aprobada',
    municipioId: 'm1',
    rol: 'admin',
    createdAt: new Date().toISOString()
  }
];

const getLocalStorageData = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

const setLocalStorageData = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initialize Mock Store
const initMockStore = () => {
  getLocalStorageData('gc_municipios', SEED_MUNICIPIOS);
  getLocalStorageData('gc_productos', SEED_PRODUCTOS);
  getLocalStorageData('gc_users', SEED_USERS);
  getLocalStorageData('gc_subpersonas', []);
  getLocalStorageData('gc_pedidos', []);
  getLocalStorageData('gc_pedido_items', []);
};

initMockStore();

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// ==========================================
// FIREBASE SEED DATA (first-time setup)
// ==========================================

const seedFirestoreData = async () => {
  if (!hasFirebaseConfig || !db) return;
  
  try {
    // Check if already seeded using a flag document
    const seedFlag = await getDoc(doc(db, '_meta', 'seed_status'));
    if (seedFlag.exists()) return; // Already seeded

    console.log('Seeding Firestore with initial data...');

    // Seed municipios
    for (const muni of SEED_MUNICIPIOS) {
      await setDoc(doc(db, 'municipios', muni.id), { nombre: muni.nombre });
    }

    // Seed productos
    for (const prod of SEED_PRODUCTOS) {
      await setDoc(doc(db, 'productos', prod.id), {
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        precio: prod.precio,
        categoria: prod.categoria,
        imagen: prod.imagen,
        disponible: prod.disponible
      });
    }

    // Mark as seeded
    await setDoc(doc(db, '_meta', 'seed_status'), {
      seededAt: new Date().toISOString(),
      version: '1.0'
    });

    console.log('Firestore seeded successfully!');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  }
};

// ==========================================
// UNIFIED SERVICE API
// ==========================================

export const dbService = {
  isMock: !hasFirebaseConfig,

  // --- AUTHENTICATION ---
  
  signUp: async (email, password, userData) => {
    if (hasFirebaseConfig) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userDoc = doc(db, 'users', userCred.user.uid);
      const newUser = {
        id: userCred.user.uid,
        ...userData,
        email,
        aprobado: 'aprobado',
        activo: false,
        solicitudActivacion: 'ninguna',
        municipioId: '',
        rol: 'cliente',
        createdAt: new Date().toISOString()
      };
      await setDoc(userDoc, newUser);
      return newUser;
    } else {
      const users = getLocalStorageData('gc_users', []);
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('El correo electrónico ya está registrado.');
      }
      const newUserId = 'u_' + generateId();
      const newUser = {
        id: newUserId,
        ...userData,
        email,
        aprobado: 'aprobado',
        activo: false,
        solicitudActivacion: 'ninguna',
        municipioId: '',
        rol: 'cliente',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      setLocalStorageData('gc_users', users);
      
      // Store dummy credentials (in mock auth context)
      const mockAuth = getLocalStorageData('gc_mock_auth_creds', {});
      mockAuth[email.toLowerCase()] = { password, userId: newUserId };
      setLocalStorageData('gc_mock_auth_creds', mockAuth);

      return newUser;
    }
  },

  signIn: async (email, password) => {
    if (hasFirebaseConfig) {
      // Bootstrap: if admin login fails, try to create the admin account automatically
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, 'users', userCred.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          // User exists in Auth but not in Firestore — create the document
          if (email === 'admin@galeriacafe.com') {
            const adminData = {
              id: userCred.user.uid,
              nombre: 'Administrador Galería Café',
              documento: '12345678',
              tipoDocumento: 'CC',
              celular: '3201234567',
              fechaNacimiento: '1990-01-01',
              email: 'admin@galeriacafe.com',
              aprobado: 'aprobado',
              activo: true,
              solicitudActivacion: 'aprobada',
              municipioId: '',
              rol: 'admin',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, adminData);
            await seedFirestoreData();
            return adminData;
          }
          throw new Error('No se encontró el documento del usuario.');
        }
        return userDocSnap.data();
      } catch (error) {
        // If admin credentials don't exist in Firebase Auth yet, create the account
        if (
          email === 'admin@galeriacafe.com' &&
          password === 'admin123' &&
          (error.code === 'auth/invalid-credential' ||
           error.code === 'auth/user-not-found' ||
           error.code === 'auth/wrong-password')
        ) {
          try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const adminData = {
              id: userCred.user.uid,
              nombre: 'Administrador Galería Café',
              documento: '12345678',
              tipoDocumento: 'CC',
              celular: '3201234567',
              fechaNacimiento: '1990-01-01',
              email: 'admin@galeriacafe.com',
              aprobado: 'aprobado',
              activo: true,
              solicitudActivacion: 'aprobada',
              municipioId: '',
              rol: 'admin',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', userCred.user.uid), adminData);
            // Seed initial data into Firestore
            await seedFirestoreData();
            return adminData;
          } catch (createError) {
            console.error('Error creating admin account:', createError);
            throw new Error('Error al crear la cuenta de administrador: ' + createError.message);
          }
        }
        throw error;
      }
    } else {
      // Admin backdoor
      if (email === 'admin@galeriacafe.com' && password === 'admin123') {
        const users = getLocalStorageData('gc_users', []);
        return users.find(u => u.email === 'admin@galeriacafe.com');
      }

      const mockAuth = getLocalStorageData('gc_mock_auth_creds', {});
      const cred = mockAuth[email.toLowerCase()];
      if (!cred || cred.password !== password) {
        throw new Error('Correo o contraseña incorrectos.');
      }

      const users = getLocalStorageData('gc_users', []);
      const user = users.find(u => u.id === cred.userId);
      if (!user) throw new Error('Usuario no encontrado.');
      return user;
    }
  },

  signOut: async () => {
    if (hasFirebaseConfig) {
      await fbSignOut(auth);
    }
    // For mock, AppContext will clear the local session.
  },

  subscribeAuthState: (callback) => {
    if (hasFirebaseConfig) {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          callback(userDoc.exists() ? userDoc.data() : null);
        } else {
          callback(null);
        }
      });
    } else {
      // AppContext handles the mock persistent login via localStorage token
      return () => {}; // return empty unsubscribe
    }
  },

  // --- USERS MANAGEMENT ---

  getUser: async (userId) => {
    if (hasFirebaseConfig) {
      const uDoc = await getDoc(doc(db, 'users', userId));
      return uDoc.exists() ? uDoc.data() : null;
    } else {
      const users = getLocalStorageData('gc_users', []);
      return users.find(u => u.id === userId) || null;
    }
  },

  getUsersByStatus: async (aprobadoStatus) => {
    if (hasFirebaseConfig) {
      const q = query(collection(db, 'users'), where('aprobado', '==', aprobadoStatus));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => list.push(doc.data()));
      return list;
    } else {
      const users = getLocalStorageData('gc_users', []);
      return users.filter(u => u.aprobado === aprobadoStatus && u.rol !== 'admin');
    }
  },

  getAllUsers: async () => {
    if (hasFirebaseConfig) {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const list = [];
      querySnapshot.forEach(doc => list.push(doc.data()));
      return list;
    } else {
      return getLocalStorageData('gc_users', []).filter(u => u.rol !== 'admin');
    }
  },

  approveUser: async (userId) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'users', userId), { aprobado: 'aprobado' });
    } else {
      const users = getLocalStorageData('gc_users', []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].aprobado = 'aprobado';
        setLocalStorageData('gc_users', users);
      }
    }
  },

  rejectUser: async (userId) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'users', userId), { aprobado: 'rechazado' });
    } else {
      const users = getLocalStorageData('gc_users', []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].aprobado = 'rechazado';
        setLocalStorageData('gc_users', users);
      }
    }
  },

  requestActivation: async (userId) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'users', userId), { solicitudActivacion: 'pendiente' });
    } else {
      const users = getLocalStorageData('gc_users', []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].solicitudActivacion = 'pendiente';
        setLocalStorageData('gc_users', users);
      }
    }
  },

  getPendingActivations: async () => {
    if (hasFirebaseConfig) {
      const q = query(collection(db, 'users'), where('solicitudActivacion', '==', 'pendiente'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => list.push(doc.data()));
      return list;
    } else {
      const users = getLocalStorageData('gc_users', []);
      return users.filter(u => u.solicitudActivacion === 'pendiente');
    }
  },

  approveActivation: async (userId, municipioId) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'users', userId), {
        solicitudActivacion: 'aprobada',
        activo: true,
        municipioId: municipioId
      });
    } else {
      const users = getLocalStorageData('gc_users', []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].solicitudActivacion = 'aprobada';
        users[userIndex].activo = true;
        users[userIndex].municipioId = municipioId;
        setLocalStorageData('gc_users', users);
      }
    }
  },

  // --- MUNICIPIOS ---

  getMunicipios: async () => {
    if (hasFirebaseConfig) {
      const querySnapshot = await getDocs(collection(db, 'municipios'));
      const list = [];
      querySnapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      return list;
    } else {
      return getLocalStorageData('gc_municipios', []);
    }
  },

  createMunicipio: async (nombre) => {
    if (hasFirebaseConfig) {
      const docRef = await addDoc(collection(db, 'municipios'), { nombre });
      return { id: docRef.id, nombre };
    } else {
      const municipios = getLocalStorageData('gc_municipios', []);
      const newMuni = { id: 'm_' + generateId(), nombre };
      municipios.push(newMuni);
      setLocalStorageData('gc_municipios', municipios);
      return newMuni;
    }
  },

  updateMunicipio: async (id, nombre) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'municipios', id), { nombre });
    } else {
      const municipios = getLocalStorageData('gc_municipios', []);
      const idx = municipios.findIndex(m => m.id === id);
      if (idx !== -1) {
        municipios[idx].nombre = nombre;
        setLocalStorageData('gc_municipios', municipios);
      }
    }
  },

  deleteMunicipio: async (id) => {
    if (hasFirebaseConfig) {
      await deleteDoc(doc(db, 'municipios', id));
    } else {
      let municipios = getLocalStorageData('gc_municipios', []);
      municipios = municipios.filter(m => m.id !== id);
      setLocalStorageData('gc_municipios', municipios);
    }
  },

  // --- SUBPERSONAS (GRUPOS) ---

  getSubpersonas: async (userId) => {
    if (hasFirebaseConfig) {
      const q = query(collection(db, 'subpersonas'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      return list;
    } else {
      const subs = getLocalStorageData('gc_subpersonas', []);
      return subs.filter(s => s.userId === userId);
    }
  },

  createSubpersona: async (userId, nombre) => {
    if (hasFirebaseConfig) {
      const docRef = await addDoc(collection(db, 'subpersonas'), { userId, nombre });
      return { id: docRef.id, userId, nombre };
    } else {
      const subs = getLocalStorageData('gc_subpersonas', []);
      const newSub = { id: 'sub_' + generateId(), userId, nombre };
      subs.push(newSub);
      setLocalStorageData('gc_subpersonas', subs);
      return newSub;
    }
  },

  updateSubpersona: async (id, nombre) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'subpersonas', id), { nombre });
    } else {
      const subs = getLocalStorageData('gc_subpersonas', []);
      const idx = subs.findIndex(s => s.id === id);
      if (idx !== -1) {
        subs[idx].nombre = nombre;
        setLocalStorageData('gc_subpersonas', subs);
      }
    }
  },

  deleteSubpersona: async (id) => {
    if (hasFirebaseConfig) {
      await deleteDoc(doc(db, 'subpersonas', id));
    } else {
      let subs = getLocalStorageData('gc_subpersonas', []);
      subs = subs.filter(s => s.id !== id);
      setLocalStorageData('gc_subpersonas', subs);
    }
  },

  // --- PRODUCTOS ---

  getProductos: async () => {
    if (hasFirebaseConfig) {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const list = [];
      querySnapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      return list;
    } else {
      return getLocalStorageData('gc_productos', []);
    }
  },

  createProducto: async (prodData) => {
    if (hasFirebaseConfig) {
      const docRef = await addDoc(collection(db, 'productos'), prodData);
      return { id: docRef.id, ...prodData };
    } else {
      const prods = getLocalStorageData('gc_productos', []);
      const newProd = { id: 'p_' + generateId(), ...prodData };
      prods.push(newProd);
      setLocalStorageData('gc_productos', prods);
      return newProd;
    }
  },

  updateProducto: async (id, prodData) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'productos', id), prodData);
    } else {
      const prods = getLocalStorageData('gc_productos', []);
      const idx = prods.findIndex(p => p.id === id);
      if (idx !== -1) {
        prods[idx] = { ...prods[idx], ...prodData };
        setLocalStorageData('gc_productos', prods);
      }
    }
  },

  deleteProducto: async (id) => {
    if (hasFirebaseConfig) {
      await deleteDoc(doc(db, 'productos', id));
    } else {
      let prods = getLocalStorageData('gc_productos', []);
      prods = prods.filter(p => p.id !== id);
      setLocalStorageData('gc_productos', prods);
    }
  },

  // --- PEDIDOS & PEDIDO ITEMS ---

  getPedidos: async (userId) => {
    if (hasFirebaseConfig) {
      const q = query(collection(db, 'pedidos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list = [];
      for (const d of querySnapshot.docs) {
        const pData = d.data();
        // get items for this order
        const qItems = query(collection(db, 'pedidoItems'), where('pedidoId', '==', d.id));
        const itemsSnap = await getDocs(qItems);
        const items = [];
        itemsSnap.forEach(iDoc => items.push({ id: iDoc.id, ...iDoc.data() }));
        list.push({ id: d.id, ...pData, items });
      }
      return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else {
      const orders = getLocalStorageData('gc_pedidos', []);
      const allItems = getLocalStorageData('gc_pedido_items', []);
      const filtered = orders.filter(o => o.userId === userId);
      
      const hydrated = filtered.map(o => {
        const items = allItems.filter(i => i.pedidoId === o.id);
        return { ...o, items };
      });
      return hydrated.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
  },

  getAllPedidos: async () => {
    if (hasFirebaseConfig) {
      const querySnapshot = await getDocs(collection(db, 'pedidos'));
      const list = [];
      for (const d of querySnapshot.docs) {
        const pData = d.data();
        const qItems = query(collection(db, 'pedidoItems'), where('pedidoId', '==', d.id));
        const itemsSnap = await getDocs(qItems);
        const items = [];
        itemsSnap.forEach(iDoc => items.push({ id: iDoc.id, ...iDoc.data() }));
        list.push({ id: d.id, ...pData, items });
      }
      return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else {
      const orders = getLocalStorageData('gc_pedidos', []);
      const allItems = getLocalStorageData('gc_pedido_items', []);
      
      const hydrated = orders.map(o => {
        const items = allItems.filter(i => i.pedidoId === o.id);
        return { ...o, items };
      });
      return hydrated.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
  },

  createPedido: async (userId, municipioId, total, items, observaciones = '') => {
    const pedidoData = {
      userId,
      municipioId,
      estado: 'pendiente',
      total,
      fecha: new Date().toISOString(),
      observaciones
    };

    if (hasFirebaseConfig) {
      const pedidoRef = await addDoc(collection(db, 'pedidos'), pedidoData);
      
      // Save items
      const savedItems = [];
      for (const item of items) {
        const itemData = {
          pedidoId: pedidoRef.id,
          productoId: item.productoId,
          subpersonaId: item.subpersonaId || null, // null for primary client
          cantidad: item.cantidad,
          estado: 'pendiente',
          motivoRechazo: ''
        };
        const itemRef = await addDoc(collection(db, 'pedidoItems'), itemData);
        savedItems.push({ id: itemRef.id, ...itemData });
      }

      return { id: pedidoRef.id, ...pedidoData, items: savedItems };
    } else {
      const orders = getLocalStorageData('gc_pedidos', []);
      const allItems = getLocalStorageData('gc_pedido_items', []);

      const newOrderId = 'o_' + generateId();
      const newOrder = { id: newOrderId, ...pedidoData };
      orders.push(newOrder);
      
      const savedItems = [];
      for (const item of items) {
        const newItem = {
          id: 'oi_' + generateId(),
          pedidoId: newOrderId,
          productoId: item.productoId,
          subpersonaId: item.subpersonaId || null,
          cantidad: item.cantidad,
          estado: 'pendiente',
          motivoRechazo: ''
        };
        allItems.push(newItem);
        savedItems.push(newItem);
      }

      setLocalStorageData('gc_pedidos', orders);
      setLocalStorageData('gc_pedido_items', allItems);

      return { ...newOrder, items: savedItems };
    }
  },

  updatePedidoState: async (pedidoId, estado) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'pedidos', pedidoId), { estado });
    } else {
      const orders = getLocalStorageData('gc_pedidos', []);
      const idx = orders.findIndex(o => o.id === pedidoId);
      if (idx !== -1) {
        orders[idx].estado = estado;
        setLocalStorageData('gc_pedidos', orders);
      }
    }
  },

  updatePedidoItemState: async (itemId, estado, motivoRechazo = '') => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'pedidoItems', itemId), { estado, motivoRechazo });
      
      // Auto-update parent order state if needed (e.g., if all items are resolved)
      // For simplicity, admin manages parent order state manually, but we keep this flexible.
    } else {
      const allItems = getLocalStorageData('gc_pedido_items', []);
      const idx = allItems.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        allItems[idx].estado = estado;
        allItems[idx].motivoRechazo = motivoRechazo;
        setLocalStorageData('gc_pedido_items', allItems);
      }
    }
  },

  updatePedidoItemQuantity: async (itemId, cantidad) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'pedidoItems', itemId), { cantidad });
    } else {
      const allItems = getLocalStorageData('gc_pedido_items', []);
      const idx = allItems.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        allItems[idx].cantidad = cantidad;
        setLocalStorageData('gc_pedido_items', allItems);
      }
    }
  },

  deletePedidoItem: async (itemId) => {
    if (hasFirebaseConfig) {
      await deleteDoc(doc(db, 'pedidoItems', itemId));
    } else {
      let allItems = getLocalStorageData('gc_pedido_items', []);
      allItems = allItems.filter(i => i.id !== itemId);
      setLocalStorageData('gc_pedido_items', allItems);
    }
  },

  togglePedidoItemCheckedOff: async (itemId, checkedOff) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'pedidoItems', itemId), { checkedOff });
    } else {
      const allItems = getLocalStorageData('gc_pedido_items', []);
      const idx = allItems.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        allItems[idx].checkedOff = checkedOff;
        setLocalStorageData('gc_pedido_items', allItems);
      }
    }
  },

  updatePedidoTotal: async (pedidoId, newTotal) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'pedidos', pedidoId), { total: newTotal });
    } else {
      const orders = getLocalStorageData('gc_pedidos', []);
      const idx = orders.findIndex(o => o.id === pedidoId);
      if (idx !== -1) {
        orders[idx].total = newTotal;
        setLocalStorageData('gc_pedidos', orders);
      }
    }
  },

  deactivateUserSession: async (userId) => {
    if (hasFirebaseConfig) {
      await updateDoc(doc(db, 'users', userId), {
        activo: false,
        solicitudActivacion: 'ninguna',
        municipioId: ''
      });
    } else {
      const users = getLocalStorageData('gc_users', []);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx].activo = false;
        users[idx].solicitudActivacion = 'ninguna';
        users[idx].municipioId = '';
        setLocalStorageData('gc_users', users);
      }
    }
  }
};
