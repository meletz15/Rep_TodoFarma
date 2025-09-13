#!/bin/bash

# Script para probar los endpoints de los nuevos módulos
# Asegúrate de que el backend esté ejecutándose en el puerto 3002

BASE_URL="http://localhost:3002"
echo "🧪 Probando endpoints de los nuevos módulos..."
echo "================================================"

# Función para hacer requests con manejo de errores
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo ""
    echo "📋 $description"
    echo "   $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "   ✅ Status: $http_code"
        echo "   📄 Response: $(echo "$body" | head -c 200)..."
    else
        echo "   ❌ Status: $http_code"
        echo "   📄 Response: $body"
    fi
}

# 1. Probar endpoints de PEDIDOS
echo ""
echo "🛒 PROBANDO MÓDULO DE PEDIDOS"
echo "=============================="

test_endpoint "GET" "/api/pedidos?pagina=1&limite=10" "Obtener lista de pedidos"
test_endpoint "GET" "/api/pedidos/estadisticas" "Obtener estadísticas de pedidos"
test_endpoint "GET" "/api/pedidos/1" "Obtener pedido por ID"

# 2. Probar endpoints de INVENTARIO
echo ""
echo "📦 PROBANDO MÓDULO DE INVENTARIO"
echo "================================="

test_endpoint "GET" "/api/inventario/movimientos?pagina=1&limite=10" "Obtener movimientos de inventario"
test_endpoint "GET" "/api/inventario/estadisticas" "Obtener estadísticas de inventario"
test_endpoint "GET" "/api/inventario/stock-bajo?limite_stock=10" "Obtener productos con stock bajo"
test_endpoint "GET" "/api/inventario/por-vencer?dias=30" "Obtener productos por vencer"
test_endpoint "GET" "/api/inventario/resumen-categoria" "Obtener resumen por categoría"

# 3. Probar endpoints de CAJA
echo ""
echo "💰 PROBANDO MÓDULO DE CAJA"
echo "=========================="

test_endpoint "GET" "/api/caja?pagina=1&limite=10" "Obtener lista de cajas"
test_endpoint "GET" "/api/caja/estadisticas" "Obtener estadísticas de caja"
test_endpoint "GET" "/api/caja/verificar" "Verificar estado de caja"
test_endpoint "GET" "/api/caja/resumen-dia?fecha=$(date +%Y-%m-%d)" "Obtener resumen del día"

# 4. Probar endpoints de VENTAS
echo ""
echo "🛍️ PROBANDO MÓDULO DE VENTAS"
echo "============================="

test_endpoint "GET" "/api/ventas?pagina=1&limite=10" "Obtener lista de ventas"
test_endpoint "GET" "/api/ventas/estadisticas" "Obtener estadísticas de ventas"
test_endpoint "GET" "/api/ventas/productos-mas-vendidos?limite=10" "Obtener productos más vendidos"
test_endpoint "GET" "/api/ventas/1" "Obtener venta por ID"

# 5. Probar endpoints de salud
echo ""
echo "🏥 PROBANDO ENDPOINTS DE SALUD"
echo "=============================="

test_endpoint "GET" "/health" "Health check del servidor"

echo ""
echo "✅ Pruebas completadas!"
echo "======================="
