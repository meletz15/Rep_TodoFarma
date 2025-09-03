const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './env.local' });

// Generar token JWT
const generarToken = (datos) => {
  return jwt.sign(datos, process.env.JWT_SECRET || 'secreto_por_defecto_cambiar', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// Verificar token JWT
const verificarToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto_cambiar');
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// Extraer token del header Authorization
const extraerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido');
  }
  return authHeader.substring(7);
};

module.exports = {
  generarToken,
  verificarToken,
  extraerToken
};
