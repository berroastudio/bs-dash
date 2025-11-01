// Sistema multiempresa para el dashboard
class EmpresaManager {
    constructor() {
        this.empresaActual = localStorage.getItem('empresaActual') || '1';
        this.empresas = [
            { id: '1', nombre: 'Empresa Principal', color: '#3B82F6' },
            { id: '2', nombre: 'Empresa Secundaria', color: '#10B981' },
            { id: '3', nombre: 'Empresa Tres', color: '#8B5CF6' }
        ];
        
        this.init();
    }

    init() {
        this.setupSwitcher();
        this.actualizarUI();
        this.cargarDatosEmpresa();
    }

    setupSwitcher() {
        const switcher = document.getElementById('empresaSwitcher');
        if (switcher) {
            switcher.value = this.empresaActual;
            switcher.addEventListener('change', (e) => {
                this.cambiarEmpresa(e.target.value);
            });
        }
    }

    cambiarEmpresa(empresaId) {
        this.empresaActual = empresaId;
        localStorage.setItem('empresaActual', empresaId);
        
        this.actualizarUI();
        this.cargarDatosEmpresa();
        this.mostrarNotificacionCambio();
    }

    getEmpresaActual() {
        return this.empresas.find(e => e.id === this.empresaActual) || this.empresas[0];
    }

    actualizarUI() {
        const empresa = this.getEmpresaActual();
        
        // Actualizar indicador
        const indicador = document.getElementById('empresaIndicador');
        if (indicador) {
            indicador.textContent = empresa.nombre;
            indicador.style.backgroundColor = empresa.color;
        }

        // Actualizar color del tema
        document.documentElement.style.setProperty('--empresa-color', empresa.color);
    }

    cargarDatosEmpresa() {
        console.log(`📊 Cargando datos para: ${this.getEmpresaActual().nombre}`);
        this.actualizarEstadisticas();
    }

    actualizarEstadisticas() {
        // Datos diferentes por empresa
        const datosPorEmpresa = {
            '1': { ventas: 15000, clientes: 45, crecimiento: 12 },
            '2': { ventas: 8500, clientes: 28, crecimiento: 8 },
            '3': { ventas: 22000, clientes: 67, crecimiento: 15 }
        };
        
        const datos = datosPorEmpresa[this.empresaActual];
        
        // Actualizar elementos en el dashboard
        const elementosVentas = document.querySelectorAll('[data-ventas]');
        elementosVentas.forEach(el => {
            el.textContent = `$${datos.ventas.toLocaleString()}`;
        });
    }

    mostrarNotificacionCambio() {
        const notificacion = document.createElement('div');
        notificacion.className = 'empresa-notificacion';
        notificacion.innerHTML = `✅ Cambiado a: <strong>${this.getEmpresaActual().nombre}</strong>`;
        
        Object.assign(notificacion.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#10B981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '1000'
        });
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }
}

// Inicializar cuando cargue el dashboard
document.addEventListener('DOMContentLoaded', function() {
    window.empresaManager = new EmpresaManager();
});