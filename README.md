# Products Microservice

Un microservicio para la gestión de productos, construido con NestJS y Prisma.

## Características

- Operaciones CRUD para productos
- Integración con base de datos usando Prisma
- Configuración basada en entornos
- Arquitectura escalable y modular

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- Node.js (v16 o superior)
- npm (v8 o superior)
- Docker (opcional, para configurar la base de datos)

## Dev

1. Clonar el repositorio
2. Instalar dependencias
3. Crear un archivo `.env` basado en el `env.template`
4. Ejecutar migración de prisma `npx prisma migrate dev`
5. Levantarel servidor de Nats

```
docker run -d --name nats-server -p 4222:4222 -p 6222:6222 -p 8222:8222 nats
```

6. Ejecutar `npm run start:dev`
