const API_BASE = '';

async function getGrupos() {
  const res = await fetch(`${API_BASE}/api/productos/grupos`);
  if (!res.ok) throw new Error('Error al cargar grupos');
  return res.json();
}

async function getProductos() {
  const res = await fetch(`${API_BASE}/api/productos/listar`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

async function buscarProducto(nombre) {
  const params = new URLSearchParams({ nombre: nombre.trim() });
  const res = await fetch(`${API_BASE}/api/productos/buscar?${params}`);
  if (!res.ok) throw new Error('Error al buscar producto');
  return res.json();
}

async function postProducto(data) {
  const res = await fetch(`${API_BASE}/api/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Error al registrar producto');
  return json;
}

function formatMonto(num) {
  return new Intl.NumberFormat('es-ES', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function showFormMessage(text, isError = false) {
  const el = document.getElementById('formMessage');
  el.textContent = text;
  el.className = 'message' + (text ? (isError ? ' error' : ' success') : '');
}

function showBusquedaMessage(text, isError = false) {
  const el = document.getElementById('busquedaMessage');
  el.textContent = text;
  el.className = 'message' + (text ? (isError ? ' error' : ' success') : '');
}

function renderTabla(productos) {
  const tbody = document.getElementById('tbodyProductos');
  const table = document.getElementById('tablaProductos');
  const loading = document.getElementById('loadingProductos');
  const errorEl = document.getElementById('errorProductos');

  loading.hidden = true;
  errorEl.hidden = true;

  if (!productos || productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No hay productos que coincidan.</td></tr>';
    table.hidden = false;
    return;
  }

  tbody.innerHTML = '';
  productos.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.grupoNombre || '—'}</td>
      <td>S/. ${formatMonto(p.PrecioUnitario)}</td>
      <td>${p.Kilos}</td>
    `;
    tbody.appendChild(tr);
  });
  table.hidden = false;
}

async function initForm() {
  const grupos = await getGrupos();
  const selGrupo = document.getElementById('grupo');
  selGrupo.innerHTML = '<option value="">Seleccione grupo</option>';
  grupos.forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.nombre;
    selGrupo.appendChild(opt);
  });
}

async function cargarProductos() {
  const loading = document.getElementById('loadingProductos');
  const errorEl = document.getElementById('errorProductos');
  loading.hidden = false;
  errorEl.hidden = true;
  showBusquedaMessage('');

  try {
    const productos = await getProductos();
    renderTabla(productos);
  } catch (err) {
    loading.hidden = true;
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
}

async function onSubmitProducto(e) {
  e.preventDefault();
  const form = e.target;
  const nombre = form.nombre.value.trim();
  const grupoID = form.grupoID.value;
  const precio = parseFloat(form.PrecioUnitario.value);
  const kilos = parseInt(form.Kilos.value, 10);

  showFormMessage('');
  try {
    await postProducto({
      nombre,
      grupoID: parseInt(grupoID, 10),
      PrecioUnitario: precio,
      Kilos: kilos,
    });
    showFormMessage('Producto registrado correctamente.');
    form.reset();
    await cargarProductos();
  } catch (err) {
    showFormMessage(err.message || 'Error al registrar.', true);
  }
}

async function onBuscar(e) {
  e.preventDefault();
  const input = document.getElementById('buscarNombre');
  const nombre = input.value.trim();

  showBusquedaMessage('');
  if (!nombre) {
    showBusquedaMessage('Ingrese el nombre del producto a buscar.', true);
    return;
  }

  const loading = document.getElementById('loadingProductos');
  const errorEl = document.getElementById('errorProductos');
  loading.hidden = false;
  errorEl.hidden = true;

  try {
    const productos = await buscarProducto(nombre);
    loading.hidden = true;
    if (productos.length === 0) {
      showBusquedaMessage('No se encontró ningún producto con ese nombre.', true);
      renderTabla([]);
    } else {
      showBusquedaMessage(`Se encontró ${productos.length} producto(s).`);
      renderTabla(productos);
    }
  } catch (err) {
    loading.hidden = true;
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
}

function bindEvents() {
  document.getElementById('formProducto').addEventListener('submit', onSubmitProducto);
  document.getElementById('btnBuscar').addEventListener('click', onBuscar);
  document.getElementById('buscarNombre').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onBuscar(e);
    }
  });
  document.getElementById('btnVerTodos').addEventListener('click', () => {
    document.getElementById('buscarNombre').value = '';
    showBusquedaMessage('');
    cargarProductos();
  });
}

async function init() {
  bindEvents();
  await initForm();
  await cargarProductos();
}

init();
