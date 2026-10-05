# Instalar y conectar MySQL sin Workbench en Windows

El proyecto solo necesita **MySQL Community Server**. Workbench es opcional y no forma parte del flujo de trabajo.

## 1. Descargar el servidor

Descarga el instalador oficial de MySQL para Windows y selecciona una instalación que incluya **MySQL Server**. Si el instalador ofrece perfiles, puedes usar `Server only` o una instalación `Custom` seleccionando únicamente el servidor y las herramientas básicas necesarias.

## 2. Configuración recomendada

Durante el instalador:

- Tipo: servidor de desarrollo / standalone.
- Puerto TCP/IP: `3306`.
- Mantén habilitado TCP/IP.
- Usuario administrador: `root`.
- Define una contraseña que recuerdes.
- Registra MySQL como servicio de Windows.
- Permite que el servicio arranque automáticamente.

No necesitas crear manualmente la base `biblioteca_comparativa`; el proyecto lo hará mediante TypeScript.

## 3. Comprobar el servicio

En PowerShell como administrador puedes revisar servicios cuyo nombre contenga MySQL:

```powershell
Get-Service *MySQL*
```

Si aparece detenido, inicia el servicio usando el nombre que muestre tu instalación, por ejemplo:

```powershell
Start-Service MySQL80
```

El nombre puede variar según la versión instalada.

## 4. Configurar el proyecto

Desde la raíz del proyecto:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Abre `backend\.env` y cambia:

```env
MYSQL_PASSWORD=CAMBIA_ESTA_PASSWORD
```

por tu contraseña real.

La configuración normal queda:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=biblioteca_comparativa
```

## 5. Instalar dependencias Node

```powershell
npm install
```

La aplicación se conecta directamente a MySQL mediante el paquete `mysql2`; por eso no depende de Workbench ni de que el comando `mysql` esté disponible en PATH.

## 6. Crear estructura y datos

```powershell
npm run db:mysql:init
```

El comando ejecuta automáticamente los archivos SQL del proyecto.

Salida esperada:

```text
Creando estructura MySQL...
Insertando datos iniciales...
Listo: base biblioteca_comparativa preparada.
```

## 7. Levantar la interfaz

```powershell
npm run dev
```

Abre:

```text
http://localhost:5173
```

En la parte superior de la interfaz debe aparecer `MySQL` como conectado.

## Si MySQL aparece desconectado

Revisa en este orden:

1. que el servicio de MySQL esté iniciado;
2. que el puerto configurado sea 3306;
3. que `MYSQL_USER` y `MYSQL_PASSWORD` sean correctos;
4. que hayas ejecutado `npm run db:mysql:init`;
5. que `MYSQL_DATABASE` permanezca como `biblioteca_comparativa`.

## Reiniciar completamente la base de demostración

El archivo `schema.sql` elimina y vuelve a crear las tablas del ejercicio. Para restaurar el dataset inicial basta con ejecutar otra vez:

```powershell
npm run db:mysql:init
```

**Advertencia:** cualquier cambio que hayas hecho en los datos de la práctica se perderá, porque esta acción está pensada como un reinicio del laboratorio.
