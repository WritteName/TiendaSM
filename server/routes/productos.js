const express = require('express');
const router = express.Router();
const db = require('../db.js');

// Listar grupos (para el desplegable)
router.get('/grupos', async (req, res) => {
  try {
    const rows = await db.query('SELECT id, nombre, descripcion FROM dbo.Grupo ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Listar nombre de productos
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT id, nombre FROM dbo.Producto ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Listar todos los productos
router.get('/listar', async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT p.id, p.nombre, p.grupoID, p.PrecioUnitario, p.Kilos, g.nombre AS grupoNombre
      FROM dbo.Producto p
      INNER JOIN dbo.Grupo g ON p.grupoID = g.id
      ORDER BY p.nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Buscar producto por nombre
router.get('/buscar', async (req, res) => {
  try {
    const nombre = (req.query.nombre || '').trim();
    if (!nombre) {
      return res.json([]);
    }
    const rows = await db.query(
      `SELECT p.id, p.nombre, p.grupoID, p.PrecioUnitario, p.Kilos, g.nombre AS grupoNombre
       FROM dbo.Producto p
       INNER JOIN dbo.Grupo g ON p.grupoID = g.id
       WHERE LOWER(TRIM(p.nombre)) = LOWER(TRIM(@nombre))
       ORDER BY p.nombre`,
      { nombre }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Registrar nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, grupoID, PrecioUnitario, Kilos } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
    }
    if (!grupoID) {
      return res.status(400).json({ error: 'Debe seleccionar un grupo.' });
    }
    if (PrecioUnitario == null || PrecioUnitario === '') {
      return res.status(400).json({ error: 'El precio unitario es obligatorio.' });
    }
    const precio = parseFloat(PrecioUnitario);
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: 'El precio unitario debe ser un valor positivo.' });
    }
    if (Kilos == null || Kilos === '') {
      return res.status(400).json({ error: 'El stock en kilos es obligatorio.' });
    }
    const kilos = parseInt(Kilos, 10);
    if (isNaN(kilos) || kilos < 0) {
      return res.status(400).json({ error: 'El stock disponible debe ser un valor no negativo.' });
    }

    // Verificar producto duplicado (mismo nombre, case insensitive)
    const existentes = await db.query(
      'SELECT id FROM dbo.Producto WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(@nombre))',
      { nombre: nombre.trim() }
    );
    if (existentes.length > 0) {
      return res.status(400).json({ error: 'Ya existe un producto con ese nombre en el catálogo.' });
    }

    await db.execute(
      `INSERT INTO dbo.Producto (nombre, grupoID, PrecioUnitario, Kilos)
       VALUES (@nombre, @grupoID, @precio, @kilos)`,
      {
        nombre: nombre.trim(),
        grupoID: parseInt(grupoID, 10),
        precio,
        kilos,
      }
    );

    res.status(201).json({ ok: true, message: 'Producto registrado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
