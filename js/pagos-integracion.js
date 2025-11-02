// js/pagos-integration.js - INTEGRACIÓN CON TU SISTEMA DE FACTURACIÓN
console.log('🔄 Cargando integración de pagos...');

class PagosIntegration {
    constructor() {
        this.storageKey = 'bs_dash_pagos_integrated';
        this.init();
    }

    init() {
        console.log('✅ Integración de pagos inicializada');
        this.sincronizarPagosFacturas();
    }

    // SINCRONIZAR PAGOS CON FACTURAS EXISTENTES
    sincronizarPagosFacturas() {
        const facturas = JSON.parse(localStorage.getItem('bsdash_facturas') || '[]');
        const pagosExistentes = this.obtenerPagos();
        
        facturas.forEach(factura => {
            // Verificar si ya existe un pago para esta factura
            const pagoExistente = pagosExistentes.find(p => p.factura_id === factura.id);
            
            if (!pagoExistente && factura.estado !== 'anulada') {
                // Crear pago automático para facturas existentes
                this.crearPagoDesdeFactura(factura);
            }
        });
    }

    // CREAR PAGO DESDE FACTURA
    crearPagoDesdeFactura(factura) {
        const pago = {
            id: Date.now(),
            factura_id: factura.id,
            numero_factura: factura.numero,
            cliente_nombre: factura.clienteNombre,
            cliente_identificacion: factura.clienteIdentificacion,
            monto: factura.total,
            moneda: 'USD',
            metodo_pago: factura.metodoPago || 'transferencia',
            fecha_creacion: new Date().toISOString(),
            fecha_vencimiento: this.calcularFechaVencimiento(factura.fecha),
            estado: this.mapearEstadoFacturaAPago(factura.estadoPago),
            descripcion: `Pago de ${factura.tipo} ${factura.numero}`,
            empresa_id: 1, // Por defecto, se puede obtener del contexto
            historial: [{
                fecha: new Date().toISOString(),
                accion: 'creado_desde_factura',
                usuario: 'sistema'
            }]
        };

        const pagos = this.obtenerPagos();
        pagos.push(pago);
        this.guardarPagos(pagos);
        
        console.log('✅ Pago integrado para factura:', factura.numero);
        return pago;
    }

    // MAPEAR ESTADOS DE FACTURA A PAGOS
    mapearEstadoFacturaAPago(estadoFactura) {
        const mapeo = {
            'pagada': 'pagado',
            'pendiente': 'pendiente',
            'parcial': 'parcial',
            'anulada': 'cancelado'
        };
        return mapeo[estadoFactura] || 'pendiente';
    }

    // CALCULAR FECHA DE VENCIMIENTO (30 días por defecto)
    calcularFechaVencimiento(fechaFactura) {
        const fecha = new Date(fechaFactura);
        fecha.setDate(fecha.getDate() + 30);
        return fecha.toISOString();
    }

    // OBTENER REPORTES COMBINADOS
    obtenerReporteCombinado(empresaId, periodo) {
        const facturas = JSON.parse(localStorage.getItem('bsdash_facturas') || '[]');
        const pagos = this.obtenerPagos();
        
        const facturasEmpresa = facturas.filter(f => !f.empresa_id || f.empresa_id == empresaId);
        const pagosEmpresa = pagos.filter(p => p.empresa_id == empresaId);

        const reporte = {
            total_facturado: 0,
            total_cobrado: 0,
            total_pendiente: 0,
            facturas_emitidas: facturasEmpresa.length,
            pagos_procesados: pagosEmpresa.filter(p => p.estado === 'pagado').length,
            eficiencia_cobranza: 0,
            facturas: facturasEmpresa,
            pagos: pagosEmpresa
        };

        // Calcular totales
        facturasEmpresa.forEach(factura => {
            if (factura.estado !== 'anulada') {
                reporte.total_facturado += factura.total;
                
                if (factura.estadoPago === 'pagada') {
                    reporte.total_cobrado += factura.total;
                } else {
                    reporte.total_pendiente += factura.total;
                }
            }
        });

        // Calcular eficiencia de cobranza
        if (reporte.total_facturado > 0) {
            reporte.eficiencia_cobranza = (reporte.total_cobrado / reporte.total_facturado) * 100;
        }

        return reporte;
    }

    // MÉTODOS DE PERSISTENCIA
    obtenerPagos() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    guardarPagos(pagos) {
        localStorage.setItem(this.storageKey, JSON.stringify(pagos));
    }
}

// Inicializar integración
window.pagosIntegration = new PagosIntegration();