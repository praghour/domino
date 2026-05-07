<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import useFishman from '../composables/Arena';

const { fishList, bossList } = useFishman();

const bossHealth = ref(100);
const bossDamage = ref(2);
const currentbosshp = computed(() => bossHealth.value);
const maxBossHealth = ref(100);
// Общее HP команды (реактивная переменная)
const teamHP = ref(0);

// Сохраняем исходное общее HP
const originalTeamHP = ref(0);

// Вычисляем начальное HP команды
for (const fish of fishList.value) {
    const hp = Number(fish.health);
    teamHP.value += hp;
    originalTeamHP.value += hp;
}

// Общий урон рыбок
const fishDamage = computed(() => {
    let currentdamage = 0;
    for (const fish of fishList.value) {
        const dmg = Number(fish.damage);
        currentdamage += dmg;
    }
    return currentdamage;
});

const isFighting = ref(true);
let fightInterval = null;

function fight() {
    if (fightInterval) clearInterval(fightInterval);
    
    fightInterval = setInterval(() => {
        if (!isFighting.value) return;
        
        // 1. Рыбки атакуют босса
        const totalFishDmg = fishDamage.value;
        bossHealth.value = Math.max(0, bossHealth.value - totalFishDmg);
        
        // 2. Проверка на смерть босса
        if (bossHealth.value <= 0) {
            maxBossHealth.value += 25;
            bossHealth.value = maxBossHealth.value;  
            bossDamage.value = bossDamage.value + 2
        }
        
        // 3. Босс атакует рыбок
        if (teamHP.value > 0 && bossHealth.value > 0) {
            teamHP.value = Math.max(0, teamHP.value - bossDamage.value);
        }
        
        // 4. Проверка поражения
        if (teamHP.value <= 0) {
            console.log('Команда побеждена!');
            isFighting.value = false;
            stopFight();
        }
        
    }, 3000);
}

function stopFight() {
    if (fightInterval) {
        clearInterval(fightInterval);
        fightInterval = null;
    }
}

function restartFight() {
    stopFight();
    
    // Восстанавливаем HP босса
    bossHealth.value = 100;
    
    // Восстанавливаем общее HP команды
    teamHP.value = originalTeamHP.value;
    
    isFighting.value = true;
    fight();
}

// Отслеживаем урон босса
watch(currentbosshp, (newHp, oldHp) => {
    if (oldHp !== undefined && newHp < oldHp) {
        const damage = oldHp - newHp;
        console.log(`Боссу нанесено ${damage} урона! Осталось HP: ${newHp}`);
    }
    
    if (oldHp === 0 && newHp > 0) {
        console.log(`Босс воскрес с новым HP: ${newHp}`);
    }
});

// Запуск боя
fight();

onBeforeUnmount(() => {
    stopFight();
});
</script>

<template>
    <div class="fish">
        <h3>Ваша команда</h3>
        <div>Общее HP команды: <strong>{{ teamHP }}</strong></div>
        <div>Общий урон рыбок: {{ fishDamage }}</div>
        
        <div v-for="value in fishList" :key="value.id" class="fish-card">
            <img :src="value.img" width="50px" :alt="value.name">
            <p>{{ value.name }}</p>
            <p>Урон: {{ value.damage }}</p>
        </div>
    </div>
    
    <div class="uebok">
        <h3>Босс</h3>
        <div>HP босса: <strong>{{ currentbosshp }}</strong></div>
        <div>Урон босса: {{ bossDamage }}</div>
        
        <div v-for="value in bossList" :key="value.id">
            <img :src="value.img" width="50px" :alt="value.name">
            <p>{{ value.name }}</p>
        </div>
        
        <div v-if="!isFighting" class="game-over">
            <h2>Игра окончена!</h2>
            <button @click="restartFight">Начать заново</button>
        </div>
    </div>
</template>

<style scoped>
.fish {
    position: absolute;
    left: 20px;
    top: 20px;
}

.uebok {
    position: absolute;
    right: 20px;
    top: 20px;
    text-align: right;
}

.fish-card {
    margin: 10px 0;
    border: 1px solid #ccc;
    padding: 10px;
}

.game-over {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 1000;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
}

button:hover {
    background: #45a049;
}
</style>