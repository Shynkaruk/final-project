// script.js

class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentView = 'Day';
        this.currentDate = new Date();

        this.init();
    }

    init() {
        this.renderViewSelector();
        this.renderDate();
        this.renderTasks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelector('.task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask(e.target.value);
                e.target.value = '';
            }
        });

        document.querySelectorAll('.view-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.changeView(e.target.innerText);
            });
        });

        document.querySelectorAll('.date-navigation').forEach(button => {
            button.addEventListener('click', (e) => {
                this.changeDate(e.target.innerText === '<' ? -1 : 1);
            });
        });
    }

    loadTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : {};
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderViewSelector() {
        document.querySelectorAll('.view-option').forEach(option => {
            option.classList.remove('active');
            if (option.innerText === this.currentView) {
                option.classList.add('active');
            }
        });
    }

    renderDate() {
        let formattedDate;
        switch (this.currentView) {
            case 'Day':
                formattedDate = this.formatDate(this.currentDate, 'dddd');
                break;
            case 'Week':
                const startOfWeek = new Date(this.currentDate);
                startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                formattedDate = `${this.formatDate(startOfWeek, 'MMM d, yyyy')} - ${this.formatDate(endOfWeek, 'MMM d, yyyy')}`;
                break;
            case 'Month':
                formattedDate = this.formatDate(this.currentDate, 'MMMM yyyy');
                break;
            case 'Year':
                formattedDate = this.currentDate.getFullYear();
                break;
        }
        document.querySelector('.date').innerText = formattedDate;
        document.querySelector('.date-number').innerText = this.formatDate(this.currentDate, 'MMMM d, yyyy');
    }
    

    formatDate(date, format) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    renderTasks() {
        const taskList = document.querySelector('.task-list');
        taskList.innerHTML = '';
    
        const tasksForDateRange = this.getTasksForDateRange();
    
        tasksForDateRange.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            if (task.completed) {
                taskItem.classList.add('completed');
            }
    
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.innerText = task.text;
    
            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
    
            const completeButton = document.createElement('button');
            completeButton.innerText = task.completed ? 'Undo' : 'Complete';
            completeButton.addEventListener('click', () => {
                this.toggleTaskCompletion(task.dateKey, index);
            });
    
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.addEventListener('click', () => {
                this.deleteTask(task.dateKey, index);
            });
    
            taskActions.appendChild(completeButton);
            taskActions.appendChild(deleteButton);
    
            taskItem.appendChild(taskText);
            taskItem.appendChild(taskActions);
    
            taskList.appendChild(taskItem);
        });
    }
    

    addTask(text) {
        const dateKey = this.formatDate(this.currentDate, 'yyyy-MM-dd');
        if (!this.tasks[dateKey]) {
            this.tasks[dateKey] = [];
        }
        this.tasks[dateKey].push({ text, completed: false });
        this.saveTasks();
        this.renderTasks();
    }

    toggleTaskCompletion(dateKey, index) {
        this.tasks[dateKey][index].completed = !this.tasks[dateKey][index].completed;
        this.saveTasks();
        this.renderTasks();
    }

    deleteTask(dateKey, index) {
        this.tasks[dateKey].splice(index, 1);
        this.saveTasks();
        this.renderTasks();
    }

    changeView(view) {
        this.currentView = view;
        this.renderViewSelector();
        this.renderDate();
        this.renderTasks();
    }

    changeDate(days) {
        switch (this.currentView) {
            case 'Day':
                this.currentDate.setDate(this.currentDate.getDate() + days);
                break;
            case 'Week':
                this.currentDate.setDate(this.currentDate.getDate() + days * 7);
                break;
            case 'Month':
                this.currentDate.setMonth(this.currentDate.getMonth() + days);
                break;
            case 'Year':
                this.currentDate.setFullYear(this.currentDate.getFullYear() + days);
                break;
        }
        this.renderDate();
        this.renderTasks();
    }

    getTasksForDateRange() {
        let tasks = [];
        const dateKeys = Object.keys(this.tasks);
    
        switch (this.currentView) {
            case 'Day':
                const dayKey = this.formatDate(this.currentDate, 'yyyy-MM-dd');
                if (this.tasks[dayKey]) {
                    tasks = this.tasks[dayKey].map(task => ({ ...task, dateKey: dayKey }));
                }
                break;
    
            case 'Week':
                const startOfWeek = new Date(this.currentDate);
                startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1); // Monday
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
                dateKeys.forEach(dateKey => {
                    const date = new Date(dateKey);
                    if (date >= startOfWeek && date <= endOfWeek) {
                        tasks = tasks.concat(this.tasks[dateKey].map(task => ({ ...task, dateKey })));
                    }
                });
                break;
    
            case 'Month':
                const startOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
                const endOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
                dateKeys.forEach(dateKey => {
                    const date = new Date(dateKey);
                    if (date >= startOfMonth && date <= endOfMonth) {
                        tasks = tasks.concat(this.tasks[dateKey].map(task => ({ ...task, dateKey })));
                    }
                });
                break;
    
            case 'Year':
                const startOfYear = new Date(this.currentDate.getFullYear(), 0, 1);
                const endOfYear = new Date(this.currentDate.getFullYear(), 11, 31);
                dateKeys.forEach(dateKey => {
                    const date = new Date(dateKey);
                    if (date >= startOfYear && date <= endOfYear) {
                        tasks = tasks.concat(this.tasks[dateKey].map(task => ({ ...task, dateKey })));
                    }
                });
                break;
        }
    
        return tasks;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
