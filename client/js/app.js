const API_BASE = '';

async function getFrutas() {
  const res = await fetch(`${API_BASE}/api/frutas`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

async function getVendedores() {
  const res = await fetch(`${API_BASE}/api/vendedores`);
  if (!res.ok) throw new Error('Error al cargar vendedores');
  return res.json();
}

async function getVentas() {
  const res = await fetch(`${API_BASE}/api/ventas`);
  if (!res.ok) throw new Error('Error al cargar ventas');
  return res.json();
}

async function getResumenVendedores() {
  const res = await fetch(`${API_BASE}/api/ventas/resumen-vendedores`);
  if (!res.ok) throw new Error('Error al cargar resumen');
  return res.json();
}

async function postVenta(data) {
  const res = await fetch(`${API_BASE}/api/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Error al registrar venta');
  return json;
}

function formatFecha(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatMonto(num) {
  return new Intl.NumberFormat('es-ES', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Llenar selects
async function initForm() {
  const [frutas, vendedores] = await Promise.all([getFrutas(), getVendedores()]);

  const selProducto = document.getElementById('producto');
  selProducto.innerHTML = '<option value="">Seleccione producto</option>';
  frutas.forEach((f) => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.nombre;
    selProducto.appendChild(opt);
  });

  const selVendedor = document.getElementById('vendedor');
  selVendedor.innerHTML = '<option value="">Seleccione vendedor</option>';
  vendedores.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.nombre;
    selVendedor.appendChild(opt);
  });

  const fecha = document.getElementById('fecha');
  if (!fecha.value) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    fecha.value = now.toISOString().slice(0, 16);
  }
}

function showFormMessage(text, isError = false) {
  const el = document.getElementById('formMessage');
  el.textContent = text;
  el.className = 'message' + (text ? (isError ? ' error' : ' success') : '');
}

// Envío del formulario
async function onSubmitVenta(e) {
  e.preventDefault();
  const form = e.target;
  const producto = form.NomProducto.value;
  const vendedor = form.NombreVendedor.value;
  const precio = parseFloat(form.Precio.value);
  const kilos = parseInt(form.Kilos.value, 10);
  let fechaAlta = form.FechaAlta.value;
  if (fechaAlta) {
    fechaAlta = new Date(fechaAlta).toISOString();
  }

  showFormMessage('');
  try {
    await postVenta({
      NomProducto: parseInt(producto, 10),
      NombreVendedor: parseInt(vendedor, 10),
      Precio: precio,
      Kilos: kilos,
      FechaAlta: fechaAlta || undefined,
    });
    showFormMessage('Venta registrada correctamente.');
    form.reset();
    const f = document.getElementById('fecha');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    f.value = now.toISOString().slice(0, 16);
    await Promise.all([cargarVentas(), cargarResumen()]);
  } catch (err) {
    showFormMessage(err.message || 'Error al registrar.', true);
  }
}

async function cargarVentas() {
  const tbody = document.getElementById('tbodyVentas');
  const loading = document.getElementById('loadingVentas');
  const errorEl = document.getElementById('errorVentas');
  const table = document.getElementById('tablaVentas');

  loading.hidden = false;
  errorEl.hidden = true;
  table.hidden = true;
  tbody.innerHTML = '';

  try {
    const ventas = await getVentas();
    loading.hidden = true;
    if (ventas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No hay ventas registradas.</td></tr>';
    } else {
      ventas.forEach((v) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatFecha(v.fecha_venta)}</td>
          <td>${v.nombreProducto || '—'}</td>
          <td>S/.${formatMonto(v.precio_venta)}</td>
          <td>${v.kilos}</td>
          <td class="monto">S/.${v.MontoTotal}</td>
          <td>${v.nombreVendedor || '—'}</td>
        `;
        tbody.appendChild(tr);
      });
    }
    table.hidden = false;
  } catch (err) {
    loading.hidden = true;
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
}

async function cargarResumen() {
  const cont = document.getElementById('resumenVendedores');
  try {
    const rows = await getResumenVendedores();
    cont.innerHTML = rows
      .map(
        (r) => `
        <div class="resumen-item">
          <span class="vendedor">${r.vendedor}</span>
          <span class="monto">${formatMonto(r.montoTotal || 0)}</span>
        </div>
      `
      )
      .join('');
  } catch {
    cont.innerHTML = '<p class="error">No se pudo cargar el resumen.</p>';
  }
}

function bindEvents() {
  document.getElementById('formVenta').addEventListener('submit', onSubmitVenta);
  document.getElementById('btnRefrescar').addEventListener('click', () => {
    cargarVentas();
    cargarResumen();
  });
}

async function init() {
  bindEvents();
  await initForm();
  await Promise.all([cargarVentas(), cargarResumen()]);
}

init();
