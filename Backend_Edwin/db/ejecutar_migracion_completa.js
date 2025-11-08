const { pool } = require('../src/config/db');

async function ejecutarMigracionCompleta() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Ejecutando migración de columnas...\n');
    
    // Agregar columnas
    await client.query(`
      ALTER TABLE producto 
      ADD COLUMN IF NOT EXISTS tipo_presentacion VARCHAR(50),
      ADD COLUMN IF NOT EXISTS cantidad_presentacion NUMERIC(10,2),
      ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(20);
    `);
    
    console.log('✅ Columnas agregadas');
    
    // Crear índice
    await client.query(`
      CREATE INDEX IF NOT EXISTS ix_producto__tipo_presentacion 
      ON producto(tipo_presentacion) 
      WHERE tipo_presentacion IS NOT NULL;
    `);
    
    console.log('✅ Índice creado\n');
    
    await client.query('COMMIT');
    
    console.log('🔄 Actualizando presentaciones de productos...\n');
    
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
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 100 ? parseInt(match[1]) : 20;
        unidadMedida = 'tabletas';
      } else if (nombre.includes('capsula') || nombre.includes('cápsula') || (nombre.includes(' cap ') && !nombre.includes('capacidad'))) {
        tipoPresentacion = 'Cápsulas';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 100 ? parseInt(match[1]) : 20;
        unidadMedida = 'cápsulas';
      } else if (nombre.includes('jarabe') || nombre.includes('syrup') || nombre.includes('suspension') || nombre.includes('suspensión')) {
        tipoPresentacion = 'Jarabe';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 500 ? parseInt(match[1]) : 100;
        unidadMedida = 'ml';
      } else if (nombre.includes('inyeccion') || nombre.includes('inyección') || nombre.includes('ampolla') || nombre.includes('ampula') || nombre.includes('vial')) {
        tipoPresentacion = 'Inyección';
        cantidadPresentacion = 1;
        unidadMedida = 'unidades';
      } else if (nombre.includes('gota') || nombre.includes('drop')) {
        tipoPresentacion = 'Gotas';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 50 ? parseInt(match[1]) : 15;
        unidadMedida = 'ml';
      } else if (nombre.includes('crema') || nombre.includes('cream')) {
        tipoPresentacion = 'Crema';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 200 ? parseInt(match[1]) : 30;
        unidadMedida = 'g';
      } else if (nombre.includes('unguento') || nombre.includes('ungüento') || nombre.includes('pomada')) {
        tipoPresentacion = 'Ungüento';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 200 ? parseInt(match[1]) : 30;
        unidadMedida = 'g';
      } else if (nombre.includes('polvo') || nombre.includes('powder')) {
        tipoPresentacion = 'Polvo';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 100 ? parseInt(match[1]) : 10;
        unidadMedida = 'g';
      } else if (nombre.includes('alcohol') || (nombre.includes('%') && !nombre.includes('mg'))) {
        tipoPresentacion = 'Líquido';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 500 ? parseInt(match[1]) : 100;
        unidadMedida = 'ml';
      } else if (nombre.includes('mg') && !nombre.includes('ml') && !nombre.includes('kg')) {
        // Medicamentos con mg generalmente son tabletas
        tipoPresentacion = 'Tabletas';
        // Buscar números que no sean dosis (números pequeños)
        const matches = nombre.match(/\b(\d+)\b/g);
        if (matches) {
          const cantidades = matches.map(m => parseInt(m)).filter(n => n <= 100 && n > 0);
          cantidadPresentacion = cantidades.length > 0 ? cantidades[0] : 20;
        } else {
          cantidadPresentacion = 20;
        }
        unidadMedida = 'tabletas';
      } else if (nombre.includes('tableta') || nombre.includes('tablet') || nombre.includes(' tab ')) {
        tipoPresentacion = 'Tabletas';
        const match = nombre.match(/\b(\d+)\b/);
        cantidadPresentacion = match && parseInt(match[1]) <= 100 ? parseInt(match[1]) : 20;
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
        ROUND(AVG(cantidad_presentacion), 1) as cantidad_promedio
       FROM producto 
       WHERE activo = true AND tipo_presentacion IS NOT NULL
       GROUP BY tipo_presentacion
       ORDER BY total DESC`
    );
    
    console.log('📊 Estadísticas de presentaciones:');
    console.log('─'.repeat(60));
    estadisticas.rows.forEach(stat => {
      console.log(`${stat.tipo_presentacion.padEnd(20)} → ${stat.total} productos (promedio: ${stat.cantidad_promedio})`);
    });
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de productos actualizados:');
    console.log('─'.repeat(60));
    const ejemplos = await client.query(
      `SELECT nombre, tipo_presentacion, cantidad_presentacion, unidad_medida 
       FROM producto 
       WHERE activo = true AND tipo_presentacion IS NOT NULL
       ORDER BY nombre
       LIMIT 10`
    );
    
    ejemplos.rows.forEach(prod => {
      const presentacion = `${prod.cantidad_presentacion} ${prod.unidad_medida} ${prod.tipo_presentacion}`;
      console.log(`${prod.nombre.padEnd(40)} → ${presentacion}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar
ejecutarMigracionCompleta()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });

