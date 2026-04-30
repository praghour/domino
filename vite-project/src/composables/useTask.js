import { computed, reactive } from 'vue';

// default список задач для проверок и тестов
const defaultTaskList = [
    {id: 0, name: 'Задача 1', description: 'Сделать раз', priority: 'Низкий'},
    {id: 1, name: 'Задача 2', description: 'Сделать два', priority: 'Низкий'},
    {id: 2, name: 'Задача 3', description: 'Сделать три', priority: 'Низкий'}
];

const taskList = reactive([]);

// сохранение задач в localStorage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(taskList));
};

// загрузка задач из localStorage
function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('tasks');

    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        taskList.splice(0, taskList.length);

        parsedTasks.forEach((task) => {
            taskList.push(task);
        });

        saveTasksToStorage();
    };
};

loadTasksFromStorage();

const tasks = computed(() => taskList);

// добавление задачи
function addTask(newName, newDescription, newPriority) {
    let maxId = -1;
    for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].id > maxId) {
            maxId = taskList[i].id;
        };
    };

    const newTaskId = maxId + 1;
    taskList.push({
        id: newTaskId,
        name: newName,
        description: newDescription,
        priority: newPriority,
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
function editTask(taskId, editName, editDescription, editPriority) {
    const editingTask = taskList.find((task) => task.id === taskId);
    if (!editingTask) {
        return
    };

    editingTask.name = editName;
    editingTask.description = editDescription;
    editingTask.priority = editPriority;

    saveTasksToStorage();
};

// экспорт всего и вся
export default function useTask() {
    return {
        tasks, 
        addTask, findTask, deleteTask, editTask, saveTasksToStorage, loadTasksFromStorage
    };
};