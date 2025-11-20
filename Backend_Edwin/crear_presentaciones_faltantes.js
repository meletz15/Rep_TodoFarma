const ExcelJS = require('exceljs');
const path = require('path');
const { pool } = require('./src/config/db');

async function crearPresentacionesFaltantes() {
  let cliente = null;
  try {
    console.log('🔍 Analizando Excel para extraer tipos de presentación...');
    console.log('='.repeat(80));
    
    // Paso 1: Leer el Excel y extraer tipos de presentación únicos
    const archivoPath = path.join(__dirname, '../FrontEnd_Edwin/subir/plantilla-productos (1).xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(archivoPath);
    
    const worksheet = workbook.worksheets[0];
    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber] = cell.value?.toString().trim().toLowerCase() || '';
    });
    
    // Encontrar la columna de tipo de presentación
    let columnaPresentacion = null;
    for (let colNum = 1; colNum <= headers.length; colNum++) {
      const header = headers[colNum];
      if (header && (
        header.includes('tipo de presentación') || 
        header.includes('tipo_presentacion') || 
        header.includes('presentacion') ||
        header === 'presentación'
      )) {
        columnaPresentacion = colNum;
        break;
      }
    }
    
    if (!columnaPresentacion) {
      throw new Error('No se encontró la columna de tipo de presentación');
    }
    
    console.log(`✅ Columna de presentación encontrada: ${columnaPresentacion}`);
    
    // Extraer todos los tipos de presentación únicos
    const presentaciones = new Set();
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const cell = row.getCell(columnaPresentacion);
      
      if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
        const presentacion = cell.value.toString().trim();
        if (presentacion) {
          presentaciones.add(presentacion);
        }
      }
    }
    
    console.log(`\n📋 Tipos de presentación encontrados en el Excel: ${presentaciones.size}`);
    const presentacionesArray = Array.from(presentaciones).sort();
    presentacionesArray.forEach((p, i) => {
      console.log(`   ${i + 1}. "${p}"`);
    });
    
    // Paso 2: Conectar a la base de datos
    console.log('\n🔌 Conectando a la base de datos...');
    cliente = await pool.connect();
    console.log('✅ Conexión establecida');
    
    // Paso 3: Verificar cuáles presentaciones ya existen
    console.log('\n🔍 Verificando presentaciones existentes...');
    const presentacionesExistentes = new Set();
    const result = await cliente.query(
      'SELECT nombre FROM presentacion WHERE activo = true'
    );
    
    result.rows.forEach(row => {
      presentacionesExistentes.add(row.nombre.toLowerCase().trim());
    });
    
    console.log(`✅ Presentaciones existentes en BD: ${presentacionesExistentes.size}`);
    
    // Paso 4: Identificar las que faltan
    const presentacionesFaltantes = presentacionesArray.filter(p => {
      return !presentacionesExistentes.has(p.toLowerCase().trim());
    });
    
    console.log(`\n📝 Presentaciones faltantes: ${presentacionesFaltantes.length}`);
    
    if (presentacionesFaltantes.length === 0) {
      console.log('✅ Todas las presentaciones ya existen en la base de datos');
      return;
    }
    
    presentacionesFaltantes.forEach((p, i) => {
      console.log(`   ${i + 1}. "${p}"`);
    });
    
    // Paso 5: Crear las presentaciones faltantes
    console.log('\n💾 Creando presentaciones faltantes...');
    let creadas = 0;
    let errores = 0;
    
    for (const presentacionNombre of presentacionesFaltantes) {
      try {
        // Verificar si existe pero está inactiva
        const existeInactiva = await cliente.query(
          'SELECT id_presentacion FROM presentacion WHERE LOWER(nombre) = LOWER($1)',
          [presentacionNombre]
        );
        
        if (existeInactiva.rows.length > 0) {
          // Actualizar a activa
          await cliente.query(
            'UPDATE presentacion SET activo = true, updated_at = NOW() WHERE id_presentacion = $1',
            [existeInactiva.rows[0].id_presentacion]
          );
          console.log(`   ✅ Reactivada: "${presentacionNombre}"`);
          creadas++;
        } else {
          // Crear nueva
          await cliente.query(
            'INSERT INTO presentacion (nombre, descripcion, activo) VALUES ($1, $2, $3)',
            [presentacionNombre, `Presentación: ${presentacionNombre}`, true]
          );
          console.log(`   ✅ Creada: "${presentacionNombre}"`);
          creadas++;
        }
      } catch (error) {
        console.error(`   ❌ Error al crear "${presentacionNombre}": ${error.message}`);
        errores++;
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(80));
    console.log(`   Total de presentaciones en Excel: ${presentacionesArray.length}`);
    console.log(`   Presentaciones existentes: ${presentacionesArray.length - presentacionesFaltantes.length}`);
    console.log(`   Presentaciones creadas/reactivadas: ${creadas}`);
    console.log(`   Errores: ${errores}`);
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

// Ejecutar
crearPresentacionesFaltantes();

