# BVG Users & Auth Service

Microservicio encargado de la autenticación, gestión de usuarios, roles y permisos del sistema.

Forma parte de una arquitectura de microservicios compuesta por:

- API Gateway
- Users/Auth Service
- Tasks Service

## Tecnologías

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- MySQL
- JWT (JSON Web Token)
- bcrypt

## Funcionalidades

### Autenticación

- Registro de usuarios
- Inicio de sesión
- Generación de JWT
- Validación de usuarios autenticados
- Consulta del perfil del usuario autenticado
- Control de usuarios activos/inactivos

### Gestión de usuarios

- Listado de usuarios
- Consulta de usuario por ID
- Actualización de datos
- Activación y desactivación de usuarios

### Roles

- Creación de roles
- Listado de roles
- Consulta de roles
- Asignación de roles a usuarios

### Permisos

El sistema implementa autorización basada en roles y permisos.

Entre los permisos utilizados se encuentran:

- `USERS_READ`
- `USERS_UPDATE`
- `USERS_STATUS`
- `TASKS_READ`
- `TASKS_CREATE`
- `TASKS_UPDATE`
- `TASKS_ASSIGN`

Los permisos asociados al rol del usuario son utilizados por el API Gateway para controlar el acceso a las distintas operaciones del sistema.

## Base de datos

Este microservicio posee su propia base de datos MySQL:

```text
bvg_users_db
```

Principales entidades:

- User
- Role
- Permission
- RolePermission

Las relaciones y migraciones se administran mediante Prisma ORM.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/bvg_users_db"
JWT_SECRET="reemplazar_por_un_secreto"
PORT=3001
```

## Prisma

Generar el cliente de Prisma:

```bash
npx prisma generate
```

Aplicar las migraciones:

```bash
npx prisma migrate dev
```

## Ejecutar el microservicio

Modo desarrollo:

```bash
npm run start:dev
```

Por defecto el servicio se ejecuta en:

```text
http://localhost:3001
```

## Endpoints principales

### Auth

```text
POST /auth/register
POST /auth/login
GET  /auth/profile
```

### Users

```text
GET   /users
GET   /users/:id
PATCH /users/:id
PATCH /users/:id/status
```

### Roles

```text
POST  /roles
GET   /roles
GET   /roles/:id
PATCH /roles/users/:userId
```

### Permissions

El microservicio proporciona las operaciones necesarias para consultar y administrar los permisos asociados a los roles.

## Seguridad

Las contraseñas de los usuarios se almacenan utilizando hash con `bcrypt`.

La autenticación se realiza mediante JWT.

Las operaciones protegidas utilizan guards de autenticación y autorización, permitiendo restringir endpoints según los permisos asociados al rol del usuario.

## Arquitectura

Este servicio se ejecuta de manera independiente y mantiene su propia base de datos.

El acceso desde los clientes se realiza normalmente a través del API Gateway:

```text
Cliente / Postman
        |
        v
API Gateway :3000
        |
        v
Users/Auth Service :3001
        |
        v
MySQL - bvg_users_db
```

El API Gateway también consulta este servicio para validar la identidad del usuario y sus permisos antes de permitir determinadas operaciones sobre otros microservicios.

## Repositorio relacionado

Este proyecto forma parte del backend BVG y trabaja en conjunto con:

- `bvg-api-gateway`
- `bvg-tasks-service`

## Autora

Florencia Llosa

Proyecto - Prácticas Profesionalizantes III