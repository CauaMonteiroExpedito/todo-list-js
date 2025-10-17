class TodoList {
    constructor() {
        this.tasks = this.getStoredTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        const addTask = () => this.addTask();
        
        document.getElementById('addBtn').addEventListener('click', addTask);
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (!text) {
            alert('Por favor, digite uma tarefa!');
            return;
        }

        this.tasks.unshift({
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('pt-BR')
        });

        input.value = '';
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        const newText = prompt('Editar tarefa:', task?.text);
        
        if (newText?.trim()) {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
    }

    clearAll() {
        if (confirm('Tem certeza que deseja excluir TODAS as tarefas?')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    }

    getFilteredTasks() {
        const filters = {
            'completed': tasks => tasks.filter(t => t.completed),
            'pending': tasks => tasks.filter(t => !t.completed),
            'all': tasks => tasks
        };

        return filters[this.currentFilter](this.tasks);
    }

    render() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        document.getElementById('totalTasks').textContent = `Total: ${this.tasks.length}`;
        document.getElementById('completedTasks').textContent = `Concluídas: ${this.tasks.filter(t => t.completed).length}`;

        if (!filteredTasks.length) {
            const isEmpty = this.tasks.length === 0;
            taskList.innerHTML = `
                <div class="empty-state ${isEmpty ? '' : 'hidden'}">
                    <h3>${isEmpty ? 'Nenhuma tarefa ainda!' : 'Nenhuma tarefa encontrada para este filtro.'}</h3>
                    <p>${isEmpty ? 'Adicione sua primeira tarefa acima 👆' : 'Tente mudar o filtro.'}</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="todoList.toggleTask(${task.id})"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="edit-btn" onclick="todoList.editTask(${task.id})">Editar</button>
                    <button class="delete-btn" onclick="todoList.deleteTask(${task.id})">Excluir</button>
                </div>
            </li>
        `).join('');
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    getStoredTasks() {
        const stored = localStorage.getItem('todoTasks');
        return stored ? JSON.parse(stored) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.todoList = new TodoList();
});