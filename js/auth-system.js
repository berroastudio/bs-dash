// js/auth-system.js - VERSIÓN CON MULTIEMPRESAS
console.log('🔐 Cargando auth-system.js...');

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'bs_dash_auth';
        console.log('✅ Auth system inicializado');
        this.checkAuth(); // Verificar sesión existente
    }

    async login(email, password) {
        console.log('🔐 Intentando login:', email);
        
        try {
            // Verificar credenciales con CONFIG
            if (email === CONFIG.ADMIN_EMAIL && password === CONFIG.ADMIN_PASSWORD) {
                this.currentUser = {
                    email: email,
                    name: 'Administrador',
                    role: 'superadmin',
                    empresa_id: CONFIG.DEFAULT_EMPRESA
                };
                
                // Guardar sesión
                this.saveSession();
                console.log('✅ Login exitoso para empresa:', CONFIG.DEFAULT_EMPRESA);
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
        const sessionData = {
            user: this.currentUser,
            loginTime: new Date().getTime(),
            expiresAt: new Date().getTime() + CONFIG.SESSION_TIMEOUT
        };
        localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    }

    checkAuth() {
        try {
            const session = localStorage.getItem(this.storageKey);
            if (!session) return false;

            const sessionData = JSON.parse(session);
            const now = new Date().getTime();

            // Verificar si la sesión expiró
            if (now > sessionData.expiresAt) {
                this.logout();
                return false;
            }

            this.currentUser = sessionData.user;
            console.log('✅ Sesión recuperada:', this.currentUser.email);
            return true;
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return false;
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
        console.log('👋 Sesión cerrada');
    }
}

// Inicializar
window.auth = new AuthSystem();