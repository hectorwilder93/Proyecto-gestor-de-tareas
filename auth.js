// Simulación de base de datos de usuarios
let users = JSON.parse(localStorage.getItem('todoUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutLink = document.getElementById('logoutLink');

// Eventos
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

if (logoutLink) {
    logoutLink.addEventListener('click', handleLogout);
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html') && !currentUser) {
        window.location.href = 'login.html';
    }
    
    if (currentUser) {
        updateUIForLoggedInUser();
    }
});

// Funciones
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Éxito', 'Inicio de sesión exitoso.');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showNotification('Error', 'Correo electrónico o contraseña incorrectos.');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Error', 'Las contraseñas no coinciden.');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showNotification('Error', 'Este correo electrónico ya está registrado.');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: 'user', // Por defecto todos son usuarios normales
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('todoUsers', JSON.stringify(users));
    
    showNotification('Éxito', 'Registro exitoso. Redirigiendo...');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    // Actualizar dashboard
    if (document.getElementById('usernameDisplay')) {
        document.getElementById('usernameDisplay').textContent = currentUser.name;
        document.getElementById('userRoleDisplay').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Usuario';
    }
    
    // Mostrar enlace de admin si es necesario
    if (document.getElementById('adminLink') && currentUser.role === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
    }
    
    // Actualizar perfil
    if (document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Usuario';
        document.getElementById('profileNameInput').value = currentUser.name;
        document.getElementById('profileEmailInput').value = currentUser.email;
    }
}

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