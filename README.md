# THRILLOTECA

**Thrilloteca** es una aplicación web *full-stack* con estética retro inspirada en **Windows 2000 / Y2K / blog antiguos**, diseñada como gestor personal de libros y descubrir nuevos libros de los géneros **suspenso, terror y thriller**.

La plataforma permite a cada usuario administrar su biblioteca personal buscando libros reales por **ISBN** o explorando catálogos por género mediante **Google Books**, organizar sus lecturas según su estado (*leer más tarde*, *leyendo*, *leído*), publicar reseñas con calificación y comentar en las reseñas de otros lectores, generando así también una comunidad.

---

## Tecnologías Utilizadas

### Frontend
* **HTML5 semántico:** Estructura dividida en pantalla de autenticación (`index.html`) y aplicación principal de vista única (`foro.html`).
* **CSS3 (`estilos.css`):** Interfaz retro con bordes biselados 3D, tipografías pixel y monoespaciada (`Press Start 2P` y `DM Mono`), y diseño responsivo implementado con CSS Grid y Flexbox.
* **JavaScript (ES6+):** Manipulación del DOM, navegación dinámica entre secciones sin recarga de página, consumo asíncrono de la API REST mediante `fetch` (`async/await`) y gestión de sesión con `localStorage`.

### Backend
* **Node.js + Express 5 (`type: "module"`):** Servidor RESTful organizado bajo una arquitectura en capas.
* **MongoDB Atlas + Mongoose:** Base de datos orientada a documentos con esquemas validados, enumeraciones (`enum`) y relaciones referenciales mediante `ObjectId` y `.populate()`.
* **Seguridad y Autenticación:**
  * `bcryptjs`: Cifrado (*hashing*) de contraseñas antes de su almacenamiento.
  * `jsonwebtoken` (JWT): Emisión y verificación de tokens de autenticación con tiempo de expiración (`2h`).
  * `cors` y `dotenv`: Configuración de políticas de origen cruzado y manejo de variables de entorno.

### APIs Externas
* **Google Books API:** Obtención de metadatos de libros por código ISBN y búsqueda de recomendaciones por género literario.
* **Open Library Covers API:** Servicio de respaldo para portadas cuando Google Books no dispone de imagen en miniatura.

---

## Arquitectura y Estructura del Proyecto

El proyecto se divide en dos módulos independientes (`front/` y `back/`):

```text
thrilloteca/
├── front/
│   ├── index.html                     # Pantalla de inicio de sesión y registro
│   ├── script-autenticacion.js        # Lógica de validación y autenticación en cliente
│   ├── foro.html                      # Interfaz principal de la aplicación
│   ├── controlador-foro.js            # Controlador de vistas y consumo de API
│   ├── config.js                      # Configuración de URL base del servidor
│   └── estilos.css                    # Hoja de estilos principal
│
└── back/
    ├── index.js                       # Punto de entrada y configuración del servidor Express
    ├── package.json                   # Dependencias y scripts de ejecución
    ├── .env                           # Variables de entorno
    ├── config/
    │   └── db.js                      # Conexión a MongoDB Atlas
    ├── middlewares/
    │   └── autorizacion.middleware.js # Middleware de verificación de token JWT
    ├── models/
    │   ├── usuario.js                 # Modelo de Usuario
    │   ├── item.js                    # Modelo de Libro (Item)
    │   ├── resena.js                  # Modelo de Reseña
    │   └── comentario.js              # Modelo de Comentario
    ├── repositories/                  # Capa de acceso a datos (Mongoose)
    │   ├── usuarios.repository.js
    │   ├── items.repository.js
    │   ├── resenas.repository.js
    │   └── comentarios.repository.js
    ├── services/                      # Capa de lógica de negocio y validaciones
    │   ├── usuarios.service.js
    │   ├── items.service.js
    │   ├── resenas.service.js
    │   └── comentarios.service.js
    ├── controllers/                   # Capa de manejo de peticiones y respuestas HTTP
    │   ├── usuarios.controller.js
    │   ├── items.controller.js
    │   ├── resenas.controller.js
    │   └── comentarios.controller.js
    └── routes/                        # Definición de rutas y endpoints REST
        ├── usuarios.routes.js
        ├── items.routes.js
        ├── resenas.routes.js
        └── comentarios.routes.js
```

---

## Descripción de Módulos del Frontend (`/front`)

### `config.js`
Define la constante global `BASE_URL` con la dirección del servidor backend (`http://localhost:3000`), centralizando la configuración de red para facilitar el despliegue.

### `index.html` y `script-autenticacion.js`
* Gestionan el acceso y registro de usuarios en una misma vista alternando dinámicamente entre ambos modos.
* Realizan validación previa en el cliente (formato de correo electrónico y longitud mínima de 8 caracteres para la contraseña).
* Al registrar un usuario (`POST /api/register`), encadenan automáticamente el inicio de sesión (`POST /api/login`), almacenan el `token` y los datos del usuario en `localStorage`, y redirigen a `foro.html`.

### `foro.html` y `controlador-foro.js`
* **Control de sesión:** Verifica la existencia del token al iniciar; ante su ausencia o ante una respuesta `401 Unauthorized` del servidor, limpia el almacenamiento local y redirige a `index.html`.
* **Cliente HTTP (`pedirAlBack`):** Centraliza todas las llamadas `fetch`, adjuntando el encabezado `Authorization: Bearer <token>`.
* **Secciones de la aplicación:**
  * **Inicio:** Muestra el feed global con las reseñas más recientes de la comunidad y el libro destacado.
  * **Mi Biblioteca:** Organiza los libros del usuario en *lecturas en progreso* (`leyendo`) y una estantería con los últimos libros terminados (`leido`), además de permitir la carga de nuevos títulos por ISBN.
  * **Mis Reseñas y Mis Comentarios:** Permiten visualizar y eliminar las reseñas y comentarios propios.
  * **Leer Más Tarde:** Muestra los libros guardados como pendientes (`leer-mas-tarde`).
  * **Explorar:** Filtra libros dentro de la biblioteca mediante la barra de búsqueda o consulta recomendaciones externas en Google Books por género (`suspenso`, `terror`, `thriller`) para incorporarlas con un clic.
  * **Detalle del Libro:** Exhibe portada, autor, género y sinopsis; permite modificar el estado o género del libro, publicar reseñas y participar en los hilos de comentarios.

### `estilos.css`
Implementa el sistema visual del proyecto mediante variables CSS (`:root`), ventanas con relieve 3D, modales de confirmación, tarjetas de contenido y reglas `@media` para adaptación a dispositivos móviles.

---

## Descripción de Módulos del Backend (`/back`)

El servidor sigue una **arquitectura en capas** (*Routes* $\rightarrow$ *Controllers* $\rightarrow$ *Services* $\rightarrow$ *Repositories* $\rightarrow$ *Models*):

* **Configuración (`index.js`, `config/db.js`):** Establece la conexión con MongoDB Atlas, configura `cors` y `express.json()`, registra un *middleware* de log de peticiones, monta las rutas públicas y protegidas, y define el manejo centralizado de errores (`404` y `500`).
* **Middleware (`middlewares/autorizacion.middleware.js`):** `pedirToken` extrae y verifica el token JWT de la cabecera `Authorization`. Si el token es válido, adjunta el identificador del usuario en `req.usuario`; caso contrario, responde con `401`.
* **Modelos (`models/`):** Definen los esquemas de Mongoose (`Usuario`, `Item`, `Resena`, `Comentario`), tipos de datos, longitudes máximas, valores permitidos (`enum`) y referencias entre colecciones.
* **Repositorios (`repositories/`):** Encapsulan las consultas a MongoDB (`find`, `findById`, `save`, `findByIdAndUpdate`, `findByIdAndDelete`), validan identificadores con `mongoose.isValidObjectId`, resuelven relaciones mediante `.populate()` y ejecutan borrado en cascada de reseñas al eliminar un libro.
* **Servicios (`services/`):** Implementan las reglas de negocio, validaciones de entrada (`400`), control de propiedad de recursos (`403`), prevención de duplicados (`409`), cifrado de contraseñas con `bcryptjs`, firma de tokens JWT y comunicación con Google Books API.
* **Controladores (`controllers/`) y Rutas (`routes/`):** Reciben las solicitudes HTTP, delegan el procesamiento a la capa de servicios y devuelven las respuestas JSON con el código de estado correspondiente.

---

## Endpoints de la API

### Autenticación (Rutas Públicas)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Registra un nuevo usuario (`email`, `password`). Retorna `201 Created`. |
| `POST` | `/api/login` | Valida credenciales y retorna `{ token, usuario }`. |

### Libros / Items (Requieren `Bearer Token`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/items` | Obtiene todos los libros de la biblioteca del usuario autenticado. |
| `POST` | `/api/items` | Agrega un libro mediante búsqueda por `isbn` en Google Books o carga directa. |
| `PUT` | `/api/items/:id` | Actualiza el `estado` y/o `genero` de un libro perteneciente al usuario. |
| `DELETE` | `/api/items/:id` | Elimina un libro del usuario y sus reseñas asociadas. |
| `GET` | `/api/libros/buscar?genero=...` | Consulta libros en Google Books filtrados por género (`suspenso`, `terror`, `thriller`). |

### Reseñas (Requieren `Bearer Token`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/resenas` | Obtiene las reseñas publicadas por el usuario autenticado. |
| `GET` | `/api/resenas/recientes` | Obtiene las últimas 10 reseñas de la comunidad. |
| `GET` | `/api/resenas/libro/:idItem` | Obtiene todas las reseñas de la comunidad asociadas al título de ese libro. |
| `POST` | `/api/resenas` | Crea una reseña (`itemId`, `texto`, `calificacion` entero de `1` a `5`). |
| `PUT` | `/api/resenas/:id` | Actualiza texto y calificación de una reseña propia. |
| `DELETE` | `/api/resenas/:id` | Elimina una reseña propia. |

### Comentarios (Requieren `Bearer Token`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/comentarios` | Lista los comentarios realizados por el usuario autenticado. |
| `GET` | `/api/comentarios/resena/:idResena` | Lista los comentarios de una reseña específica. |
| `POST` | `/api/comentarios` | Crea un nuevo comentario en una reseña (`resenaId`, `texto`). |
| `DELETE` | `/api/comentarios/:id` | Elimina un comentario propio. |

---

## Instalación y Ejecución

1. **Instalar dependencias del servidor:**
   ```bash
   cd back
   npm install
   ```

2. **Configurar variables de entorno:**
   Crear un archivo `.env` en la carpeta `back/` con las siguientes variables:
   ```env
   PORT=3000
   MONGO_URI=tu_cadena_de_conexion_mongodb_atlas
   JWT_SECRET=tu_clave_secreta_jwt
   GOOGLE_BOOKS_API_KEY=tu_api_key_de_google_books
   ```

3. **Iniciar el servidor backend:**
   ```bash
   npm run dev
   ```
   El servidor quedará disponible en `http://localhost:3000`.

4. **Ejecutar el frontend:**
   Abrir `front/index.html` en el navegador (se recomienda utilizar la extensión *Live Server* de VS Code).
