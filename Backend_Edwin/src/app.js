const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { manejadorErrores } = require('./utils/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const cajaRoutes = require('./routes/cajaRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');
const presentacionRoutes = require('./routes/presentacionRoutes');
const unidadMedidaRoutes = require('./routes/unidadMedidaRoutes');
const cargaRoutes = require('./routes/cargaRoutes');
const rolRoutes = require('./routes/rolRoutes');

const app = express();

// Middlewares de seguridad
// Configurar Helmet con opciones optimizadas para Chrome
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Deshabilitar para evitar problemas con recursos externos
  contentSecurityPolicy: false, // Deshabilitar CSP estricto que puede bloquear recursos en Chrome
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir recursos cross-origin
}));

// Middleware de CORS con configuración optimizada para Chrome
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight por 24 horas (reduce requests en Chrome)
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para sanitizar entradas
app.use((req, res, next) => {
  // Sanitizar headers
  if (req.headers.authorization) {
    req.headers.authorization = req.headers.authorization.trim();
  }
  
  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
});

// Ruta de salud (sin autenticación) - verifica estado del backend y base de datos
app.get('/health', async (req, res) => {
  const { pool } = require('./config/db');
  const estado = {
    ok: true,
    mensaje: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    servidor: {
      estado: 'corriendo',
      uptime: process.uptime(),
      memoria: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    },
    baseDatos: {
      estado: 'verificando',
      conectado: false,
      error: null
    }
  };

  // Verificar conexión a la base de datos
  try {
    const cliente = await pool.connect();
    // Hacer una consulta simple para verificar la conexión
    await cliente.query('SELECT 1');
    cliente.release();
    
    estado.baseDatos.estado = 'conectado';
    estado.baseDatos.conectado = true;
    estado.ok = true;
  } catch (error) {
    estado.baseDatos.estado = 'desconectado';
    estado.baseDatos.conectado = false;
    estado.baseDatos.error = error.message;
    estado.ok = false;
  }

  // Retornar el código de estado HTTP apropiado
  const statusCode = estado.ok ? 200 : 503;
  res.status(statusCode).json(estado);
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/presentacion', presentacionRoutes);
app.use('/api/unidad-medida', unidadMedidaRoutes);
app.use('/api/carga', cargaRoutes);
app.use('/api/roles', rolRoutes);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: 'Ruta no encontrada',
    ruta: req.originalUrl
  });
});

// Middleware de manejo de errores (debe ser el último)
app.use(manejadorErrores);

module.exports = app;
