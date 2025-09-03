// Función para construir consultas paginadas
const construirPaginacion = (pagina = 1, limite = 10) => {
  const offset = (pagina - 1) * limite;
  return {
    offset,
    limite: parseInt(limite),
    pagina: parseInt(pagina)
  };
};

// Función para construir respuesta paginada
const construirRespuestaPaginada = (datos, total, pagina, limite) => {
  const totalPaginas = Math.ceil(total / limite);
  
  return {
    datos,
    paginacion: {
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      total,
      totalPaginas,
      tieneSiguiente: pagina < totalPaginas,
      tieneAnterior: pagina > 1
    }
  };
};

// Función para validar parámetros de paginación
const validarPaginacion = (pagina, limite) => {
  const paginaNum = parseInt(pagina) || 1;
  const limiteNum = parseInt(limite) || 10;
  
  if (paginaNum < 1) {
    throw new Error('La página debe ser mayor a 0');
  }
  
  if (limiteNum < 1 || limiteNum > 100) {
    throw new Error('El límite debe estar entre 1 y 100');
  }
  
  return { pagina: paginaNum, limite: limiteNum };
};

module.exports = {
  construirPaginacion,
  construirRespuestaPaginada,
  validarPaginacion
};
