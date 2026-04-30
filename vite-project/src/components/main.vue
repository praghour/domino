<script setup>
import { computed, reactive } from 'vue';

import useNotice from '../composables/useNotice';
import useTask from '../composables/useTask'

const { showNotice } = useNotice();
const { tasks, addTask, deleteTask, editTask } = useTask();

const activeFilter = ref('all');

const newTaskName = ref('');
const newTaskDescription = ref('');
const newTaskPriority = ref('Низкий');

const editId = ref(null);
const editName = ref('');
const editDescription = ref('');
const editPriority = ref('');

const filters = [
    {name: 'Все', value: 'all'},
    {name: 'Выполненные', value: 'done'},
    {name: 'Активные', value: 'active'},
    {name: 'Архив', value: 'archive'},
    {name: 'Просроченные', value: 'expired'},
];

// фильтрация
const taskList = computed(() => {
    if (activeFilter.value === 'done') {
        return tasks.value.filter((task) => task.isDone === true)
    };
    if (activeFilter.value === 'active') {
        return tasks.value.filter((task) => task.isDone !== true && task.isArchive !== true);
    };
    if (activeFilter.value === 'archive') {
        return tasks.value.filter((task) => task.isArchive === true)
    };
    if (activeFilter.value === 'expired') {
        return tasks.value.filter((task) => task.isExpired === true)
    };

    return tasks.value;
});

// отслеживание выполненных и активных задач
const doneTasks = computed(() => {
    return tasks.value.filter((task) => task.isDone === true).length;
});

const activeTasks = computed(() => {
    return tasks.value.filter((task) => task.isDone !== true && task.isArchive !== true).length;
});

// смена фильтра
function changeFilter(filter) {
    activeFilter.value = filter;
};

// отметка о выполнении задачи
function completeTask(task) {
    task.isDone = !task.isDone;
    saveTasksToStorage();

    if (task.isDone) {
        showNotice('Задача выполнена');
    } else {
        showNotice('Задача снова активна');
    };
};

// архивирование задачи
function archiveTask(task) {
    task.isArchive = true;
    saveTasksToStorage();
    showNotice('Задача добавлена в архив');
};

// удаление задачи
function remove(id) {
    deleteTask(id);
    showNotice('Задача удалена');
};
</script>

<template>

</template>