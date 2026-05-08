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

<!-- <script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, computed } from "vue";
import useArena from "../composables/useArena.js";

const arena = useArena();

const activeMode = ref("arena");

const setActiveMode = (mode) => {
  activeMode.value = mode;
};

const visibleArenaSlides = computed(() => {
  return arena.arenaSlides.value.slice(arena.currentIndexArena.value, arena.currentIndexArena.value + 3);
});

</script>

<template>
<div class="page">
    <div class="sidebar">

        <div class="your-balanceArena">
            <div class="balance-info">
                <p class="yb-p">Ваш баланс</p>
                <div class="balance-arena">
                    <div class="balance-item">10<img src="/Aquarium/money.png" alt=""></div>
                    <div class="balance-item">10<img src="/Aquarium/crystals.png" alt=""></div>
                </div>
            </div>
        </div>

        <div class="settings-arena">
            <p class="gs-p-arena">Отправить на арену</p>  

            <div class="slider-arena">   
                <button class="control-btn-arena-up" @click="arena.prevSlideArena()">
                    <img src="/Aquarium/up.png" alt="">
                </button>
                <div class="slides-arena">
                    <div class="slide-arena">
                        <div 
                            v-for="(slide) in visibleArenaSlides" :key="slide.id" class="arena-item"> 
                            <button class="arena-fish-btn"
                                :class="{ 'active-arena': arena.selectedArenaIds.value.some(a => a.id === slide.id) }"
                                @click="arena.selectArenaCard(slide)">
                                <img :src="slide.src" :alt="slide.alt" />
                            </button>
                            <div class="arena-fish-info">
                                <div class="fish-name">Название</div>
                                <div class="fish-ability">Способность</div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="control-btn-arena-down" @click="arena.nextSlideArena()">
                    <img src="/Aquarium/down.png" alt="">
                </button>
            </div>
        </div>

        <div class="game-mode"> 
            <p class="gm-p">Режим игры</p>
            <div class="gm-btns">
                <button class="gm-btn" :class="{ 'active': activeMode === 'aquarium' }" 
                @click="setActiveMode('aquarium')">Аквариум</button>
                <button class="gm-btn" :class="{ 'active': activeMode === 'arena' }" 
                @click="setActiveMode('arena')">Арена</button>
            </div>
        </div>
    </div>

    <div class="arena-block">
        <img src="/Aquarium/fonarena.png" alt="">
    </div>

</div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.page {
  display: flex;
  gap: 20px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  width: 1362px;
  height: 620px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.your-balanceArena,
.settings-arena,
.game-mode {
  background-color: white;
  border-radius: 20px;
  border: 1px solid #E5EAF1;
}

/* БАЛАНС АРЕНА */
.your-balanceArena {
  width: 348px;
  height: 97px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 69px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.yb-p {
  font-weight: 500;
  font-size: 18px;
  line-height: 100%;
  color: #1A1A1A;
  text-align: left;
  margin: 0;
}

.balance-arena {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 50px;
  width: 100%;
  margin-left: 45px;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 20px;
  color: #1A1A1A;
  margin: 0;
}

.balance-item img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
/* БАЛАНС АРЕНА */

/* НАСТРОЙКИ АРЕНА */
.settings-arena {
  width: 348px;
  height: 367px;
  padding: 20px;
}

.gs-p-arena {
  font-weight: 500;
  font-size: 18px;
  line-height: 100%;
  color: #1A1A1A;
  text-align: left;
  width: 100%;
  margin-bottom: 20px;
}
/* НАСТРОЙКИ АРЕНА */

/* ВЕРТИКАЛЬНЫЙ СЛАЙДЕР АРЕНА */
.slider-arena {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  width: 308px;
  height: auto;
}

.control-btn-arena-up,
.control-btn-arena-down {
  width: 24px;
  height: 24px;
  display: block;
  cursor: pointer;
}

.control-btn-arena-up img,
.control-btn-arena-down img {
  width: 24px;
  height:24px;
}

.slides-arena {
  width: 100%;
  overflow: hidden;
}

.slide-arena {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.arena-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.arena-fish-btn {
  width: 72px;
  height: 64px;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: 10px;
  border: 2px solid #E5EAF1;
  overflow: hidden;
  flex-shrink: 0;
}

.arena-fish-btn.active-arena {
  border: 2px solid #2D78F5;
}

.arena-fish-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

.arena-fish-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fish-name {
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
}

.fish-ability {
  font-weight: 400;
  font-size: 14px;
  color: #67758A;
}
/* ВЕРТИКАЛЬНЫЙ СЛАЙДЕР АРЕНА */

/* РЕЖИМ ИГРЫ */
.game-mode {
  width: 348px;
  height: 116px;
  padding: 20px;
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.gm-p {
  font-weight: 500;
  font-size: 18px;
  line-height: 100%;
  color: #1A1A1A;
  text-align: left;
  width: 100%;
}

.gm-btns {
  display: flex;
  gap: 10px;
}

.gm-btn {
  width: 148px;
  height: 43px;
  background-color: #EFF3F8;
  color: #1A1A1A;
  border: 1px solid #E5EAF1;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.25s;
}

.gm-btn:hover {
  background-color: #DBEAFD;
}

.gm-btn.active {
  background-color: #DBEAFD;
  color: #2D78F5;
  border-color: #E5EAF1;
}
/* РЕЖИМ ИГРЫ */

/* АРЕНА */
.arena-block {
  width: 975px;
  height: 550px;
  background-color: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px solid #E5EAF1;
}

.arena-block img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
</style> -->