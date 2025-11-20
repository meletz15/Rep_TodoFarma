const ExcelJS = require('exceljs');
const path = require('path');
const { pool } = require('./src/config/db');

async function actualizarSimbolosDesdeExcel() {
  let cliente = null;
  try {
    console.log('🔧 Actualizando símbolos de unidades de medida desde Excel...');
    console.log('='.repeat(80));
    
    // Leer el Excel
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
    
    // Extraer todas las unidades de medida únicas del Excel
    const unidadesExcel = new Set();
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const cell = row.getCell(columnaUnidadMedida);
      
      if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
        const unidad = cell.value.toString().trim();
        if (unidad) {
          unidadesExcel.add(unidad);
        }
      }
    }
    
    console.log(`\n📋 Unidades de medida en Excel: ${unidadesExcel.size}`);
    
    // Conectar a la base de datos
    cliente = await pool.connect();
    
    let actualizadas = 0;
    let errores = 0;
    
    // Para cada unidad del Excel, buscar en BD y actualizar el símbolo
    for (const unidadExcel of unidadesExcel) {
      try {
        // Buscar por nombre (case insensitive)
        const result = await cliente.query(
          'SELECT id_unidad_medida, nombre, simbolo FROM unidad_medida WHERE LOWER(nombre) = LOWER($1)',
          [unidadExcel]
        );
        
        if (result.rows.length > 0) {
          const unidad = result.rows[0];
          
          // Si el símbolo no coincide con el valor del Excel, actualizarlo
          if (unidad.simbolo !== unidadExcel) {
            // Verificar si el nuevo símbolo ya existe en otra unidad
            const existeSimbolo = await cliente.query(
              'SELECT 1 FROM unidad_medida WHERE simbolo = $1 AND id_unidad_medida != $2',
              [unidadExcel, unidad.id_unidad_medida]
            );
            
            if (existeSimbolo.rows.length === 0) {
              // Si el valor del Excel cabe en 10 caracteres, usarlo como símbolo
              if (unidadExcel.length <= 10) {
                await cliente.query(
                  'UPDATE unidad_medida SET simbolo = $1 WHERE id_unidad_medida = $2',
                  [unidadExcel, unidad.id_unidad_medida]
                );
                console.log(`   ✅ Actualizada: "${unidad.nombre}" (símbolo: "${unidadExcel}")`);
                actualizadas++;
              } else {
                // Si no cabe, usar los primeros 10 caracteres
                const simboloCorto = unidadExcel.substring(0, 10);
                const existeSimboloCorto = await cliente.query(
                  'SELECT 1 FROM unidad_medida WHERE simbolo = $1 AND id_unidad_medida != $2',
                  [simboloCorto, unidad.id_unidad_medida]
                );
                
                if (existeSimboloCorto.rows.length === 0) {
                  await cliente.query(
                    'UPDATE unidad_medida SET simbolo = $1 WHERE id_unidad_medida = $2',
                    [simboloCorto, unidad.id_unidad_medida]
                  );
                  console.log(`   ✅ Actualizada: "${unidad.nombre}" (símbolo: "${simboloCorto}")`);
                  actualizadas++;
                } else {
                  console.log(`   ⚠️  No se puede actualizar "${unidad.nombre}": símbolo "${simboloCorto}" ya existe`);
                }
              }
            } else {
              console.log(`   ⚠️  No se puede actualizar "${unidad.nombre}": símbolo "${unidadExcel}" ya existe`);
            }
          } else {
            console.log(`   ✓ Ya correcto: "${unidad.nombre}" (símbolo: "${unidad.simbolo}")`);
          }
        } else {
          console.log(`   ⚠️  No encontrada en BD: "${unidadExcel}"`);
        }
      } catch (error) {
        console.error(`   ❌ Error al procesar "${unidadExcel}": ${error.message}`);
        errores++;
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(80));
    console.log(`   Unidades procesadas: ${unidadesExcel.size}`);
    console.log(`   Unidades actualizadas: ${actualizadas}`);
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

actualizarSimbolosDesdeExcel();

