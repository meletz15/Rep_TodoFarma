const { pool } = require('../src/config/db');

async function actualizarUnidadesMedida() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Actualizando unidades de medida de productos...\n');
    
    // Obtener todos los productos activos
    const productos = await client.query(
      'SELECT id_producto, nombre, tipo_presentacion, unidad_medida FROM producto WHERE activo = true ORDER BY nombre'
    );
    
    console.log(`📦 Productos encontrados: ${productos.rows.length}\n`);
    
    let actualizados = 0;
    
    for (const producto of productos.rows) {
      const nombre = producto.nombre.toLowerCase();
      let unidadMedida = producto.unidad_medida || null;
      
      // Si ya tiene unidad de medida, mantenerla
      if (unidadMedida) {
        console.log(`⏭️  ${producto.nombre.padEnd(40)} → Ya tiene: ${unidadMedida}`);
        continue;
      }
      
      // Asignar unidad de medida basada en tipo de presentación o nombre
      if (producto.tipo_presentacion) {
        const tipo = producto.tipo_presentacion.toLowerCase();
        
        if (tipo.includes('tableta') || tipo.includes('blister')) {
          unidadMedida = 'tabletas';
        } else if (tipo.includes('capsula') || tipo.includes('cápsula')) {
          unidadMedida = 'cápsulas';
        } else if (tipo.includes('jarabe') || tipo.includes('suspension') || tipo.includes('suspensión') || tipo.includes('líquido') || tipo.includes('liquido')) {
          unidadMedida = 'ml';
        } else if (tipo.includes('inyeccion') || tipo.includes('inyección') || tipo.includes('ampolla') || tipo.includes('vial')) {
          unidadMedida = 'unidades';
        } else if (tipo.includes('gota') || tipo.includes('drop')) {
          unidadMedida = 'ml';
        } else if (tipo.includes('crema') || tipo.includes('unguento') || tipo.includes('ungüento') || tipo.includes('pomada')) {
          unidadMedida = 'g';
        } else if (tipo.includes('polvo')) {
          unidadMedida = 'g';
        } else {
          unidadMedida = 'unidades';
        }
      } else {
        // Si no tiene tipo de presentación, inferir del nombre
        if (nombre.includes('mg') && !nombre.includes('ml') && !nombre.includes('kg')) {
          unidadMedida = 'tabletas';
        } else if (nombre.includes('alcohol') || nombre.includes('%')) {
          unidadMedida = 'ml';
        } else {
          unidadMedida = 'unidades';
        }
      }
      
      // Actualizar el producto
      await client.query(
        `UPDATE producto 
         SET unidad_medida = $1,
             updated_at = NOW()
         WHERE id_producto = $2`,
        [unidadMedida, producto.id_producto]
      );
      
      console.log(`✅ ${producto.nombre.padEnd(40)} → ${unidadMedida}`);
      actualizados++;
    }
    
    console.log(`\n✨ Actualización completada: ${actualizados} productos actualizados\n`);
    
    // Mostrar estadísticas
    const estadisticas = await client.query(
      `SELECT 
        unidad_medida,
        COUNT(*) as total
       FROM producto 
       WHERE activo = true AND unidad_medida IS NOT NULL
       GROUP BY unidad_medida
       ORDER BY total DESC`
    );
    
    console.log('📊 Estadísticas de unidades de medida:');
    console.log('─'.repeat(60));
    estadisticas.rows.forEach(stat => {
      console.log(`${(stat.unidad_medida || 'Sin unidad').padEnd(20)} → ${stat.total} productos`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar
actualizarUnidadesMedida()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });

