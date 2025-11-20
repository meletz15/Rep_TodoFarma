const ExcelJS = require('exceljs');
const path = require('path');
const { pool } = require('./src/config/db');
const CargaController = require('./src/controllers/cargaController');

async function testCargaDirecta() {
  let cliente = null;
  try {
    console.log('🧪 Probando carga directa de productos...');
    console.log('='.repeat(80));
    
    cliente = await pool.connect();
    await cliente.query('BEGIN');
    
    // Simular una fila de producto
    const filaTest = {
      nombre: 'GASTROMEP',
      sku: 'PROD-001',
      'código de barras': '7501234567000',
      categoria: 'suplemento',
      marca: 'ADVANTA Farma',
      descripcion: 'alivia y controla los problemas de gastritis y helicobacter pylori',
      'precio unitario': '125',
      stock: '1',
      'tipo de presentación': 'caja con 60 sobres',
      'cantidad de presentación': '1',
      'unidad de medida': '60 sobres',
      activo: 'Sí'
    };
    
    console.log('\n📋 Probando validación de producto...');
    const resultado = await CargaController.validarProducto(filaTest, 2, cliente);
    
    if (resultado.error) {
      console.error('❌ Error en validación:', resultado.error);
    } else {
      console.log('✅ Validación exitosa');
      console.log('   Datos validados:', JSON.stringify(resultado.datos, null, 2));
      
      console.log('\n📋 Probando carga de producto...');
      const resultados = { creados: 0, actualizados: 0, errores: [] };
      
      try {
        await CargaController.cargarProducto(resultado.datos, cliente, resultados);
        console.log('✅ Carga exitosa');
        console.log('   Resultados:', resultados);
      } catch (error) {
        console.error('❌ Error en carga:', error.message);
        resultados.errores.push({ error: error.message });
      }
    }
    
    await cliente.query('ROLLBACK');
    console.log('\n✅ Prueba completada (transacción revertida)');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    if (cliente) {
      try {
        await cliente.query('ROLLBACK');
      } catch (e) {
        // Ignorar
      }
    }
  } finally {
    if (cliente) {
      cliente.release();
    }
  }
}

testCargaDirecta();

