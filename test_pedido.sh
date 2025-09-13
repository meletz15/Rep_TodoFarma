#!/bin/bash

echo "=== Probando creación de pedido ==="

# 1. Login para obtener token
echo "1. Iniciando sesión..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@dominio.com","password":"Admin123!"}' http://localhost:3002/api/auth/login)
echo "Respuesta de login: $LOGIN_RESPONSE"

# Extraer token si el login fue exitoso
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener el token de autenticación"
    echo "Probando con usuario diferente..."
    
    # Intentar con otro usuario
    LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123"}' http://localhost:3002/api/auth/login)
    echo "Respuesta de login alternativo: $LOGIN_RESPONSE"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo autenticar. Verificando usuarios disponibles..."
    curl -s http://localhost:3002/api/usuarios?pagina=1&limite=10
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 2. Crear un pedido
echo "2. Creando pedido..."
PEDIDO_DATA='{
  "proveedor_id": 1,
  "usuario_id": 1,
  "fecha_pedido": "2025-09-13T04:30:00.000Z",
  "estado": "CREADO",
  "observacion": "Pedido de prueba con Quetzales",
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 10,
      "costo_unitario": 2.50
    },
    {
      "id_producto": 2,
      "cantidad": 5,
      "costo_unitario": 3.25
    }
  ]
}'

PEDIDO_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$PEDIDO_DATA" http://localhost:3002/api/pedidos)
echo "Respuesta de creación de pedido: $PEDIDO_RESPONSE"

# 3. Listar pedidos
echo "3. Listando pedidos..."
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3002/api/pedidos?pagina=1&limite=10"

echo ""
echo "=== Prueba completada ==="
