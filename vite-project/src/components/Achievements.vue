<script setup>
import { computed } from 'vue';

import AchievementCard from './AchievementCard.vue';
import useTask from '../composables/useTask';

const { tasks } = useTask();

const savedStats = JSON.parse(localStorage.getItem('stats')) || {};

const stats = {
    coins: savedStats.coins || 0,
    crystals: savedStats.crystals || 0,
    completedTasks: savedStats.completedTasks || 0,
    deletedTasks: savedStats.deletedTasks || 0,
    archivedTasks: savedStats.archivedTasks || 0,
    wins: savedStats.wins || 0,
    losses: savedStats.losses || 0
};

// выполненные задачи
const completedTasks = computed(() => {
    return tasks.value.filter((task) => task.isDone === true).length;
});

// задачи в архиве
const archivedTasks = computed(() => {
    return tasks.value.filter((task) => task.isArchive === true).length;
});

// список достижений
const achievements = computed(() => {
    const list = [
        {
            title: 'Первая монетка',
            description: 'Получите 1 монету',
            image: '/coin1.png',
            color: 'coin',
            progress: stats.coins,
            target: 1,
            category: 'Монетки'
        },
        {
            title: 'Копейка к копейке',
            description: 'Соберите 10 монеток',
            image: '/coin10.png',
            color: 'coin',
            progress: stats.coins,
            target: 10,
            category: 'Монетки'
        },
        {
            title: 'Монетный мешок',
            description: 'Соберите 50 монеток',
            image: '/coin50.png',
            color: 'coin',
            progress: stats.coins,
            target: 50,
            category: 'Монетки'
        },
        {
            title: 'Золотой запас',
            description: 'Соберите 100 монеток',
            image: '/coin100.png',
            color: 'coin',
            progress: stats.coins,
            target: 100,
            category: 'Монетки'
        },

        {
            title: 'Первый кристалл',
            description: 'Получите 1 кристалл',
            image: '/crystal1.png',
            color: 'crystal',
            progress: stats.crystals,
            target: 1,
            category: 'Кристаллы'
        },
        {
            title: 'Блестящая десятка',
            description: 'Соберите 10 кристаллов',
            image: '/crystal10.png',
            color: 'crystal',
            progress: stats.crystals,
            target: 10,
            category: 'Кристаллы'
        },
        {
            title: 'Кристальная жила',
            description: 'Соберите 50 кристаллов',
            image: '/crystal50.png',
            color: 'crystal',
            progress: stats.crystals,
            target: 50,
            category: 'Кристаллы'
        },
        {
            title: 'Кристальный магнат',
            description: 'Соберите 100 кристаллов',
            image: '/crystal100.png',
            color: 'crystal',
            progress: stats.crystals,
            target: 100,
            category: 'Кристаллы'
        },

        {
            title: 'Пять из пяти',
            description: 'Выполните 5 задач',
            image: '/task5.png',
            color: 'task',
            progress: completedTasks.value,
            target: 5,
            category: 'Задачи'
        },
        {
            title: 'Разогнался',
            description: 'Выполните 15 задач',
            image: '/task15.png',
            color: 'task',
            progress: completedTasks.value,
            target: 15,
            category: 'Задачи'
        },
        {
            title: 'Машина задач',
            description: 'Выполните 30 задач',
            image: '/task30.png',
            color: 'task',
            progress: completedTasks.value,
            target: 30,
            category: 'Задачи'
        },
        {
            title: 'Ой, не то',
            description: 'Удалите 1 задачу',
            image: '/delTask.png',
            color: 'task',
            progress: stats.deletedTasks,
            target: 1,
            category: 'Задачи'
        },
        {
            title: 'Я сдаюсь... потом',
            description: 'Отправьте 1 задачу в архив',
            image: '/archTask.png',
            color: 'archive',
            progress: archivedTasks.value,
            target: 1,
            category: 'Задачи'
        },

        {
            title: 'Охотник на врагов',
            description: 'Победите врагов 5 раз',
            image: '/win5.png',
            color: 'win',
            progress: stats.wins,
            target: 5,
            category: 'Победы'
        },
        {
            title: 'Гроза врагов',
            description: 'Победите врагов 15 раз',
            image: '/win15.png',
            color: 'win',
            progress: stats.wins,
            target: 15,
            category: 'Победы'
        },
        {
            title: 'Истребитель',
            description: 'Победите врагов 30 раз',
            image: '/win30.png',
            color: 'win',
            progress: stats.wins,
            target: 30,
            category: 'Победы'
        },

        {
            title: 'Это была разведка',
            description: 'Проиграйте 1 раз',
            image: '/lose1.png',
            color: 'lose',
            progress: stats.losses,
            target: 1,
            category: 'Поражения'
        },
        {
            title: 'Почти получилось',
            description: 'Проиграйте 5 раз',
            image: '/lose5.png',
            color: 'lose',
            progress: stats.losses,
            target: 5,
            category: 'Поражения'
        },
        {
            title: 'Легенда фейлов',
            description: 'Проиграйте 15 раз',
            image: '/lose15.png',
            color: 'lose',
            progress: stats.losses,
            target: 15,
            category: 'Поражения'
        }
    ];

    const result = [];

    for (let i = 0; i < list.length; i++) {
        let percent = (list[i].progress / list[i].target) * 100;

        if (percent > 100) {
            percent = 100;
        };

        result.push({
            title: list[i].title,
            description: list[i].description,
            image: list[i].image,
            color: list[i].color,
            progress: list[i].progress,
            target: list[i].target,
            category: list[i].category,
            percent: percent,
            isReceived: list[i].progress >= list[i].target,
            progressText: list[i].progress + '/' + list[i].target
        });
    };

    return result;
});

// полученные достижения
const receivedAchievements = computed(() => {
    let count = 0;

    for (let i = 0; i < achievements.value.length; i++) {
        if (achievements.value[i].isReceived === true) {
            count++;
        };
    };

    return count;
});

// количество достижений в категории
function countByCategory(category) {
    let count = 0;

    for (let i = 0; i < achievements.value.length; i++) {
        if (achievements.value[i].category === category) {
            count++;
        };
    };

    return count;
};
</script>

<template>
    <main class="achievements_page">
        <section class="achievements_content">
            <div class="page_title">
                <h2>Достижения</h2>
                <p>Отслеживайте прогресс и получайте достижения</p>
            </div>

            <div class="achievements_grid">
                <AchievementCard v-for="achievement in achievements" :achievement="achievement" />
            </div>
        </section>

        <aside class="achievements_sidebar">
            <div class="side_card">
                <h3>Общий прогресс</h3>

                <div class="side_row">
                    <span>Получено</span>
                    <strong>{{ receivedAchievements }} из {{ achievements.length }}</strong>
                </div>
            </div>

            <div class="side_card">
                <h3>Категории</h3>

                <div class="side_row">
                    <span>Монетки</span>
                    <strong>{{ countByCategory('Монетки') }}</strong>
                </div>

                <div class="side_row">
                    <span>Кристаллы</span>
                    <strong>{{ countByCategory('Кристаллы') }}</strong>
                </div>

                <div class="side_row">
                    <span>Задачи</span>
                    <strong>{{ countByCategory('Задачи') }}</strong>
                </div>

                <div class="side_row">
                    <span>Победы</span>
                    <strong>{{ countByCategory('Победы') }}</strong>
                </div>

                <div class="side_row">
                    <span>Поражения</span>
                    <strong>{{ countByCategory('Поражения') }}</strong>
                </div>
            </div>
        </aside>
    </main>
</template>

<style scoped>
.achievements_page {
    min-height: 100vh;
    max-width: 1200px;

    margin: 0 auto;
    padding: 20px;

    background: #f8fafc;
    font-family: 'Jost', Arial, sans-serif;
    color: #0d1627;

    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 30px;
}

.page_title {
    margin-bottom: 30px;
}

.page_title h2 {
    margin: 0;

    font-size: 30px;
    font-weight: 600;
}

.page_title p {
    margin: 6px 0 0;

    color: #67758a;
    font-size: 14px;
}

.achievements_grid {
    display: grid;
    grid-template-columns: repeat(3, 260px);
    gap: 20px;
}

.achievements_sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.side_card {
    width: 220px;

    padding: 20px;

    background: #ffffff;
    border: 1px solid #e5eaf1;
    border-radius: 16px;
}

.side_card h3 {
    margin: 0 0 24px;

    font-size: 18px;
    font-weight: 600;
}

.side_row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 18px;

    color: #67758a;
    font-size: 15px;
}

.side_row:last-child {
    margin-bottom: 0;
}

.side_row strong {
    color: #0d1627;
}
</style>