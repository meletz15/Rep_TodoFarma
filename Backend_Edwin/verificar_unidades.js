const { pool } = require('./src/config/db');

async function verificarUnidades() {
  let cliente = null;
  try {
    cliente = await pool.connect();
    
    // Buscar unidades que contengan "27ml"
    const result = await cliente.query(
      `SELECT id_unidad_medida, nombre, simbolo, activo 
       FROM unidad_medida 
       WHERE LOWER(nombre) LIKE '%27ml%' OR LOWER(simbolo) LIKE '%27ml%'
       ORDER BY nombre`
    );
    
    console.log(`Unidades encontradas con "27ml": ${result.rows.length}`);
    result.rows.forEach(u => {
      console.log(`  - Nombre: "${u.nombre}", Símbolo: "${u.simbolo}", Activo: ${u.activo}`);
    });
    
    // Buscar todas las unidades que contengan "frasco"
    const result2 = await cliente.query(
      `SELECT id_unidad_medida, nombre, simbolo, activo 
       FROM unidad_medida 
       WHERE LOWER(nombre) LIKE '%frasco%'
       ORDER BY nombre`
    );
    
    console.log(`\nUnidades encontradas con "frasco": ${result2.rows.length}`);
    result2.rows.forEach(u => {
      console.log(`  - Nombre: "${u.nombre}", Símbolo: "${u.simbolo}", Activo: ${u.activo}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (cliente) {
      cliente.release();
    }
  }
}

verificarUnidades();

