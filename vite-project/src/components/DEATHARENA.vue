<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import useFishman from '../composables/Arena';
import useAquarium from '../composables/useAquarium.js';
import useGacha from '../composables/useGacha.js';
import useMoney from '../composables/useMoney.js';

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
const currentBoss = ref({ ...possibleBosses.value[0] });

const getRandomBoss = () => {
  const randomIndex = Math.floor(Math.random() * possibleBosses.value.length);
  return { ...possibleBosses.value[randomIndex] };
};

watch(win, (newWin) => {
  const winIds = newWin.map(fish => fish.id);
  aquarium.updateAvailableFish(winIds);
}, { deep: true, immediate: true });

const { findCurrency } = useMoney();

const userMoney = computed(() => {
  const money = findCurrency('money');
  return money ? money.count : 0;
});

const userCrystals = computed(() => {
  const crystal = findCurrency('crystal');
  return crystal ? crystal.count : 0;
});

const bossHealth = ref(100);
const bossDamage = ref(2);
const currentbosshp = computed(() => bossHealth.value);
const maxBossHealth = ref(100);
const teamHP = ref(0);
const originalTeamHP = ref(0);
const isFighting = ref(false);
const bosslvl = ref(1);
const bossDefeatedCount = ref(0);
const showVictoryModal = ref(false);
const earnedCrystals = ref(0);
let fightInterval = null;

const floatingDamages = ref([]);
const floatingHeals = ref([]);
const floatingBossDamages = ref([]);
const attackingFish = ref([]);
const healingFish = ref([]);
const isBossHit = ref(false);
const isBossAttacking = ref(false);
let damageId = 0;

const addFloatingDamage = (value, fishId) => {
  const id = damageId++;
  const x = Math.random() * 80 + 20;
  const y = Math.random() * 80 + 20;
  floatingDamages.value.push({ id, value, x, y, fishId });
  setTimeout(() => {
    floatingDamages.value = floatingDamages.value.filter(d => d.id !== id);
  }, 800);
};

const addFloatingHeal = (value, fishId) => {
  const id = damageId++;
  const x = Math.random() * 60 + 20;
  const y = -20 - Math.random() * 30;
  floatingHeals.value.push({ id, value, x, y, fishId });
  setTimeout(() => {
    floatingHeals.value = floatingHeals.value.filter(h => h.id !== id);
  }, 800);
};

const addFloatingBossDamage = (value) => {
  const id = damageId++;
  const x = Math.random() * 200 + 50;
  const y = Math.random() * 150 + 200;
  floatingBossDamages.value.push({ id, value, x, y });
  setTimeout(() => {
    floatingBossDamages.value = floatingBossDamages.value.filter(d => d.id !== id);
  }, 800);
};

const triggerBossHit = () => {
  isBossHit.value = true;
  setTimeout(() => {
    isBossHit.value = false;
  }, 200);
};

const triggerBossAttack = () => {
  isBossAttacking.value = true;
  setTimeout(() => {
    isBossAttacking.value = false;
  }, 300);
};

const triggerFishAttack = (fishIds) => {
  attackingFish.value = fishIds;
  setTimeout(() => {
    attackingFish.value = [];
  }, 300);
};

const triggerFishHeal = (fishIds) => {
  healingFish.value = fishIds;
  setTimeout(() => {
    healingFish.value = [];
  }, 500);
};

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

const updateTeamHP = () => {
  teamHP.value = calculateTeamHP();
  originalTeamHP.value = calculateTeamHP();
};

const teamHealthPercent = computed(() => {
  if (originalTeamHP.value === 0) return 0;
  return (teamHP.value / originalTeamHP.value) * 100;
});

const bossHealthPercent = computed(() => {
  return (bossHealth.value / maxBossHealth.value) * 100;
});

const getHealthBarColor = (percent) => {
  if (percent > 60) return '#4CAF50';
  if (percent > 30) return '#FFC107';
  return '#F44336';
};

const fishDamage = computed(() => {
  let currentdamage = 0;
  for (const fish of party.value) {
    currentdamage += Number(fish.damage);
  }
  return currentdamage;
});

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
  bossDefeatedCount.value = 0;
  currentBoss.value = { ...possibleBosses.value[0] };
  isFighting.value = true;
  fight();
}

function fight() {
  if (fightInterval) clearInterval(fightInterval);
  
  fightInterval = setInterval(() => {
    if (!isFighting.value) return;
    
    if (teamHP.value <= 0) {
      stopFight();
      return;
    }
    
    const totalFishDmg = fishDamage.value;
    const totalabilitydmg = abilitydamage.value;
    const totalabilityheal = abilityheal.value;
    
    if (totalFishDmg > 0) {
      triggerBossHit();
      
      const attackingFishIds = [];
      for (const fish of party.value) {
        attackingFishIds.push(fish.id);
        addFloatingDamage(Number(fish.damage), fish.id);
      }
      triggerFishAttack(attackingFishIds);
    }
    
    if (totalabilitydmg > 0) {
      for (const fish of party.value) {
        if (fish.abilitytype === 'damage') {
          addFloatingDamage(Number(fish.abilityvalue), fish.id);
        }
      }
    }
    
    bossHealth.value = Math.max(0, bossHealth.value - totalFishDmg - totalabilitydmg);
    
    if (bossHealth.value <= 0) {
      bossDefeatedCount.value++;
      
      if (bossDefeatedCount.value >= 5) {
        stopFight();
        isFighting.value = false;
        earnedCrystals.value = 1;
        const crystal = findCurrency('crystal');
        if (crystal) {
          crystal.count += 1;
        }
        showVictoryModal.value = true;
        return;
      }
      
      const newBoss = getRandomBoss();
      currentBoss.value = newBoss;
      maxBossHealth.value += 25;
      bossHealth.value = maxBossHealth.value;  
      bossDamage.value = bossDamage.value + 2;
      bosslvl.value = bosslvl.value + 1;
      
      console.log(`Новый босс: ${newBoss.name}! HP: ${maxBossHealth.value}, Урон: ${bossDamage.value}`);
      return;
    }
    
    if (teamHP.value > 0) {
      let newTeamHP = Math.min(teamHP.value + totalabilityheal, maxTeamHP.value);
      const healAmount = newTeamHP - teamHP.value;
      
      if (healAmount > 0) {
        const healingFishIds = [];
        for (const fish of party.value) {
          if (fish.abilitytype === 'heal') {
            healingFishIds.push(fish.id);
            addFloatingHeal(Number(fish.abilityvalue), fish.id);
          }
        }
        if (healingFishIds.length > 0) {
          triggerFishHeal(healingFishIds);
        }
      }
      
      const damageToTeam = bossDamage.value;
      newTeamHP = newTeamHP - damageToTeam;
      
      if (damageToTeam > 0) {
        triggerBossAttack();
        addFloatingBossDamage(damageToTeam);
      }
      
      teamHP.value = Math.max(0, newTeamHP);
    }
    
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
  bossDefeatedCount.value = 0;
  currentBoss.value = { ...possibleBosses.value[0] };
  startFight();
}

function closeVictoryModalAndRestart() {
  showVictoryModal.value = false;
  bossDefeatedCount.value = 0;
  restartFight();
}

const currentFon = computed(() => {
  return { src: '/Aquarium/fonarena.png' };
});

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

watch(party, () => {
  updateSelectedArenaIds();
  updateTeamHP();
}, { deep: true });

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
  gacha();
  
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
        <div class="your-balanceArena">
            <div class="balance-info">
                <p class="yb-p">Ваш баланс</p>
                <div class="balance-arena">
                    <div class="balance-item"><p>{{ userMoney }}</p><img src="/Aquarium/money.png" alt=""></div>
                    <div class="balance-item"><p>{{ userCrystals }}</p><img src="/Aquarium/crystals.png" alt=""></div>
                </div>
            </div>
        </div>

        <div class="game-settings">
            <p class="gs-p">Настройки</p>  
            <p class="gs-p2">Рыбки на арену</p>  
            <div class="slider-arena">   
                <button class="control-btn-arena-up" @click="prevSlideArena()">
                    <img src="/Aquarium/up.png" alt="">
                </button>
                <div class="slides-arena">
                    <div class="slide-arena">
                        <div v-for="fish in visibleArenaSlides" :key="fish.id" class="arena-item"> 
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

        <div class="game-mode"> 
            <p class="gm-p">Режим игры</p>
            <div class="gm-btns">
                <button class="gm-btn" @click="goToAquarium">Аквариум</button>
                <button class="gm-btn active">Арена</button>
            </div>
        </div>
    </div>

    <div class="arena-container">
        <div style="position: relative; width: 935px; height: 550px;">
            <img :src="currentFon.src" alt="фон арены" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
            
            <div class="boss-image">
                <div class="boss-card" :class="{ 'boss-hit': isBossHit, 'boss-attacking': isBossAttacking }">
                    <img :src="currentBoss.img" width="120px" :alt="currentBoss.name">
                    <div v-for="damage in floatingDamages" :key="damage.id" class="floating-damage" :style="{ left: damage.x + 'px', top: damage.y + 'px' }">
                        -{{ damage.value }}
                    </div>
                </div>
            </div>   
            
           <div class="team-fish-left">
    <div v-for="fish in party" :key="fish.id" class="arena-fish-card" 
        :class="{ 'fish-attack': attackingFish.includes(fish.id), 'fish-heal': healingFish.includes(fish.id) }">
        <img :src="fish.img" width="45px" :alt="fish.name">
        <div v-for="heal in floatingHeals.filter(h => h.fishId === fish.id)" :key="heal.id" class="floating-heal" :style="{ left: heal.x + 'px', top: heal.y + 'px' }">
            +{{ heal.value }}
        </div>
    </div>
</div>
            <div v-for="bossDamage in floatingBossDamages" :key="bossDamage.id" class="floating-boss-damage" :style="{ left: bossDamage.x + 'px', top: bossDamage.y + 'px' }">
                -{{ bossDamage.value }}
            </div>
            
            <div class="arena-team">
                <div class="team-stats">
                    <p>Ваша команда</p>
                    <div class="stats-row">
                        <span>HP: <strong>{{ teamHP }} / {{ originalTeamHP }}</strong></span>
                        <span>DMG: {{ fishDamage }}</span>
                    </div>
                </div>
                <div class="health-bar-container">
                    <div class="health-bar-fill" :style="{ width: teamHealthPercent + '%', backgroundColor: getHealthBarColor(teamHealthPercent) }"></div>
                </div>
            </div>
            
            <div class="arena-boss">
                <div class="boss-header">
                    <h3>БОСС</h3>
                    <span>УРОВЕНЬ {{ bosslvl }}</span>
                </div>
                <div class="boss-stats-row">
                    <span>HP: <strong>{{ currentbosshp }} / {{ maxBossHealth }}</strong></span>
                    <span>DMG: {{ bossDamage }}</span>
                </div>
                <div class="health-bar-container boss-health">
                    <div class="health-bar-fill" :style="{ width: bossHealthPercent + '%', backgroundColor: getHealthBarColor(bossHealthPercent) }"></div>
                </div>
            </div>

            <div v-if="!isFighting && party.length > 0" class="start-battle">
                <p>Начать игру?</p>
                <button class="start-battle-btn" @click="startFight">В БОЙ!</button>
            </div>

            <div v-if="!isFighting && teamHP <= 0 && party.length > 0" class="game-over">
                <p>Поражение!</p>
                <button class="game-over-btn" @click="restartFight">Начать заново</button>
            </div>

            <div v-if="party.length === 0 && !isFighting" class="no-fish-message">
                <p>Нет рыбок в отряде</p>
                <p>Добавьте рыбок в аквариуме</p>
            </div>
        </div>
    </div>

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

    <div v-if="showVictoryModal" class="overlay" @click="showVictoryModal = false"></div>
    <div class="victory-modal" v-if="showVictoryModal">
        <div class="victory-content">
            <div class="victory-icon">🏆</div>
            <h2 class="victory-title">ПОБЕДА!</h2>
            <p class="victory-text">Вы победили 5 боссов подряд!</p>
            <div class="victory-reward">
                <img src="/Aquarium/crystals.png" alt="" class="reward-icon">
                <span class="reward-amount">+{{ earnedCrystals }}</span>
            </div>
            <button class="victory-btn" @click="closeVictoryModalAndRestart">Продолжить</button>
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

.game-settings {
  width: 348px;
  height: auto;
  min-height: 286px;
  padding: 20px;
}

.team-fish-left {
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

.arena-fish-card {
  position: relative;
  transition: all 0.2s ease;
}

.arena-fish-card:nth-child(1) {
  position: relative;
  top: 80px;
}

.arena-fish-card:nth-child(2) {
  position: relative;
  top: 40px;
  left: 120px;
}

.arena-fish-card:nth-child(3) {
  position: relative;
  top: 10px;
}

.arena-fish-card:nth-child(4) {
  position: relative;
  top: -10px;
  left: 120px;
}

.arena-fish-card {
  animation: float 3s ease-in-out infinite;
}

.arena-fish-card:nth-child(1) { animation-delay: 0s; }
.arena-fish-card:nth-child(2) { animation-delay: 0.5s; }
.arena-fish-card:nth-child(3) { animation-delay: 1s; }
.arena-fish-card:nth-child(4) { animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0); }
  50% { transform: translateY(-8px) translateX(0); }
}

.fish-attack {
  animation: fishAttackAnim 0.3s ease-in-out !important;
}

@keyframes fishAttackAnim {
  0% { transform: translateX(0px) translateY(0px); }
  50% { transform: translateX(40px) translateY(-15px); }
  100% { transform: translateX(0px) translateY(0px); }
}

.fish-heal {
  animation: fishHealAnim 0.5s ease-in-out !important;
}

@keyframes fishHealAnim {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); filter: brightness(1.3); }
  100% { transform: scale(1); }
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
  position: relative;
  text-align: center;
  margin: 0;
  animation: float 3s ease-in-out infinite;
  animation-delay: 0.3s;
  transition: all 0.1s ease;
}

.boss-card img {
  width: 335px;
  height: 265px;
  object-fit: contain;
}

.boss-hit {
  animation: bossHitAnim 0.2s ease-in-out !important;
}

@keyframes bossHitAnim {
  0% { transform: scale(1); }
  50% { transform: scale(0.92); filter: brightness(0.5); }
  100% { transform: scale(1); }
}

.boss-attacking {
  animation: bossAttackAnim 0.3s ease-in-out !important;
}

@keyframes bossAttackAnim {
  0% { transform: translateX(0); }
  30% { transform: translateX(-20px); }
  70% { transform: translateX(10px); }
  100% { transform: translateX(0); }
}

.floating-damage {
  position: absolute;
  font-size: 28px;
  font-weight: bold;
  color: #ff4444;
  text-shadow: 2px 2px 0px #000;
  pointer-events: none;
  animation: floatUp 0.8s ease-out forwards;
  z-index: 100;
}

.floating-heal {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: #44ff44;
  text-shadow: 1px 1px 0px #000;
  pointer-events: none;
  animation: floatUpHeal 0.8s ease-out forwards;
  z-index: 100;
}

.floating-boss-damage {
  position: absolute;
  font-size: 30px;
  font-weight: bold;
  color: #ff6666;
  text-shadow: 2px 2px 0px #000;
  pointer-events: none;
  animation: floatUpBoss 0.8s ease-out forwards;
  z-index: 100;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px);
  }
}

@keyframes floatUpHeal {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px);
  }
}

@keyframes floatUpBoss {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }
  100% {
    opacity: 0;
    transform: translateY(-70px);
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

.victory-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  color: white;
  z-index: 1001;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.victory-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.victory-icon {
  font-size: 64px;
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.victory-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.victory-text {
  font-size: 16px;
  margin: 0;
}

.victory-reward {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 50px;
}

.reward-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.reward-amount {
  font-size: 24px;
  font-weight: bold;
}

.victory-btn {
  padding: 10px 30px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.victory-btn:hover {
  transform: scale(1.05);
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
</style>