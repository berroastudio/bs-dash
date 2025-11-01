// js/database-manager.js - GESTOR DE BASE DE DATOS
class DatabaseManager {
    constructor() {
        this.db = window.secureDB;
        this.auth = window.auth;
        this.data = this.db.load() || this.db.getDefaultData();
    }

    // ==================== EMPRESAS ====================
    getEmpresas() {
        return this.data.empresas || [];
    }

    getEmpresa(id) {
        return this.data.empresas.find(e => e.id === parseInt(id));
    }

    async crearEmpresa(nombre, rif, direccion, telefono, color = '#3B82F6') {
        if (!this.auth.isAdmin()) {
            throw new Error('Solo administradores pueden crear empresas');
        }

        const nuevaEmpresa = {
            id: this.generarId(),
            nombre,
            rif,
            direccion,
            telefono,
            color,
            created_at: new Date().toISOString()
        };

        this.data.empresas.push(nuevaEmpresa);
        
        // Inicializar datos para la nueva empresa
        this.data.clientes[nuevaEmpresa.id] = [];
        this.data.productos[nuevaEmpresa.id] = [];
        this.data.facturas[nuevaEmpresa.id] = [];
        this.data.cotizaciones[nuevaEmpresa.id] = [];

        await this.save();
        return nuevaEmpresa;
    }

    // ==================== CLIENTES ====================
    getClientes(empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        return this.data.clientes[empresa] || [];
    }

    getCliente(id, empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        return this.getClientes(empresa).find(c => c.id === id);
    }

    async crearCliente(clienteData, empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        if (!this.data.clientes[empresa]) {
            this.data.clientes[empresa] = [];
        }

        const nuevoCliente = {
            id: this.generarId(),
            ...clienteData,
            empresa_id: empresa,
            created_at: new Date().toISOString(),
            activo: true
        };

        this.data.clientes[empresa].push(nuevoCliente);
        await this.save();
        return nuevoCliente;
    }

    async actualizarCliente(id, clienteData, empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        const index = this.getClientes(empresa).findIndex(c => c.id === id);
        
        if (index !== -1) {
            this.data.clientes[empresa][index] = {
                ...this.data.clientes[empresa][index],
                ...clienteData,
                updated_at: new Date().toISOString()
            };
            await this.save();
            return this.data.clientes[empresa][index];
        }
        return null;
    }

    // ==================== PRODUCTOS ====================
    getProductos(empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        return this.data.productos[empresa] || [];
    }

    getProducto(id, empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        return this.getProductos(empresa).find(p => p.id === id);
    }

    async crearProducto(productoData, empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        if (!this.data.productos[empresa]) {
            this.data.productos[empresa] = [];
        }

        const nuevoProducto = {
            id: this.generarId(),
            ...productoData,
            empresa_id: empresa,
            created_at: new Date().toISOString(),
            activo: true
        };

        this.data.productos[empresa].push(nuevoProducto);
        await this.save();
        return nuevoProducto;
    }

    async actualizarStock(id, cantidad, empresaId = null) {
        const producto = this.getProducto(id, empresaId);
        if (producto && producto.stock !== null) {
            producto.stock += cantidad;
            producto.updated_at = new Date().toISOString();
            await this.save();
            return producto;
        }
        return null;
    }

    // ==================== FACTURAS ====================
    getFacturas(empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        return this.data.facturas[empresa] || [];
    }

    async crearFactura(facturaData, empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        if (!this.data.facturas[empresa]) {
            this.data.facturas[empresa] = [];
        }

        const nuevaFactura = {
            id: this.generarId(),
            numero: this.generarNumeroFactura(empresa),
            ...facturaData,
            empresa_id: empresa,
            fecha: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            estado: 'pendiente'
        };

        // Actualizar stock si hay productos
        if (nuevaFactura.productos) {
            for (const producto of nuevaFactura.productos) {
                await this.actualizarStock(producto.id, -producto.cantidad, empresa);
            }
        }

        this.data.facturas[empresa].push(nuevaFactura);
        await this.save();
        return nuevaFactura;
    }

    generarNumeroFactura(empresaId) {
        const facturas = this.getFacturas(empresaId);
        const formato = this.data.configuracion?.formato_factura || 'F-{empresa}-{numero}';
        const nextNum = facturas.length + 1;
        
        return formato
            .replace('{empresa}', empresaId)
            .replace('{numero}', String(nextNum).padStart(6, '0'));
    }

    // ==================== ESTADÍSTICAS ====================
    getEstadisticas(empresaId = null) {
        const empresa = empresaId || this.auth.getEmpresaId();
        const hoy = new Date().toISOString().split('T')[0];
        
        const facturas = this.getFacturas(empresa);
        const productos = this.getProductos(empresa);
        const clientes = this.getClientes(empresa);

        const ventasHoy = facturas
            .filter(f => f.fecha === hoy)
            .reduce((sum, f) => sum + (f.total || 0), 0);

        const productosBajoStock = productos.filter(p => 
            p.stock !== null && p.stock < 10
        ).length;

        const ordenesPendientes = facturas.filter(f => 
            f.estado === 'pendiente'
        ).length;

        return {
            ventas: ventasHoy,
            productos: productos.length,
            productosBajoStock,
            ordenesPendientes,
            clientes: clientes.length,
            facturas_mes: facturas.filter(f => 
                f.fecha.startsWith(hoy.substring(0, 7))
            ).length
        };
    }

    // ==================== UTILIDADES ====================
    generarId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    async save() {
        this.data.metadata = {
            ...this.data.metadata,
            ultima_actualizacion: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return this.db.save(this.data);
    }

    async backup() {
        return this.db.backupToFile();
    }

    async restore(file) {
        const success = await this.db.restoreFromFile(file);
        if (success) {
            this.data = this.db.load();
        }
        return success;
    }

    getInfo() {
        return this.db.getInfo();
    }

    // ==================== CONFIGURACIÓN ====================
    getConfiguracion() {
        return this.data.configuracion || {};
    }

    async actualizarConfiguracion(nuevaConfig) {
        this.data.configuracion = {
            ...this.data.configuracion,
            ...nuevaConfig
        };
        await this.save();
        return this.data.configuracion;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.dbManager = new DatabaseManager();
    console.log('🎯 Database Manager inicializado');
});