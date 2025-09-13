#!/bin/bash

echo "=== Probando conexión frontend-backend ==="

# 1. Verificar que el backend esté funcionando
echo "1. Verificando backend..."
curl -s http://localhost:3002/health
echo ""

# 2. Verificar que el frontend esté funcionando
echo "2. Verificando frontend..."
curl -s http://localhost:4200 | head -5
echo ""

# 3. Probar login y obtener token
echo "3. Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"correo":"admin@dominio.com","contrasena":"Admin123!"}' http://localhost:3002/api/auth/login)
echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener token"
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 4. Probar endpoint de pedidos con token
echo "4. Probando endpoint de pedidos..."
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3002/api/pedidos?pagina=1&limite=10" | jq '.ok, .mensaje, .datos.datos | length'

echo ""
echo "=== Prueba completada ==="
