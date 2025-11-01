// js/file-database.js - SISTEMA DE ARCHIVOS EN DISCO
class FileDatabase {
    constructor() {
        this.dataPath = './data/';
        this.ensureDataDirectory();
    }

    ensureDataDirectory() {
        // En un entorno real, esto crearía la carpeta data/
        // Por ahora usamos localStorage como simulador
        console.log('📁 Sistema de archivos local inicializado');
    }

    // ==================== CLIENTES ====================
    getClientes() {
        try {
            const data = localStorage.getItem('bs_clientes');
            return data ? JSON.parse(data) : this.getClientesDefault();
        } catch (error) {
            console.error('Error leyendo clientes:', error);
            return this.getClientesDefault();
        }
    }

    guardarCliente(cliente) {
        try {
            const clientes = this.getClientes();
            const clienteExistente = clientes.find(c => c.id === cliente.id);
            
            if (clienteExistente) {
                // Actualizar
                Object.assign(clienteExistente, cliente);
            } else {
                // Nuevo cliente
                cliente.id = cliente.id || 'cli_' + Date.now();
                cliente.createdAt = new Date().toISOString();
                clientes.push(cliente);
            }
            
            localStorage.setItem('bs_clientes', JSON.stringify(clientes));
            return true;
        } catch (error) {
            console.error('Error guardando cliente:', error);
            return false;
        }
    }

    getClientesDefault() {
        return [
            {
                id: 'cli_consumidor_final',
                codigo: 'CF',
                nombre: 'CONSUMIDOR FINAL',
                identificacion: '000-000000-0',
                telefono: '',
                email: '',
                direccion: '',
                tipo: 'consumidor_final',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // ==================== FACTURAS ====================
    getFacturas() {
        try {
            const data = localStorage.getItem('bs_facturas');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error leyendo facturas:', error);
            return [];
        }
    }

    guardarFactura(factura) {
        try {
            const facturas = this.getFacturas();
            
            // Generar número de factura
            if (!factura.numero) {
                const secuencia = this.getSecuencia('facturas');
                factura.numero = `FACT-${secuencia.proximo.toString().padStart(3, '0')}`;
                this.incrementarSecuencia('facturas');
            }
            
            factura.id = factura.id || 'fact_' + Date.now();
            factura.createdAt = factura.createdAt || new Date().toISOString();
            factura.updatedAt = new Date().toISOString();
            
            facturas.push(factura);
            localStorage.setItem('bs_facturas', JSON.stringify(facturas));
            
            console.log('✅ Factura guardada:', factura.numero);
            return true;
        } catch (error) {
            console.error('Error guardando factura:', error);
            return false;
        }
    }

    // ==================== SECUENCIAS ====================
    getSecuencia(tipo) {
        const secuencias = {
            facturas: { proximo: 1, prefijo: 'FACT', ceros: 3 },
            cotizaciones: { proximo: 1, prefijo: 'COT', ceros: 3 },
            ordenes: { proximo: 1, prefijo: 'ORD', ceros: 3 }
        };
        
        const stored = localStorage.getItem('bs_secuencias');
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed[tipo] || secuencias[tipo];
        }
        
        return secuencias[tipo];
    }

    incrementarSecuencia(tipo) {
        const secuencias = JSON.parse(localStorage.getItem('bs_secuencias') || '{}');
        if (!secuencias[tipo]) {
            secuencias[tipo] = this.getSecuencia(tipo);
        }
        secuencias[tipo].proximo++;
        localStorage.setItem('bs_secuencias', JSON.stringify(secuencias));
    }

    // ==================== PRODUCTOS ====================
    getProductos() {
        try {
            const data = localStorage.getItem('bs_productos');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error leyendo productos:', error);
            return [];
        }
    }

    // ==================== CONFIGURACIÓN ====================
    getConfiguracion() {
        return {
            paises: [
                { codigo: 'RD', nombre: 'República Dominicana', moneda: 'RD$', decimales: 2, estados: [] },
                { codigo: 'US', nombre: 'Estados Unidos', moneda: 'US$', decimales: 2, estados: ['NY', 'CA', 'TX', 'FL', 'IL'] }
            ],
            metodosPago: ['Efectivo', 'Tarjeta Débito', 'Tarjeta Crédito', 'Transferencia', 'Cheque'],
            tiposComprobante: ['Consumidor Final', 'Factura con Valor Fiscal', 'Factura Gubernamental', 'Factura Especial'],
            iva: 18,
            redondeo: true,
            plazoEntrega: 7
        };
    }
}

// Inicializar globalmente
window.fileDB = new FileDatabase();