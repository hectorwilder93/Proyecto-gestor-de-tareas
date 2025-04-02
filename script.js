// Funciones comunes que pueden ser necesarias en varias páginas

// Mostrar notificación
function showNotification(title, message) {
    if (document.getElementById('notificationModal')) {
        document.getElementById('notificationTitle').textContent = title;
        document.getElementById('notificationMessage').textContent = message;
        document.getElementById('notificationModal').style.display = 'flex';
        
        document.getElementById('notificationClose').onclick = () => {
            document.getElementById('notificationModal').style.display = 'none';
        };
    } else {
        alert(`${title}: ${message}`);
    }
}

// Formatear fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Verificar si el usuario está autenticado
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    if (window.location.pathname.includes('dashboard.html') && !currentUser) {
        window.location.href = 'login.html';
    }
    
    if ((window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) && currentUser) {
        window.location.href = 'dashboard.html';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', checkAuth);