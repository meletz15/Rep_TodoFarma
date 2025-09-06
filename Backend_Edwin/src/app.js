const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { manejadorErrores } = require('./utils/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');

const app = express();

// Middlewares de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    : true,
  credentials: true
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

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/proveedores', proveedorRoutes);

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
