const { pool } = require('./src/config/db');

async function corregirSimbolosDuplicados() {
  let cliente = null;
  try {
    console.log('🔧 Corrigiendo símbolos duplicados de unidades de medida...');
    console.log('='.repeat(80));
    
    cliente = await pool.connect();
    
    // Obtener todas las unidades que tienen "frasco de" en el nombre
    const result = await cliente.query(
      `SELECT id_unidad_medida, nombre, simbolo 
       FROM unidad_medida 
       WHERE LOWER(nombre) LIKE 'frasco de%' 
       ORDER BY nombre`
    );
    
    console.log(`\n📋 Unidades con "frasco de" encontradas: ${result.rows.length}`);
    
    let actualizadas = 0;
    
    for (const unidad of result.rows) {
      try {
        // Extraer la parte numérica o distintiva del nombre
        // Ejemplo: "frasco de 27ml" -> "27ml" o "frasco27"
        const match = unidad.nombre.match(/(\d+\.?\d*ml?)/i);
        let nuevoSimbolo = null;
        
        if (match) {
          // Usar el número + ml como símbolo
          nuevoSimbolo = match[1].toLowerCase();
        } else {
          // Si no hay número, usar una parte distintiva
          const partes = unidad.nombre.split(' ');
          if (partes.length > 2) {
            nuevoSimbolo = (partes[partes.length - 1] || 'fr').substring(0, 10);
          } else {
            nuevoSimbolo = unidad.nombre.substring(0, 10);
          }
        }
        
        // Asegurar que no exceda 10 caracteres
        if (nuevoSimbolo.length > 10) {
          nuevoSimbolo = nuevoSimbolo.substring(0, 10);
        }
        
        // Verificar si el nuevo símbolo ya existe
        const existe = await cliente.query(
          'SELECT 1 FROM unidad_medida WHERE simbolo = $1 AND id_unidad_medida != $2',
          [nuevoSimbolo, unidad.id_unidad_medida]
        );
        
        if (existe.rows.length === 0) {
          await cliente.query(
            'UPDATE unidad_medida SET simbolo = $1 WHERE id_unidad_medida = $2',
            [nuevoSimbolo, unidad.id_unidad_medida]
          );
          console.log(`   ✅ Actualizada: "${unidad.nombre}" (símbolo: "${nuevoSimbolo}")`);
          actualizadas++;
        } else {
          // Si existe, intentar con un sufijo numérico
          let intentos = 1;
          let simboloFinal = nuevoSimbolo.substring(0, 8) + intentos;
          
          while (intentos < 10) {
            const existe2 = await cliente.query(
              'SELECT 1 FROM unidad_medida WHERE simbolo = $1 AND id_unidad_medida != $2',
              [simboloFinal, unidad.id_unidad_medida]
            );
            
            if (existe2.rows.length === 0) {
              await cliente.query(
                'UPDATE unidad_medida SET simbolo = $1 WHERE id_unidad_medida = $2',
                [simboloFinal, unidad.id_unidad_medida]
              );
              console.log(`   ✅ Actualizada: "${unidad.nombre}" (símbolo: "${simboloFinal}")`);
              actualizadas++;
              break;
            }
            
            intentos++;
            simboloFinal = nuevoSimbolo.substring(0, 8) + intentos;
          }
          
          if (intentos >= 10) {
            console.log(`   ⚠️  No se pudo actualizar "${unidad.nombre}": no se encontró símbolo único`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Error al procesar "${unidad.nombre}": ${error.message}`);
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

corregirSimbolosDuplicados();

