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
- pnpm (v7 o superior)
- Docker (opcional, para configurar la base de datos)

## Configuración para Desarrollo

Sigue estos pasos para configurar el proyecto en un entorno de desarrollo:

1. **Clonar el Repositorio**  
    ```bash
    git clone https://github.com/Microservicios-Nest-Nicolas/products-microservice.git
    cd products-ms
    ```

2. **Instalar Dependencias**  
    ```bash
    pnpm install
    ```

3. **Configurar Variables de Entorno**  
    Crea un archivo `.env` en el directorio raíz basado en el archivo `.env.template`. Actualiza los valores según sea necesario.

4. **Ejecutar Migraciones de Base de Datos**  
    ```bash
    pnpm dlx prisma migrate dev
    ```

5. **Iniciar el Servidor de Desarrollo**  
    ```bash
    pnpm run start:dev
    ```

## Estructura del Proyecto

- `src/` - Contiene el código fuente de la aplicación
- `prisma/` - Esquema de Prisma y archivos de migración
- `.env.template` - Plantilla para las variables de entorno
- `README.md` - Documentación del proyecto

## Scripts

- `pnpm run start:dev` - Inicia el servidor de desarrollo
- `pnpm run build` - Construye el proyecto para producción
- `pnpm run lint` - Ejecuta verificaciones de linting
- `pnpm run test` - Ejecuta las pruebas