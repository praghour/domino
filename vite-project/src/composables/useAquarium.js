import { ref, watch, computed } from "vue";
import useFishman from './Arena.js';

const { playerFishCollection } = useFishman();

const slidesfon = ref([
  { id: 1, src: "/Aquarium/fon1.png", alt: "фон 1" },
  { id: 2, src: "/Aquarium/fon2.png", alt: "фон 2" },
  { id: 3, src: "/Aquarium/fon3.png", alt: "фон 3" },
  { id: 4, src: "/Aquarium/fon4.png", alt: "фон 4" },
  { id: 5, src: "/Aquarium/fon5.png", alt: "фон 5" },
  { id: 6, src: "/Aquarium/fon6.png", alt: "фон 6" }
]);

const currentIndexFon = ref(0);
const selectedFonId = ref(1);

export const allFish = ref([
  { id: 1, src: "/Aquarium/fish1.png", alt: "рыба 1", damage: 10, health: 20, name: 'Рыба1', rarity: 'common', abilitytype: 'damage', abilityvalue: 5, ability: "claw", lvl: 1 },
  { id: 2, src: "/Aquarium/fish2.png", alt: "рыба 2", damage: 10, health: 20, name: 'Рыба2', rarity: 'common', abilitytype: 'damage', abilityvalue: 5, ability: "chew", lvl: 1 },
  { id: 3, src: "/Aquarium/fish3.png", alt: "рыба 3", damage: 10, health: 20, name: 'Рыба3', rarity: 'common', abilitytype: 'heal', abilityvalue: 5, ability: "feed", lvl: 1 },
  { id: 4, src: "/Aquarium/fish4.png", alt: "рыба 4", damage: 10, health: 20, name: 'Рыба4', rarity: 'rare', abilitytype: 'damage', abilityvalue: 10, ability: "jaw", lvl: 1 },
  { id: 5, src: "/Aquarium/fish5.png", alt: "рыба 5", damage: 10, health: 20, name: 'Рыба5', rarity: 'rare', abilitytype: 'damage', abilityvalue: 10, ability: "punch", lvl: 1 },
  { id: 6, src: "/Aquarium/fish6.png", alt: "рыба 6", damage: 10, health: 20, name: 'Рыба6', rarity: 'rare', abilitytype: 'heal', abilityvalue: 10, ability: "brbrpatapims", lvl: 1 },
  { id: 7, src: "/Aquarium/fish7.png", alt: "рыба 7", damage: 10, health: 20, name: 'Рыба7', rarity: 'legendary', abilitytype: 'heal', abilityvalue: 20, ability: "kiss", lvl: 1 },
  { id: 8, src: "/Aquarium/fish8.png", alt: "рыба 8", damage: 10, health: 20, name: 'Рыба8', rarity: 'legendary', abilitytype: 'damage', abilityvalue: 20, ability: "lowkick", lvl: 1 },
  { id: 9, src: "/Aquarium/fish9.png", alt: "рыба 9", damage: 10, health: 20, name: 'Рыба9', rarity: 'legendary', abilitytype: 'damage', abilityvalue: 20, ability: "swalala", lvl: 1 }
]);

const availableFishIds = ref([]);
const availableFish = computed(() => {
  const fishList = allFish.value.filter(fish => availableFishIds.value.includes(fish.id));
  
  return fishList.map(fish => {
    const playerFish = playerFishCollection.value[fish.id];
    if (playerFish) {
      return {
        ...fish,
        lvl: playerFish.lvl || fish.lvl,
        damage: playerFish.damage || fish.damage,
        health: playerFish.health || fish.health,
        abilityvalue: playerFish.abilityvalue || fish.abilityvalue,
      };
    }
    return fish;
  });
});

const currentIndexFish = ref(0);
const selectedFishIds = ref([]);

let animationId = null;

const savedSlidesfon = localStorage.getItem("aquarium_slidesfon");
const savedSelectedFonId = localStorage.getItem("aquarium_selectedFonId");
const savedSelectedFishIds = localStorage.getItem("aquarium_selectedFishIds");

if (savedSlidesfon) slidesfon.value = JSON.parse(savedSlidesfon);
if (savedSelectedFonId) selectedFonId.value = JSON.parse(savedSelectedFonId);
if (savedSelectedFishIds) {
  const saved = JSON.parse(savedSelectedFishIds);
  selectedFishIds.value = saved.map(fish => ({
    ...fish,
    x: Math.random() * (935 - 120),
    y: Math.random() * (550 - 120),
    speedX: Math.abs(Math.random() - 0.5) * 3 + 1,
    speedY: (Math.random() - 0.5) * 3,
    mirrored: fish.mirrored || false
  }));
}

function syncAvailableFishWithCollection() {
  const fishIds = Object.keys(playerFishCollection.value).map(id => Number(id));
  availableFishIds.value = fishIds;
}

watch(playerFishCollection, () => {
  syncAvailableFishWithCollection();
}, { deep: true, immediate: true });

function updateAvailableFish(winFishIds) {
  availableFishIds.value = winFishIds;
}

watch(slidesfon, (newVal) => {
  localStorage.setItem("aquarium_slidesfon", JSON.stringify(newVal));
}, { deep: true });

watch(selectedFonId, (newVal) => {
  localStorage.setItem("aquarium_selectedFonId", JSON.stringify(newVal));
});

watch(selectedFishIds, (newVal) => {
  const toSave = newVal.map(fish => ({
    id: fish.id,
    src: fish.src,
    alt: fish.alt,
    mirrored: fish.mirrored
  }));
  localStorage.setItem("aquarium_selectedFishIds", JSON.stringify(toSave));
}, { deep: true });

function selectFon(slide) {
  selectedFonId.value = slide.id;
}

function nextSlideFon() {
  if (currentIndexFon.value + 3 < slidesfon.value.length) currentIndexFon.value++;
}

function prevSlideFon() {
  if (currentIndexFon.value > 0) currentIndexFon.value--;
}

function nextSlideFish() {
  if (currentIndexFish.value + 3 < availableFish.value.length) currentIndexFish.value++;
}

function prevSlideFish() {
  if (currentIndexFish.value > 0) currentIndexFish.value--;
}

function selectFish(fish) {
  const index = selectedFishIds.value.findIndex(f => f.id === fish.id);
  if (index === -1) {
    selectedFishIds.value.push({
      ...fish,
      x: Math.random() * (935 - 120),
      y: Math.random() * (550 - 120),
      speedX: Math.abs(Math.random() - 0.5) * 3 + 1,
      speedY: (Math.random() - 0.5) * 3,
      mirrored: false
    });
  } else {
    selectedFishIds.value.splice(index, 1);
  }
}

function moveFishes() {
  selectedFishIds.value.forEach(fish => {
    fish.x += fish.speedX;
    fish.y += fish.speedY;
    
    if (fish.x <= 0) {
      fish.speedX = -fish.speedX;
      fish.x = 0;
      fish.mirrored = false;
    } else if (fish.x + 120 >= 935) {
      fish.speedX = -fish.speedX;
      fish.x = 935 - 120;
      fish.mirrored = true;
    }
    
    if (fish.y <= 0) {
      fish.speedY = -fish.speedY;
      fish.y = 0;
    } else if (fish.y + 120 >= 550) {
      fish.speedY = -fish.speedY;
      fish.y = 550 - 120;
    }
  });
  
  animationId = requestAnimationFrame(moveFishes);
}

function getFishStyle(fish) {
  return {
    position: 'absolute',
    left: fish.x + 'px',
    top: fish.y + 'px',
    width: '120px',
    height: '120px',
    transition: 'none',
    transform: fish.mirrored ? 'scaleX(-1)' : 'scaleX(1)'
  };
}

function startAnimation() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(moveFishes);
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

export default function useAquarium() {
  return {
    slidesfon,
    currentIndexFon,
    selectedFonId,
    availableFish,
    currentIndexFish,
    selectedFishIds,
    selectFon,
    nextSlideFon,
    prevSlideFon,
    nextSlideFish,
    prevSlideFish,
    selectFish,
    getFishStyle,
    startAnimation,
    stopAnimation,
    updateAvailableFish
  };
}