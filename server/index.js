const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config.js');

const frutasRouter = require('./routes/frutas.js');
const vendedoresRouter = require('./routes/vendedores.js');
const ventasRouter = require('./routes/ventas.js');
const productosRouter = require('./routes/productos.js');

const app = express();
app.use(cors());
app.use(express.json());

// API
app.use('/api/frutas', frutasRouter);
app.use('/api/vendedores', vendedoresRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/productos', productosRouter);

// Cliente
app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`TiendaSM API y cliente: http://localhost:${PORT}`);
});
