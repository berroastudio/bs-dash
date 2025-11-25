// js/simple-dashboard.js - SISTEMA DEL DASHBOARD
console.log('📊 Cargando dashboard simple...');

class SimpleDashboard {
    constructor() {
        this.init();
    }

    init() {
        // Verificar autenticación
        if (!window.simpleAuth || !window.simpleAuth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        console.log('✅ Dashboard cargado para:', window.simpleAuth.currentUser.email);
        this.loadUserInfo();
    }

    loadUserInfo() {
        const user = window.simpleAuth.currentUser;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userRole').textContent = user.role;
    }

    logout() {
        window.simpleAuth.logout();
        window.location.href = 'index.html';
    }
}

// Inicializar cuando esté listo el DOM
document.addEventListener('DOMContentLoaded', function() {
    window.simpleDashboard = new SimpleDashboard();
});
