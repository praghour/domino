<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import useAquarium from "../composables/useAquarium.js";
import useGacha from "../composables/useGacha.js";
import useFishman from "../composables/Arena.js";
const router = useRouter()
const { gacha, win, lastFish } = useGacha();
const { fishList, addFishtoParty, removeFishFromParty, party } = useFishman();
const aquarium = useAquarium();

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

// === ГОРИЗОНТАЛЬНЫЙ СЛАЙДЕР (рыбки В АКВАРИУМ для плавания) ===
const currentIndexFish = ref(0);

const visibleFishSlides = computed(() => {
  return aquarium.availableFish.value.slice(currentIndexFish.value, currentIndexFish.value + 3);
});

function nextSlideFish() {
  if (currentIndexFish.value + 3 < aquarium.availableFish.value.length) {
    currentIndexFish.value++;
  }
}

function prevSlideFish() {
  if (currentIndexFish.value > 0) {
    currentIndexFish.value--;
  }
}

function selectAquariumFish(fish) {
  aquarium.selectFish(fish);
}

function isFishInAquarium(fishId) {
  return aquarium.selectedFishIds.value.some(fish => fish.id === fishId);
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
  addFishtoParty(fish.id);
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
    health: fish.health
  }));
}

function isFishInParty(fishId) {
  return party.value.some(fish => fish.id === fishId);
}

function togglePartyList() {
  showPartyList.value = !showPartyList.value;
}

// Обновляем подсветку при изменении party
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
  gacha();
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
                    <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
                    <p class="balance-item">10<img src="/Aquarium/crystals.png" alt=""></p>
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
                        <button 
                            v-for="(slide) in visibleFonSlides" :key="slide.id" 
                            class="bgfon-btn"
                            :class="{ 'active-fon': aquarium.selectedFonId.value === slide.id }"
                            @click="aquarium.selectFon(slide)">
                            <img :src="slide.src" :alt="slide.alt" />
                        </button>
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
                        <button 
                            v-for="(fish) in visibleFishSlides" :key="fish.id" 
                            class="bgfish-btn"
                            :class="{ 'active-fish': isFishInAquarium(fish.id) }"
                            @click="selectAquariumFish(fish)">
                            <img :src="fish.src" :alt="fish.alt" />
                        </button>
                    </div>
                </div>
                <button class="control-btn" @click="nextSlideFish()">
                    <img src="/Aquarium/right.png" alt="">
                </button>
            </div>

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
                                <div class="fish-name">{{ fish.name || 'Название' }}</div>
                                <div class="fish-ability">Урон: {{ fish.damage }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="control-btn-arena-down" @click="nextSlideArena()">
                    <img src="/Aquarium/down.png" alt="">
                </button>
            </div>

            <!-- КНОПКА ПОКАЗАТЬ ОТРЯД -->
            <button class="show-party-btn" @click="togglePartyList">
                {{ showPartyList ? 'Скрыть отряд' : 'Показать отряд' }} ({{ party.length }})
            </button>

            <!-- ТЕКУЩИЙ ОТРЯД (выезжающая панель) -->
            <div v-if="showPartyList" class="current-party">
                <div class="party-header">
                    <span>Текущий отряд</span>
                    <button class="close-party" @click="showPartyList = false">X</button>
                </div>
                <div v-for="fish in party" :key="fish.id" class="party-item">
                    <img :src="fish.img"  :alt="fish.name">
                    <div class="party-info">
                        <div class="party-name">{{ fish.name }}</div>
                        <div class="party-stats">HP{{ fish.health }} DMG{{ fish.damage }}</div>
                    </div>
                    <button class="remove-party-btn" @click="removeFromParty(fish.id)">X</button>
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
            <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
        </div>
        <div class="select-chest">
            <p class="ppp">Выберите сундук</p>
        </div>
        <div class="chest-cards">
            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item">10<img src="/Aquarium/money.png" style="width: 16px; height: 16px;" height="20px" alt=""></p>
                <button class="open-btn" @click="onGachaClick">Открыть</button>
            </div>
            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item" >10<img src="/Aquarium/money.png" style="width: 16px; height: 16px;" height="20px" alt=""></p>
                <button class="open-btn" @click="onGachaClick">Открыть</button>
            </div>
            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item">10<img src="/Aquarium/money.png" style="width: 16px; height: 16px;" height="20px" alt=""></p>
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
  background: #EFF3F8;
  cursor: pointer;
  padding: 0;
  border-radius: 10px;
  border: 2px solid #E5EAF1;
  overflow: hidden;
}

.bgfish-btn.active-fish {
  border: 2px solid #2D78F5;
  background: #DBEAFD;
}

.bgfish-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  display: block;
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

/* КНОПКА ПОКАЗАТЬ ОТРЯД */
.show-party-btn {
  width: 100%;
  height: 40px;
  background: #2D78F5;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 15px;
}

.show-party-btn:hover {
  background: #1a5bc4;
}

/* ТЕКУЩИЙ ОТРЯД */
.current-party {
  margin-top: 10px;
  width: 308px;
  max-height: 250px;
  overflow-y: auto;
  background: #EFF3F8;
  border-radius: 10px;
  padding: 8px;
  border: 1px solid #E5EAF1;
}

.party-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  font-weight: 600;
  font-size: 14px;
  color: #1A1A1A;
  border-bottom: 1px solid #E5EAF1;
  margin-bottom: 8px;
}

.close-party {
  width: 20px;
  height: 20px;
  background: #FF4D4F;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.remove-party-btn:hover {
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

.arena-placeholder {
  text-align: center;
  color: #67758A;
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