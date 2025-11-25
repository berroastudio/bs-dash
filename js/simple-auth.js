// js/simple-auth.js - SISTEMA COMPLETO EN UN ARCHIVO
console.log('🔐 Cargando sistema de autenticación simple...');

class SimpleAuth {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'bs_dash_simple';
        this.init();
    }

    init() {
        console.log('🔄 Inicializando sistema simple...');
        this.initDatabase();
        this.checkExistingSession();
    }

    initDatabase() {
        // Datos por defecto - CAMBIA AQUÍ TUS CREDENCIALES
        const defaultData = {
            users: [{
                id: 1,
                email: 'admin@berroa.com',  // ← TU EMAIL
                password: '809415',         // ← TU CONTRASEÑA
                name: 'Administrador',
                role: 'superadmin'
            }]
        };

        // Guardar datos por defecto si no existen
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
            console.log('✅ Base de datos inicializada');
        }
    }

    async login(email, password) {
        console.log('🔐 Intentando login:', email);
        
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey));
            const user = data.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.currentUser = user;
                this.saveSession();
                console.log('✅ Login exitoso');
                return true;
            } else {
                console.log('❌ Credenciales incorrectas');
                return false;
            }
        } catch (error) {
            console.error('💥 Error en login:', error);
            return false;
        }
    }

    saveSession() {
        const session = {
            user: this.currentUser,
            loginTime: new Date().getTime()
        };
        localStorage.setItem('bs_dash_session', JSON.stringify(session));
    }

    checkExistingSession() {
        const session = localStorage.getItem('bs_dash_session');
        if (session) {
            this.currentUser = JSON.parse(session).user;
            console.log('✅ Sesión recuperada:', this.currentUser.email);
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('bs_dash_session');
    }
}

// Inicializar
window.simpleAuth = new SimpleAuth();