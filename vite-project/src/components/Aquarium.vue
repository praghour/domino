<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, computed } from "vue";
import useAquarium from "../composables/useAquarium.js";

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

onMounted(() => {
  aquarium.startAnimation();
});

onUnmounted(() => {
  aquarium.stopAnimation();
});
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
            <button class="chest-btn">Сундуки</button>
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
    </div>
</div>
</template>

<style >
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.page p {
    color: black;
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