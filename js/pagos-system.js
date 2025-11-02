// js/pagos-system.js - SISTEMA COMPLETO DE PAGOS
console.log('💳 Cargando sistema de pagos...');

class PagosSystem {
    constructor() {
        this.storageKey = 'bs_dash_pagos';
        this.monedas = ['USD', 'EUR', 'BS'];
        this.estados = ['pendiente', 'pagado', 'vencido', 'cancelado'];
        this.metodosPago = ['transferencia', 'efectivo', 'tarjeta', 'pago_movil'];
        this.init();
    }

    init() {
        console.log('✅ Sistema de pagos inicializado');
    }

    // CREAR NUEVO PAGO
    async crearPago(pagoData) {
        const pagos = this.obtenerPagos();
        const nuevoPago = {
            id: Date.now(),
            ...pagoData,
            numero_factura: this.generarNumeroFactura(),
            fecha_creacion: new Date().toISOString(),
            estado: 'pendiente',
            historial: [{
                fecha: new Date().toISOString(),
                accion: 'creado',
                usuario: window.auth?.currentUser?.email || 'sistema'
            }]
        };

        pagos.push(nuevoPago);
        this.guardarPagos(pagos);
        
        console.log('✅ Pago creado:', nuevoPago.numero_factura);
        return nuevoPago;
    }

    // OBTENER PAGOS POR EMPRESA
    obtenerPagosPorEmpresa(empresaId, filtros = {}) {
        let pagos = this.obtenerPagos().filter(pago => pago.empresa_id == empresaId);
        
        // Aplicar filtros
        if (filtros.estado) {
            pagos = pagos.filter(pago => pago.estado === filtros.estado);
        }
        if (filtros.mes) {
            pagos = pagos.filter(pago => {
                const fecha = new Date(pago.fecha_creacion);
                return fecha.getMonth() + 1 == filtros.mes && fecha.getFullYear() == (filtros.anio || new Date().getFullYear());
            });
        }
        if (filtros.cliente) {
            pagos = pagos.filter(pago => 
                pago.cliente_nombre.toLowerCase().includes(filtros.cliente.toLowerCase()) ||
                pago.cliente_identificacion.includes(filtros.cliente)
            );
        }

        return pagos.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    }

    // ACTUALIZAR ESTADO DE PAGO
    async actualizarEstadoPago(pagoId, nuevoEstado, notas = '') {
        const pagos = this.obtenerPagos();
        const pagoIndex = pagos.findIndex(p => p.id == pagoId);
        
        if (pagoIndex !== -1) {
            pagos[pagoIndex].estado = nuevoEstado;
            pagos[pagoIndex].fecha_actualizacion = new Date().toISOString();
            pagos[pagoIndex].historial.push({
                fecha: new Date().toISOString(),
                accion: `estado_cambiado_a_${nuevoEstado}`,
                usuario: window.auth?.currentUser?.email || 'sistema',
                notas: notas
            });

            if (nuevoEstado === 'pagado') {
                pagos[pagoIndex].fecha_pago = new Date().toISOString();
            }

            this.guardarPagos(pagos);
            console.log('✅ Estado actualizado:', pagoId, '->', nuevoEstado);
            return true;
        }
        return false;
    }

    // GENERAR REPORTES FINANCIEROS
    generarReporteFinanciero(empresaId, periodo) {
        const pagos = this.obtenerPagosPorEmpresa(empresaId);
        const ahora = new Date();
        let pagosFiltrados = [];

        switch (periodo) {
            case 'mes_actual':
                pagosFiltrados = pagos.filter(pago => {
                    const fechaPago = new Date(pago.fecha_creacion);
                    return fechaPago.getMonth() === ahora.getMonth() && 
                           fechaPago.getFullYear() === ahora.getFullYear();
                });
                break;
            case 'trimestre_actual':
                pagosFiltrados = pagos.filter(pago => {
                    const fechaPago = new Date(pago.fecha_creacion);
                    const trimestreActual = Math.floor(ahora.getMonth() / 3);
                    const trimestrePago = Math.floor(fechaPago.getMonth() / 3);
                    return trimestrePago === trimestreActual && 
                           fechaPago.getFullYear() === ahora.getFullYear();
                });
                break;
            case 'anio_actual':
                pagosFiltrados = pagos.filter(pago => {
                    const fechaPago = new Date(pago.fecha_creacion);
                    return fechaPago.getFullYear() === ahora.getFullYear();
                });
                break;
            default:
                pagosFiltrados = pagos;
        }

        const reporte = {
            total_ingresos: 0,
            total_pendientes: 0,
            total_pagados: 0,
            total_vencidos: 0,
            por_metodo_pago: {},
            por_estado: {},
            pagos: pagosFiltrados
        };

        pagosFiltrados.forEach(pago => {
            if (pago.estado === 'pagado') {
                reporte.total_ingresos += pago.monto;
                reporte.total_pagados++;
            } else if (pago.estado === 'pendiente') {
                reporte.total_pendientes++;
            } else if (pago.estado === 'vencido') {
                reporte.total_vencidos++;
            }

            // Estadísticas por método de pago
            reporte.por_metodo_pago[pago.metodo_pago] = 
                (reporte.por_metodo_pago[pago.metodo_pago] || 0) + pago.monto;

            // Estadísticas por estado
            reporte.por_estado[pago.estado] = 
                (reporte.por_estado[pago.estado] || 0) + 1;
        });

        return reporte;
    }

    // MÉTODOS DE UTILIDAD
    generarNumeroFactura() {
        const ahora = new Date();
        const timestamp = ahora.getTime();
        const random = Math.floor(Math.random() * 1000);
        return `FACT-${ahora.getFullYear()}${(ahora.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
    }

    obtenerPagos() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    guardarPagos(pagos) {
        localStorage.setItem(this.storageKey, JSON.stringify(pagos));
    }

    // OBTENER ESTADÍSTICAS RÁPIDAS
    obtenerEstadisticasRapidas(empresaId) {
        const pagos = this.obtenerPagosPorEmpresa(empresaId);
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const anioActual = ahora.getFullYear();

        const pagosMesActual = pagos.filter(pago => {
            const fechaPago = new Date(pago.fecha_creacion);
            return fechaPago.getMonth() === mesActual && 
                   fechaPago.getFullYear() === anioActual;
        });

        const ingresosMes = pagosMesActual
            .filter(p => p.estado === 'pagado')
            .reduce((sum, p) => sum + p.monto, 0);

        const pendientes = pagos.filter(p => p.estado === 'pendiente').length;
        const vencidos = pagos.filter(p => p.estado === 'vencido').length;

        return {
            ingresos_mes_actual: ingresosMes,
            pagos_pendientes: pendientes,
            pagos_vencidos: vencidos,
            total_pagos: pagos.length
        };
    }
}

// Inicializar sistema de pagos
window.pagosSystem = new PagosSystem();