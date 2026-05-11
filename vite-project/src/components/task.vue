<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useTask from '../composables/useTask';
import useNotice from '../composables/useNotice';
import useMoney from '../composables/useMoney';
import EditTask from './editTask.vue';

const route = useRoute();
const router = useRouter();

const { findTask, deleteTask, editTask, saveTasksToStorage } = useTask();
const { showNotice } = useNotice();
const { addCurrency } = useMoney();

const isEditModalOpen = ref(false);

const taskId = Number(route.params.id);

const task = computed(() => {
    return findTask(taskId);
});

// отслеживание выполнения подзадач
const doneSubtasks = computed(() => {
    let count = 0;
    for (let i = 0; i < subtasks.value.length; i++) {
        if (subtasks.value[i].isDone === true) {
            count++;
        };
    };
    return count;
});

// отслеживание активных подзадач
const activeSubtasks = computed(() => {
    return subtasks.value.length - doneSubtasks.value;
});

// отслеживание наличия подзадач
const subtasks = computed(() => {
    if (!task.value || !task.value.subtasks) {
        return [];
    };
    return task.value.subtasks;
});

// определение награды за задачу
const taskReward = computed(() => {
    if (!task.value) {
        return 0;
    };
    if (task.value.priority === 'Высокий') {
        return 3;
    };
    if (task.value.priority === 'Средний') {
        return 2;
    };
    return 1;
});

// прогресс
const progressPercent = computed(() => {
    if (task.value && task.value.isDone === true) {
        return 100;
    };
    if (subtasks.value.length === 0) {
        return 0;
    };

    return Math.round(doneSubtasks.value / subtasks.value.length * 100);
});

const circleStyle = computed(() => {
    return {
        background: `conic-gradient(#2d78f5 0% ${progressPercent.value}%, #edf1f7 ${progressPercent.value}% 100%)`
    };
});

function goBack() {
    router.push({name: 'main'});
};

function completeTask() {
    task.value.isDone = !task.value.isDone;
    if (task.value.isDone) {
        addCurrency('money', taskReward.value);
        showNotice('Задача выполнена', 'Получено монет: ' + taskReward.value);
    } else {
        showNotice('Выполнение отменено', 'Задача снова активна');
    };
    saveTasksToStorage();
};

function completeSubtask(subtask) {
    if (typeof subtask === 'string') {
        return;
    };
    subtask.isDone = !subtask.isDone;
    saveTasksToStorage();
};

// архивирование/разархивирование
function archiveTask() {
    task.value.isArchive = !task.value.isArchive;
    saveTasksToStorage();

    if (task.value.isArchive) {
        showNotice('Задача добавлена в архив', 'Её можно найти в списке "архиве"');
    } else {
        showNotice('Задача снова активна', 'Задача снова в списке "активно"');
    };
};

function removeTask() {
    deleteTask(task.value.id);
    showNotice('Задача удалена', 'Задача убрана из списка');
    router.push({name: 'main'});
};

// модалка редактирования
function openEditModal() {
    isEditModalOpen.value = true;
};

function saveEditedTask(editedTask) {
    editTask(task.value.id, editedTask);
    isEditModalOpen.value = false;
    showNotice('Задача изменена', 'Изменения сохранены');
};
</script>

<template>
    <main class="task_page" v-if="task">
        <section class="task_content">
            <div class="task_header">
                <button class="back_button" @click="goBack">‹</button>
                <h2>{{ task.name }}</h2>
            </div>

            <div class="task_labels">
                <span class="task_priority" :class="{ high: task.priority === 'Высокий', medium: task.priority === 'Средний', low: task.priority === 'Низкий' }">{{ task.priority }}</span>
                <span class="done_label" v-if="task.isDone">✓ Выполнено</span>
                <span class="date_label">
                    <img src="/icons/calendar.svg" alt="">
                    {{ task.deadline || task.date }}
                </span>
            </div>

            <p class="task_description">{{ task.description }}</p>

            <div class="subtasks_block">
                <h3>Подзадачи</h3>
                <div v-for="subtask in subtasks" v-if="subtasks.length !== 0" class="subtask_item">
                    <button class="checkbox" :class="{ checked: subtask.isDone }" @click="completeSubtask(subtask)">
                        <span v-if="subtask.isDone">✓</span>
                    </button>
                    <p :class="{ done: subtask.isDone }">{{ subtask.name }}</p>
                </div>
                <div v-else class="info_item"><p>Позадач пока нет, вы можете добавить их при редактировании задачи</p></div>
            </div>

            <button class="done_button" :class="{ cancel_done_button: task.isDone }" @click="completeTask">
                <span v-if="task.isDone">Отменить</span>
                <span v-else>Сделано</span>
            </button>

            <div class="subtasks_info">
                <p>Всего подзадач: {{ subtasks.length }}</p>
                <p>Активных подзадач: {{ activeSubtasks }}</p>
            </div>
        </section>

        <aside class="task_sidebar">
            <div class="side_block">
                <h3>Информация</h3>
                <div class="info_item">
                    <img src="/icons/calendar.svg" alt="">
                    <div>
                        <b>Создано</b>
                        <p>{{ task.createdDate || task.date }}</p>
                    </div>
                </div>
                <div class="info_item">
                    <img src="/icons/clock.svg" alt="">
                    <div>
                        <b>Обновлено</b>
                        <p>{{ task.updatedDate || task.date }}</p>
                    </div>
                </div>
                <div class="info_item">
                    <span class="money_icon">$</span>
                    <div>
                        <b>Награда</b>
                        <p>{{ taskReward }} <img src="/icons/coin.svg" alt=""></p>
                    </div>
                </div>
            </div>

            <div class="side_block">
                <h3>Прогресс</h3>
                <div class="progress_block">
                    <div class="progress_circle" :style="circleStyle">
                        <div class="progress_inner">{{ progressPercent }}%</div>
                    </div>
                    <div class="progress_text">
                        <b>{{ doneSubtasks }} из {{ subtasks.length }}</b>
                        <span>выполнено</span>
                    </div>
                </div>
            </div>

            <div class="side_block">
                <h3>Быстрые действия</h3>
                <button class="action_button" @click="archiveTask">
                    <img src="/icons/archive.svg" alt="">
                    <span v-if="task.isArchive">Разархивировать</span>
                    <span v-else>Архивировать</span>
                </button>
                <button class="action_button" @click="openEditModal">
                    <img src="/icons/edit.svg" alt="">
                    Редактировать
                </button>
                <button class="action_button delete_action" @click="removeTask">
                    <img src="/icons/trash.svg" alt="">
                    Удалить задачу
                </button>
            </div>
        </aside>

        <EditTask v-model="isEditModalOpen" v-bind:task="task" v-on:save="saveEditedTask"/>
    </main>

    <main class="task_page" v-else>
        <section class="task_content">
            <h2>Задача не найдена</h2>
            <button class="done_button" @click="goBack">На главную</button>
        </section>
    </main>
</template>

<style scoped>
.task_page {
    width: min(100% - 80px, 1362px);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 310px;
    gap: 30px;
    background: #f8fafc;
}

.task_content,
.side_block {
    background: white;
    border: 1px solid #e5eaf1;
    border-radius: 20px;
    padding: 20px;
}

.task_content {
    min-height: 520px;
    position: relative;
}

.task_header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.back_button {
    border: none;
    background: transparent;
    color: #0d1627;
    font-size: 32px;
    cursor: pointer;
}

.task_header h2 {
    margin: 0;
    color: #0d1627;
    font-size: 24px;
}

.task_labels {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 35px;
}

.task_priority,
.done_label,
.date_label {
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
}

.high {
    background: #fdf0f2;
    color: #e65359;
}

.medium {
    background: #fef5ea;
    color: #ef8922;
}

.low {
    background: #ebf8ef;
    color: #4cae6c;
}

.done_label {
    background: #ebf8ef;
    color: #4cae6c;
}

.date_label {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #eff3f8;
    color: #66748a;
}

.date_label img {
    width: 18px;
    height: 18px;
}

.task_description {
    max-width: 650px;
    margin: 45px 0;
    color: #66748a;
    font-size: 14px;
    line-height: 22px;
}

.subtasks_block h3 {
    margin: 0 0 14px;
    color: #0d1627;
    font-size: 18px;
}

.subtask_item {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 10px 14px;
    margin-bottom: 8px;
    border: 1px solid #e5eaf1;
    border-radius: 10px;
}

.subtask_item p {
    margin: 0;
    color: #0d1627;
    font-size: 14px;
}

.subtask_item p.done {
    opacity: 0.5;
}

.checkbox {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 2px solid #374151;
    border-radius: 4px;
    background: white;
    color: #2f75ff;
    font-size: 18px;
    flex-shrink: 0;
}

.checkbox.checked {
    border-color: #2f75ff;
}

.done_button {
    position: absolute;
    right: 20px;
    bottom: 80px;
    padding: 14px 28px;
    border: none;
    border-radius: 10px;
    background: #2d78f5;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.cancel_done_button {
    background: #eff3f8;
    color: #66748a;
}

.subtasks_info {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 20px;
    display: flex;
    justify-content: space-between;
    color: #66748a;
    font-size: 14px;
}

.subtasks_info p {
    margin: 0;
}

.task_sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.side_block h3 {
    margin: 0 0 18px;
    color: #0d1627;
    font-size: 16px;
}

.info_item {
    display: flex;
    gap: 14px;
    margin-bottom: 22px;
}

.info_item img {
    width: 22px;
    height: 22px;
}

.info_item b {
    color: #0d1627;
    font-size: 14px;
}

.info_item p {
    margin: 4px 0 0;
    color: #66748a;
    font-size: 13px;
}

.info_item p img {
    width: 18px;
    height: 18px;
    display: inline-block;
    vertical-align: middle;
}

.money_icon {
    width: 22px;
    color: #0d1627;
    font-size: 24px;
}

.progress_block {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

.progress_circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress_inner {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: white;
    color: #0d1627;
    font-size: 24px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress_text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.progress_text b {
    color: #0d1627;
    font-size: 14px;
}

.progress_text span {
    color: #66748a;
    font-size: 12px;
}

.action_button {
    width: 100%;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e5eaf1;
    border-radius: 10px;
    background: white;
    color: #0d1627;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.action_button img {
    width: 22px;
    height: 22px;
}

.delete_action {
    color: #e65359;
}
</style>