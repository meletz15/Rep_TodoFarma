const ExcelJS = require('exceljs');
const path = require('path');
const { pool } = require('./src/config/db');

async function crearUnidadesMedidaFaltantes() {
  let cliente = null;
  try {
    console.log('🔍 Analizando Excel para extraer unidades de medida...');
    console.log('='.repeat(80));
    
    // Paso 1: Leer el Excel y extraer unidades de medida únicas
    const archivoPath = path.join(__dirname, '../FrontEnd_Edwin/subir/plantilla-productos (1).xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(archivoPath);
    
    const worksheet = workbook.worksheets[0];
    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber] = cell.value?.toString().trim().toLowerCase() || '';
    });
    
    // Encontrar la columna de unidad de medida
    let columnaUnidadMedida = null;
    for (let colNum = 1; colNum <= headers.length; colNum++) {
      const header = headers[colNum];
      if (header && (
        header.includes('unidad de medida') || 
        header.includes('unidad_medida') || 
        header.includes('unidad medida') ||
        header === 'unidad'
      )) {
        columnaUnidadMedida = colNum;
        break;
      }
    }
    
    if (!columnaUnidadMedida) {
      throw new Error('No se encontró la columna de unidad de medida');
    }
    
    console.log(`✅ Columna de unidad de medida encontrada: ${columnaUnidadMedida}`);
    
    // Extraer todas las unidades de medida únicas
    const unidadesMedida = new Set();
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const cell = row.getCell(columnaUnidadMedida);
      
      if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
        const unidad = cell.value.toString().trim();
        if (unidad) {
          unidadesMedida.add(unidad);
        }
      }
    }
    
    console.log(`\n📋 Unidades de medida encontradas en el Excel: ${unidadesMedida.size}`);
    const unidadesArray = Array.from(unidadesMedida).sort();
    unidadesArray.forEach((u, i) => {
      console.log(`   ${i + 1}. "${u}"`);
    });
    
    // Paso 2: Conectar a la base de datos
    console.log('\n🔌 Conectando a la base de datos...');
    cliente = await pool.connect();
    console.log('✅ Conexión establecida');
    
    // Paso 3: Verificar cuáles unidades ya existen
    console.log('\n🔍 Verificando unidades de medida existentes...');
    const unidadesExistentes = new Set();
    const result = await cliente.query(
      'SELECT nombre, simbolo FROM unidad_medida WHERE activo = true'
    );
    
    result.rows.forEach(row => {
      if (row.nombre) unidadesExistentes.add(row.nombre.toLowerCase().trim());
      if (row.simbolo) unidadesExistentes.add(row.simbolo.toLowerCase().trim());
    });
    
    console.log(`✅ Unidades existentes en BD: ${result.rows.length}`);
    
    // Paso 4: Identificar las que faltan
    const unidadesFaltantes = unidadesArray.filter(u => {
      return !unidadesExistentes.has(u.toLowerCase().trim());
    });
    
    console.log(`\n📝 Unidades de medida faltantes: ${unidadesFaltantes.length}`);
    
    if (unidadesFaltantes.length === 0) {
      console.log('✅ Todas las unidades de medida ya existen en la base de datos');
      return;
    }
    
    unidadesFaltantes.forEach((u, i) => {
      console.log(`   ${i + 1}. "${u}"`);
    });
    
    // Paso 5: Crear las unidades de medida faltantes
    console.log('\n💾 Creando unidades de medida faltantes...');
    let creadas = 0;
    let errores = 0;
    
    for (const unidadNombre of unidadesFaltantes) {
      try {
        // Verificar si existe pero está inactiva
        const existeInactiva = await cliente.query(
          'SELECT id_unidad_medida FROM unidad_medida WHERE LOWER(nombre) = LOWER($1) OR LOWER(simbolo) = LOWER($1)',
          [unidadNombre]
        );
        
        if (existeInactiva.rows.length > 0) {
          // Actualizar a activa
          await cliente.query(
            'UPDATE unidad_medida SET activo = true, updated_at = NOW() WHERE id_unidad_medida = $1',
            [existeInactiva.rows[0].id_unidad_medida]
          );
          console.log(`   ✅ Reactivada: "${unidadNombre}"`);
          creadas++;
        } else {
          // Crear nueva - generar un símbolo único
          let simbolo = unidadNombre.length <= 10 ? unidadNombre : unidadNombre.substring(0, 10);
          
          // Verificar si el símbolo ya existe y generar uno único
          let simboloExiste = true;
          let intentos = 0;
          let simboloFinal = simbolo;
          
          while (simboloExiste && intentos < 100) {
            const check = await cliente.query(
              'SELECT 1 FROM unidad_medida WHERE simbolo = $1',
              [simboloFinal]
            );
            
            if (check.rows.length === 0) {
              simboloExiste = false;
            } else {
              // Generar un nuevo símbolo único
              if (unidadNombre.length <= 8) {
                simboloFinal = unidadNombre + (intentos + 1);
              } else {
                const base = unidadNombre.substring(0, 7);
                simboloFinal = base + (intentos + 1);
              }
              intentos++;
            }
          }
          
          await cliente.query(
            'INSERT INTO unidad_medida (nombre, simbolo, descripcion, activo) VALUES ($1, $2, $3, $4)',
            [unidadNombre, simboloFinal, `Unidad de medida: ${unidadNombre}`, true]
          );
          console.log(`   ✅ Creada: "${unidadNombre}" (símbolo: "${simboloFinal}")`);
          creadas++;
        }
      } catch (error) {
        console.error(`   ❌ Error al crear "${unidadNombre}": ${error.message}`);
        errores++;
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(80));
    console.log(`   Total de unidades en Excel: ${unidadesArray.length}`);
    console.log(`   Unidades existentes: ${unidadesArray.length - unidadesFaltantes.length}`);
    console.log(`   Unidades creadas/reactivadas: ${creadas}`);
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
crearUnidadesMedidaFaltantes();

