# Arquitectura del proyecto

## Objetivo

La aplicación utiliza el dominio de una biblioteca para comparar de manera visible dos paradigmas de almacenamiento. El frontend no se limita a pedir datos: enseña qué consulta ejecutó cada motor, qué estructuras intervienen y cómo llega el resultado.

## Capas

```text
Frontend TypeScript
        │
        │ HTTP / JSON
        ▼
Backend Express + TypeScript
        │
        ├────────────── mysql2 ──────────────► MySQL Server
        │
        └────────────── mongodb ─────────────► MongoDB Server
```

### Frontend

Responsabilidades:

- navegación temática de biblioteca;
- explorador del modelo;
- selector de operaciones comparativas;
- representación tabular de MySQL;
- representación JSON de MongoDB;
- CRUD comparativo.

### Backend

Responsabilidades:

- ejecutar consultas reales;
- mantener la consulta visible para la interfaz;
- controlar el acceso a ambos motores;
- transformar MySQL a MongoDB;
- mantener la lógica CRUD.

### MySQL

Es la fuente relacional normalizada. El esquema está definido exclusivamente en `database/mysql/schema.sql`.

### MongoDB

Se construye desde los datos de MySQL mediante `syncMongoFromMysql()`. El objetivo es que la diferencia observada sea de **modelo**, no de contenido.

## Endpoints principales

```text
GET  /api/health
GET  /api/models
GET  /api/compare/operations
POST /api/compare/query
GET  /api/crud/reference-data
GET  /api/crud/books/:id
POST /api/crud/books
PUT  /api/crud/books/:id
DELETE /api/crud/books/:id
POST /api/crud/sync-mongo
```

## Decisiones didácticas

- No se usa ORM: ver SQL explícito es parte del objetivo de la práctica.
- MongoDB usa el driver oficial y queries explícitas por la misma razón.
- El modelo de MongoDB no replica una colección por cada tabla; utiliza embedding donde tiene sentido.
- El CRUD de libros muestra las diferencias al crear y modificar relaciones N:M.
- La integridad referencial de MySQL se mantiene visible y no se oculta tras una abstracción.
