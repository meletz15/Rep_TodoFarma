e# TodoFarma - Sistema de Gestión Farmacéutica

## 🚀 Descripción

TodoFarma es un sistema integral de gestión farmacéutica desarrollado con **Angular 17**, **Angular Material** y **Tailwind CSS**. El sistema proporciona una interfaz moderna y funcional para la gestión de usuarios y otros módulos del negocio farmacéutico.

## ✨ Características

### 🔐 Autenticación
- Sistema de login seguro con JWT
- Protección de rutas con guards
- Gestión de sesiones de usuario

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Filtros avanzados (rol, estado, búsqueda)
- Paginación de resultados
- Validación de formularios
- Estados activo/inactivo

### 🎨 Interfaz de Usuario
- Diseño moderno y responsive
- Tema médico/farmacéutico
- Componentes Material Design
- Animaciones suaves
- Experiencia de usuario optimizada

### 📱 Responsive Design
- Compatible con dispositivos móviles
- Diseño adaptativo
- Navegación intuitiva

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 17** - Framework principal
- **Angular Material** - Componentes UI
- **Tailwind CSS** - Framework de estilos
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva

### Backend (API)
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

## 📋 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Angular CLI 17+
- PostgreSQL 16+

### 🚀 Inicio Rápido

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd todofarma
```

2. **Iniciar el Backend**
```bash
cd Backend
npm install
npm run dev
```

3. **Iniciar el Frontend**
```bash
cd FrontEnd/todofarma-web
npm install
npm start
```

4. **Acceder a la aplicación**
```
Frontend: http://localhost:4200
Backend:  http://localhost:3000
```

### 🔐 Credenciales por Defecto
- **Usuario**: `admin@todofarma.com`
- **Contraseña**: `Admin123!`

## 📁 Estructura del Proyecto

```
todofarma/
├── Backend/                    # API REST con Node.js
│   ├── src/
│   │   ├── controllers/       # Controladores de la API
│   │   ├── models/           # Modelos de datos
│   │   ├── routes/           # Rutas de la API
│   │   └── middlewares/      # Middlewares de autenticación
│   └── package.json
│
└── FrontEnd/
    └── todofarma-web/         # Aplicación Angular
        ├── src/
        │   ├── app/
        │   │   ├── components/    # Componentes reutilizables
        │   │   ├── guards/        # Guards de autenticación
        │   │   ├── interceptors/  # Interceptores HTTP
        │   │   ├── models/        # Interfaces y tipos
        │   │   ├── pages/         # Páginas principales
        │   │   │   ├── login/     # Página de login
        │   │   │   ├── dashboard/ # Dashboard principal
        │   │   │   └── usuarios/  # Gestión de usuarios
        │   │   └── services/      # Servicios de API
        │   └── environments/      # Configuraciones de entorno
        └── package.json
```

## 🎯 Funcionalidades Principales

### 1. 🔐 Login
- Formulario de autenticación con validación
- Persistencia de sesión con JWT
- Redirección automática al dashboard
- Manejo de errores de autenticación

### 2. 🏠 Dashboard
- Menú principal con módulos del sistema
- Indicadores de estado de módulos
- Navegación intuitiva
- Información del usuario autenticado

### 3. 👥 Gestión de Usuarios
- **Listar usuarios** con paginación y ordenamiento
- **Crear usuarios** con validación completa
- **Editar usuarios** existentes
- **Eliminar usuarios** (inactivar)
- **Filtros avanzados**:
  - Por rol (ADMIN, USUARIO, VENDEDOR)
  - Por estado (ACTIVO, INACTIVO)
  - Búsqueda por nombre, apellido o correo
- **Exportación** de datos

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start          # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm run test       # Ejecutar pruebas
npm run lint       # Verificar código
```

## ⚙️ Configuración de Desarrollo

### Variables de Entorno
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Estilos Personalizados
- **Tailwind CSS** para utilidades
- **Angular Material** para componentes
- **CSS personalizado** para estilos específicos

## 🔒 Características de Seguridad

- **Autenticación JWT** con interceptores
- **Validación de formularios** en frontend y backend
- **Protección de rutas** con guards
- **Encriptación de contraseñas** con bcrypt
- **Rate limiting** en el backend

## 📊 Módulos Futuros

El sistema está diseñado para expandirse con los siguientes módulos:

- [ ] **Ventas** - Gestión de ventas y facturación
- [ ] **Productos** - Inventario de productos
- [ ] **Clientes** - Gestión de clientes
- [ ] **Reportes** - Reportes y estadísticas
- [ ] **Configuración** - Configuración del sistema

## 🐛 Solución de Problemas

### Error de compilación
Si encuentras errores de compilación, asegúrate de:
1. Tener Node.js 18+ instalado
2. Ejecutar `npm install` en ambos directorios
3. Verificar que el backend esté ejecutándose en puerto 3000

### Error de conexión al backend
```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:3000/api/auth/login
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para TodoFarma**

## 🎉 ¡Disfruta usando TodoFarma!
