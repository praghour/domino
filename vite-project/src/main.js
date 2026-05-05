<script setup>
import { computed, reactive, ref } from 'vue';

import useNotice from '../composables/useNotice';
import useTask from '../composables/useTask';
import CheckBox from '../comp/CheckBox.vue';

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
    <main>
        <section class="tasks-section">
            <div class="filters">
                <button 
                v-for="filter in filters" 
                class="filter_button" 
                :class="{ active: activeFilter === filter.value}" 
                @click="changeFilter(filter.value)"> {{filter.name}}</button>
                <button class="add_button" @click="addTask">Добавить</button>
            </div>

            <div v-for="task in taskList" class="task_item">
                <CheckBox :model-value="task.isDone" @update:model-value="completeTask(task)"/>
                <p class="task_name" :class="{done: task.isDone}">{{task.name}}</p>
                <span class="task_priority" :class="{
                    high: task.priority === 'Высокий',
                    medium: task.priority === 'Средний',
                    low: task.priority === 'Низкий',
                    archive: task.isArchive}">
                    {{task.isArchive ? 'Архив' : task.priority}}
                </span>
                <button class="edit_button" @click="editTask(task)"><img src="../../public/edit-3.png" alt="Редактировать"></button>
                <button class="delete_button" @click="remove(task.id)"><img src="../../public/trash-2.png" alt="Удалить"></button>
            </div>

            <div class="tasks_info">
                <p>Всего задач: {{tasks.length}}</p>
                <p>Активных задач: {{activeTasks}}</p>
            </div>

        </section>
        <aside class="sidebar">
            <div class="aquarium_block">
                <h3>Аквариум</h3>
                <div class="aquarium">
                    <button class="game_button">Перейти в игру</button>
                </div>
                <div class="game_stats">
                    <span>10 <img src="../../public/coin.png" alt=""></span>                    
                    <span>10 <img src="../../public/crystal.png" alt=""></span>                    
                </div>
            </div>

            <div class="today_block">
                <h3>Сегодня</h3>
                <div v-for="task in tasks.filter(task => task.isArchive !== true).slice(0, 3)" class="today_task">
                    <span class="today_circle"></span>
                    <div>
                        <p>{{task.name}}</p>
                        <small :class="{
                            high: task.priority === 'Высокий',
                            medium: task.priority === 'Средний',
                            low: task.priority === 'Низкий'
                        }">
                        {{task.priority}}
                        </small>
                    </div>
                </div>
                <button class="show_all_button">Показать все</button>
            </div>

            <div class="quick_block">
                <h3>Быстрые действия</h3>

                <div class="quick_actions">
                    <button class="quick_button">
                    <img src="../../public/target.png" alt="">
                    <span>Фокусировка</span>
                    </button>

                    <button class="quick_button">
                    <img src="../../public/award.png" alt="">
                    <span>Достижения</span>
                    </button>
                </div>
            </div>

        </aside>
    </main>

</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  background: #f8fafc;
  overflow-x: hidden;
}

:global(body) {
  font-family: 'Jost', Arial, sans-serif;
}

:global(#app) {
  min-height: 100vh;
  background: #f8fafc;
}

/* Основной блок страницы */

main {
  width: 100%;
  max-width: 1362px;
  margin: 0 auto;
  padding: 40px 0;

  display: grid;
  grid-template-columns: 1012px 310px;
  gap: 40px;

  background: #f8fafc;
}

/* Левая карточка со списком */

.tasks-section {
  width: 1012px;
  min-height: 740px;

  padding: 20px;

  background: #ffffff;
  border: 1px solid #e5eaf1;
  border-radius: 20px;

  display: flex;
  flex-direction: column;
}

/* Фильтры */

.filters {
  width: 100%;

  display: flex;
  align-items: center;
  gap: 12px;

  margin-bottom: 36px;
}

.filter_button {
  min-height: 43px;

  padding: 10px 20px;

  border: 1px solid #e5eaf1;
  border-radius: 10px;
  background: #eff3f8;

  color: #0d1627;
  opacity: 0.8;

  font-size: 16px;
  font-weight: 400;
  font-family: inherit;

  cursor: pointer;
}

.filter_button.active {
  background: #dbeafd;
  color: #2d78f5;
  opacity: 1;
  font-weight: 500;
}

.add_button {
  width: 110px;
  height: 43px;

  margin-left: auto;

  border: none;
  border-radius: 10px;
  background: #2d78f5;

  color: #fefefe;
  font-size: 16px;
  font-weight: 500;
  font-family: inherit;

  cursor: pointer;
}

/* Поле одной задачи */

.task_item {
  width: 100%;
  height: 59px;

  padding: 12px 20px;
  margin-bottom: 12px;

  display: flex;
  align-items: center;

  background: #fefefe;
  border: 1px solid #e5eaf1;
  border-radius: 10px;
}

.task_name {
  margin: 0;
  margin-left: 21px;

  flex: 1;

  color: #0d1627;
  font-size: 16px;
  font-weight: 400;
  line-height: 23px;
}

.task_name.done {
  opacity: 0.5;
}

/* Приоритет */

.task_priority {
  min-width: 65px;
  height: 35px;

  padding: 6px 10px;
  margin-right: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  font-size: 16px;
  font-weight: 500;
  line-height: 23px;
  white-space: nowrap;
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

/* Кнопки редактировать / удалить */

.edit_button,
.delete_button {
  width: 24px;
  height: 24px;

  padding: 0;

  border: none;
  background: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0.5;
  cursor: pointer;
}

.edit_button {
  margin-right: 20px;
}

.edit_button img,
.delete_button img {
  width: 24px;
  height: 24px;
  display: block;
}

/* Нижняя информация */

.tasks_info {
  width: 100%;

  margin-top: auto;

  display: flex;
  justify-content: space-between;
  align-items: center;

  color: #67758a;
  font-size: 16px;
  font-weight: 400;
}

.tasks_info p {
  margin: 0;
}

/* Правая колонка */

.sidebar {
  width: 310px;

  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Общие карточки справа */

.aquarium_block,
.today_block,
.quick_block {
  width: 310px;

  background: #ffffff;
  border: 1px solid #e5eaf1;
  border-radius: 20px;
}

.aquarium_block h3,
.today_block h3,
.quick_block h3 {
  margin: 0;

  color: #0d1627;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

/* Аквариум */

.aquarium_block {
  height: 280px;
  padding: 10px;

  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aquarium {
  width: 290px;
  height: 190px;

  border-radius: 20px;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  background:
    linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url('/aquarium.png');
  background-size: cover;
  background-position: center;
}

.game_button {
  width: 150px;
  height: 43px;

  border: none;
  border-radius: 10px;
  background: #2d78f5;

  color: #fefefe;
  font-size: 16px;
  font-weight: 500;
  font-family: inherit;

  cursor: pointer;
}

.game_stats {
  width: 290px;
  height: 24px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.game_stats span {
  display: flex;
  align-items: center;
  gap: 6px;

  color: #000000;
  font-size: 16px;
  font-weight: 500;
}

.game_stats img {
  width: 24px;
  height: 24px;
  display: block;
}

/* Сегодня */

.today_block {
  height: 262px;
  padding: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.today_block h3 {
  width: 100%;
}

.today_task {
  width: 270px;
  height: 40px;

  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.today_circle {
  width: 14px;
  height: 14px;

  margin-top: 4px;

  border: 2px solid #0d1627;
  border-radius: 50%;

  flex-shrink: 0;
}

.today_task p {
  margin: 0;

  color: #0d1627;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.today_task small {
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 0;
  background: transparent;

  color: #66748a;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.show_all_button {
  border: none;
  background: transparent;

  color: #2d78f5;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;

  cursor: pointer;
}

/* Быстрые действия */

.quick_block {
  height: 158px;
  padding: 20px;

  display: flex;
  flex-direction: column;
  gap: 18px;
}

.quick_actions {
  width: 270px;
  height: 74px;

  display: flex;
  align-items: center;
  gap: 12px;
}

.quick_button {
  width: 129px;
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

  cursor: pointer;
}

.quick_button img {
  width: 24px;
  height: 24px;
  display: block;
}

.quick_button span {
  color: #67758a;
  font-size: 14px;
  font-weight: 600;
}
</style>
