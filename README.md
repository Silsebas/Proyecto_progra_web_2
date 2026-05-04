# Market Vehículos — Proyecto Web 2

Aplicación fullstack de compra y venta de autos usados. El proyecto está dividido en tres servicios independientes que se comunican entre sí.

---

## Estructura del repositorio

```
Proyecto_progra_web_2/
├── Proyecto_Venta_Autos_Backend_2/     # API REST (Node.js + Express)
├── Proyecto_Venta_Autos_Frontend_2/    # Interfaz de usuario (React + Vite)
└── Proyecto_Venta_Autos_GraphQL/       # Servicio de consultas GraphQL
```

---

## Requisitos previos

Antes de instalar el proyecto asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [MongoDB](https://www.mongodb.com/) corriendo localmente en el puerto `27017`
- [XAMPP](https://www.apachefriends.org/) con Apache y PHP corriendo
- Cuenta en [SendGrid](https://sendgrid.com/) para envío de correos
- Cuenta en [Twilio](https://www.twilio.com/) para envío de SMS
- Proyecto en [Google Cloud Console](https://console.cloud.google.com/) con OAuth 2.0 configurado

---

## 0. XAMPP — Padrón Electoral

El sistema valida la cédula costarricense contra un servicio PHP local que debe correr en XAMPP. Este servicio verifica que la cédula exista y obtiene el nombre oficial del titular.

Mas detalle en este link

https://github.com/guntanis/padron?tab=readme-ov-file

### Configuración

1. Descarga e instala [XAMPP](https://www.apachefriends.org/)
2. Copia la carpeta del servicio del padrón a:
   ```
   C:/xampp/htdocs/padron/
   ```
3. Abre el **Panel de Control de XAMPP** y enciende **Apache**
4. Verifica que funciona abriendo en el navegador:
   ```
   http://localhost/padron/cedula/206950164
   ```
   Debe devolver un JSON con el nombre del titular de esa cédula

### ¿Cómo se usa en el proyecto?

- El frontend consulta el padrón cuando el usuario escribe su cédula en el formulario de registro
- Si la cédula existe el nombre oficial se rellena automáticamente en el campo de nombre
- Si la cédula no existe el registro no puede continuar
- El backend también valida la cédula antes de guardar el usuario en la base de datos

---

## 1. Backend — API REST

### Instalación

```bash
cd Proyecto_Venta_Autos_Backend_2
npm install
```

### Configuración del .env

Crea un archivo `.env` en la raíz de `Proyecto_Venta_Autos_Backend_2` basándote en `.env.example`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/market_vehiculos_db

# Servidor
PORT=4000
NODE_ENV=development

# JWT — usa una clave larga y aleatoria
JWT_SECRET=tu-clave-secreta-larga

# SendGrid — para envío de correos de activación
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=tucorreo@gmail.com

# Google OAuth 2.0
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# Twilio — para envío de SMS con el código 2FA
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

### Configuración de Google OAuth

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Ve a **APIs y Servicios → Credenciales**
4. Crea unas credenciales de tipo **OAuth 2.0**
5. En **URIs de redirección autorizados** agrega:
   ```
   http://localhost:4000/api/users/auth/google/callback
   ```
6. Copia el **Client ID** y el **Client Secret** al `.env`

### Configuración de SendGrid

1. Ve a [app.sendgrid.com](https://app.sendgrid.com)
2. **Settings → API Keys → Create API Key**
3. Dale permisos de **Full Access**
4. Copia la key al `.env` en `SENDGRID_API_KEY`
5. Verifica el correo remitente en **Settings → Sender Authentication**

### Configuración de Twilio

1. Ve a [twilio.com](https://www.twilio.com) y crea una cuenta
2. En el dashboard copia el **Account SID** y el **Auth Token**
3. Ve a **Phone Numbers → Manage → Active Numbers**
4. Si no tienes número haz clic en **Get a trial number**
5. Copia el número al `.env` en `TWILIO_PHONE_NUMBER`
6. Verifica tu número personal en **Phone Numbers → Verified Caller IDs**

### Ejecutar el backend

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

El backend corre en `http://localhost:4000`

### Endpoints principales

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/users/register` | Registrar usuario | No |
| POST | `/api/users/login` | Iniciar sesión | No |
| POST | `/api/users/verificar-2fa` | Verificar código SMS | No |
| GET | `/api/users/activar/:token` | Activar cuenta por email | No |
| GET | `/api/users/auth/google` | Login con Google | No |
| GET | `/api/vehicles` | Listar vehículos | No |
| POST | `/api/vehicles` | Publicar vehículo | Sí |
| PUT | `/api/vehicles/:id` | Editar vehículo | Sí |
| DELETE | `/api/vehicles/:id` | Eliminar vehículo | Sí |
| PATCH | `/api/vehicles/:id/estado` | Marcar como vendido | Sí |
| POST | `/api/chats` | Crear conversación | Sí |
| POST | `/api/chats/:id/mensajes` | Enviar mensaje | Sí |
| GET | `/api/chats` | Ver mis conversaciones | Sí |

> Las rutas con **Auth: Sí** requieren el header `x-auth-token` con el JWT.

---

## 2. Frontend — React

### Instalación

```bash
cd Proyecto_Venta_Autos_Frontend_2
npm install
```

### Configuración del .env

Crea un archivo `.env` en la raíz de `Proyecto_Venta_Autos_Frontend_2`:

```env
VITE_API_URL=http://localhost:4000
```

### Ejecutar el frontend

```bash
npm run dev
```

El frontend corre en `http://localhost:5173`

### Rutas de la aplicación

| Ruta | Descripción |
|------|-------------|
| `/` | Catálogo de vehículos con filtros |
| `/login` | Iniciar sesión |
| `/registro` | Crear cuenta nueva |
| `/verificar` | Verificación de código 2FA |
| `/publicar` | Publicar o editar vehículo |
| `/vehicles/:id` | Detalle de un vehículo |
| `/inbox` | Bandeja de mensajes |

---

## 3. GraphQL — Servicio de consultas

### Instalación

```bash
cd Proyecto_Venta_Autos_GraphQL
npm install
```

### Configuración del .env

Crea un archivo `.env` en la raíz de `Proyecto_Venta_Autos_GraphQL`:

```env
MONGODB_URI=mongodb://localhost:27017/market_vehiculos_db
PORT=4001
JWT_SECRET=tu-clave-secreta-larga
```

> El `JWT_SECRET` debe ser exactamente el mismo que el del backend REST para que los tokens funcionen en ambos servicios.

### Ejecutar GraphQL

```bash
npm run dev
```

El servicio GraphQL corre en `http://localhost:4001/graphql`

Abre esa URL en el navegador para acceder al **Apollo Sandbox** donde puedes probar todas las consultas.

---

## Consultas GraphQL de ejemplo

### Consultas públicas (sin token)

**Listar todos los vehículos:**
```graphql
query {
  vehiculos {
    vehiculos {
      id
      marca
      modelo
      anio
      precio
      estado
    }
    total
    totalPaginas
    paginaActual
  }
}
```

**Filtrar vehículos por marca:**
```graphql
query {
  vehiculos(marca: "Toyota") {
    vehiculos {
      id
      marca
      modelo
      precio
      estado
    }
    total
  }
}
```

**Filtrar vehículos por rango de precio:**
```graphql
query {
  vehiculos(precioMin: 10000, precioMax: 30000) {
    vehiculos {
      id
      marca
      modelo
      precio
    }
    total
  }
}
```

**Filtrar vehículos disponibles con paginación:**
```graphql
query {
  vehiculos(estado: "disponible", pagina: 1) {
    vehiculos {
      id
      marca
      modelo
      precio
    }
    total
    totalPaginas
    paginaActual
  }
}
```

**Ver detalle de un vehículo por ID:**
```graphql
query {
  vehiculo(id: "REEMPLAZA_CON_UN_ID_REAL") {
    id
    marca
    modelo
    anio
    precio
    kilometraje
    estado
    descripcion
    vendedor {
      name
      email
    }
  }
}
```

### Consultas protegidas (requieren token)

Para usar estas consultas en el Apollo Sandbox agrega el header en la sección **Headers**:

```json
{
  "x-auth-token": "tu-token-jwt-aqui"
}
```

Para obtener el token inicia sesión en el frontend, abre las herramientas del navegador (F12), ve a **Application → Local Storage** y copia el valor de `token`.

**Ver mi perfil:**
```graphql
query {
  miPerfil {
    id
    name
    email
    cedula
    telefono
  }
}
```

**Ver mis vehículos publicados:**
```graphql
query {
  misVehiculos {
    id
    marca
    modelo
    anio
    precio
    estado
  }
}
```

**Ver mis conversaciones:**
```graphql
query {
  misChats {
    id
    vehiculo {
      marca
      modelo
    }
    comprador {
      name
      email
    }
    vendedor {
      name
      email
    }
    ultimaActualizacion
  }
}
```

---

## Flujos principales del sistema

### Registro con email y contraseña
1. Usuario llena el formulario con cédula, nombre, email, contraseña y teléfono
2. El sistema valida la cédula contra el padrón electoral costarricense via XAMPP
3. Se crea la cuenta con `isActivated: false`
4. Se envía un correo de activación via SendGrid
5. El usuario hace clic en el link del correo
6. La cuenta queda activada y puede iniciar sesión

### Login con email y contraseña (2FA)
1. Usuario ingresa email y contraseña
2. El sistema valida las credenciales
3. Se genera un código de 6 dígitos y se envía por SMS via Twilio
4. El usuario ingresa el código en la pantalla de verificación
5. Si el código es correcto se entrega el JWT y se accede al catálogo

### Registro con Google
1. Usuario hace clic en "Continue with Google"
2. Google autentica al usuario y redirige al sistema
3. Si el usuario es nuevo lo lleva al formulario de registro para completar cédula y teléfono
4. La cédula se valida contra el padrón electoral via XAMPP
5. Se registra en la base de datos normalmente

### Login con Google
1. Usuario hace clic en "Continue with Google"
2. Google autentica al usuario
3. Si el email ya está registrado en la base de datos se genera el JWT directamente
4. El usuario accede al catálogo sin necesidad de 2FA

---

## Ejecutar el proyecto completo

Abre cuatro terminales y ejecuta cada servicio:

```bash
# Paso 1 — Encender Apache en XAMPP desde el Panel de Control de XAMPP

# Paso 2 — Encender MongoDB (si no corre como servicio automático)
mongod

# Terminal 1 — Backend REST
cd Proyecto_Venta_Autos_Backend_2
npm run dev

# Terminal 2 — Frontend
cd Proyecto_Venta_Autos_Frontend_2
npm run dev

# Terminal 3 — GraphQL
cd Proyecto_Venta_Autos_GraphQL
npm run dev
```

Luego abre el navegador en `http://localhost:5173`

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite 7, React Router, React Icons |
| Backend | Node.js, Express 5, Mongoose |
| Base de datos | MongoDB |
| Padrón Electoral | XAMPP, PHP, Apache |
| Autenticación | JWT, Passport.js, Google OAuth 2.0 |
| 2FA | Twilio SMS |
| Correos | SendGrid |
| GraphQL | Apollo Server 3, GraphQL 15 |
| Validación | express-validator |
| Imágenes | Multer (almacenamiento local) |
