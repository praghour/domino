<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, computed } from "vue";
import useAquarium from "../composables/useAquarium.js";
import usegacha from "../composables/useGacha.js";
import useFishman from "../composables/Arena.js";
const { gacha, win, lastFish} = usegacha();
const { fishList, addFishtoParty, removeFishFromParty, party} = useFishman()
const aquarium = useAquarium();
const activeMode = ref("aquarium");
const setActiveMode = (mode) => {
  activeMode.value = mode;
};

const visibleFonSlides = computed(() => {
  return aquarium.slidesfon.value.slice(aquarium.currentIndexFon.value, aquarium.currentIndexFon.value + 3);
});

const visibleFishSlides = computed(() => {
  return aquarium.slidesfish.value.slice(aquarium.currentIndexFish.value, aquarium.currentIndexFish.value + 3);
});

const currentFon = computed(() => {
  return aquarium.slidesfon.value.find(f => f.id === aquarium.selectedFonId.value);
});
const showGachaModal = ref(false);
onMounted(() => {
  aquarium.startAnimation();
});
const showWinModal = ref(false);
onUnmounted(() => {
  aquarium.stopAnimation();
});
const onGachaClick = () => {
    gacha();
    showGachaModal.value = false;
    showWinModal.value = true;
};
function isFishInParty(fishId) {
  return party.value.some(fish => fish.id === fishId);
}
</script>

<template>
<div class="page">
    <div class="sidebar">

        <div class="your-balance">
            <div class="balance-info">
                <p class="yb-p">Ваш баланс</p>
                <div class="balance-values">
                    <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
                    <p class="balance-item">10<img src="/Aquarium/crystals.png" alt=""></p>
                </div>
            </div>
            <button class="chest-btn" @click="showGachaModal=ref(true)">Сундуки</button>
        </div>

        <div class="game-settings">
            <p class="gs-p">Настройки</p>  
            
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

            <p class="gs-p2">Рыбы</p>

            <div class="slider">   
                <button class="control-btn" @click="aquarium.prevSlideFish()">
                    <img src="/Aquarium/left.png" alt="">
                </button>
                <div class="slides">
                    <div class="slide">
                        <button 
                            v-for="(slide) in visibleFishSlides" :key="slide.id" 
                            class="bgfish-btn"
                            :class="{ 'active-fish': aquarium.selectedFishIds.value.some(f => f.id === slide.id) }"
                            @click="aquarium.selectFish(slide)"> 
                            <img :src="slide.src" :alt="slide.alt" />
                        </button>
                    </div>
                </div>
                <button class="control-btn" @click="aquarium.nextSlideFish()">
                    <img src="/Aquarium/right.png" alt="">
                </button>
            </div>

            <div class="fishes">
                
            </div>
        </div>  

        <div class="game-mode"> 
            <p class="gm-p">Режим игры</p>
            <div class="gm-btns">
                <button class="gm-btn" :class="{ 'active': activeMode === 'aquarium' }" @click="setActiveMode('aquarium')">Аквариум</button>
                <button class="gm-btn" :class="{ 'active': activeMode === 'arena' }" @click="setActiveMode('arena')">Арена</button>
            </div>
        </div>
    </div>

    <div class="aquarium-block">
        <div style="position: relative; width: 935px; height: 550px;">
            <img :src="currentFon.src" alt="фон1" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
            <div 
                v-for="fish in aquarium.selectedFishIds.value" 
                :key="fish.id"
                :style="aquarium.getFishStyle(fish)">
                <img :src="fish.src" :alt="fish.alt"  style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
        </div>
        <div v-if="showGachaModal" class="overlay" @click="showGachaModal=false"></div>
    </div>
        <div class="gacha" v-if="showGachaModal" @click.self="showGachaModal=false">
        <div class="gacha-hed">
            <p>Испытай удачу</p>
            <button class="close" @click="showGachaModal=false"><img src="/gacha/close.jpg" alt=""></button>
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
                <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
                <button class="open-btn" @click="onGachaClick">Открыть</button>
            </div>

            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
                <button class="open-btn"  @click="onGachaClick">Открыть</button>
            </div>

            <div class="chest-card">
                <img src="/gacha/chest.png" alt="">
                <p class="balance-item">10<img src="/Aquarium/money.png" alt=""></p>
                <button class="open-btn"  @click="onGachaClick">Открыть</button>
            </div>
            <div v-if="showWinModal && lastFish" class="overlay" @click="showWinModal=false"></div>
    <div class="winmodal" v-if="showWinModal && lastFish">
        <div class="gacha-hed">
            <button class="close" @click="showWinModal=false"><img src="/gacha/close.jpg" alt=""></button>
        </div>
        <div class="win-content">
            <img :src="lastFish.img" :alt="lastFish.alt" width="400px" class="win-fish-img">
            <h3 class="win-fish-name">{{ lastFish.name }}</h3>
            <h3 class="win-fish-name">{{ lastFish.rarity }}</h3>
            <button class="close-win-btn" @click="closeWinModal">Отлично!</button>
        </div>
    </div>
        </div>   
    </div>
</div>
<div v-for="value in fishList" :key="value.id" class="choosefish">
            <img :src="value.img" alt="" height="20px">
            <div>{{ value.name }}</div>
            <button class="gm-btn" @click="addFishtoParty(value.id)">Добавить в отряд</button>
            <button  v-if="isFishInParty(value.id)"  class="gm-btn" @click="removeFishFromParty(value.id)">Удалить из отряда</button>
        </div>
</template>

<style >
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* КАКИШ ВЫШЕ */
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
    animation: bounceIn 0.5s ease;
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
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
    animation: float 3s ease-in-out infinite;
}

.win-fish-name {
    font-size: 28px;
    font-weight: bold;
    margin: 10px 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.close-win-btn {
    padding: 10px 30px;
    background: white;
    color: #764ba2;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
}

.close-win-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
.balance-gacha {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
}

.balance-gacha p {
    font-size: 18px;
    margin: 0;
}

.balance-gacha .balance-item {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
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
/* КАКИШ ВЫШЕ */

/* СУНДУКИ */
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

.chest-card .balance-item {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    font-weight: 500;
    font-size: 16px;
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
    display: flex;
    align-items: center;
    justify-content: center;
}

.open-btn:hover {
    background-color: #2D78F5;
    color: #FEFEFE;
}

/* СУНДУКИ */

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
  display: flex;
  justify-content: center;
  align-items: center;
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

/* БАЛАНС */


/* НАСТРОЙКИ */
.game-settings {
  width: 348px;
  height: auto;
  min-height: 286px;
  padding: 20px;
}

.gs-p{
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
    margin-bottom: 20px;
    margin-top: 20px;
}
/* НАСТРОЙКИ */

/* СЛАЙДЕР */
.slider {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-top: 10px;
    width: 308px;
    height: 62px;
}

button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-btn {
    width: 24px;
    height: 24px;
    display: block;
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

.bgfon-btn {
    width: 72px;
    height: 64px;
    background: none;
    border: none;
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

.bgfish-btn {
    width: 72px;
    height: 64px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0; 
    border-radius: 10px;
    border: 2px solid #E5EAF1;
    overflow: hidden; 
}

.bgfish-btn.active-fish {
    border: 2px solid #2D78F5;
}

.bgfish-btn img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px; 
    display: block; 
}
/* СЛАЙДЕР */

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

/* активная кнопка*/
.gm-btn.active {
  background-color: #DBEAFD;
  color: #2D78F5;
  border-color: #E5EAF1;
}

/* РЕЖИМ ИГРЫ */

/* АКВАРИУМ */
.aquarium-block {
  width: 975px;
  height: auto;
  background-color: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px solid #E5EAF1;
}

.aquarium-block img {
  width: 935px;
  height: 550px;
  object-fit: cover;
  border-radius: 12px;
}


/* АКВАРИУМ */
</style>