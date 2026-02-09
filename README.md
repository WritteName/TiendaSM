# TiendaSM - Módulo de ingreso de ventas

Aplicación **cliente-servidor en JavaScript** para una distribuidora que necesita registrar ventas por fecha y kilos, y conocer el **monto de venta por vendedor**.

## Requisitos

- **Node.js** (v16 o superior)
- **SQL Server** con la base de datos TiendaSM creada

## Base de datos

1. Ejecutar el script en SQL Server:
   - Archivo: `database/tienda_sm.sql`
   - Crea la base de datos `TiendaSM` y las tablas: Producto, Grupo, Vendedor y Venta.

2. Ajustar la conexión en el servidor:
   - Editar `server/config.js` (servidor, usuario, contraseña, base de datos)  
   - O usar variables de entorno: `DB_SERVER`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`.

## Instalación

```bash
cd TiendaSM
npm install
```

## Ejecución

```bash
npm start
```

- Interfaz y API: **http://localhost:3000**

## Arquitectura

- **Cliente**: HTML, CSS y JavaScript en `client/` (formulario de ingreso de ventas, listado y resumen por vendedor).
- **Servidor**: Node.js + Express en `server/` (API REST y entrega de archivos estáticos).
- **Base de datos**: SQL Server (TiendaSM).

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | CRUD productos (solo Registrar, Recuperar) |
| GET | `/api/vendedores` | Lista vendedores |
| GET | `/api/ventas` | Lista ventas |
| GET | `/api/ventas/resumen-vendedores` | Monto total por vendedor |
| POST | `/api/ventas` | Registrar Venta |

## Funcionalidad

- **Ingreso de ventas**: producto, vendedor, precio por kg, kilos vendidos y fecha.
- **Registro de ventas**: tabla con todas las ventas (fecha, producto, precio, kilos, monto, vendedor).
- **Monto por vendedor**: resumen con el total vendido por cada vendedor.
- **Ingreso de productos**: nombre, grupo, precio unitario y kilos disponibles. 
- **Registro de productos**: tabla con todas las productos (nombre, grupo, precio, stock).
