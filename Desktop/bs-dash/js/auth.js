// auth.js - Sistema de autenticación BS Dash
function loginUser(email, password) {
    const user = db.getUserByEmail(email);
    
    if (user && user.password === password) {
        // Guardar sesión
        localStorage.setItem('userName', user.nombre);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('empresaNombre', user.empresa);
        localStorage.setItem('userRol', user.rol);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
        return true;
    } else {
        alert('Credenciales incorrectas');
        return false;
    }
}

// Evento del formulario
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    loginUser(email, password);
});

// Verificar si ya está logueado
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
});