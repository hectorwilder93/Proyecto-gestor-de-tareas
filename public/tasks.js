// Simulación de base de datos de tareas
let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
let currentTaskId = null;

// Elementos del DOM
const viewTasksLink = document.getElementById('viewTasks');
const createTaskLink = document.getElementById('createTask');
const viewProfileLink = document.getElementById('viewProfile');
const tasksSection = document.getElementById('tasksSection');
const createTaskSection = document.getElementById('createTaskSection');
const editTaskSection = document.getElementById('editTaskSection');
const taskDetailSection = document.getElementById('taskDetailSection');
const profileSection = document.getElementById('profileSection');
const taskForm = document.getElementById('taskForm');
const editTaskForm = document.getElementById('editTaskForm');
const profileForm = document.getElementById('profileForm');
const tasksList = document.getElementById('tasksList');
const filterPriority = document.getElementById('filterPriority');
const filterStatus = document.getElementById('filterStatus');
const backToTasks = document.getElementById('backToTasks');
const cancelTask = document.getElementById('cancelTask');
const cancelEdit = document.getElementById('cancelEdit');
const editDetailTask = document.getElementById('editDetailTask');
const deleteDetailTask = document.getElementById('deleteDetailTask');

// Eventos
if (viewTasksLink) viewTasksLink.addEventListener('click', showTasksSection);
if (createTaskLink) createTaskLink.addEventListener('click', showCreateTaskSection);
if (viewProfileLink) viewProfileLink.addEventListener('click', showProfileSection);
if (taskForm) taskForm.addEventListener('submit', handleTaskSubmit);
if (editTaskForm) editTaskForm.addEventListener('submit', handleEditTaskSubmit);
if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
if (filterPriority) filterPriority.addEventListener('change', renderTasks);
if (filterStatus) filterStatus.addEventListener('change', renderTasks);
if (backToTasks) backToTasks.addEventListener('click', showTasksSection);
if (cancelTask) cancelTask.addEventListener('click', showTasksSection);
if (cancelEdit) cancelEdit.addEventListener('click', showTasksSection);
if (editDetailTask) editDetailTask.addEventListener('click', editCurrentTask);
if (deleteDetailTask) deleteDetailTask.addEventListener('click', () => {
    showConfirmModal('Eliminar Tarea', '¿Estás seguro de que deseas eliminar esta tarea?', deleteCurrentTask);
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        renderTasks();
        checkTaskReminders();
        setInterval(checkTaskReminders, 60000); // Revisar recordatorios cada minuto
    }
});

// Funciones
function showTasksSection(e) {
    if (e) e.preventDefault();
    tasksSection.style.display = 'block';
    createTaskSection.style.display = 'none';
    editTaskSection.style.display = 'none';
    taskDetailSection.style.display = 'none';
    profileSection.style.display = 'none';
    renderTasks();
}

function showCreateTaskSection(e) {
    if (e) e.preventDefault();
    tasksSection.style.display = 'none';
    createTaskSection.style.display = 'block';
    editTaskSection.style.display = 'none';
    taskDetailSection.style.display = 'none';
    profileSection.style.display = 'none';
    
    // Resetear formulario
    taskForm.reset();
    document.getElementById('taskDueDate').valueAsDate = new Date();
}

function showEditTaskSection() {
    tasksSection.style.display = 'none';
    createTaskSection.style.display = 'none';
    editTaskSection.style.display = 'block';
    taskDetailSection.style.display = 'none';
    profileSection.style.display = 'none';
}

function showTaskDetailSection() {
    tasksSection.style.display = 'none';
    createTaskSection.style.display = 'none';
    editTaskSection.style.display = 'none';
    taskDetailSection.style.display = 'block';
    profileSection.style.display = 'none';
}

function showProfileSection(e) {
    if (e) e.preventDefault();
    tasksSection.style.display = 'none';
    createTaskSection.style.display = 'none';
    editTaskSection.style.display = 'none';
    taskDetailSection.style.display = 'none';
    profileSection.style.display = 'block';
}

function renderTasks() {
    if (!tasksList) return;
    
    const priorityFilter = filterPriority ? filterPriority.value : 'all';
    const statusFilter = filterStatus ? filterStatus.value : 'all';
    
    let filteredTasks = tasks.filter(task => {
        // Filtrar por usuario (excepto para admin)
        if (currentUser.role !== 'admin' && task.userId !== currentUser.id) {
            return false;
        }
        
        // Filtrar por prioridad
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
            return false;
        }
        
        // Filtrar por estado
        if (statusFilter !== 'all') {
            const now = new Date();
            const dueDate = new Date(task.dueDate);
            
            if (statusFilter === 'pending' && (task.status !== 'pending' || dueDate < now)) {
                return false;
            }
            
            if (statusFilter === 'completed' && task.status !== 'completed') {
                return false;
            }
            
            if (statusFilter === 'overdue' && (task.status === 'completed' || dueDate >= now)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Ordenar por fecha de vencimiento (las más cercanas primero)
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    tasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p class="no-tasks">No hay tareas que mostrar.</p>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < now && task.status !== 'completed';
        
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.priority} ${isOverdue ? 'overdue' : ''} ${task.status === 'completed' ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <div class="task-title">
                <span>${task.title}</span>
                <span class="task-status">${task.status === 'completed' ? 'Completada' : isOverdue ? 'Vencida' : 'Pendiente'}</span>
            </div>
            <div class="task-due-date">
                <i class="far fa-calendar-alt"></i> 
                Vence: ${formatDate(task.dueDate)}
            </div>
            <div class="task-description">${task.description}</div>
            <span class="task-priority ${task.priority}">
                ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'} Prioridad
            </span>
            <div class="task-actions">
                <button class="btn btn-primary view-task" data-id="${task.id}">Ver</button>
                <button class="btn btn-secondary edit-task" data-id="${task.id}">Editar</button>
                <button class="btn btn-danger delete-task" data-id="${task.id}">Eliminar</button>
            </div>
        `;
        
        tasksList.appendChild(taskElement);
    });
    
    // Agregar eventos a los botones
    document.querySelectorAll('.view-task').forEach(btn => {
        btn.addEventListener('click', (e) => viewTask(e.target.dataset.id));
    });
    
    document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', (e) => editTask(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showConfirmModal('Eliminar Tarea', '¿Estás seguro de que deseas eliminar esta tarea?', () => deleteTask(e.target.dataset.id));
        });
    });
}

function viewTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentTaskId = taskId;
    
    document.getElementById('detailTitle').textContent = task.title;
    document.getElementById('detailDescription').textContent = task.description;
    document.getElementById('detailDueDate').textContent = `Vence: ${formatDate(task.dueDate)}`;
    
    const priorityElement = document.getElementById('detailPriority');
    priorityElement.textContent = task.priority === 'high' ? 'Alta Prioridad' : task.priority === 'medium' ? 'Media Prioridad' : 'Baja Prioridad';
    priorityElement.className = `priority ${task.priority}`;
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < now && task.status !== 'completed';
    
    const statusElement = document.getElementById('detailStatus');
    statusElement.textContent = task.status === 'completed' ? 'Completada' : isOverdue ? 'Vencida' : 'Pendiente';
    statusElement.className = `status ${task.status === 'completed' ? 'completed' : isOverdue ? 'overdue' : 'pending'}`;
    
    const reminderElement = document.getElementById('detailReminder');
    const reminderContainer = document.getElementById('detailReminderContainer');
    
    if (task.reminder) {
        reminderElement.textContent = `Recordatorio: ${formatDateTime(task.reminder)}`;
        reminderContainer.style.display = 'flex';
    } else {
        reminderContainer.style.display = 'none';
    }
    
    showTaskDetailSection();
}
//Editar las tareas
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentTaskId = taskId;
    
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskDueDate').value = task.dueDate.split('T')[0];
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskStatus').value = task.status;
    
    if (task.reminder) {
        document.getElementById('editTaskReminder').value = task.reminder.replace('Z', '').slice(0, 16);
    } else {
        document.getElementById('editTaskReminder').value = '';
    }
    
    showEditTaskSection();
}

function editCurrentTask() {
    if (currentTaskId) {
        editTask(currentTaskId);
    }
}

function deleteCurrentTask() {
    if (currentTaskId) {
        deleteTask(currentTaskId);
        showTasksSection();
    }
}

//CRear las tareas
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const reminder = document.getElementById('taskReminder').value;
    
    const newTask = {
        id: Date.now().toString(),
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        status: 'pending',
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        reminder: reminder ? new Date(reminder).toISOString() : null
    };
    
    tasks.push(newTask);
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
    
    showNotification('Éxito', 'Tarea creada correctamente.');
    showTasksSection();
}

//Editar las tareas
function handleEditTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const dueDate = document.getElementById('editTaskDueDate').value;
    const priority = document.getElementById('editTaskPriority').value;
    const status = document.getElementById('editTaskStatus').value;
    const reminder = document.getElementById('editTaskReminder').value;
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title,
            description,
            dueDate: new Date(dueDate).toISOString(),
            priority,
            status,
            reminder: reminder ? new Date(reminder).toISOString() : null
        };
        
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        showNotification('Éxito', 'Tarea actualizada correctamente.');
        showTasksSection();
    }
}

//Eliminar tareas
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
    renderTasks();
    showNotification('Éxito', 'Tarea eliminada correctamente.');
}

//Actualizar el perfil
function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('profileNameInput').value;
    const email = document.getElementById('profileEmailInput').value;
    const currentPassword = document.getElementById('profileCurrentPassword').value;
    const newPassword = document.getElementById('profileNewPassword').value;
    const confirmPassword = document.getElementById('profileConfirmPassword').value;
    
    // Validar cambios de contraseña
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            showNotification('Error', 'Las nuevas contraseñas no coinciden.');
            return;
        }
        
        if (currentUser.password !== currentPassword) {
            showNotification('Error', 'La contraseña actual es incorrecta.');
            return;
        }
    }
    
    // Actualizar usuario
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            name,
            email,
            password: newPassword || users[userIndex].password
        };
        
        localStorage.setItem('todoUsers', JSON.stringify(users));
        
        // Actualizar usuario actual
        currentUser = users[userIndex];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUIForLoggedInUser();
        showNotification('Éxito', 'Perfil actualizado correctamente.');
    }
    setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
}

function checkTaskReminders() {
    const now = new Date();
    
    tasks.forEach(task => {
        if (task.reminder && task.userId === currentUser.id && task.status !== 'completed') {
            const reminderTime = new Date(task.reminder);
            const dueDate = new Date(task.dueDate);
            
            // Mostrar notificación si el recordatorio está dentro de los próximos 5 minutos
            if (reminderTime <= new Date(now.getTime() + 5 * 60000) && reminderTime > now) {
                showNotification('Recordatorio', `Tarea: ${task.title}\nVence: ${formatDate(task.dueDate)}\n${task.description}`);
            }
            
            // Mostrar notificación si la tarea está vencida
            if (dueDate < now) {
                showNotification('Tarea Vencida', `La tarea "${task.title}" ha vencido.`);
            }
        }
    });
}

function showConfirmModal(title, message, confirmCallback) {
    if (document.getElementById('confirmModal')) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'flex';
        
        document.getElementById('modalCancel').onclick = () => {
            document.getElementById('confirmModal').style.display = 'none';
        };
        
        document.getElementById('modalConfirm').onclick = () => {
            confirmCallback();
            document.getElementById('confirmModal').style.display = 'none';
        };
    } else {
        if (confirm(`${title}: ${message}`)) {
            confirmCallback();
        }
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatDateTime(dateTimeString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString('es-ES', options);
}