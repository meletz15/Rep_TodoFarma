const ExcelJS = require('exceljs');
const path = require('path');

async function analizarExcel() {
  try {
    const archivoPath = path.join(__dirname, '../FrontEnd_Edwin/subir/plantilla-productos (1).xlsx');
    
    console.log('📊 Analizando archivo Excel:', archivoPath);
    console.log('='.repeat(80));
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(archivoPath);
    
    console.log(`\n✅ Archivo leído correctamente`);
    console.log(`📑 Número de hojas: ${workbook.worksheets.length}`);
    
    // Analizar la primera hoja
    const worksheet = workbook.worksheets[0];
    console.log(`\n📋 Primera hoja: "${worksheet.name}"`);
    console.log(`📏 Total de filas: ${worksheet.rowCount}`);
    console.log(`📏 Total de columnas: ${worksheet.columnCount}`);
    
    // Leer encabezados
    console.log('\n📌 ENCABEZADOS (Fila 1):');
    console.log('-'.repeat(80));
    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const header = cell.value?.toString().trim() || '';
      headers[colNumber] = header;
      console.log(`  Columna ${colNumber}: "${header}"`);
    });
    
    // Leer primeras 10 filas de datos
    console.log('\n📦 PRIMERAS 10 FILAS DE DATOS:');
    console.log('-'.repeat(80));
    
    const maxRows = Math.min(10, worksheet.rowCount - 1);
    for (let rowNumber = 2; rowNumber <= maxRows + 1; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const fila = {};
      
      // Verificar si la fila está vacía
      let filaVacia = true;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
          filaVacia = false;
        }
      });
      
      if (filaVacia) {
        console.log(`\n  Fila ${rowNumber}: [VACÍA]`);
        continue;
      }
      
      console.log(`\n  Fila ${rowNumber}:`);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          const value = cell.value !== null && cell.value !== undefined ? cell.value.toString().trim() : '';
          if (value) {
            fila[header] = value;
            console.log(`    ${header}: "${value}"`);
          }
        }
      });
    }
    
    // Contar filas con datos
    let filasConDatos = 0;
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      let tieneDatos = false;
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
          tieneDatos = true;
        }
      });
      if (tieneDatos) filasConDatos++;
    }
    
    console.log('\n📊 RESUMEN:');
    console.log('-'.repeat(80));
    console.log(`  Total de filas en el archivo: ${worksheet.rowCount}`);
    console.log(`  Filas con datos (excluyendo encabezados): ${filasConDatos}`);
    console.log(`  Columnas detectadas: ${headers.length}`);
    
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error al analizar el Excel:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analizarExcel();

