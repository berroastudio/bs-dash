// Configuración del Sistema
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = '../index.html';
    }

    document.getElementById('userName').textContent = localStorage.getItem('userName') || 'John Berroa';
    cargarTodaConfiguracion();
});

function cargarTodaConfiguracion() {
    cargarInformacionEmpresa();
    cargarConfiguracionPOS();
    cargarSecuencias();
    cargarUsuarios();
    cargarClientes();
}

// Información de la Empresa
function cargarInformacionEmpresa() {
    const empresa = JSON.parse(localStorage.getItem('bsdash_empresa') || '{}');
    
    document.getElementById('empresaNombre').value = empresa.nombre || 'Berroa Studio S.R.L.';
    document.getElementById('empresaRNC').value = empresa.rnc || '';
    document.getElementById('empresaTelefono').value = empresa.telefono || '';
    document.getElementById('empresaEmail').value = empresa.email || '';
    document.getElementById('empresaDireccion').value = empresa.direccion || '';
    document.getElementById('empresaWebsite').value = empresa.website || '';
    document.getElementById('empresaEslogan').value = empresa.eslogan || '';
}

function guardarInformacionEmpresa() {
    const empresa = {
        nombre: document.getElementById('empresaNombre').value,
        rnc: document.getElementById('empresaRNC').value,
        telefono: document.getElementById('empresaTelefono').value,
        email: document.getElementById('empresaEmail').value,
        direccion: document.getElementById('empresaDireccion').value,
        website: document.getElementById('empresaWebsite').value,
        eslogan: document.getElementById('empresaEslogan').value
    };
    
    localStorage.setItem('bsdash_empresa', JSON.stringify(empresa));
    return true;
}

// Configuración POS
function cargarConfiguracionPOS() {
    const metodosPago = JSON.parse(localStorage.getItem('bsdash_metodosPago') || '["Efectivo", "Tarjeta Débito", "Tarjeta Crédito", "Transferencia"]');
    const metodosContainer = document.getElementById('metodosPagoContainer');
    metodosContainer.innerHTML = '';

    metodosPago.forEach((metodo, index) => {
        metodosContainer.innerHTML += `
            <div class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                <input type="text" value="${metodo}" onchange="actualizarMetodoPago(${index}, this.value)" 
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-300">
                <button onclick="eliminarMetodoPago(${index})" class="bs-btn bg-red-50 text-red-600 border-red-200 text-sm hover:bg-red-100">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
    });

    const config = JSON.parse(localStorage.getItem('bsdash_configuracion') || '{}');
    document.getElementById('habilitarDescuentos').checked = config.habilitarDescuentos || false;
    document.getElementById('solicitarCliente').checked = config.solicitarCliente || false;
    document.getElementById('imprimirAutomatico').checked = config.imprimirAutomatico || false;
    document.getElementById('ivaPorDefecto').value = config.ivaPorDefecto || 18;
}

function agregarMetodoPago() {
    const metodosPago = JSON.parse(localStorage.getItem('bsdash_metodosPago') || '["Efectivo", "Tarjeta Débito", "Tarjeta Crédito", "Transferencia"]');
    metodosPago.push('Nuevo Método');
    localStorage.setItem('bsdash_metodosPago', JSON.stringify(metodosPago));
    cargarConfiguracionPOS();
}

function actualizarMetodoPago(index, valor) {
    const metodosPago = JSON.parse(localStorage.getItem('bsdash_metodosPago') || '["Efectivo", "Tarjeta Débito", "Tarjeta Crédito", "Transferencia"]');
    metodosPago[index] = valor;
    localStorage.setItem('bsdash_metodosPago', JSON.stringify(metodosPago));
}

function eliminarMetodoPago(index) {
    const metodosPago = JSON.parse(localStorage.getItem('bsdash_metodosPago') || '["Efectivo", "Tarjeta Débito", "Tarjeta Crédito", "Transferencia"]');
    if (metodosPago.length > 1) {
        metodosPago.splice(index, 1);
        localStorage.setItem('bsdash_metodosPago', JSON.stringify(metodosPago));
        cargarConfiguracionPOS();
    } else {
        alert('Debe haber al menos un método de pago');
    }
}

function guardarConfiguracionPOS() {
    const config = {
        habilitarDescuentos: document.getElementById('habilitarDescuentos').checked,
        solicitarCliente: document.getElementById('solicitarCliente').checked,
        imprimirAutomatico: document.getElementById('imprimirAutomatico').checked,
        ivaPorDefecto: parseFloat(document.getElementById('ivaPorDefecto').value)
    };
    localStorage.setItem('bsdash_configuracion', JSON.stringify(config));
    return true;
}

// Secuencias
function cargarSecuencias() {
    const secuencias = JSON.parse(localStorage.getItem('bsdash_secuencias') || '{}');
    
    const secuenciasDefault = {
        facturas: { prefijo: 'FACT', numero: 1, ceros: 3 },
        cotizaciones: { prefijo: 'COT', numero: 1, ceros: 3 },
        ordenes: { prefijo: 'ORD', numero: 1, ceros: 3 },
        reportes: { prefijo: 'REP', numero: 1, ceros: 3 }
    };
    
    const secuenciasCompletas = { ...secuenciasDefault, ...secuencias };
    
    Object.keys(secuenciasCompletas).forEach(tipo => {
        const secuencia = secuenciasCompletas[tipo];
        const numeroFormateado = secuencia.prefijo + '-' + secuencia.numero.toString().padStart(secuencia.ceros, '0');
        document.getElementById(`secuencia${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).textContent = numeroFormateado;
    });
}

let secuenciaEditando = null;

function editarSecuencia(tipo) {
    secuenciaEditando = tipo;
    const secuencias = JSON.parse(localStorage.getItem('bsdash_secuencias') || '{}');
    const secuencia = secuencias[tipo] || { prefijo: tipo.substring(0, 4).toUpperCase(), numero: 1, ceros: 3 };
    
    document.getElementById('tituloModalSecuencia').textContent = `Editar Secuencia de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    document.getElementById('secuenciaPrefijo').value = secuencia.prefijo;
    document.getElementById('secuenciaNumero').value = secuencia.numero;
    document.getElementById('secuenciaCeros').value = secuencia.ceros;
    
    document.getElementById('modalSecuencia').classList.remove('hidden');
    document.getElementById('modalSecuencia').classList.add('flex');
}

function cerrarModalSecuencia() {
    document.getElementById('modalSecuencia').classList.add('hidden');
    document.getElementById('modalSecuencia').classList.remove('flex');
}

document.getElementById('formSecuencia').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const secuencia = {
        prefijo: document.getElementById('secuenciaPrefijo').value,
        numero: parseInt(document.getElementById('secuenciaNumero').value),
        ceros: parseInt(document.getElementById('secuenciaCeros').value)
    };
    
    const secuencias = JSON.parse(localStorage.getItem('bsdash_secuencias') || '{}');
    secuencias[secuenciaEditando] = secuencia;
    localStorage.setItem('bsdash_secuencias', JSON.stringify(secuencias));
    
    cerrarModalSecuencia();
    cargarSecuencias();
    alert('Secuencia actualizada correctamente');
});

// Gestión de Usuarios
function cargarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('bsdash_usuarios') || '[]');
    const tabla = document.getElementById('tablaUsuarios');
    tabla.innerHTML = '';

    if (usuarios.length === 0) {
        // Usuario por defecto
        const usuarioDefault = {
            id: 1,
            nombre: 'John Berroa',
            email: 'admin@bsdash.com',
            username: 'admin',
            rol: 'admin',
            activo: true
        };
        usuarios.push(usuarioDefault);
        localStorage.setItem('bsdash_usuarios', JSON.stringify(usuarios));
    }

    usuarios.forEach(usuario => {
        const rolColor = {
            'admin': 'purple',
            'vendedor': 'blue',
            'inventario': 'green',
            'reportes': 'orange'
        }[usuario.rol] || 'gray';
        
        tabla.innerHTML += `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-3 px-4">
                    <div class="font-medium">${usuario.nombre}</div>
                    <div class="text-sm text-gray-500">@${usuario.username}</div>
                </td>
                <td class="py-3 px-4">
                    <span class="text-xs bg-${rolColor}-100 text-${rolColor}-800 px-2 py-1 rounded capitalize">${usuario.rol}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="text-xs ${usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-2 py-1 rounded">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <button onclick="editarUsuario(${usuario.id})" class="bs-btn text-sm mr-2">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${usuario.id !== 1 ? `<button onclick="eliminarUsuario(${usuario.id})" class="bs-btn bg-red-50 text-red-600 text-sm">
                        <i class="bi bi-trash"></i>
                    </button>` : ''}
                </td>
            </tr>
        `;
    });
}

function abrirModalUsuario() {
    document.getElementById('tituloModalUsuario').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('modalUsuario').classList.remove('hidden');
    document.getElementById('modalUsuario').classList.add('flex');
}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').classList.add('hidden');
    document.getElementById('modalUsuario').classList.remove('flex');
}

document.getElementById('formUsuario').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = {
        id: Date.now(),
        nombre: document.getElementById('usuarioNombre').value,
        email: document.getElementById('usuarioEmail').value,
        username: document.getElementById('usuarioUsername').value,
        password: document.getElementById('usuarioPassword').value,
        rol: document.getElementById('usuarioRol').value,
        activo: true
    };
    
    const usuarios = JSON.parse(localStorage.getItem('bsdash_usuarios') || '[]');
    usuarios.push(usuario);
    localStorage.setItem('bsdash_usuarios', JSON.stringify(usuarios));
    
    cerrarModalUsuario();
    cargarUsuarios();
    alert('Usuario creado correctamente');
});

// Gestión de Clientes (manteniendo tu código existente con mejoras)
function cargarClientes() {
    const clientes = db.getClientes();
    const tabla = document.getElementById('tablaClientes');
    tabla.innerHTML = '';

    clientes.forEach(cliente => {
        tabla.innerHTML += `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-3 px-4 font-mono text-sm">${cliente.codigo}</td>
                <td class="py-3 px-4">${cliente.nombre}</td>
                <td class="py-3 px-4 text-sm">${cliente.ruc_ci}</td>
                <td class="py-3 px-4 text-sm">${cliente.telefono || '-'}</td>
                <td class="py-3 px-4">
                    <button onclick="editarCliente(${cliente.id})" class="bs-btn text-sm">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

let clienteEditando = null;

function abrirModalCliente() {
    clienteEditando = null;
    document.getElementById('tituloModalCliente').textContent = 'Nuevo Cliente';
    document.getElementById('formCliente').reset();
    document.getElementById('modalCliente').classList.remove('hidden');
    document.getElementById('modalCliente').classList.add('flex');
}

function cerrarModalCliente() {
    document.getElementById('modalCliente').classList.add('hidden');
    document.getElementById('modalCliente').classList.remove('flex');
}

function editarCliente(id) {
    const clientes = db.getClientes();
    clienteEditando = clientes.find(c => c.id === id);
    
    if (clienteEditando) {
        document.getElementById('tituloModalCliente').textContent = 'Editar Cliente';
        document.getElementById('clienteCodigo').value = clienteEditando.codigo;
        document.getElementById('clienteNombre').value = clienteEditando.nombre;
        document.getElementById('clienteIdentificacion').value = clienteEditando.ruc_ci;
        document.getElementById('clienteTelefono').value = clienteEditando.telefono || '';
        document.getElementById('clienteEmail').value = clienteEditando.email || '';
        document.getElementById('clienteDireccion').value = clienteEditando.direccion || '';
        document.getElementById('modalCliente').classList.remove('hidden');
        document.getElementById('modalCliente').classList.add('flex');
    }
}

document.getElementById('formCliente').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cliente = {
        codigo: document.getElementById('clienteCodigo').value,
        nombre: document.getElementById('clienteNombre').value,
        ruc_ci: document.getElementById('clienteIdentificacion').value,
        telefono: document.getElementById('clienteTelefono').value,
        email: document.getElementById('clienteEmail').value,
        direccion: document.getElementById('clienteDireccion').value
    };

    if (clienteEditando) {
        cliente.id = clienteEditando.id;
        const clientes = db.getClientes();
        const index = clientes.findIndex(c => c.id === cliente.id);
        if (index !== -1) {
            clientes[index] = cliente;
            db.set('clientes', clientes);
        }
    } else {
        db.addCliente(cliente);
    }

    cerrarModalCliente();
    cargarClientes();
    alert('Cliente guardado correctamente');
});

// Funciones generales
function personalizarPlantilla(tipo) {
    // Guardar el tipo de plantilla que estamos editando
    localStorage.setItem('plantillaEditando', tipo);
    
    // Redirigir al editor de plantillas
    window.location.href = `editor-plantillas.html?tipo=${tipo}`;
}

function guardarTodaConfiguracion() {
    const resultados = [
        guardarInformacionEmpresa(),
        guardarConfiguracionPOS()
    ];
    
    if (resultados.every(r => r)) {
        alert('✅ Toda la configuración ha sido guardada correctamente');
    } else {
        alert('⚠️ Algunas configuraciones no se pudieron guardar');
    }
}

function restablecerConfiguracion() {
    if (confirm('¿Estás seguro de que deseas restablecer toda la configuración a los valores por defecto? Esto no se puede deshacer.')) {
        localStorage.removeItem('bsdash_empresa');
        localStorage.removeItem('bsdash_configuracion');
        localStorage.removeItem('bsdash_metodosPago');
        localStorage.removeItem('bsdash_secuencias');
        localStorage.removeItem('bsdash_usuarios');
        
        alert('Configuración restablecida. Recarga la página para ver los cambios.');
        setTimeout(() => location.reload(), 1000);
    }
}

function logout() {
    if(confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.clear();
        window.location.href = '../index.html';
    }
}