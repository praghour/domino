<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import useFishman from '../composables/Arena';
import useAquarium from '../composables/useAquarium.js';
import useGacha from '../composables/useGacha.js';
import useMoney from '../composables/useMoney.js';

// Массив всех возможных боссов
const possibleBosses = ref([
  { id: 1, img: '/Aquarium/boss1.png', name: 'ЗЛАЯ РЫБКА1' },
  { id: 2, img: '/Aquarium/boss2.png', name: 'ЗЛАЯ РЫБКА2' },
  { id: 3, img: '/Aquarium/boss3.png', name: 'ЗЛАЯ РЫБКА3' },
  { id: 4, img: '/Aquarium/boss4.png', name: 'ЗЛАЯ РЫБКА4' },
  { id: 5, img: '/Aquarium/boss5.png', name: 'ЗЛАЯ РЫБКА5' }
]);

const router = useRouter();
const { party, addFishtoParty, removeFishFromParty, fishList, addOrUpdateFish } = useFishman();
const { gacha, win, lastFish } = useGacha();
const aquarium = useAquarium();
const maxTeamHP = computed(() => calculateTeamHP());

// Текущий босс (начинаем с первого)
const currentBoss = ref({ ...possibleBosses.value[0] });
const bossList = ref([...possibleBosses.value]);

// Функция получения случайного босса
const getRandomBoss = () => {
  const randomIndex = Math.floor(Math.random() * possibleBosses.value.length);
  return { ...possibleBosses.value[randomIndex] };
};

// Обновляем доступных рыб в аквариуме при изменении win
watch(win, (newWin) => {
  const winIds = newWin.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
}, { deep: true, immediate: true });

// БАБКИ
const { findCurrency } = useMoney();

const userMoney = computed(() => {
  const money = findCurrency('money');
  return money ? money.count : 0;
});

const userCrystals = computed(() => {
  const crystal = findCurrency('crystal');
  return crystal ? crystal.count : 0;
});
// БАБКИ

// === БОЕВАЯ СИСТЕМА ===
const bossHealth = ref(100);
const bossDamage = ref(2);
const currentbosshp = computed(() => bossHealth.value);
const maxBossHealth = ref(100);
const teamHP = ref(0);
const originalTeamHP = ref(0);
const isFighting = ref(false);
const bosslvl = ref(1)
let fightInterval = null;

const abilitydamage = computed(() => {
  let totalDamage = 0;
  for (const fishy of party.value) {
    if (fishy.abilitytype === 'damage') {
      totalDamage += Number(fishy.abilityvalue) || 0;
    }
  }
  return totalDamage;
});

const abilityheal = computed(() => {
  let totalHeal = 0;
  for (const fishy of party.value) {
    if (fishy.abilitytype === 'heal') {
      totalHeal += Number(fishy.abilityvalue) || 0;
    }
  }
  return totalHeal;
});

const calculateTeamHP = () => {
  let total = 0;
  for (const fish of party.value) {
    total += Number(fish.health);
  }
  return total;
};

// Обновляем HP команды
const updateTeamHP = () => {
  teamHP.value = calculateTeamHP();
  originalTeamHP.value = calculateTeamHP();
};

// Процент HP команды для полоски
const teamHealthPercent = computed(() => {
  if (originalTeamHP.value === 0) return 0;
  return (teamHP.value / originalTeamHP.value) * 100;
});

// Процент HP босса для полоски
const bossHealthPercent = computed(() => {
  return (bossHealth.value / maxBossHealth.value) * 100;
});

// Цвет полоски HP в зависимости от процента
const getHealthBarColor = (percent) => {
  if (percent > 60) return '#4CAF50';
  if (percent > 30) return '#FFC107';
  return '#F44336';
};

// Общий урон рыбок
const fishDamage = computed(() => {
  let currentdamage = 0;
  for (const fish of party.value) {
    currentdamage += Number(fish.damage);
  }
  return currentdamage;
});

// Старт боя
function startFight() {
  if (party.value.length === 0) {
    console.log('Нет рыбок в отряде!');
    return;
  }
  if (isFighting.value) return;
  
  updateTeamHP();
  bossHealth.value = 100;
  bossDamage.value = 2;
  maxBossHealth.value = 100;
  bosslvl.value = 1;
  currentBoss.value = { ...possibleBosses.value[0] }; // Сбрасываем на первого босса
  isFighting.value = true;
  fight();
}

function fight() {
  if (fightInterval) clearInterval(fightInterval);
  
  fightInterval = setInterval(() => {
    if (!isFighting.value) return;
    
    // Проверка жива ли команда перед атакой
    if (teamHP.value <= 0) {
      stopFight();
      return;
    }
    
    // 1. Рыбки атакуют босса
    const totalFishDmg = fishDamage.value;
    const totalabilitydmg = abilitydamage.value;
    const totalabilityheal = abilityheal.value;
    bossHealth.value = Math.max(0, bossHealth.value - totalFishDmg - totalabilitydmg);
    
    // 2. Проверка на смерть босса
    if (bossHealth.value <= 0) {
      // Получаем случайного босса
      const newBoss = getRandomBoss();
      currentBoss.value = newBoss;
      
      // Увеличиваем сложность
      maxBossHealth.value += 25;
      bossHealth.value = maxBossHealth.value;  
      bossDamage.value = bossDamage.value + 2;
      bosslvl.value = bosslvl.value + 1;
      
      console.log(`Новый босс: ${newBoss.name}! HP: ${maxBossHealth.value}, Урон: ${bossDamage.value}`);
      return;
    }
    
    if (teamHP.value > 0) {
      let newTeamHP = Math.min(teamHP.value + totalabilityheal, maxTeamHP.value);
      newTeamHP = newTeamHP - bossDamage.value;
      teamHP.value = Math.max(0, newTeamHP);
    }
    
    // 4. Проверка поражения
    if (teamHP.value <= 0) {
      console.log('Команда побеждена!');
      isFighting.value = false;
      stopFight();
    }
    
  }, 1000);
}

function stopFight() {
  if (fightInterval) {
    clearInterval(fightInterval);
    fightInterval = null;
  }
  isFighting.value = false;
}

function restartFight() {
  stopFight();
  
  // Восстанавливаем здоровье всех рыб в партии
  for (const fish of party.value) {
    const originalFish = fishList.value.find(f => f.id === fish.id);
    if (originalFish) {
      fish.health = originalFish.health;
    }
  }
  
  updateTeamHP();
  bossHealth.value = 100;
  bossDamage.value = 2;
  maxBossHealth.value = 100;
  bosslvl.value = 1;
  currentBoss.value = { ...possibleBosses.value[0] }; // Сбрасываем на первого босса
  startFight();
}

// Фиксированный фон арены
const currentFon = computed(() => {
  return { src: '/Aquarium/fonarena.png' };
});

// === ВЕРТИКАЛЬНЫЙ СЛАЙДЕР (выбор в party) - только когда не в бою ===
const currentIndexArena = ref(0);
const selectedArenaIds = ref([]);

const visibleArenaSlides = computed(() => {
  return aquarium.availableFish.value.slice(currentIndexArena.value, currentIndexArena.value + 3);
});

function nextSlideArena() {
  if (!isFighting.value && currentIndexArena.value + 3 < aquarium.availableFish.value.length) {
    currentIndexArena.value++;
  }
}

function prevSlideArena() {
  if (!isFighting.value && currentIndexArena.value > 0) {
    currentIndexArena.value--;
  }
}

function selectArenaCard(fish) {
  if (!isFighting.value) {
    if (isFishInParty(fish.id)) {
      removeFishFromParty(fish.id);
    } else {
      addFishtoParty(fish.id);
      updateSelectedArenaIds();
      updateTeamHP();
    }
  }
}

function removeFromParty(fishId) {
  if (!isFighting.value) {
    removeFishFromParty(fishId);
    updateSelectedArenaIds();
    updateTeamHP();
  }
}

function updateSelectedArenaIds() {
  selectedArenaIds.value = party.value.map(fish => ({
    id: fish.id,
    src: fish.img,
    alt: fish.name,
    name: fish.name,
    damage: fish.damage,
    health: fish.health,
    abilitytype: fish.abilitytype, 
    abilityvalue: fish.abilityvalue, 
    ability: fish.ability,
    lvl: fish.lvl
  }));
}

function isFishInParty(fishId) {
  return party.value.some(fish => fish.id === fishId);
}

// Обновляем подсветку при изменении party
watch(party, () => {
  updateSelectedArenaIds();
  updateTeamHP();
}, { deep: true });

// === ГАЧА МОДАЛКИ ===
const showGachaModal = ref(false);
const showWinModal = ref(false);

onMounted(() => {
  aquarium.startAnimation();
  
  const winIds = win.value.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
  
  updateSelectedArenaIds();
  updateTeamHP();
});

onBeforeUnmount(() => {
  stopFight();
  aquarium.stopAnimation();
});

const onGachaClick = () => {
  gacha(); // получаем новую рыбку (lastFish)
  
  // ОБНОВЛЯЕМ КОЛЛЕКЦИЮ
  if (lastFish.value) {
    addOrUpdateFish(lastFish.value);
  }
  
  const winIds = win.value.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
  showGachaModal.value = false;
  showWinModal.value = true;
};

function closeWinModal() {
  showWinModal.value = false;
}

function goToAquarium() {
  router.push({ name: 'aquarium' });
}
</script>

<template>
<div class="arena-page">
    <div class="sidebar">
        <!-- БАЛАНС -->
        <div class="your-balanceArena">
            <div class="balance-info">
                <p class="yb-p">Ваш баланс</p>
                <div class="balance-arena">
                    <div class="balance-item"><p>{{ userMoney }}</p><img src="/Aquarium/money.png" alt=""></div>
                    <div class="balance-item"><p>{{ userCrystals }}</p><img src="/Aquarium/crystals.png" alt=""></div>
                </div>
            </div>
        </div>


        <!-- НАСТРОЙКИ -->
        <div class="game-settings">
            <p class="gs-p">Настройки</p>  
            
            <!-- ВЕРТИКАЛЬНЫЙ СЛАЙДЕР (Рыбки НА АРЕНУ) -->
            <p class="gs-p2">Рыбки на арену</p>  
            <div class="slider-arena">   
                <button class="control-btn-arena-up" @click="prevSlideArena()">
                    <img src="/Aquarium/up.png" alt="">
                </button>
                <div class="slides-arena">
                    <div class="slide-arena">
                        <div 
                            v-for="fish in visibleArenaSlides" :key="fish.id" class="arena-item"> 
                            <button class="arena-fish-btn"
                                :class="{ 'active-arena': isFishInParty(fish.id) }"
                                @click="selectArenaCard(fish)">
                                <img :src="fish.src" :alt="fish.alt" />
                            </button>
                            <div class="arena-fish-info">
                                <div class="fish-name">{{ fish.name }} lvl {{ fish.lvl }}</div>
                                <div class="party-stats">HP{{ fish.health }} DMG{{ fish.damage }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="control-btn-arena-down" @click="nextSlideArena()">
                    <img src="/Aquarium/down.png" alt="">
                </button>
            </div>
        </div>  

        <!-- РЕЖИМ ИГРЫ -->
        <div class="game-mode"> 
            <p class="gm-p">Режим игры</p>
            <div class="gm-btns">
                <button class="gm-btn" @click="goToAquarium">Аквариум</button>
                <button class="gm-btn active">Арена</button>
            </div>
        </div>
    </div>

    <!-- АРЕНА с фоном -->
    <div class="arena-container">
        <div style="position: relative; width: 935px; height: 550px;">
            <!-- ФОН арены -->
            <img :src="currentFon.src" alt="фон арены" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
            
            <div class="boss-image">
                <div v-for="boss in bossList" :key="boss.id" class="boss-card">
                    <img :src="boss.img" width="120px" :alt="boss.name">
                </div>
            </div>   
            
            <div class="team-fish-left">
                <div v-for="(fish, index) in party" :key="fish.id" class="arena-fish-card">
                    <img :src="fish.img" width="45px" :alt="fish.name">
                </div>
            </div>           
            <!-- Команда игрока (слева) -->
            <div class="arena-team">
                <div class="team-stats">
                    <p>Ваша команда</p>
                    <div class="stats-row">
                        <span>HP: <strong>{{ teamHP }} / {{ originalTeamHP }}</strong></span>
                        <span>DMG: {{ fishDamage }}</span>
                    </div>
                </div>
                <!-- Полоска HP команды -->
                <div class="health-bar-container">
                    <div 
                        class="health-bar-fill"
                        :style="{
                            width: teamHealthPercent + '%',
                            backgroundColor: getHealthBarColor(teamHealthPercent)
                        }"
                    ></div>
                </div>

            </div>
            
            <!-- Босс (справа) -->
            <div class="arena-boss">
                <div class="boss-header">
                    <h3>БОСС</h3>
                    <span>УРОВЕНЬ {{ bosslvl }}</span>
                </div>
                <div class="boss-stats-row">
                    <span>HP: <strong>{{ currentbosshp }} / {{ maxBossHealth }}</strong></span>
                    <span>DMG: {{ bossDamage }}</span>
                </div>
                <!-- Полоска HP босса -->
                <div class="health-bar-container boss-health">
                    <div 
                        class="health-bar-fill"
                        :style="{
                            width: bossHealthPercent + '%',
                            backgroundColor: getHealthBarColor(bossHealthPercent)
                        }"
                    ></div>
                </div>
<<<<<<< HEAD
                <div class="boss-card">
                <img :src="currentBoss.img" width="80px" :alt="currentBoss.name">
                <p>{{ currentBoss.name }}</p>
                  </div>
=======
>>>>>>> 1cfe63db6d4faaac7a46c6526e5bc3ad7cb78046
            </div>

            <!-- Кнопка начала боя -->
            <div v-if="!isFighting && party.length > 0" class="start-battle">
                <p>Начать игру?</p>
                <button class="start-battle-btn" @click="startFight">В БОЙ!</button>
            </div>

            <!-- Сообщение о поражении -->
            <div v-if="!isFighting && teamHP <= 0 && party.length > 0" class="game-over">
                <p>Поражение!</p>
                <button class="game-over-btn" @click="restartFight">Начать заново</button>
            </div>

            <!-- Затемнение если нет рыбок -->
            <div v-if="party.length === 0 && !isFighting" class="no-fish-message">
                <p>Нет рыбок в отряде</p>
                <p>Добавьте рыбок в аквариуме</p>
            </div>
        </div>
    </div>

    <!-- ГАЧА МОДАЛКА -->
    <div v-if="showGachaModal" class="overlay" @click="showGachaModal = false"></div>
    <div class="gacha" v-if="showGachaModal" @click.self="showGachaModal = false">
        <div class="gacha-hed">
            <p>Испытай удачу</p>
            <button class="close" @click="showGachaModal = false"><img src="/gacha/close.jpg" alt=""></button>
        </div>
        <div class="balance-gacha">
            <p>Ваш баланс</p>
            <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
        </div>
        <div class="select-chest">
            <p class="ppp">Выберите сундук</p>
        </div>
        <div class="chest-cards">
            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item">10<img src="/Aquarium/money.png" style="width: 16px; height: 16px;" alt=""></p>
                <button class="open-btn" @click="onGachaClick">Открыть</button>
            </div>
            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item">10<img src="/Aquarium/money.png" style="width: 16px; height: 16px;" alt=""></p>
                <button class="open-btn" @click="onGachaClick">Открыть</button>
            </div>
            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item">10<img src="/Aquarium/money.png" style="width: 16px; height: 16px;" alt=""></p>
                <button class="open-btn" @click="onGachaClick">Открыть</button>
            </div>
        </div>
    </div>

    <!-- ВЫИГРЫШ МОДАЛКА -->
    <div v-if="showWinModal && lastFish" class="overlay" @click="showWinModal = false"></div>
    <div class="winmodal" v-if="showWinModal && lastFish">
        <div class="gacha-hed">
            <button class="close" @click="showWinModal = false"><img src="/gacha/close.jpg" alt=""></button>
        </div>
        <div class="win-content">
            <img :src="lastFish.img" :alt="lastFish.alt" class="win-fish-img">
            <h3 class="win-fish-name">{{ lastFish.name }}</h3>
            <h3 class="win-fish-name">{{ lastFish.rarity }}</h3>
            <button class="close-win-btn" @click="closeWinModal">Отлично!</button>
        </div>
    </div>
</div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.arena-page {
  display: flex;
  gap: 20px;
  padding: 20px;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.your-balanceArena,
.game-settings,
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

.balance-arena p {
    font-family: 'FRM3216x16', 'FRM325x8', monospace;
}

.balance-item img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
/* БАЛАНС АРЕНА */

/* НАСТРОЙКИ */
.game-settings {
  width: 348px;
  height: auto;
  min-height: 286px;
  padding: 20px;
}


/* Рыбы команды слева, напротив босса */
.team-fish-left {
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

/* Первая рыба */
.arena-fish-card:nth-child(1) {
  position: relative;
  top: 80px;
}

/* Вторая рыба */
.arena-fish-card:nth-child(2) {
  position: relative;
  top: 40px;
  left: 120px;
}

/* Третья рыба */
.arena-fish-card:nth-child(3) {
  position: relative;
  top: 10px;
}

/* Четвертая рыба */
.arena-fish-card:nth-child(4) {
  position: relative;
  top: -10px;
  left: 120px;
}

/* Анимация движения рыб */
.arena-fish-card {
  animation: float 3s ease-in-out infinite;
}

/* Разные задержки для каждой рыбы */
.arena-fish-card:nth-child(1) {
  animation-delay: 0s;
}

.arena-fish-card:nth-child(2) {
  animation-delay: 0.5s;
}

.arena-fish-card:nth-child(3) {
  animation-delay: 1s;
}

.arena-fish-card:nth-child(4) {
  animation-delay: 1.5s;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

.arena-fish-card img {

  width: 120px;
  height: 101px;
  object-fit: cover;
}

.gs-p {
  font-weight: 500;
  font-size: 18px;
  line-height: 100%;
  color: #1A1A1A;
  text-align: left;
  width: 100%;
}

.gs-p2 {
  margin-top: 11px;
  font-weight: 500;
  font-size: 16px;
  line-height: 100%;
  color: #1A1A1A;
  text-align: left;
  width: 100%;
  margin-bottom: 15px;
  margin-top: 20px;
}

/* ВЕРТИКАЛЬНЫЙ СЛАЙДЕР */
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
  background: none;
  border: none;
}

.control-btn-arena-up img,
.control-btn-arena-down img {
  width: 24px;
  height: 24px;
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
  background: #ffffff;
  cursor: pointer;
  padding: 0;
  border-radius: 10px;
  border: 2px solid #E5EAF1;
  overflow: hidden;
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

.party-stats {
  font-size: 11px;
  color: #67758A;
}

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

/* АРЕНА */
.arena-container {
  width: 975px;
  background-color: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px solid #E5EAF1;
}

.arena-team {
  position: absolute;
  left: 20px;
  top: 20px;
  padding: 1px;
  border-radius: 12px;
  color: white;
  min-width: 220px;
}

.team-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2px;
}

.team-stats p {
  font-size: 18px;
  font-weight: 500;
  font-family: 'FRM3216x16', 'FRM325x8', monospace;
}

.stats-row {
  font-family: 'FRM3216x16', 'FRM325x8', monospace;
  font-size: 14px;
  display: flex;
  gap: 20px;
}

/* Стили для полосок HP */
.health-bar-container {
  width: 286px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 12px;
}

.health-bar-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 5px;
}

.boss-health {
  margin-bottom: 15px;
}

/* Босс - стили как у команды игрока, но с выравниванием вправо */
.arena-boss {
  position: absolute;
  right: 20px;
  top: 20px;
  padding: 1px;
  border-radius: 12px;
  color: white;
  min-width: 220px;
  text-align: right;
}

.boss-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}

.boss-header h3 {
  font-size: 18px;
  font-weight: 500;
  font-family: 'FRM3216x16', 'FRM325x8', monospace;
  margin: 0;
}

.boss-header span {
  font-family: 'FRM3216x16', 'FRM325x8', monospace;
  font-size: 14px;
}

.boss-stats-row {
  font-family: 'FRM3216x16', 'FRM325x8', monospace;
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-bottom: 8px;
}

.boss-image {
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

.boss-card {
  text-align: center;
  margin: 0;
}

.boss-card img {
  width: 335px;
  height: 265px;
  object-fit: contain;
}

/* Анимация для босса */
.boss-card {
  text-align: center;
  margin: 0;
  animation: float 3s ease-in-out infinite;
  animation-delay: 0.3s;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

.start-battle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 328px;
  height: 132px;
  background-color: #FFFFFF;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.start-battle p {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #1A1A1A;
}

.start-battle-btn {
  width: 288px;
  height: 43px;
  background-color: #2D78F5;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-battle-btn:hover {
  background-color: #1a5bc4;
}

/* Проигрыш */
.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 328px;
  height: 132px;
  background-color: #FFFFFF;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.game-over p {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #1A1A1A;
}

.game-over-btn {
  width: 288px;
  height: 43px;
  background-color: #EFF3F8;
  border: none;
  border-radius: 10px;
  color: #66748A;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.game-over-btn:hover {
  background-color: #2D78F5;
  color: white;
}

/* ОВЕРЛЕЙ ДЛЯ МОДАЛОК */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  backdrop-filter: blur(5px);
}

/* ГАЧА СТИЛИ */
.gacha {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 725px;
  height: 473px;
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  color: black;
  z-index: 1000;
}

.winmodal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: auto;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  color: rgb(0, 0, 0);
  z-index: 1001;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.win-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.win-fish-img {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.win-fish-name {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
}

.close-win-btn {
  padding: 10px 30px;
  background: #2D78F5;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.balance-gacha {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.gacha-hed {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gacha-hed p {
  font-size: 24px;
  margin: 0;
}

.close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.close img {
  width: 100%;
  height: 100%;
  display: block;
}

.select-chest {
  margin-top: 20px;
}

.select-chest p {
  color: #67758A;
  font-size: 16px;
  text-align: left;
}

.chest-cards {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.chest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 15px;
  width: 221px;
}

.chest-card img {
  width: 221px;
  height: 200px;
  object-fit: contain;
}

.open-btn {
  width: 99px;
  height: 43px;
  background-color: #EFF3F8;
  color: #66748A;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.open-btn:hover {
  background-color: #2D78F5;
  color: #FEFEFE;
}
</style>