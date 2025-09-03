const { Pool } = require('pg');
require('dotenv').config({ path: './env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5435,
  database: process.env.DB_NAME || 'mi_basedatos',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Evento para manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función para probar la conexión
const probarConexion = async () => {
  try {
    const cliente = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    cliente.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    return false;
  }
};

// Función para inicializar el admin si no existe
const inicializarAdmin = async () => {
  try {
    const bcrypt = require('bcrypt');
    const cliente = await pool.connect();
    
    // Verificar si existe el usuario admin
    const resultado = await cliente.query(
      'SELECT id_usuario FROM usuarios WHERE correo = $1',
      ['admin@dominio.com']
    );
    
    if (resultado.rows.length === 0) {
      // Crear usuario admin
      const contrasenaHash = await bcrypt.hash('Admin123!', 10);
      await cliente.query(
        `INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado)
         VALUES ($1, $2, $3, $4, 
                 (SELECT id_rol FROM roles WHERE nombre = 'ADMIN'), $5)`,
        ['Admin', 'Sistema', 'admin@dominio.com', contrasenaHash, 'ACTIVO']
      );
      console.log('✅ Usuario admin creado correctamente');
    } else {
      // Verificar si el hash es placeholder y actualizarlo
      const adminResult = await cliente.query(
        'SELECT contrasena_hash FROM usuarios WHERE correo = $1',
        ['admin@dominio.com']
      );
      
      if (adminResult.rows[0].contrasena_hash.includes('placeholder')) {
        const contrasenaHash = await bcrypt.hash('Admin123!', 10);
        await cliente.query(
          'UPDATE usuarios SET contrasena_hash = $1 WHERE correo = $2',
          [contrasenaHash, 'admin@dominio.com']
        );
        console.log('✅ Hash del admin actualizado correctamente');
      }
    }
    
    cliente.release();
  } catch (error) {
    console.error('❌ Error al inicializar admin:', error.message);
  }
};

module.exports = {
  pool,
  probarConexion,
  inicializarAdmin
};
