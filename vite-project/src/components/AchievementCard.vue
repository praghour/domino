<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import useMoney from '../composables/useMoney.js';

const props = defineProps({
    achievement: {
        type: Object,
        required: true
    }
});

const { addCurrency } = useMoney();
const isClaimed = ref(false);
const isReceived = ref(props.achievement.isReceived);

// Загрузка состояния полученных наград
const loadClaimedState = () => {
    const claimedRewards = localStorage.getItem('claimedAchievements');
    if (claimedRewards) {
        const claimed = JSON.parse(claimedRewards);
        isClaimed.value = claimed.includes(props.achievement.title);
    }
};

// Сохранение состояния полученной награды
const saveClaimedState = () => {
    const claimedRewards = localStorage.getItem('claimedAchievements');
    let claimed = claimedRewards ? JSON.parse(claimedRewards) : [];
    
    if (!claimed.includes(props.achievement.title)) {
        claimed.push(props.achievement.title);
        localStorage.setItem('claimedAchievements', JSON.stringify(claimed));
    }
};

// Награда за достижение
const getRewardAmount = (achievement) => {
    if (achievement.reward) {
        return achievement.reward;
    }
    
    let baseReward = 10;
    
    if (achievement.target >= 100) {
        baseReward = 50;
    } else if (achievement.target >= 50) {
        baseReward = 25;
    } else if (achievement.target >= 10) {
        baseReward = 15;
    }
    
    return baseReward;
};

const claimReward = () => {
    if (isClaimed.value) return;
    
    const rewardAmount = getRewardAmount(props.achievement);
    addCurrency('money', rewardAmount);
    
    isClaimed.value = true;
    saveClaimedState();
};

// Следим за изменением 
watch(() => props.achievement.isReceived, (newValue) => {
    isReceived.value = newValue;
});

// отслеживаниe изменений в localStorage
const storageListener = (event) => {
    if (event.key === 'claimedAchievements') {
        loadClaimedState();
    }
};

// событие обновления статистики
const handleStatsUpdate = () => {
    isReceived.value = props.achievement.isReceived;
};

onMounted(() => {
    loadClaimedState();
    isReceived.value = props.achievement.isReceived;
    
    //изменения в localStorage
    window.addEventListener('storage', storageListener);
    

    window.addEventListener('achievements-updated', handleStatsUpdate);
});

onUnmounted(() => {
    window.removeEventListener('storage', storageListener);
    window.removeEventListener('achievements-updated', handleStatsUpdate);
});
</script>

<template>
    <div class="achievement_card">
        <div class="achievement_top">
            <div class="achievement_icon" :class="props.achievement.color">
                <img :src="props.achievement.image" :alt="props.achievement.title">
            </div>

            <div>
                <h3>{{ props.achievement.title }}</h3>
                <p>{{ props.achievement.description }}</p>
            </div>
        </div>

        <div v-if="isReceived === true && isClaimed === true" class="received">
            Получено
        </div>

        <button v-else-if="isReceived === true && isClaimed === false" class="claim-btn" @click="claimReward"> 
            <span>{{ getRewardAmount(props.achievement) }}</span>
            <img src="/Aquarium/money.png" alt="">
        </button>

        <div v-else class="progress_box">
            <div class="progress_line">
                <div class="progress_fill" :style="{ width: props.achievement.percent + '%' }"></div>
            </div>

            <p>{{ props.achievement.progress }}/{{ props.achievement.target }}</p>
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

.claim-btn {
    height: 32px;

    background: #2D78F5;
    border: none;
    border-radius: 8px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.claim-btn:hover {
    background: #1a5bc4;
}

.claim-btn img {
    width: 18px;
    height: 18px;
    object-fit: contain;
}

.claim-btn span {
    color: white;
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