const app = require('./src/app');
require('dotenv').config({ path: './env.local' });
const { probarConexion, inicializarAdmin } = require('./src/config/db');

// Función para iniciar el servidor
const iniciarServidor = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Probar conexión a la base de datos
    const conexionExitosa = await probarConexion();
    if (!conexionExitosa) {
      console.error('❌ No se pudo conectar a la base de datos. Saliendo...');
      process.exit(1);
    }
    
    // Inicializar usuario admin si es necesario
    await inicializarAdmin();
    
    // Iniciar servidor HTTP
    const puerto = process.env.PORT || 3000;
    const servidor = app.listen(puerto, () => {
      console.log(`✅ Servidor iniciado en puerto ${puerto}`);
      console.log(`📊 Health check: http://localhost:${puerto}/health`);
      console.log(`🔐 API Auth: http://localhost:${puerto}/api/auth`);
      console.log(`👥 API Usuarios: http://localhost:${puerto}/api/usuarios`);
      console.log(`📈 API Reportes: http://localhost:${puerto}/api/reportes`);
    });
    
    // Manejo de señales para cierre graceful
    const cerrarServidor = (senal) => {
      console.log(`\n📴 Recibida señal ${senal}. Cerrando servidor...`);
      servidor.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', () => cerrarServidor('SIGTERM'));
    process.on('SIGINT', () => cerrarServidor('SIGINT'));
    
    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Error no capturado:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
iniciarServidor();
