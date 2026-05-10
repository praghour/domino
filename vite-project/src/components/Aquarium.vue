<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import useAquarium from "../composables/useAquarium.js";
import useGacha from "../composables/useGacha.js";
import useFishman from "../composables/Arena.js";
import useMoney from '../composables/useMoney.js';
import useNotice from '../composables/useNotice.js';

const router = useRouter()
const { gacha, win, lastFish } = useGacha();
const { fishList, addFishtoParty, removeFishFromParty, party, addOrUpdateFish } = useFishman();
const aquarium = useAquarium();

// балванка для тестов 
const addTestCurrency = () => {
  addCurrency('money', 10);
  addCurrency('crystal', 10);
};

// БАБКИ
const { findCurrency, spendCurrency, currency, addCurrency } = useMoney();
const { showNotice, isNoticeVisible, notice } = useNotice();

const userMoney = computed(() => {
  const money = findCurrency('money');
  return money ? money.count : 0;
});

const userCrystals = computed(() => {
  const crystal = findCurrency('crystal');
  return crystal ? crystal.count : 0;
});

// Обновляем доступных рыб в аквариуме при изменении win
watch(win, (newWin) => {
  const winIds = newWin.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
}, { deep: true, immediate: true });

// === РЕЖИМЫ ===
const activeMode = ref("aquarium");

const setActiveMode = (mode) => {
  activeMode.value = mode;
};

// === АКВАРИУМ: горизонтальный слайдер (фоны) ===
const visibleFonSlides = computed(() => {
  return aquarium.slidesfon.value.slice(aquarium.currentIndexFon.value, aquarium.currentIndexFon.value + 3);
});

const currentFon = computed(() => {
  return aquarium.slidesfon.value.find(f => f.id === aquarium.selectedFonId.value);
});

// === НОВОЕ: для слайдера рыб с блокировкой используем allFishWithStatus ===
const currentIndexFish = ref(0);

// МЕНЯЕМ: теперь показываем ВСЕХ рыб с флагом блокировки
const visibleFishSlides = computed(() => {
  const fishArray = aquarium.allFishWithStatus?.value || aquarium.availableFish.value;
  return fishArray.slice(currentIndexFish.value, currentIndexFish.value + 3);
});

function nextSlideFish() {
  const fishArray = aquarium.allFishWithStatus?.value || aquarium.availableFish.value;
  if (currentIndexFish.value + 3 < fishArray.length) {
    currentIndexFish.value++;
  }
}

function prevSlideFish() {
  if (currentIndexFish.value > 0) {
    currentIndexFish.value--;
  }
}

function selectAquariumFish(fish) {
  // НОВОЕ: проверка на разблокировку
  if (!fish.isUnlocked && fish.isUnlocked !== undefined) {
    showNotice('Заблокировано', `Рыба "${fish.name}" ещё не разблокирована! Выбейте её в сундуках или на арене.`);
    return;
  }
  aquarium.selectFish(fish);
}

function isFishInAquarium(fishId) {
  return aquarium.selectedFishIds.value.some(fish => fish.id === fishId);
}

// НОВОЕ: функция для стилизации карточки рыбы
function getFishCardClass(fish) {
  return {
    'bgfish-btn': true,
    'active-fish': isFishInAquarium(fish.id),
    'locked-fish': !fish.isUnlocked && fish.isUnlocked !== undefined
  };
}

// === ВЕРТИКАЛЬНЫЙ СЛАЙДЕР (рыбки НА АРЕНУ в отряд) ===
const currentIndexArena = ref(0);
const selectedArenaIds = ref([]);
const showPartyList = ref(false);

const visibleArenaSlides = computed(() => {
  return aquarium.availableFish.value.slice(currentIndexArena.value, currentIndexArena.value + 3);
});

function nextSlideArena() {
  if (currentIndexArena.value + 3 < aquarium.availableFish.value.length) {
    currentIndexArena.value++;
  }
}

function prevSlideArena() {
  if (currentIndexArena.value > 0) {
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
  removeFishFromParty(fishId);
  updateSelectedArenaIds();
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

function togglePartyList() {
  showPartyList.value = !showPartyList.value;
}

watch(party, () => {
  updateSelectedArenaIds();
}, { deep: true });

// === ГАЧА МОДАЛКИ ===
const showGachaModal = ref(false);
const showWinModal = ref(false);

onMounted(() => {
  aquarium.startAnimation();
  const winIds = win.value.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
  updateSelectedArenaIds();

});

onUnmounted(() => {
  aquarium.stopAnimation();
});

const onGachaClick = () => {
  const money = findCurrency('money');
  
  if (!money || money.count < 10) {
    showNotice('Ошибка', 'Недостаточно монет! Нужно 10 монет для открытия сундука.');
    return;
  }
  
  const success = spendCurrency('money', 10);
  
  if (!success) {
    showNotice('Ошибка', 'Не удалось списать монеты. Попробуйте снова.');
    return;
  }
  
  gacha();
  
  if (lastFish.value) {
    addOrUpdateFish(lastFish.value);
    // НОВОЕ: разблокируем полученную рыбу
    if (aquarium.unlockFish) {
      aquarium.unlockFish(lastFish.value.id);
    }
  }
  
  const winIds = win.value.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
  showGachaModal.value = false;
  showWinModal.value = true;
};

function closeWinModal() {
  showWinModal.value = false;
}
</script>

<template>
<div class="page">
    <div class="sidebar">
        <!-- БАЛАНС -->
        <div class="your-balance">
            <div class="balance-info">
                <p class="yb-p">Ваш баланс</p>
                <div class="balance-values">
                    <p class="balance-item">{{ userMoney }}<img src="/Aquarium/money.png" alt=""></p>
                    <p class="balance-item">{{ userCrystals }}<img src="/Aquarium/crystals.png" alt=""></p>
                    <button @click="addTestCurrency">+10</button>
                </div>
            </div>
            <button class="chest-btn" @click="showGachaModal = true">Сундуки</button>
        </div>

        <!-- НАСТРОЙКИ -->
        <div class="game-settings">
            <p class="gs-p">Настройки</p>  
            
            <!-- ГОРИЗОНТАЛЬНЫЙ СЛАЙДЕР (ФОН) -->
            <p class="gs-p2">Фон</p>
            <div class="slider">   
                <button class="control-btn" @click="aquarium.prevSlideFon()">
                    <img src="/Aquarium/left.png" alt="">
                </button>
                <div class="slides">
                    <div class="slide">
                        <div v-for="(slide) in visibleFonSlides" :key="slide.id" style="position: relative; width: 72px; height: 64px;">
                            <button 
                                class="bgfon-btn"
                                :class="{ 'active-fon': aquarium.selectedFonId.value === slide.id }"
                                @click="aquarium.selectFon(slide)">
                                <img :src="slide.src" :alt="slide.alt" />
                            </button>
                            <div v-if="!slide.isUnlocked && slide.price > 0" class="fon-locked-overlay" @click.stop="aquarium.buyFon(slide)">
                                <div class="fon-price-center">
                                    <span class="fon-price-text">{{ slide.price }}</span>
                                    <img src="/Aquarium/crystals.png" class="fon-price-icon" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="control-btn" @click="aquarium.nextSlideFon()">
                    <img src="/Aquarium/right.png" alt="">
                </button>
            </div>  

            <!-- ГОРИЗОНТАЛЬНЫЙ СЛАЙДЕР (Рыбки В АКВАРИУМ) -->
            <p class="gs-p2">Рыбки в аквариум</p>
            <div class="slider">   
                <button class="control-btn" @click="prevSlideFish()">
                    <img src="/Aquarium/left.png" alt="">
                </button>
                <div class="slides">
                    <div class="slide">
                        <!-- ИЗМЕНЕНО: добавляем обертку для замка -->
                        <div 
                            v-for="(fish) in visibleFishSlides" :key="fish.id" 
                            style="position: relative; width: 72px; height: 64px;">
                            <button 
                                :class="getFishCardClass(fish)"
                                @click="selectAquariumFish(fish)"
                                :disabled="!fish.isUnlocked && fish.isUnlocked !== undefined">
                                <div class="fish-card-content">
                                    <img :src="fish.src" :alt="fish.alt" />
                                    <!-- НОВОЕ: иконка замка для заблокированных рыб -->
                                    <div v-if="!fish.isUnlocked && fish.isUnlocked !== undefined" class="fish-locked-overlay">
                                        <span class="lock-icon">🔒</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <button class="control-btn" @click="nextSlideFish()">
                    <img src="/Aquarium/right.png" alt="">
                </button>
            </div>
            
            <!-- НОВОЕ: подсказка -->
            <div class="hint-text">
                <span class="lock-icon-small">🔒</span> - рыба ещё не разблокирована (выбейте в сундуках)
            </div>
        </div>  

        <!-- РЕЖИМ ИГРЫ -->
        <div class="game-mode"> 
            <p class="gm-p">Режим игры</p>
            <div class="gm-btns">
                <button class="gm-btn" :class="{ 'active': activeMode === 'aquarium' }" @click="setActiveMode('aquarium')">Аквариум</button>
                <button class="gm-btn" :class="{ 'active': activeMode === 'arena' }" @click="router.push({name: 'arena'})">Арена</button>
            </div>
        </div>
    </div>

    <!-- АКВАРИУМ -->
    <div class="aquarium-block" v-if="activeMode === 'aquarium'">
        <div style="position: relative; width: 935px; height: 550px;">
            <img :src="currentFon.src" alt="фон" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
            <div 
                v-for="fish in aquarium.selectedFishIds.value" 
                :key="fish.id"
                :style="aquarium.getFishStyle(fish)">
                <img :src="fish.src" :alt="fish.alt" style="width: 100%; height: 100%; object-fit: contain;" />
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
            <p class="balance-item">{{ userMoney }}<img src="/Aquarium/money.png" alt=""></p>
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

    <!-- УВЕДОМЛЕНИЕ -->
    <teleport to="body">
        <div v-if="isNoticeVisible" class="notice">
            <div class="notice-content">
                <h4>{{ notice.title }}</h4>
                <p>{{ notice.description }}</p>
            </div>
        </div>
    </teleport>
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
  align-items: flex-start;
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

.balance-values p {
    font-family: 'FRM3216x16', 'FRM325x8', monospace;
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
  border: none;
  outline: none;
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

/* ГОРИЗОНТАЛЬНЫЙ СЛАЙДЕР */
.slider {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 10px;
  width: 308px;
  height: 72px;
}

.control-btn {
  width: 24px;
  height: 24px;
  display: block;
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: none;
}

.control-btn img {
  width: 6px;
  height: 12px;
}

.slides {
  flex: 1;
  overflow: hidden;
}

.slide {
  display: flex;
  gap: 10px;
}

/* Стиль для кнопки фона */
.bgfon-btn {
  width: 72px;
  height: 64px;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: 10px;
  border: 2px solid #E5EAF1;
  overflow: hidden;
}

.bgfon-btn.active-fon {
  border: 2px solid #2D78F5;
}

.bgfon-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}


/* Стиль для кнопки рыбок в аквариум */
.bgfish-btn {
  width: 72px;
  height: 64px;
  background: #ffffff;
  cursor: pointer;
  padding: 0;
  border-radius: 10px;
  border: 2px solid #E5EAF1;
  overflow: hidden;
  position: relative;
}

.bgfish-btn.active-fish {
  border: 2px solid #2D78F5;
}

/* НОВОЕ: стиль для заблокированной рыбы */
.bgfish-btn.locked-fish {
  opacity: 0.7;
  filter: grayscale(0.3);
}

.bgfish-btn:disabled {
  cursor: not-allowed;
}

.fish-card-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.bgfish-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

/* НОВОЕ: оверлей с замком */
.fish-locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 24px;
  color: white;
  text-shadow: 0 0 3px black;
}

/* НОВОЕ: подсказка */
.hint-text {
  margin-top: 10px;
  font-size: 11px;
  color: #67758A;
  text-align: center;
}

.lock-icon-small {
  font-size: 12px;
  margin-right: 4px;
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

/* АКВАРИУМ */
.aquarium-block {
  width: 975px;
  background-color: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px solid #E5EAF1;
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


/* ПОКУПКА ФОНОФ */
.fon-locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 72px;
  height: 64px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
}

.fon-price-center {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
}

.fon-price-text {
  font-size: 18px;
  font-weight: bold;
}

.fon-price-icon {
  width: 24px;
  height: px;
  object-fit: contain;
}

/* ПОКУПКА ФОНОФ */
</style>