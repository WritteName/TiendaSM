const express = require('express');
const router = express.Router();
const db = require('../db.js');

// Listar ventas con nombres de producto y vendedor
router.get('/', async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT v.id, v.producto, v.precio_venta, v.kilos, v.fecha_venta, v.vendedor,
             f.nombre AS nombreProducto, c.nombre AS nombreVendedor, v.MontoTotal
      FROM dbo.Venta v
      INNER JOIN dbo.Producto f ON f.id = v.producto
      INNER JOIN dbo.Vendedor c ON c.id = v.vendedor
      ORDER BY v.fecha_venta DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Resumen monto de venta por vendedor
router.get('/resumen-vendedores', async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT c.id, c.nombre AS vendedor,
             SUM(v.precio_venta * v.kilos) AS montoTotal,
             SUM(v.kilos) AS kilosTotal,
             COUNT(v.id) AS cantidadVentas
      FROM dbo.Vendedor c
      LEFT JOIN dbo.Venta v ON v.vendedor = c.id
      GROUP BY c.id, c.nombre
      ORDER BY montoTotal DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crear venta
router.post('/', async (req, res) => {
  try {
    const { NomProducto, Precio, Kilos, NombreVendedor, FechaAlta } = req.body;
    if (NomProducto == null || Precio == null || Kilos == null || NombreVendedor == null) {
      return res.status(400).json({
        error: 'Faltan datos: NomProducto, Precio, Kilos, NombreVendedor son requeridos',
      });
    }
    const sql = `
      INSERT INTO dbo.Venta (producto, precio_venta, kilos, vendedor, fecha_venta)
      VALUES (@NomProducto, @Precio, @Kilos, @NombreVendedor, ISNULL(@FechaAlta, SYSDATETIME()))
    `;
    const pool = await db.getPool();
    const reqSql = pool.request();
    reqSql.input('NomProducto', db.sql.Int, NomProducto);
    reqSql.input('Precio', db.sql.Float, parseFloat(Precio));
    reqSql.input('Kilos', db.sql.Int, parseInt(Kilos, 10));
    reqSql.input('NombreVendedor', db.sql.Int, NombreVendedor);
    reqSql.input('FechaAlta', db.sql.DateTime2, FechaAlta || null);
    await reqSql.query(sql);
    res.status(201).json({ ok: true, message: 'Venta registrada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
