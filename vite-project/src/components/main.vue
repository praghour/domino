<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import useNotice from '../composables/useNotice';
import useTask from '../composables/useTask';
 import useMoney from '../composables/useMoney.js';
import CreateTask from './createTask.vue';
import EditTask from './editTask.vue';
import useAchieve from '../composables/useAchieve';

const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedTask = ref(null);

const router = useRouter();

const { showNotice } = useNotice();
const { tasks, deleteTask, editTask, saveTasksToStorage, getTodayDate } = useTask();
const { findCurrency, addCurrency } = useMoney();

const { addStat } = useAchieve();
  
const activeFilter = ref('all');

const filters = [
    {name: 'Все', value: 'all', img: '/icons/all.svg'},
    {name: 'Выполненные', value: 'done', img: '/icons/done.svg'},
    {name: 'Активные', value: 'active', img: '/icons/active.svg'},
    {name: 'Архив', value: 'archive', img: '/icons/archive.svg'},
    {name: 'Просроченные', value: 'expired', img: '/icons/expired.svg'}
];

// фильтрация задач
const taskList = computed(() => {
    if (activeFilter.value === 'done') {
        return tasks.value.filter((task) => task.isDone === true);
    };

    if (activeFilter.value === 'active') {
        return tasks.value.filter((task) => task.isDone !== true && task.isArchive !== true);
    };

    if (activeFilter.value === 'archive') {
        return tasks.value.filter((task) => task.isArchive === true);
    };

    if (activeFilter.value === 'expired') {
        return tasks.value.filter((task) => task.isExpired === true);
    };

    return tasks.value;
});

// отслеживание активных задач
const activeTasks = computed(() => {
    return tasks.value.filter((task) => task.isDone !== true && task.isArchive !== true).length;
});

// задачи на сегодня
const todayTasks = computed(() => {
    const result = [];
    const today = getTodayDate();

    for (let i = 0; i < tasks.value.length; i++) {
        if (tasks.value[i].isArchive !== true && tasks.value[i].deadline === today && result.length < 3) {
            result.push(tasks.value[i]);
        };
    };
    return result;
});

// смена фильтра
function changeFilter(filter) {
    activeFilter.value = filter;
};

// отметка о выполнении задачи
function completeTask(task) {
    task.isDone = !task.isDone;
    if (task.isDone) {
        const reward = getTaskReward(task);
        addCurrency('money', reward);
        showNotice('Задача выполнена', 'Получено монет: ' + reward);
    } else {
        showNotice('Задача активна', 'Задача снова вернулась в список');
    };
    saveTasksToStorage();
};

// определение награды за задачу
function getTaskReward(task) {
    if (task.priority === 'Высокий') {
        return 3;
    };
    if (task.priority === 'Средний') {
        return 2;
    };
    return 1;
};

// архивирование задачи
function archiveTask(task) {
    task.isArchive = true;
    saveTasksToStorage();
    showNotice('Задача добавлена в архив');
};

function remove(id) {
    addStat('deletedTasks');

    deleteTask(id);
    showNotice('Задача удалена', 'Задача убрана из списка');
};

// открытие/закрытие модалок
function openTaskForm() {
    isCreateModalOpen.value = true;
};

function openEditTask(task) {
    selectedTask.value = task;
    isEditModalOpen.value = true;
};

function closeCreateModal() {
    isCreateModalOpen.value = false;
};

// сохранение изменённой задачи
function saveEditedTask(editedTask) {
    editTask(selectedTask.value.id, editedTask);
    isEditModalOpen.value = false;
    selectedTask.value = null;
    showNotice('Задача изменена', 'Изменения сохранены');
};
  
 //бабосики 
const userMoney = computed(() => {
  const money = findCurrency('money');
  return money ? money.count : 0;
});

const userCrystals = computed(() => {
  const crystal = findCurrency('crystal');
  return crystal ? crystal.count : 0;
});


// переход к аквариуму
function openAquarium() {
    router.push({name: 'aquarium'});
};

// переход к таймеру
function openTimer() {
    router.push({name: 'timer'});
};

function openAchievements() {
    router.push({name: 'achievements'});
}
</script>

<template>
    <main class="main_page">
        <section class="tasks_section">
            <div class="filters">

                <button v-for="filter in filters" class="filter_button" :class="{ active: activeFilter === filter.value }" @click="changeFilter(filter.value)">
                    <img :src="filter.img" alt="">
                    {{ filter.name }}
                </button>

                <button class="add_button" @click="openTaskForm">Добавить</button>
            </div>

            <div v-for="task in taskList" class="task_item">
                <button class="checkbox" :class="{ checked: task.isDone }" @click="completeTask(task)">
                    <span v-if="task.isDone">✓</span>
                </button>

                <p class="task_name" :class="{ done: task.isDone }" @click="router.push({name: 'task', params: {id: task.id}})">
                    {{ task.name }}
                </p>

                <span class="task_priority" :class="{ high: task.priority === 'Высокий', medium: task.priority === 'Средний', low: task.priority === 'Низкий', archive: task.isArchive === true }">
                    <span v-if="task.isArchive">Архив</span>
                    <span v-else>{{ task.priority }}</span>
                </span>

                <button class="icon_button" @click="openEditTask(task)">
                    <img src="/icons/edit.svg" alt="Изменить">
                </button>

                <button class="icon_button" @click="remove(task.id)">
                    <img src="/icons/trash.svg" alt="Удалить">
                </button>
            </div>

            <div class="tasks_info">
                <p>Всего задач: {{ tasks.length }}</p>
                <p>Активных задач: {{ activeTasks }}</p>
            </div>
        </section>

        <aside class="sidebar">
            <div class="side_block">
                <h3>Аквариум</h3>
                <div class="aquarium">
                    <button class="game_button" @click="openAquarium">Перейти в игру</button>
                </div>
                <div class="game_stats">
                    <span>{{ userMoney }}<img src="/icons/coin.svg" alt="Монеты"></span>
                    <span>{{ userCrystals }}<img src="/icons/crystal.svg" alt="Кристаллы"></span>
                </div>
            </div>

            <div class="side_block">
                <h3>Сегодня</h3>
                <div v-for="task in todayTasks" class="today_task">
                    <span class="today_circle"></span>
                    <div>
                        <p>{{ task.name }}</p>
                        <small>
                            <span class="priority_dot" :class="{ high_dot: task.priority === 'Высокий', medium_dot: task.priority === 'Средний', low_dot: task.priority === 'Низкий' }"></span>
                            {{ task.priority }}
                        </small>
                    </div>
                </div>
            </div>

            <div class="side_block">
                <h3>Быстрые действия</h3>
                <div class="quick_actions">
                    <button class="quick_button" @click="openTimer">
                        <img src="/icons/target.svg" alt="">
                        <span>Фокусировка</span>
                    </button>

                    <button class="quick_button" @click="openAchievements">
                        <img src="/icons/award.svg" alt="">
                        <span>Достижения</span>
                    </button>
                </div>
            </div>
        </aside>
    </main>
    <CreateTask v-model="isCreateModalOpen" />
    <EditTask v-model="isEditModalOpen" v-bind:task="selectedTask" v-on:save="saveEditedTask"/>
</template>

<style scoped>
.main_page {
  width: min(100% - 80px, 1362px);
  margin: 0 auto;

  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 30px;

  background: #f8fafc;
}

.tasks_section,
.side_block {
  min-width: 0;
  background: white;
  border: 1px solid #e5eaf1;
  border-radius: 20px;
  padding: 20px;
}

.tasks_section {
  min-height: 520px;

  display: flex;
  flex-direction: column;
}

.filters {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 7px;
  margin-bottom: 25px;
}

button {
  border: none;
  border-radius: 10px;
  background: #eff3f8;
  color: #66748a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.filter_button {
  padding: 10px 14px;

  display: flex;
  align-items: center;
  gap: 6px;

  background: #eff3f8;
  color: #66748a;

  font-size: 13px;
}

.filter_button img {
  width: 16px;
  height: 16px;
  display: block;

  filter: brightness(0) saturate(100%) invert(45%) sepia(12%) saturate(506%) hue-rotate(176deg) brightness(94%) contrast(89%);
}

.filter_button.active {
  background: #dbeafd;
  color: #2d78f5;
}

.filter_button.active img {
  filter: brightness(0) saturate(100%) invert(42%) sepia(89%) saturate(1788%) hue-rotate(204deg) brightness(98%) contrast(96%);
}

.add_button,
.game_button {
  background: #2d78f5;
  color: white;
}

.add_button {
  margin-left: auto;
  padding: 10px 18px;
  font-size: 13px;
}

.task_item {
  display: flex;
  align-items: center;
  gap: 14px;

  padding: 8px 14px;
  margin-bottom: 8px;

  border: 1px solid #e5eaf1;
  border-radius: 10px;
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

.task_name {
  flex: 1;
  margin: 0;
  cursor: pointer;
  color: #0d1627;
  font-size: 14px;
  text-align: left;
}

.task_name.done {
  opacity: 0.5;
}

.task_priority {
  min-width: 70px;

  padding: 6px 10px;
  border-radius: 10px;

  text-align: center;
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

.archive {
  background: #e5eaf1;
  color: #66748a;
}

.icon_button {
  width: 28px;
  height: 28px;
  padding: 0;

  background: transparent;
  flex-shrink: 0;
}

.icon_button img {
  width: 22px;
  height: 22px;
  display: block;
}

.tasks_info {
  margin-top: auto;
  padding-top: 20px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  color: #66748a;
  font-size: 14px;
}

.tasks_info p {
  margin: 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side_block h3 {
  margin: 0 0 14px;

  color: #0d1627;
  font-size: 16px;
}

.aquarium {
  height: 160px;

  border-radius: 16px;

  background: #dbeafd;
  background-image: url('/icons/aqua.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  display: flex;
  align-items: center;
  justify-content: center;
}

.game_button {
  padding: 12px 20px;
}

.game_stats {
  display: flex;
  justify-content: center;
  gap: 35px;

  margin-top: 12px;
}

.game_stats span {
  display: flex;
  align-items: center;
  gap: 6px;

  font-family: 'FRM3216x16', 'FRM325x8', monospace;
  font-size: 16px;
  font-weight: 600;
}

.game_stats img {
  width: 20px;
  height: 20px;
}

.today_task {
  display: flex;
  gap: 10px;

  margin-bottom: 16px;
}

.today_task p {
  margin: 0;

  color: #0d1627;
  font-size: 14px;
  font-weight: 600;
}

.today_task small {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-top: 4px;

  color: #66748a;
}

.priority_dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;
}

.high_dot {
  background: #e65359;
}

.medium_dot {
  background: #ef8922;
}

.low_dot {
  background: #4cae6c;
}

.show_all_button {
  width: 100%;

  background: transparent;
  color: #2d78f5;
}

.quick_actions {
  display: flex;
  flex-direction: row;
  gap: 12px;

  width: 100%;
}

.quick_button {
  width: 50%;
  height: 74px;

  padding: 10px;

  border: 1px solid #e5eaf1;
  border-radius: 12px;

  background: #eff3f8;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.quick_button img {
  width: 24px;
  height: 24px;
  display: block;
}
</style>