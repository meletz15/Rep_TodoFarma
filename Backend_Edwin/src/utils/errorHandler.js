// Clase personalizada para errores de la aplicación
class ErrorAplicacion extends Error {
  constructor(mensaje, codigoEstado = 500, errores = null) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
    this.errores = errores;
    this.esErrorOperacional = true;
  }
}

// Middleware para manejar errores
const manejadorErrores = (error, req, res, next) => {
  console.error('Error:', error);

  // Si es un error de validación de Joi
  if (error.isJoi) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos de entrada inválidos',
      errores: error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensaje: detail.message
      }))
    });
  }

  // Si es un error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token expirado'
    });
  }

  // Si es un error de la aplicación
  if (error.esErrorOperacional) {
    return res.status(error.codigoEstado).json({
      ok: false,
      mensaje: error.mensaje,
      errores: error.errores
    });
  }

  // Error interno del servidor
  res.status(500).json({
    ok: false,
    mensaje: 'Error interno del servidor'
  });
};

// Función helper para crear errores
const crearError = (mensaje, codigoEstado = 500, errores = null) => {
  return new ErrorAplicacion(mensaje, codigoEstado, errores);
};

module.exports = {
  ErrorAplicacion,
  manejadorErrores,
  crearError
};
