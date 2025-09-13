#!/bin/bash

echo "=== Probando creación de pedido sin autenticación ==="

# Verificar que el backend esté funcionando
echo "1. Verificando salud del backend..."
curl -s http://localhost:3002/health
echo ""

# Intentar crear un pedido sin autenticación (debería fallar)
echo "2. Intentando crear pedido sin autenticación..."
PEDIDO_DATA='{
  "proveedor_id": 1,
  "usuario_id": 1,
  "fecha_pedido": "2025-09-13T04:30:00.000Z",
  "estado": "CREADO",
  "observacion": "Pedido de prueba",
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 10,
      "costo_unitario": 2.50
    }
  ]
}'

curl -s -X POST -H "Content-Type: application/json" -d "$PEDIDO_DATA" http://localhost:3002/api/pedidos
echo ""

echo "=== Prueba completada ==="
