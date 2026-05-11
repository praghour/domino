<script setup>
import { watch, onMounted, onUnmounted } from 'vue';
import AchievementCard from './AchievementCard.vue';
import useAchieve from '../composables/useAchieve';

const { achievements, receivedAchievements, countByCategory, receivedByCategory, updateStatsFromStorage } = useAchieve();

let interval = null;

// Обновляем достижения каждую секунду
onMounted(() => {
    interval = setInterval(() => {
        updateStatsFromStorage();
    }, 1000);
});

onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
});

// Следим за изменениями достижений и диспатчим событие
watch(achievements, () => {
    window.dispatchEvent(new CustomEvent('achievements-updated'));
}, { deep: true });
</script>

<template>
    <main class="achievements_page">
        <section class="achievements_content">
            <div class="page_title">
                <h2>Достижения</h2>
                <p>Отслеживайте прогресс и получайте достижения</p>
            </div>

            <div class="achievements_grid">
                <AchievementCard v-for="achievement in achievements" :achievement="achievement" :key="achievement.title" />
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
                    <strong>{{ receivedByCategory('Монетки') }} из {{ countByCategory('Монетки') }}</strong>
                </div>

                <div class="side_row">
                    <span>Кристаллы</span>
                    <strong>{{ receivedByCategory('Кристаллы') }} из {{ countByCategory('Кристаллы') }}</strong>
                </div>

                <div class="side_row">
                    <span>Задачи</span>
                    <strong>{{ receivedByCategory('Задачи') }} из {{ countByCategory('Задачи') }}</strong>
                </div>

                <div class="side_row">
                    <span>Победы</span>
                    <strong>{{ receivedByCategory('Победы') }} из {{ countByCategory('Победы') }}</strong>
                </div>

                <div class="side_row">
                    <span>Поражения</span>
                    <strong>{{ receivedByCategory('Поражения') }} из {{ countByCategory('Поражения') }}</strong>
                </div>
            </div>
        </aside>
    </main>
</template>

<style scoped>
/* Стили остаются без изменений */
.achievements_page {
    width: min(100% - 80px, 1362px);
    min-height: 100vh;

    margin: 0 auto;

    background: #f8fafc;
    font-family: 'Jost', Arial, sans-serif;
    color: #0d1627;

    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 30px;
}

.achievements_content {
    min-width: 0;
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
    grid-template-columns: repeat(auto-fit, minmax(260px, 260px));
    gap: 20px;
}

.achievements_sidebar {
    width: 220px;

    display: flex;
    flex-direction: column;
    gap: 20px;
}

.side_card {
    width: 100%;

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
    gap: 10px;

    margin-bottom: 18px;

    color: #67758a;
    font-size: 15px;
}

.side_row:last-child {
    margin-bottom: 0;
}

.side_row strong {
    color: #0d1627;
    white-space: nowrap;
}
</style>