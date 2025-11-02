// Sistema de Facturación - COMPLETO
let facturas = [];
let facturaEditando = null;
let nextFacturaId = 1;

document.addEventListener('DOMContentLoaded', function() {
    cargarFacturas();
    cargarEstadisticas();
    cargarClientesFactura();
    cargarMetodosPago();
    
    // Establecer fecha actual por defecto
    document.getElementById('facturaFecha').value = new Date().toISOString().split('T')[0];
});

function cargarFacturas() {
    const tipoFilter = document.getElementById('tipoComprobanteFilter').value;
    const estadoFilter = document.getElementById('estadoFacturaFilter').value;
    
    facturas = JSON.parse(localStorage.getItem('bsdash_facturas') || '[]');
    
    // Actualizar next ID
    if (facturas.length > 0) {
        nextFacturaId = Math.max(...facturas.map(f => f.id)) + 1;
    }

    let facturasFiltradas = facturas;
    
    if (tipoFilter) {
        facturasFiltradas = facturasFiltradas.filter(f => f.tipo === tipoFilter);
    }
    
    if (estadoFilter) {
        facturasFiltradas = facturasFiltradas.filter(f => f.estadoPago === estadoFilter);
    }

    mostrarFacturas(facturasFiltradas);
}

function cargarEstadisticas() {
    const facturasMes = facturas.filter(f => {
        const fechaFactura = new Date(f.fecha);
        const hoy = new Date();
        return fechaFactura.getMonth() === hoy.getMonth() && 
               fechaFactura.getFullYear() === hoy.getFullYear();
    });
    
    const totalFacturasMes = facturasMes.length;
    const ingresosMes = facturasMes.reduce((sum, f) => sum + f.total, 0);
    const facturasPendientes = facturas.filter(f => f.estadoPago === 'pendiente').length;
    const facturasAnuladas = facturas.filter(f => f.estado === 'anulada').length;
    
    document.getElementById('totalFacturasMes').textContent = totalFacturasMes;
    document.getElementById('ingresosMes').textContent = `$${ingresosMes.toFixed(2)}`;
    document.getElementById('facturasPendientes').textContent = facturasPendientes;
    document.getElementById('facturasAnuladas').textContent = facturasAnuladas;
}

function mostrarFacturas(facturas) {
    const tbody = document.getElementById('tablaFacturas');
    const noFacturas = document.getElementById('noFacturas');
    const loading = document.getElementById('loadingFacturas');

    loading.style.display = 'none';

    if (facturas.length === 0) {
        tbody.innerHTML = '';
        noFacturas.classList.remove('hidden');
        return;
    }

    noFacturas.classList.add('hidden');
    
    tbody.innerHTML = facturas.map(factura => `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="py-3 px-4">
                <div class="font-medium text-blue-600">${factura.numero}</div>
                <div class="text-xs text-gray-500 capitalize">${getTipoText(factura.tipo)}</div>
            </td>
            <td class="py-3 px-4">
                <div class="font-medium">${factura.clienteNombre}</div>
                <div class="text-sm text-gray-500">${factura.clienteIdentificacion}</div>
            </td>
            <td class="py-3 px-4 text-sm text-gray-500">
                ${new Date(factura.fecha).toLocaleDateString()}
            </td>
            <td class="py-3 px-4">
                <span class="text-xs ${getTipoColor(factura.tipo)} px-2 py-1 rounded capitalize">
                    ${getTipoText(factura.tipo)}
                </span>
            </td>
            <td class="py-3 px-4 font-semibold">$${factura.total.toFixed(2)}</td>
            <td class="py-3 px-4">
                <span class="bs-status bs-status-${factura.estadoPago}">${getEstadoPagoText(factura.estadoPago)}</span>
            </td>
            <td class="py-3 px-4">
                <div class="flex gap-2">
                    <button onclick="verFactura(${factura.id})" class="bs-btn bs-btn-sm bg-blue-100 text-blue-700">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button onclick="editarFactura(${factura.id})" class="bs-btn bs-btn-sm bg-green-100 text-green-700">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="anularFactura(${factura.id})" class="bs-btn bs-btn-sm bg-red-100 text-red-700">
                        <i class="bi bi-x-circle"></i>
                    </button>
                    ${factura.estadoPago === 'pendiente' ? `
                    <button onclick="marcarComoPagada(${factura.id})" class="bs-btn bs-btn-sm bg-purple-100 text-purple-700">
                        <i class="bi bi-check-lg"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function getTipoText(tipo) {
    const tipos = {
        'factura': 'Factura',
        'credito': 'N. Crédito', 
        'debito': 'N. Débito'
    };
    return tipos[tipo] || tipo;
}

function getTipoColor(tipo) {
    const colores = {
        'factura': 'bg-green-100 text-green-800',
        'credito': 'bg-blue-100 text-blue-800', 
        'debito': 'bg-orange-100 text-orange-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
}

function getEstadoPagoText(estado) {
    const estados = {
        'pagada': 'Pagada',
        'pendiente': 'Pendiente', 
        'parcial': 'Parcial',
        'anulada': 'Anulada'
    };
    return estados[estado] || estado;
}

function cargarClientesFactura() {
    const clientes = db.getClientes();
    const select = document.getElementById('facturaCliente');
    select.innerHTML = '<option value="">Seleccionar cliente...</option>';
    
    clientes.forEach(cliente => {
        select.innerHTML += `<option value="${cliente.id}">${cliente.nombre} - ${cliente.ruc_ci}</option>`;
    });
}

function cargarMetodosPago() {
    const metodosPago = JSON.parse(localStorage.getItem('bsdash_metodosPago') || '["Efectivo", "Tarjeta Débito", "Tarjeta Crédito", "Transferencia"]');
    const select = document.getElementById('facturaMetodoPago');
    select.innerHTML = '<option value="">Seleccionar método...</option>';
    
    metodosPago.forEach(metodo => {
        select.innerHTML += `<option value="${metodo}">${metodo}</option>`;
    });
}

function nuevaFactura() {
    facturaEditando = null;
    document.getElementById('tituloModalFactura').textContent = 'Nueva Factura';
    document.getElementById('formFactura').reset();
    document.getElementById('itemsFactura').innerHTML = '';
    
    // Establecer fecha actual
    document.getElementById('facturaFecha').value = new Date().toISOString().split('T')[0];
    
    agregarItemFactura(); // Agregar un item vacío por defecto
    actualizarTotalesFactura();
    
    document.getElementById('modalFactura').classList.remove('hidden');
    document.getElementById('modalFactura').classList.add('flex');
}

function agregarItemFactura() {
    const itemsContainer = document.getElementById('itemsFactura');
    const itemId = Date.now();
    
    itemsContainer.innerHTML += `
        <div class="grid grid-cols-12 gap-2 items-center border border-gray-200 p-3 rounded-lg" id="factura-item-${itemId}">
            <div class="col-span-5">
                <input type="text" placeholder="Descripción" class="bs-input w-full factura-item-descripcion" 
                       onchange="actualizarTotalesFactura()">
            </div>
            <div class="col-span-2">
                <input type="number" placeholder="Cantidad" class="bs-input w-full factura-item-cantidad" 
                       value="1" min="1" onchange="actualizarTotalesFactura()">
            </div>
            <div class="col-span-2">
                <input type="number" placeholder="Precio" class="bs-input w-full factura-item-precio" 
                       step="0.01" min="0" onchange="actualizarTotalesFactura()">
            </div>
            <div class="col-span-2 text-right font-semibold factura-item-total">
                $0.00
            </div>
            <div class="col-span-1 text-center">
                <button type="button" onclick="eliminarItemFactura(${itemId})" class="bs-btn bg-red-50 text-red-600 text-sm">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function eliminarItemFactura(itemId) {
    const itemElement = document.getElementById(`factura-item-${itemId}`);
    if (itemElement) {
        itemElement.remove();
        actualizarTotalesFactura();
    }
}

function actualizarTotalesFactura() {
    let subtotal = 0;
    
    document.querySelectorAll('[id^="factura-item-"]').forEach(itemElement => {
        const cantidad = parseFloat(itemElement.querySelector('.factura-item-cantidad').value) || 0;
        const precio = parseFloat(itemElement.querySelector('.factura-item-precio').value) || 0;
        const totalItem = cantidad * precio;
        
        itemElement.querySelector('.factura-item-total').textContent = `$${totalItem.toFixed(2)}`;
        subtotal += totalItem;
    });
    
    const descuento = 0; // Podrías agregar un campo de descuento
    const baseImponible = subtotal - descuento;
    const iva = baseImponible * 0.18; // 18% IVA
    const total = baseImponible + iva;
    
    document.getElementById('subtotalFactura').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('descuentoFactura').textContent = `$${descuento.toFixed(2)}`;
    document.getElementById('ivaFactura').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('totalFactura').textContent = `$${total.toFixed(2)}`;
}

function guardarFactura() {
    if (!validarFactura()) return;
    
    const factura = obtenerDatosFactura();
    factura.estado = 'activa';
    
    if (facturaEditando) {
        // Editar factura existente
        const index = facturas.findIndex(f => f.id === facturaEditando);
        if (index !== -1) {
            facturas[index] = factura;
        }
    } else {
        // Nueva factura
        factura.id = nextFacturaId++;
        factura.numero = `FACT-${String(factura.id).padStart(3, '0')}`;
        factura.fecha = new Date().toISOString();
        facturas.push(factura);
    }
    
    localStorage.setItem('bsdash_facturas', JSON.stringify(facturas));
    cerrarModalFactura();
    cargarFacturas();
    cargarEstadisticas();
    alert('✅ Factura guardada correctamente');
}

function obtenerDatosFactura() {
    const clienteId = document.getElementById('facturaCliente').value;
    const clientes = db.getClientes();
    const cliente = clientes.find(c => c.id == clienteId);
    
    const items = [];
    document.querySelectorAll('[id^="factura-item-"]').forEach(itemElement => {
        const descripcion = itemElement.querySelector('.factura-item-descripcion').value;
        const cantidad = parseFloat(itemElement.querySelector('.factura-item-cantidad').value);
        const precio = parseFloat(itemElement.querySelector('.factura-item-precio').value);
        
        if (descripcion && cantidad && precio) {
            items.push({
                descripcion,
                cantidad,
                precio,
                total: cantidad * precio
            });
        }
    });
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const descuento = 0;
    const baseImponible = subtotal - descuento;
    const iva = baseImponible * 0.18;
    const total = baseImponible + iva;
    
    return {
        id: facturaEditando || nextFacturaId,
        numero: facturaEditando ? facturas.find(f => f.id === facturaEditando).numero : `FACT-${String(nextFacturaId).padStart(3, '0')}`,
        tipo: document.getElementById('facturaTipo').value,
        clienteId: clienteId,
        clienteNombre: cliente ? cliente.nombre : '',
        clienteIdentificacion: cliente ? cliente.ruc_ci : '',
        fecha: document.getElementById('facturaFecha').value,
        metodoPago: document.getElementById('facturaMetodoPago').value,
        estadoPago: document.getElementById('facturaEstadoPago').value,
        items: items,
        subtotal: subtotal,
        descuento: descuento,
        iva: iva,
        total: total,
        estado: 'activa'
    };
}

function validarFactura() {
    const cliente = document.getElementById('facturaCliente').value;
    const metodoPago = document.getElementById('facturaMetodoPago').value;
    
    if (!cliente) {
        alert('⚠️ Debe seleccionar un cliente');
        return false;
    }
    
    if (!metodoPago) {
        alert('⚠️ Debe seleccionar un método de pago');
        return false;
    }
    
    const itemsValidos = Array.from(document.querySelectorAll('[id^="factura-item-"]')).some(itemElement => {
        const descripcion = itemElement.querySelector('.factura-item-descripcion').value;
        const cantidad = itemElement.querySelector('.factura-item-cantidad').value;
        const precio = itemElement.querySelector('.factura-item-precio').value;
        return descripcion && cantidad && precio;
    });
    
    if (!itemsValidos) {
        alert('⚠️ Debe agregar al menos un producto/servicio válido');
        return false;
    }
    
    return true;
}

function editarFactura(id) {
    const factura = facturas.find(f => f.id === id);
    if (!factura) return;
    
    facturaEditando = id;
    document.getElementById('tituloModalFactura').textContent = 'Editar Factura';
    document.getElementById('formFactura').reset();
    document.getElementById('itemsFactura').innerHTML = '';
    
    // Cargar datos de la factura
    document.getElementById('facturaTipo').value = factura.tipo;
    document.getElementById('facturaCliente').value = factura.clienteId;
    document.getElementById('facturaFecha').value = factura.fecha.split('T')[0];
    document.getElementById('facturaMetodoPago').value = factura.metodoPago;
    document.getElementById('facturaEstadoPago').value = factura.estadoPago;
    
    // Cargar items
    factura.items.forEach(item => {
        agregarItemFactura();
        const lastItem = document.querySelector('[id^="factura-item-"]:last-child');
        lastItem.querySelector('.factura-item-descripcion').value = item.descripcion;
        lastItem.querySelector('.factura-item-cantidad').value = item.cantidad;
        lastItem.querySelector('.factura-item-precio').value = item.precio;
    });
    
    actualizarTotalesFactura();
    document.getElementById('modalFactura').classList.remove('hidden');
    document.getElementById('modalFactura').classList.add('flex');
}

function anularFactura(id) {
    if (confirm('¿Estás seguro de que deseas anular esta factura? Esta acción no se puede deshacer.')) {
        const factura = facturas.find(f => f.id === id);
        if (factura) {
            factura.estado = 'anulada';
            factura.estadoPago = 'anulada';
            localStorage.setItem('bsdash_facturas', JSON.stringify(facturas));
            cargarFacturas();
            cargarEstadisticas();
            alert('✅ Factura anulada correctamente');
        }
    }
}

function marcarComoPagada(id) {
    const factura = facturas.find(f => f.id === id);
    if (factura) {
        factura.estadoPago = 'pagada';
        localStorage.setItem('bsdash_facturas', JSON.stringify(facturas));
        cargarFacturas();
        cargarEstadisticas();
        alert('✅ Factura marcada como pagada');
    }
}

function verFactura(id) {
    const factura = facturas.find(f => f.id === id);
    if (!factura) return;
    
    document.getElementById('numeroFacturaVer').textContent = factura.numero;
    
    const contenido = document.getElementById('contenidoFactura');
    contenido.innerHTML = generarHTMLFactura(factura);
    
    document.getElementById('modalVerFactura').classList.remove('hidden');
    document.getElementById('modalVerFactura').classList.add('flex');
}

function generarHTMLFactura(factura) {
    const empresa = JSON.parse(localStorage.getItem('bsdash_empresa') || '{}');
    
    return `
        <div class="factura-template">
            <!-- Encabezado -->
            <div class="text-center mb-8 border-b pb-4">
                <h1 class="text-2xl font-bold text-gray-800">${empresa.nombre || 'Berroa Studio'}</h1>
                <p class="text-gray-600">${empresa.eslogan || 'Soluciones digitales innovadoras'}</p>
                <p class="text-sm text-gray-500">RNC: ${empresa.rnc || '123456789'} | Tel: ${empresa.telefono || '(809) 123-4567'}</p>
                <p class="text-sm text-gray-500">${empresa.direccion || 'Av. Principal #123, Santo Domingo'}</p>
            </div>
            
            <!-- Información de la Factura -->
            <div class="grid grid-cols-2 gap-8 mb-6">
                <div>
                    <h3 class="font-bold text-gray-800 mb-2">Para:</h3>
                    <p>${factura.clienteNombre}</p>
                    <p>RNC/Cédula: ${factura.clienteIdentificacion}</p>
                </div>
                <div class="text-right">
                    <h3 class="font-bold text-gray-800 mb-2">${getTipoText(factura.tipo)}:</h3>
                    <p><strong>N°:</strong> ${factura.numero}</p>
                    <p><strong>Fecha:</strong> ${new Date(factura.fecha).toLocaleDateString()}</p>
                    <p><strong>Método Pago:</strong> ${factura.metodoPago}</p>
                </div>
            </div>
            
            <!-- Items -->
            <table class="w-full mb-6">
                <thead>
                    <tr class="border-b-2 border-gray-800">
                        <th class="text-left py-2">Descripción</th>
                        <th class="text-center py-2">Cantidad</th>
                        <th class="text-right py-2">Precio Unit.</th>
                        <th class="text-right py-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${factura.items.map(item => `
                        <tr class="border-b border-gray-200">
                            <td class="py-3">${item.descripcion}</td>
                            <td class="text-center py-3">${item.cantidad}</td>
                            <td class="text-right py-3">$${item.precio.toFixed(2)}</td>
                            <td class="text-right py-3">$${item.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Totales -->
            <div class="grid grid-cols-2 gap-8 max-w-md ml-auto">
                <div class="text-right">Subtotal:</div>
                <div class="text-right font-semibold">$${factura.subtotal.toFixed(2)}</div>
                
                ${factura.descuento > 0 ? `
                <div class="text-right">Descuento:</div>
                <div class="text-right font-semibold">$${factura.descuento.toFixed(2)}</div>
                ` : ''}
                
                <div class="text-right">IVA (18%):</div>
                <div class="text-right font-semibold">$${factura.iva.toFixed(2)}</div>
                
                <div class="text-right border-t pt-2 text-lg font-bold">Total:</div>
                <div class="text-right border-t pt-2 text-lg font-bold">$${factura.total.toFixed(2)}</div>
            </div>
            
            <!-- Estado -->
            <div class="mt-8 text-center text-sm text-gray-500">
                <p>Estado de Pago: <span class="font-semibold">${getEstadoPagoText(factura.estadoPago)}</span></p>
                <p class="mt-2">¡Gracias por su preferencia!</p>
            </div>
        </div>
    `;
}

function imprimirFactura() {
    window.print();
}

function descargarFacturaPDF() {
    alert('📄 Generando PDF... En una implementación real, esto generaría un archivo PDF descargable.');
    // Aquí integrarías una librería como jsPDF
}

function cerrarModalFactura() {
    document.getElementById('modalFactura').classList.add('hidden');
    document.getElementById('modalFactura').classList.remove('flex');
}

function cerrarModalVerFactura() {
    document.getElementById('modalVerFactura').classList.add('hidden');
    document.getElementById('modalVerFactura').classList.remove('flex');
}

// Evento del formulario
document.getElementById('formFactura').addEventListener('submit', function(e) {
    e.preventDefault();
    guardarFactura();
});

function buscarFacturas() {
    const searchTerm = document.getElementById('searchFacturas').value.toLowerCase();
    if (!searchTerm) {
        cargarFacturas();
        return;
    }
    
    const facturasFiltradas = facturas.filter(factura => 
        factura.numero.toLowerCase().includes(searchTerm) ||
        factura.clienteNombre.toLowerCase().includes(searchTerm) ||
        factura.clienteIdentificacion.includes(searchTerm)
    );
    
    mostrarFacturas(facturasFiltradas);
}
// ==================== INTEGRACIÓN CON SISTEMA DE PAGOS ====================

function integrarConSistemaPagos(factura) {
    console.log('🔄 Integrando factura con sistema de pagos...');
    
    // Verificar que el sistema de pagos esté disponible
    if (!window.pagosSystem) {
        console.error('❌ Sistema de pagos no disponible');
        return false;
    }
    
    try {
        // Crear pago automáticamente para la factura
        const pagoData = {
            factura_id: factura.id,
            numero_factura: factura.numero,
            cliente_nombre: factura.clienteNombre,
            cliente_identificacion: factura.clienteIdentificacion,
            monto: factura.total,
            moneda: 'USD',
            metodo_pago: factura.metodoPago,
            fecha_vencimiento: calcularFechaVencimiento(factura.fecha),
            descripcion: `Pago de ${factura.tipo} ${factura.numero}`,
            empresa_id: 1, // Por defecto
            estado: mapearEstadoFacturaAPago(factura.estadoPago)
        };
        
        window.pagosSystem.crearPago(pagoData);
        console.log('✅ Pago integrado para factura:', factura.numero);
        return true;
        
    } catch (error) {
        console.error('💥 Error integrando con sistema de pagos:', error);
        return false;
    }
}

function calcularFechaVencimiento(fechaFactura) {
    const fecha = new Date(fechaFactura);
    fecha.setDate(fecha.getDate() + 30); // 30 días para pagar
    return fecha.toISOString();
}

function mapearEstadoFacturaAPago(estadoFactura) {
    const mapeo = {
        'pagada': 'pagado',
        'pendiente': 'pendiente', 
        'parcial': 'parcial',
        'anulada': 'cancelado'
    };
    return mapeo[estadoFactura] || 'pendiente';
}

// ==================== MODIFICAR FUNCIÓN guardarFactura ====================

// Guardar la función original
const guardarFacturaOriginal = window.guardarFactura;

// Reemplazar con la función integrada
window.guardarFactura = function() {
    if (!validarFactura()) return;
    
    const factura = obtenerDatosFactura();
    factura.estado = 'activa';
    
    if (facturaEditando) {
        // Editar factura existente
        const index = facturas.findIndex(f => f.id === facturaEditando);
        if (index !== -1) {
            facturas[index] = factura;
        }
    } else {
        // Nueva factura
        factura.id = nextFacturaId++;
        factura.numero = `FACT-${String(factura.id).padStart(3, '0')}`;
        factura.fecha = new Date().toISOString();
        facturas.push(factura);
        
        // ✅ INTEGRAR CON SISTEMA DE PAGOS - SOLO PARA NUEVAS FACTURAS
        setTimeout(() => {
            integrarConSistemaPagos(factura);
        }, 100);
    }
    
    localStorage.setItem('bsdash_facturas', JSON.stringify(facturas));
    cerrarModalFactura();
    cargarFacturas();
    cargarEstadisticas();
    alert('✅ Factura guardada correctamente' + (window.pagosSystem ? ' y integrada con sistema de pagos' : ''));
};

// ==================== INTEGRAR FACTURAS EXISTENTES ====================

function integrarFacturasExistentes() {
    console.log('🔄 Integrando facturas existentes con sistema de pagos...');
    
    if (!window.pagosSystem) {
        console.log('❌ Sistema de pagos no disponible para integración');
        return;
    }
    
    const facturasExistentes = JSON.parse(localStorage.getItem('bsdash_facturas') || '[]');
    let integradas = 0;
    
    facturasExistentes.forEach(factura => {
        if (factura.estado !== 'anulada') {
            // Verificar si ya existe un pago para esta factura
            const pagos = window.pagosSystem.obtenerPagos();
            const pagoExistente = pagos.find(p => p.factura_id === factura.id);
            
            if (!pagoExistente) {
                integrarConSistemaPagos(factura);
                integradas++;
            }
        }
    });
    
    if (integradas > 0) {
        console.log(`✅ ${integradas} facturas existentes integradas con sistema de pagos`);
    }
}

// Ejecutar integración al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        integrarFacturasExistentes();
    }, 2000);
});