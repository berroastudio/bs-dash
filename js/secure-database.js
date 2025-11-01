// js/secure-database.js - BASE DE DATOS ENCRIPTADA
class SecureDatabase {
    constructor() {
        this.encryptionKey = window.CONFIG.ENCRYPTION_KEY;
        this.dbFile = 'bsdash_data.encrypted';
        this.backupPrefix = 'backup-bsdash-';
        this.init();
    }

    init() {
        console.log('🔄 Inicializando base de datos segura...');
        // Verificar si ya existe datos, sino crear estructura inicial
        if (!this.load()) {
            console.log('📦 Creando estructura inicial de datos...');
            this.save(this.getDefaultData());
        }
        console.log('✅ Base de datos segura lista');
    }

    // ==================== ENCRIPCIÓN ====================
    encrypt(data) {
        try {
            const text = JSON.stringify(data);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ 
                    this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            return btoa(result);
        } catch (error) {
            console.error('❌ Error encriptando datos:', error);
            return null;
        }
    }

    decrypt(encryptedData) {
        try {
            const decoded = atob(encryptedData);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(
                    decoded.charCodeAt(i) ^ 
                    this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            return JSON.parse(result);
        } catch (error) {
            console.error('❌ Error desencriptando datos:', error);
            return null;
        }
    }

    // ==================== OPERACIONES CRUD ====================
    save(data) {
        try {
            const encrypted = this.encrypt(data);
            if (encrypted) {
                localStorage.setItem(this.dbFile, encrypted);
                console.log('💾 Datos guardados correctamente');
                return true;
            }
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
        return false;
    }

    load() {
        try {
            const encrypted = localStorage.getItem(this.dbFile);
            if (encrypted) {
                const data = this.decrypt(encrypted);
                if (data) {
                    console.log('📂 Datos cargados correctamente');
                    return data;
                }
            }
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
        return null;
    }

    // ==================== BACKUP & RESTORE ====================
    backupToFile() {
        try {
            const data = this.load();
            if (!data) {
                console.error('❌ No hay datos para hacer backup');
                return false;
            }

            const blob = new Blob(
                [JSON.stringify(data, null, 2)], 
                { type: 'application/json' }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.backupPrefix}${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('📦 Backup creado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error creando backup:', error);
            return false;
        }
    }

    async restoreFromFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.save(data)) {
                        console.log('🔄 Datos restaurados correctamente');
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    console.error('❌ Error restaurando datos:', error);
                    resolve(false);
                }
            };
            reader.readAsText(file);
        });
    }

    // ==================== DATOS POR DEFECTO ====================
    getDefaultData() {
        return {
            empresas: [
                {
                    id: 1,
                    nombre: 'Empresa Principal',
                    rif: 'J-123456789',
                    direccion: 'Caracas, Venezuela',
                    telefono: '+584123456789',
                    color: '#3B82F6',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    nombre: 'Empresa Secundaria', 
                    rif: 'J-987654321',
                    direccion: 'Valencia, Venezuela',
                    telefono: '+584987654321',
                    color: '#10B981',
                    created_at: new Date().toISOString()
                }
            ],
            usuarios: {
                [window.CONFIG.ADMIN_EMAIL]: {
                    password: this.hashPassword(window.CONFIG.ADMIN_PASSWORD),
                    empresa_id: window.CONFIG.DEFAULT_EMPRESA,
                    rol: 'admin',
                    nombre: 'Administrador',
                    created_at: new Date().toISOString()
                }
            },
            clientes: {
                1: [], // Empresa 1
                2: []  // Empresa 2
            },
            productos: {
                1: [], // Empresa 1
                2: []  // Empresa 2
            },
            facturas: {
                1: [], // Empresa 1
                2: []  // Empresa 2
            },
            cotizaciones: {
                1: [], // Empresa 1
                2: []  // Empresa 2
            },
            configuracion: {
                iva: 16,
                moneda: '$',
                formato_factura: 'F-{empresa}-{numero}',
                backup_automatico: true
            },
            metadata: {
                version: '1.0.0',
                ultimo_backup: null,
                creado_en: new Date().toISOString()
            }
        };
    }

    hashPassword(password) {
        return btoa(password).split('').reverse().join('');
    }

    // ==================== UTILIDADES ====================
    clear() {
        localStorage.removeItem(this.dbFile);
        console.log('🗑️ Base de datos limpiada');
    }

    getSize() {
        const data = localStorage.getItem(this.dbFile);
        return data ? data.length : 0;
    }

    getInfo() {
        const data = this.load();
        return {
            empresas: data ? Object.keys(data.empresas || {}).length : 0,
            clientes: data ? Object.values(data.clientes || {}).flat().length : 0,
            productos: data ? Object.values(data.productos || {}).flat().length : 0,
            facturas: data ? Object.values(data.facturas || {}).flat().length : 0,
            tamaño: this.getSize(),
            ultima_actualizacion: data ? data.metadata?.creado_en : null
        };
    }
}

// Instancia global
window.secureDB = new SecureDatabase();