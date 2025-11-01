// database.js - Base de datos simulada para BS Dash
class Database {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('bsdash_initialized')) {
            const initialData = {
                users: [
                    {
                        id: 1,
                        email: 'admin@bsdash.com',
                        password: '1234',
                        nombre: 'John Berroa',
                        empresa: 'Berroa Studio',
                        rol: 'admin',
                        activo: true
                    }
                ],
                empresas: [
                    {
                        id: 1,
                        nombre: 'Berroa Studio',
                        ruc: '1234567890001',
                        telefono: '+593 123456789',
                        email: 'info@berroastudio.com',
                        direccion: 'Quito, Ecuador'
                    }
                ],
                productos: [
                    {
                        id: 1,
                        codigo: 'PROD001',
                        nombre: 'Laptop Dell XPS 13',
                        descripcion: 'Laptop ultradelgada 13 pulgadas',
                        categoria: 'Tecnología',
                        precio_compra: 800,
                        precio_venta: 1200,
                        stock: 15,
                        stock_minimo: 3,
                        activo: true
                    },
                    {
                        id: 2,
                        codigo: 'PROD002',
                        nombre: 'Mouse Inalámbrico',
                        descripcion: 'Mouse ergonómico inalámbrico',
                        categoria: 'Tecnología',
                        precio_compra: 15,
                        precio_venta: 35,
                        stock: 50,
                        stock_minimo: 10,
                        activo: true
                    }
                ],
                clientes: [
                    {
                        id: 1,
                        codigo: 'CLI001',
                        nombre: 'Cliente Corporativo SA',
                        ruc_ci: '1234567890001',
                        telefono: '+593 987654321',
                        email: 'cliente@corporativo.com',
                        direccion: 'Quito, Ecuador'
                    }
                ]
            };

            Object.keys(initialData).forEach(key => {
                localStorage.setItem(`bsdash_${key}`, JSON.stringify(initialData[key]));
            });

            localStorage.setItem('bsdash_initialized', 'true');
        }
    }

    get(table) {
        const data = localStorage.getItem(`bsdash_${table}`);
        return data ? JSON.parse(data) : [];
    }

    set(table, data) {
        localStorage.setItem(`bsdash_${table}`, JSON.stringify(data));
    }

    getUserByEmail(email) {
        const users = this.get('users');
        return users.find(user => user.email === email && user.activo);
    }

    getProductos() {
        return this.get('productos');
    }

    getClientes() {
        return this.get('clientes');
    }
}

const db = new Database();