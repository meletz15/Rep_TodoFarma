#!/bin/bash

echo "=== Probando endpoints de pedidos con autenticación ==="

# 1. Verificar que el backend esté funcionando
echo "1. Verificando salud del backend..."
curl -s http://localhost:3002/health
echo ""

# 2. Intentar login (esperar un poco para que pase el rate limit)
echo "2. Esperando para evitar rate limit..."
sleep 2

echo "3. Intentando login..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"correo":"admin@dominio.com","contrasena":"Admin123!"}' http://localhost:3002/api/auth/login)
echo "Respuesta de login: $LOGIN_RESPONSE"

# Extraer token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener el token de autenticación"
    echo "Probando con usuario alternativo..."
    
    # Intentar con otro usuario
    LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"correo":"test@test.com","contrasena":"test123"}' http://localhost:3002/api/auth/login)
    echo "Respuesta de login alternativo: $LOGIN_RESPONSE"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo autenticar. Verificando usuarios disponibles..."
    curl -s http://localhost:3002/api/usuarios?pagina=1&limite=5
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 3. Probar endpoint de pedidos
echo "4. Probando endpoint de pedidos..."
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3002/api/pedidos?pagina=1&limite=10" | jq .

echo ""

# 4. Probar endpoint de estadísticas de pedidos
echo "5. Probando estadísticas de pedidos..."
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3002/api/pedidos/estadisticas" | jq .

echo ""

# 5. Probar obtener un pedido específico
echo "6. Probando obtener pedido específico (ID 1)..."
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3002/api/pedidos/1" | jq .

echo ""
echo "=== Prueba completada ==="
