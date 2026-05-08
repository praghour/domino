<script setup>
defineProps({
    achievement: {
        type: Object,
        required: true
    }
});
</script>

<template>
    <div class="achievement_card">
        <div class="achievement_top">
            <div class="achievement_icon" :class="achievement.color">
                <img :src="achievement.image" :alt="achievement.title">
            </div>

            <div>
                <h3>{{ achievement.title }}</h3>
                <p>{{ achievement.description }}</p>
            </div>
        </div>

        <div v-if="achievement.isReceived === true" class="received">
            Получено
        </div>

        <div v-else class="progress_box">
            <div class="progress_line">
                <div class="progress_fill" :style="{ width: achievement.percent + '%' }"></div>
            </div>

            <p>{{ achievement.progress }}/{{ achievement.target }}</p>
        </div>
    </div>
</template>

<style scoped>
.achievement_card {
    width: 260px;
    height: 135px;

    padding: 10px;

    background: #ffffff;
    border: 1px solid #e5eaf1;
    border-radius: 16px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.achievement_top {
    display: flex;
    align-items: center;
    gap: 12px;
}

.achievement_icon {
    width: 72px;
    height: 72px;

    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;
}

.achievement_icon img {
    width: 52px;
    height: 52px;
    object-fit: contain;
}

.coin {
    background: #fff4ce;
}

.crystal {
    background: #eaf2ff;
}

.task {
    background: #eaf8ef;
}

.archive {
    background: #eaf8ef;
}

.win {
    background: #ffe0dc;
}

.lose {
    background: #eadcf8;
}

.achievement_card h3 {
    margin: 0;

    color: #0d1627;
    font-size: 15px;
    font-weight: 600;
    line-height: 18px;
}

.achievement_card p {
    margin: 0;

    color: #67758a;
    font-size: 13px;
    line-height: 16px;
}

.received {
    height: 32px;

    background: #ebf8ef;
    border: 1px solid #c7f0d4;
    border-radius: 8px;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #4cae6c;
    font-size: 15px;
    font-weight: 600;
}

.progress_box {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.progress_line {
    width: 100%;
    height: 18px;

    border: 1px solid #e5eaf1;
    border-radius: 20px;

    overflow: hidden;
    background: #ffffff;
}

.progress_fill {
    height: 100%;

    background: #2d78f5;
    border-radius: 20px;
}

.progress_box p {
    text-align: center;

    color: #67758a;
    font-size: 16px;
    font-weight: 500;
}
</style>