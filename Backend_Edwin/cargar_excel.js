const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3002/api';
const ARCHIVO_EXCEL = path.join(__dirname, '../FrontEnd_Edwin/subir/plantilla-productos (1).xlsx');
const TIPO_CARGA = 'productos';

// Credenciales de admin (ajustar si es necesario)
const ADMIN_EMAIL = 'admin@dominio.com';
const ADMIN_PASSWORD = 'Admin123!';

async function cargarExcel() {
  try {
    console.log('🚀 Iniciando proceso de carga de Excel...');
    console.log('='.repeat(80));
    
    // Paso 1: Autenticarse
    console.log('\n📝 Paso 1: Autenticándose...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      correo: ADMIN_EMAIL,
      contrasena: ADMIN_PASSWORD
    });
    
    if (!loginResponse.data.ok || !loginResponse.data.datos || !loginResponse.data.datos.token) {
      throw new Error('Error al autenticarse: ' + JSON.stringify(loginResponse.data));
    }
    
    const token = loginResponse.data.datos.token;
    console.log('✅ Autenticación exitosa');
    
    // Paso 2: Verificar que el archivo existe
    console.log('\n📁 Paso 2: Verificando archivo...');
    if (!fs.existsSync(ARCHIVO_EXCEL)) {
      throw new Error(`El archivo no existe: ${ARCHIVO_EXCEL}`);
    }
    console.log(`✅ Archivo encontrado: ${ARCHIVO_EXCEL}`);
    
    // Paso 3: Procesar el Excel (preview)
    console.log('\n📊 Paso 3: Procesando Excel (preview)...');
    const formData = new FormData();
    formData.append('archivo', fs.createReadStream(ARCHIVO_EXCEL));
    formData.append('tipo', TIPO_CARGA);
    
    const procesarResponse = await axios.post(
      `${API_BASE_URL}/carga/procesar`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    if (!procesarResponse.data.ok) {
      throw new Error('Error al procesar: ' + JSON.stringify(procesarResponse.data));
    }
    
    const datosProcesados = procesarResponse.data.datos;
    console.log('✅ Excel procesado correctamente');
    console.log(`   Total de filas: ${datosProcesados.totalFilas}`);
    console.log(`   Filas válidas: ${datosProcesados.filasValidas}`);
    console.log(`   Filas con error: ${datosProcesados.filasConError}`);
    
    if (datosProcesados.filasConError > 0) {
      console.log('\n⚠️  ERRORES ENCONTRADOS:');
      datosProcesados.errores.forEach((error, index) => {
        console.log(`   Error ${index + 1} - Fila ${error.fila}: ${error.error}`);
      });
    }
    
    if (datosProcesados.filasValidas === 0) {
      console.log('\n❌ No hay filas válidas para cargar. Abortando...');
      return;
    }
    
    // Paso 4: Confirmar y cargar los datos
    console.log('\n💾 Paso 4: Confirmando y cargando datos...');
    const confirmarResponse = await axios.post(
      `${API_BASE_URL}/carga/confirmar`,
      {
        tipo: TIPO_CARGA,
        datos: datosProcesados.todosLosDatos
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!confirmarResponse.data.ok) {
      throw new Error('Error al confirmar carga: ' + JSON.stringify(confirmarResponse.data));
    }
    
    const resultados = confirmarResponse.data.datos;
    console.log('✅ Carga completada exitosamente');
    console.log(`   Registros creados: ${resultados.creados}`);
    console.log(`   Registros actualizados: ${resultados.actualizados}`);
    console.log(`   Errores: ${resultados.errores.length}`);
    
    if (resultados.errores.length > 0) {
      console.log('\n⚠️  ERRORES DURANTE LA CARGA:');
      resultados.errores.forEach((error, index) => {
        console.log(`   Error ${index + 1} - Índice ${error.indice}: ${error.error}`);
      });
    }
    
    console.log('\n✅ Proceso completado exitosamente');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error durante el proceso:', error.message);
    if (error.response) {
      console.error('   Respuesta del servidor:', error.response.data);
      console.error('   Status:', error.response.status);
    }
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar
cargarExcel();

