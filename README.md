# Biblioteca entre líneas · SQL vs NoSQL

Proyecto escolar en TypeScript para comparar, dentro del contexto de una biblioteca, dos formas de modelar y consultar la misma información:

- **MySQL**: modelo relacional con tablas, PK, FK y JOIN.
- **MongoDB**: modelo documental con JSON/BSON, objetos embebidos y arreglos.

La aplicación no usa MySQL Workbench ni una interfaz externa como parte de la demostración. **MySQL y MongoDB actúan únicamente como motores**; la estructura, las consultas y los resultados se visualizan desde la interfaz propia del proyecto.

## Qué incluye

- Modelo relacional de 9 tablas.
- `schema.sql` y `seeds.sql` versionables.
- Backend Node.js + Express + TypeScript.
- Frontend Vanilla TypeScript + Vite.
- Conexión a MySQL con `mysql2`.
- Conexión a MongoDB con el driver oficial `mongodb`.
- Script que transforma los datos relacionales de MySQL al modelo documental de MongoDB.
- Explorador visual de modelos.
- Comparador de consultas SQL vs MongoDB.
- CRUD comparativo de libros.
- Interfaz temática de biblioteca con estilo dibujado a mano y paleta lila/azul.

## Modelo relacional usado

1. `usuario`
2. `editorial`
3. `categoria`
4. `autor`
5. `libro`
6. `libro_autor`
7. `ejemplar`
8. `prestamo`
9. `detalle_prestamo`

Relaciones principales:

- Editorial 1:N Libro
- Categoría 1:N Libro
- Libro N:M Autor mediante `libro_autor`
- Libro 1:N Ejemplar
- Usuario 1:N Préstamo
- Préstamo 1:N DetallePréstamo
- Ejemplar 1:N DetallePréstamo históricamente

## Modelo documental

El script de sincronización transforma los datos a tres colecciones:

- `libros`: embebe editorial, categoría, autores y ejemplares.
- `usuarios`: conserva al lector como documento independiente.
- `prestamos`: embebe un snapshot del usuario y el arreglo de detalles del préstamo.

## Requisitos

- Windows 10/11.
- Node.js 20 o superior.
- npm.
- MySQL Community Server.
- MongoDB Community Server para la parte NoSQL.

No necesitas MySQL Workbench.

## 1. Instalar dependencias del proyecto

Desde PowerShell, dentro de la carpeta del proyecto:

```powershell
npm install
```

El proyecto usa npm workspaces, por lo que ese comando instala las dependencias de `backend` y `frontend`.

## 2. Configurar variables de entorno

Copia el archivo de ejemplo:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Edita `backend\.env` y coloca la contraseña de MySQL que definiste al instalar el servidor:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=TU_PASSWORD_REAL
MYSQL_DATABASE=biblioteca_comparativa

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=biblioteca_documental
```

## 3. Crear automáticamente la base MySQL

Con el servicio MySQL encendido:

```powershell
npm run db:mysql:init
```

Este comando lee:

- `database/mysql/schema.sql`
- `database/mysql/seeds.sql`

Y crea la base, las 9 tablas, PK, FK, índices y datos iniciales. No hace falta abrir un cliente gráfico ni ejecutar los SQL manualmente.

## 4. Preparar MongoDB

Cuando MongoDB esté instalado y su servicio activo:

```powershell
npm run db:mongo:sync
```

El script lee los datos reales desde MySQL y construye los documentos equivalentes en MongoDB. Así la comparación se hace sobre el mismo conjunto de información y no sobre dos datasets escritos por separado.

## 5. Ejecutar la aplicación

```powershell
npm run dev
```

Se levantan simultáneamente:

- API: `http://localhost:3001`
- Interfaz: `http://localhost:5173`

Abre `http://localhost:5173` en el navegador.

## Cómo usar la interfaz

### Inicio

Muestra el propósito del laboratorio y el estado de conexión de API, MySQL y MongoDB.

### Modelos

Presenta lado a lado:

- tablas, columnas, PK/FK y relaciones de MySQL;
- colecciones y campos embebidos de MongoDB.

### Comparador

Incluye consultas como:

- catálogo completo con autores;
- búsqueda por título;
- libros por categoría;
- ejemplares disponibles;
- préstamos de un usuario.

Cada ejecución muestra:

- consulta SQL real;
- tablas y JOIN utilizados;
- resultado tabular;
- query MongoDB equivalente;
- colección/pipeline usados;
- resultado JSON/BSON;
- lectura breve de la diferencia entre ambos enfoques.

### CRUD comparativo

Permite crear, actualizar y eliminar fichas de libros. La pantalla enseña las operaciones que se ejecutaron en MySQL y en MongoDB.

Al eliminar un libro con ejemplares relacionados, MySQL puede rechazar la operación por integridad referencial. Esto se deja intencionalmente visible porque es una diferencia útil para explicar frente al modelo documental.

## Scripts disponibles

```text
npm run dev             Levanta backend y frontend
npm run build           Compila ambos proyectos
npm run check           Comprueba TypeScript
npm run db:mysql:init   Crea/recrea MySQL y carga datos iniciales
npm run db:mongo:sync   Reconstruye MongoDB desde los datos de MySQL
```

## Estructura

```text
biblioteca-sql-nosql/
├── database/
│   ├── mysql/
│   │   ├── schema.sql
│   │   ├── seeds.sql
│   │   └── sample_queries.sql
│   └── mongodb/
│       └── model-reference.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   └── utils/
│   └── .env.example
├── frontend/
│   └── src/
├── docs/
├── package.json
└── README.md
```

## Flujo conceptual de la práctica

```text
Modelo de biblioteca
        ↓
MySQL relacional
(tablas + PK/FK + JOIN)
        ↓
Transformación controlada
        ↓
MongoDB documental
(documentos + embedding + arrays)
        ↓
Interfaz TypeScript
        ↓
Comparación visual de consultas y resultados
```
