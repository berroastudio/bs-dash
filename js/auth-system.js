// js/auth-system.js - SISTEMA DE AUTENTICACIÓN SEGURO
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.sessionDuration = window.CONFIG.SESSION_TIMEOUT;
        this.checkAuth();
    }

    // ==================== AUTENTICACIÓN ====================
    async login(email, password) {
        try {
            const db = window.secureDB.load();
            if (!db || !db.usuarios) {
                console.error('❌ Error: Base de datos no disponible');
                return false;
            }

            const user = db.usuarios[email];
            if (user && user.password === this.hashPassword(password)) {
                // Crear sesión segura
                this.currentUser = {
                    email: email,
                    empresa_id: user.empresa_id,
                    rol: user.rol,
                    nombre: user.nombre,
                    login_time: Date.now()
                };

                // Guardar sesión
                sessionStorage.setItem('auth_token', this.generateToken());
                sessionStorage.setItem('user_data', JSON.stringify(this.currentUser));
                sessionStorage.setItem('session_start', Date.now().toString());

                console.log('✅ Login exitoso:', this.currentUser.email);
                return true;
            }
            
            console.warn('❌ Credenciales incorrectas para:', email);
            return false;
        } catch (error) {
            console.error('❌ Error en login:', error);
            return false;
        }
    }

    checkAuth() {
        try {
            const token = sessionStorage.getItem('auth_token');
            const userData = sessionStorage.getItem('user_data');
            const sessionStart = sessionStorage.getItem('session_start');

            if (!token || !userData || !sessionStart) {
                return false;
            }

            // Verificar tiempo de sesión
            const sessionTime = Date.now() - parseInt(sessionStart);
            if (sessionTime > this.sessionDuration) {
                console.warn('⚠️ Sesión expirada');
                this.logout();
                return false;
            }

            this.currentUser = JSON.parse(userData);
            console.log('🔐 Sesión activa:', this.currentUser.email);
            return true;
        } catch (error) {
            console.error('❌ Error verificando autenticación:', error);
            return false;
        }
    }

    logout() {
        console.log('👋 Cerrando sesión:', this.currentUser?.email);
        this.currentUser = null;
        sessionStorage.clear();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }

    // ==================== SEGURIDAD ====================
    generateToken() {
        return 'bsdash_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    hashPassword(password) {
        return btoa(password).split('').reverse().join('');
    }

    // ==================== MIDDLEWARE ====================
    requireAuth(redirectUrl = 'index.html') {
        if (!this.checkAuth()) {
            console.warn('🔒 Acceso no autorizado, redirigiendo...');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            return false;
        }
        return true;
    }

    requireRole(requiredRole, redirectUrl = 'dashboard.html') {
        if (!this.checkAuth()) {
            this.requireAuth();
            return false;
        }

        if (this.currentUser.rol !== requiredRole && this.currentUser.rol !== 'admin') {
            console.warn(`❌ Permisos insuficientes. Requerido: ${requiredRole}`);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            return false;
        }

        return true;
    }

    // ==================== GETTERS ====================
    getUser() {
        return this.currentUser;
    }

    getEmpresaId() {
        return this.currentUser ? this.currentUser.empresa_id : null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.rol === 'admin';
    }

    // ==================== GESTIÓN DE USUARIOS ====================
    async crearUsuario(email, password, empresa_id, rol = 'usuario', nombre = '') {
        if (!this.isAdmin()) {
            console.error('❌ Solo administradores pueden crear usuarios');
            return false;
        }

        try {
            const db = window.secureDB.load();
            if (!db) return false;

            if (db.usuarios[email]) {
                console.error('❌ Usuario ya existe:', email);
                return false;
            }

            db.usuarios[email] = {
                password: this.hashPassword(password),
                empresa_id: empresa_id,
                rol: rol,
                nombre: nombre,
                created_at: new Date().toISOString(),
                activo: true
            };

            if (window.secureDB.save(db)) {
                console.log('✅ Usuario creado:', email);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error creando usuario:', error);
            return false;
        }
    }

    async cambiarPassword(email, newPassword) {
        try {
            const db = window.secureDB.load();
            if (!db || !db.usuarios[email]) {
                return false;
            }

            db.usuarios[email].password = this.hashPassword(newPassword);
            return window.secureDB.save(db);
        } catch (error) {
            console.error('❌ Error cambiando password:', error);
            return false;
        }
    }
}

// Instancia global
window.auth = new AuthSystem();