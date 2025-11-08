const { pool } = require('../src/config/db');

async function actualizarPresentaciones() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando actualización de presentaciones...\n');
    
    // Obtener todos los productos activos
    const productos = await client.query(
      'SELECT id_producto, nombre, sku FROM producto WHERE activo = true ORDER BY nombre'
    );
    
    console.log(`📦 Productos encontrados: ${productos.rows.length}\n`);
    
    let actualizados = 0;
    
    for (const producto of productos.rows) {
      const nombre = producto.nombre.toLowerCase();
      let tipoPresentacion = null;
      let cantidadPresentacion = null;
      let unidadMedida = null;
      
      // Detectar tipo de presentación basado en el nombre
      if (nombre.includes('blister')) {
        tipoPresentacion = 'Blister';
        // Extraer cantidad del nombre si está presente
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 20;
        unidadMedida = 'tabletas';
      } else if (nombre.includes('capsula') || nombre.includes('cápsula') || nombre.includes('cap')) {
        tipoPresentacion = 'Cápsulas';
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 20;
        unidadMedida = 'cápsulas';
      } else if (nombre.includes('jarabe') || nombre.includes('syrup') || nombre.includes('suspension') || nombre.includes('suspensión')) {
        tipoPresentacion = 'Jarabe';
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 100;
        unidadMedida = 'ml';
      } else if (nombre.includes('inyeccion') || nombre.includes('inyección') || nombre.includes('ampolla') || nombre.includes('ampula') || nombre.includes('vial')) {
        tipoPresentacion = 'Inyección';
        cantidadPresentacion = 1;
        unidadMedida = 'unidades';
      } else if (nombre.includes('gota') || nombre.includes('drop')) {
        tipoPresentacion = 'Gotas';
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 15;
        unidadMedida = 'ml';
      } else if (nombre.includes('crema') || nombre.includes('cream')) {
        tipoPresentacion = 'Crema';
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 30;
        unidadMedida = 'g';
      } else if (nombre.includes('unguento') || nombre.includes('ungüento') || nombre.includes('pomada')) {
        tipoPresentacion = 'Ungüento';
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 30;
        unidadMedida = 'g';
      } else if (nombre.includes('polvo') || nombre.includes('powder')) {
        tipoPresentacion = 'Polvo';
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 10;
        unidadMedida = 'g';
      } else if (nombre.includes('alcohol') || nombre.includes('%')) {
        // Productos líquidos como alcohol
        tipoPresentacion = 'Líquido';
        const match = nombre.match(/(\d+)/);
        cantidadPresentacion = match ? parseInt(match[1]) : 100;
        unidadMedida = 'ml';
      } else if (nombre.includes('mg') || nombre.includes('tableta') || nombre.includes('tablet') || nombre.includes('tab')) {
        // Medicamentos con mg generalmente son tabletas
        tipoPresentacion = 'Tabletas';
        const match = nombre.match(/(\d+)/);
        // Si el número es muy grande (como 500mg), usar cantidad estándar
        if (match && parseInt(match[1]) > 1000) {
          cantidadPresentacion = 20; // Cantidad estándar de tabletas
        } else if (match && parseInt(match[1]) <= 100) {
          cantidadPresentacion = parseInt(match[1]);
        } else {
          cantidadPresentacion = 20;
        }
        unidadMedida = 'tabletas';
      } else {
        // Por defecto, asignar Tabletas
        tipoPresentacion = 'Tabletas';
        cantidadPresentacion = 20;
        unidadMedida = 'tabletas';
      }
      
      // Actualizar el producto
      await client.query(
        `UPDATE producto 
         SET tipo_presentacion = $1, 
             cantidad_presentacion = $2, 
             unidad_medida = $3,
             updated_at = NOW()
         WHERE id_producto = $4`,
        [tipoPresentacion, cantidadPresentacion, unidadMedida, producto.id_producto]
      );
      
      console.log(`✅ ${producto.nombre.padEnd(40)} → ${tipoPresentacion} (${cantidadPresentacion} ${unidadMedida})`);
      actualizados++;
    }
    
    console.log(`\n✨ Actualización completada: ${actualizados} productos actualizados\n`);
    
    // Mostrar estadísticas
    const estadisticas = await client.query(
      `SELECT 
        tipo_presentacion,
        COUNT(*) as total,
        AVG(cantidad_presentacion) as cantidad_promedio
       FROM producto 
       WHERE activo = true AND tipo_presentacion IS NOT NULL
       GROUP BY tipo_presentacion
       ORDER BY total DESC`
    );
    
    console.log('📊 Estadísticas de presentaciones:');
    console.log('─'.repeat(60));
    estadisticas.rows.forEach(stat => {
      console.log(`${stat.tipo_presentacion.padEnd(20)} → ${stat.total} productos (promedio: ${parseFloat(stat.cantidad_promedio).toFixed(1)})`);
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar presentaciones:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar
actualizarPresentaciones()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });

