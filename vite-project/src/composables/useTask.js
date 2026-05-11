import { computed, reactive } from 'vue';

// default список задач для проверок и тестов
const defaultTaskList = [
    {id: 0, name: 'Задача 1', description: 'Сделать раз', priority: 'Низкий', date: '', subtasks: []},
    {id: 1, name: 'Задача 2', description: 'Сделать два', priority: 'Средний', date: '', subtasks: []},
    {id: 2, name: 'Задача 3', description: 'Сделать три', priority: 'Высокий', date: '', subtasks: []},
    {id: 3, name: 'Задача 4', description: 'Сделать раз', priority: 'Низкий', date: '', subtasks: []},
    {id: 4, name: 'Задача 5', description: 'Сделать два', priority: 'Средний', date: '', subtasks: []},
    {id: 5, name: 'Задача 6', description: 'Сделать три', priority: 'Высокий', date: '', subtasks: []},
    {id: 6, name: 'Задача 7', description: 'Сделать раз', priority: 'Низкий', date: '', subtasks: []},
    {id: 7, name: 'Задача 8', description: 'Сделать два', priority: 'Средний', date: '', subtasks: []},
    {id: 8, name: 'Задача 9', description: 'Сделать три', priority: 'Высокий', date: '', subtasks: []},
    {id: 9, name: 'Задача 10', description: 'Сделать раз', priority: 'Низкий', date: '', subtasks: []},
    {id: 10, name: 'Задача 11', description: 'Сделать два', priority: 'Средний', date: '', subtasks: []},
    {id: 11, name: 'Задача 12', description: 'Сделать три', priority: 'Высокий', date: '', subtasks: []}
];

const taskList = reactive([]);

// сегодняшняя дата
function getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
        month = '0' + month;
    };
    if (day < 10) {
        day = '0' + day;
    };

    return `${year}-${month}-${day}`;
};

// сохранение задач в localStorage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(taskList));
};

// загрузка задач из localStorage
function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('tasks');

    taskList.splice(0, taskList.length);

    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);

        parsedTasks.forEach((task) => {
            taskList.push(task);
        });
    } else {
        defaultTaskList.forEach((task) => {
            taskList.push({
                id: task.id,
                name: task.name,
                description: task.description,
                subtasks: task.subtasks,
                date: task.date,
                priority: task.priority,
                isDone: false,
                isArchive: false,
                isExpired: false
            });
        });
        saveTasksToStorage();
    };
};

loadTasksFromStorage();

const tasks = computed(() => taskList);

// добавление задачи
function addTask(newTask) {
    let maxId = -1;

    for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].id > maxId) {
            maxId = taskList[i].id;
        };
    };

    const subtasksList = [];

    for (let i = 0; i < newTask.subtasks.length; i++) {
        const currentSubtask = newTask.subtasks[i].trim();

        if (currentSubtask !== '') {
            subtasksList.push(currentSubtask);
        };
    };

    const newTaskId = maxId + 1;

    taskList.push({
        id: newTaskId,
        name: newTask.name.trim(),
        description: newTask.description.trim(),
        subtasks: subtasksList,
        date: newTask.date,
        priority: newTask.priority,
        isDone: false,
        isArchive: false,
        isExpired: false
    });

    saveTasksToStorage();
};

// поиск задачи по id
function findTask(taskId) {
    return taskList.find((task) => task.id === taskId);
};

// удаление задачи
function deleteTask(taskId) {
    const deletedTask = taskList.indexOf(findTask(taskId));

    if (deletedTask !== -1) {
        taskList.splice(deletedTask, 1);
        saveTasksToStorage();
    };
};

// изменение задачи
function editTask(taskId, editTaskData) {
    const editingTask = taskList.find((task) => task.id === taskId);
    if (!editingTask) {
        return;
    };

    const taskData = prepareTaskData(editTaskData);

    editingTask.name = taskData.name;
    editingTask.description = taskData.description;
    editingTask.subtasks = taskData.subtasks;
    editingTask.date = taskData.date;
    editingTask.priority = taskData.priority;

    saveTasksToStorage();
};

// очистка подзадач
function getCleanSubtasks(subtasks) {
    const result = [];
    for (let i = 0; i < subtasks.length; i++) {
        if (typeof subtasks[i] === 'string') {
            if (subtasks[i].trim() !== '') {
                result.push({
                    name: subtasks[i].trim(),
                    isDone: false
                });
            };
        } else {
            if (subtasks[i].name.trim() !== '') {
                result.push({
                    name: subtasks[i].name.trim(),
                    isDone: subtasks[i].isDone
                });
            };
        };
    };

    return result;
};

// подготовка данных задачи
function prepareTaskData(form) {
    return {
        name: form.name.trim(),
        description: form.description.trim(),
        subtasks: getCleanSubtasks(form.subtasks),
        date: form.date,
        priority: form.priority
    };
};


// экспорт всего и вся
export default function useTask() {
    return {
        tasks,
        addTask, findTask, deleteTask, editTask, getTodayDate, saveTasksToStorage, loadTasksFromStorage, getCleanSubtasks, prepareTaskData
    };
};
