const { pool } = require('./src/config/db');

async function corregirSimbolosUnidades() {
  let cliente = null;
  try {
    console.log('🔧 Corrigiendo símbolos de unidades de medida...');
    console.log('='.repeat(80));
    
    cliente = await pool.connect();
    
    // Obtener todas las unidades de medida
    const result = await cliente.query(
      'SELECT id_unidad_medida, nombre, simbolo FROM unidad_medida ORDER BY nombre'
    );
    
    console.log(`\n📋 Unidades de medida encontradas: ${result.rows.length}`);
    
    let actualizadas = 0;
    
    for (const unidad of result.rows) {
      // Si el símbolo no coincide con el nombre y el nombre es corto, actualizar el símbolo
      if (unidad.nombre.length <= 10 && unidad.simbolo !== unidad.nombre) {
        // Verificar si el símbolo con el nombre ya existe
        const existe = await cliente.query(
          'SELECT 1 FROM unidad_medida WHERE simbolo = $1 AND id_unidad_medida != $2',
          [unidad.nombre, unidad.id_unidad_medida]
        );
        
        if (existe.rows.length === 0) {
          await cliente.query(
            'UPDATE unidad_medida SET simbolo = $1 WHERE id_unidad_medida = $2',
            [unidad.nombre, unidad.id_unidad_medida]
          );
          console.log(`   ✅ Actualizada: "${unidad.nombre}" (símbolo: "${unidad.nombre}")`);
          actualizadas++;
        } else {
          console.log(`   ⚠️  No se puede actualizar "${unidad.nombre}": el símbolo ya existe`);
        }
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(80));
    console.log(`   Unidades actualizadas: ${actualizadas}`);
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (cliente) {
      cliente.release();
    }
  }
}

corregirSimbolosUnidades();

