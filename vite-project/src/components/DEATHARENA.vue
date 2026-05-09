<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import useFishman from '../composables/Arena';
import useAquarium from '../composables/useAquarium.js';
import useGacha from '../composables/useGacha.js';

const router = useRouter();
const { party, bossList, addFishtoParty, removeFishFromParty, fishList, addOrUpdateFish } = useFishman();
const { gacha, win, lastFish } = useGacha();
const aquarium = useAquarium();
const maxTeamHP = computed(() => calculateTeamHP()); // <-- ДОБАВИТЬ ЭТО
// Обновляем доступных рыб в аквариуме при изменении win
watch(win, (newWin) => {
  const winIds = newWin.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
}, { deep: true, immediate: true });

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
    if (fishy.abilitytype === 'damage') {  // тип способности у каждой рыбки
      totalDamage += Number(fishy.abilityvalue) || 0;
    }
  }
  return totalDamage;
});

const abilityheal = computed(() => {
  let totalHeal = 0;
  for (const fishy of party.value) {
    if (fishy.abilitytype === 'heal') {  // тип способности у каждой рыбки
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
      maxBossHealth.value += 25;
      bossHealth.value = maxBossHealth.value;  
      bossDamage.value = bossDamage.value + 2;
      bosslvl.value = bosslvl.value +1;
      console.log('Босс возродился с новыми силами! HP:', maxBossHealth.value, 'Урон:', bossDamage.value);
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
  bosslvl.value = 1
  startFight();
}

// === ФОН ===
const currentFon = computed(() => {
  return aquarium.slidesfon.value.find(f => f.id === aquarium.selectedFonId.value);
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
  const fishId = fish.id;
  
  if (isFishInParty(fishId)) {
    removeFishFromParty(fishId);
  } else {
    addFishtoParty(fishId);
  }
  
  updateSelectedArenaIds();
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
        <div class="your-balance">
            <div class="balance-info">
                <p class="yb-p">Ваш баланс</p>
                <div class="balance-values">
                    <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
                    <p class="balance-item">10<img src="/Aquarium/crystals.png" alt=""></p>
                </div>
            </div>
            <button class="chest-btn" @click="showGachaModal = true">Сундуки</button>
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
                            v-for="(fish) in visibleArenaSlides" :key="fish.id" class="arena-item"> 
                            <button class="arena-fish-btn"
                                :class="{ 'active-arena': isFishInParty(fish.id) }"
                                @click="selectArenaCard(fish)">
                                <img :src="fish.src" :alt="fish.alt" />
                            </button>
                            <div class="arena-fish-info">
                                <div class="fish-name">{{ fish.name }} lvl {{ fish.lvl }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="control-btn-arena-down" @click="nextSlideArena()">
                    <img src="/Aquarium/down.png" alt="">
                </button>
            </div>

            <!-- ТЕКУЩИЙ ОТРЯД -->
            <p class="gs-p2">Текущий отряд</p>
            <div class="current-party">
                <div v-for="fish in party" :key="fish.id" class="party-item">
                    <img :src="fish.img" :alt="fish.name">
                    <div class="party-info">
                        <div class="party-name">{{ fish.name }} lvl {{ fish.lvl }}</div>
                        <div class="party-stats">HP{{ fish.health }} DMG{{ fish.damage }}</div>
                    </div>
                    <button class="remove-party-btn" @click="removeFromParty(fish.id)" :disabled="isFighting">✖</button>
                </div>
                <div v-if="party.length === 0" class="empty-party">
                    Нет рыбок в отряде
                </div>
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
            
            <!-- Команда игрока (слева) -->
            <div class="arena-team">
                <h3>Ваша команда</h3>
                <div class="team-stats">
                    <span>HP: <strong>{{ teamHP }} / {{ originalTeamHP }}</strong></span>
                    <span>DMG: {{ fishDamage }}</span>
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
                <div class="team-members">
                    <div v-for="fish in party" :key="fish.id" class="arena-fish-card">
                        <img :src="fish.img" width="35px" :alt="fish.name">
                        <span>{{ fish.name }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Босс (справа) -->
            <div class="arena-boss">
                <h3>БОСС</h3>
                <h2> УРОВЕНЬ {{ bosslvl }} </h2>
                <div class="boss-stats">
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
                <div v-for="boss in bossList" :key="boss.id" class="boss-card">
                    <img :src="boss.img" width="80px" :alt="boss.name">
                    <p>{{ boss.name }}</p>
                </div>
            </div>

            <!-- Кнопка начала боя -->
            <div v-if="!isFighting && party.length > 0" class="start-battle-btn">
                <button @click="startFight">В БОЙ</button>
            </div>

            <!-- Сообщение о поражении -->
            <div v-if="!isFighting && teamHP <= 0 && party.length > 0" class="game-over">
                <h2>Поражение!</h2>
                <button @click="restartFight">Начать заново</button>
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

.your-balance,
.game-settings,
.game-mode {
  background-color: white;
  border-radius: 20px;
  border: 1px solid #E5EAF1;
}

/* БАЛАНС */
.your-balance {
  width: 348px;
  height: 133px;
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

.balance-values {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  font-size: 16px;
  color: #1A1A1A;
  margin: 0;
}

.balance-item img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.chest-btn {
  width: 104px;
  height: 43px;
  border-radius: 10px;
  padding: 10px 20px;
  background-color: #2D78F5;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

/* НАСТРОЙКИ */
.game-settings {
  width: 348px;
  height: auto;
  min-height: 286px;
  padding: 20px;
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
  background: #EFF3F8;
  cursor: pointer;
  padding: 0;
  border-radius: 10px;
  border: 2px solid #E5EAF1;
  overflow: hidden;
  flex-shrink: 0;
}

.arena-fish-btn.active-arena {
  border: 2px solid #2D78F5;
  background: #DBEAFD;
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
  font-size: 12px;
  color: #67758A;
}

/* ТЕКУЩИЙ ОТРЯД */
.current-party {
  width: 308px;
  max-height: 200px;
  overflow-y: auto;
  background: #EFF3F8;
  border-radius: 10px;
  padding: 8px;
}

.party-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #E5EAF1;
}

.party-item img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
}

.party-info {
  flex: 1;
}

.party-name {
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
}

.party-stats {
  font-size: 11px;
  color: #67758A;
}

.remove-party-btn {
  width: 24px;
  height: 24px;
  background: #FF4D4F;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-party-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.remove-party-btn:hover:not(:disabled) {
  background: #ff7875;
}

.empty-party {
  text-align: center;
  color: #67758A;
  padding: 20px;
  font-size: 14px;
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  color: white;
  min-width: 220px;
}

.team-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

/* Стили для полосок HP */
.health-bar-container {
  width: 100%;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
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

.team-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.arena-fish-card {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.arena-boss {
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  color: white;
  text-align: center;
  min-width: 170px;
}

.boss-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.boss-card {
  text-align: center;
  margin-top: 10px;
}

.boss-card img {
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
}

.start-battle-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.start-battle-btn button {
  padding: 12px 30px;
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}

.start-battle-btn button:hover {
  transform: scale(1.05);
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  z-index: 100;
}

.game-over button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
}

.no-fish-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  z-index: 100;
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