#!/bin/bash

echo "=== Probando creación de pedido desde consola ==="

# 1. Login para obtener token
echo "1. Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"correo":"admin@dominio.com","contrasena":"Admin123!"}' http://localhost:3002/api/auth/login)
echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener token"
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 2. Crear un pedido de prueba
echo "2. Creando pedido de prueba..."
PEDIDO_DATA='{
  "proveedor_id": 1,
  "usuario_id": 1,
  "fecha_pedido": "2025-09-13T04:50:00.000Z",
  "estado": "CREADO",
  "observacion": "Pedido de prueba desde consola",
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 5,
      "costo_unitario": 2.50
    },
    {
      "id_producto": 2,
      "cantidad": 3,
      "costo_unitario": 3.25
    }
  ]
}'

echo "Datos del pedido:"
echo "$PEDIDO_DATA" | jq .

echo "3. Enviando pedido al backend..."
PEDIDO_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$PEDIDO_DATA" http://localhost:3002/api/pedidos)
echo "Respuesta del backend:"
echo "$PEDIDO_RESPONSE" | jq .

echo ""
echo "=== Prueba completada ==="
