import { ref, watch, computed } from "vue";

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

// Базовая коллекция всех рыб (для справки)
export const allFish = ref([
  { id: 1, src: "/Aquarium/fish1.png", alt: "рыба 1", name: 'Рыба1', damage: 10, health: 20, rarity: 'common' },
  { id: 2, src: "/Aquarium/fish2.png", alt: "рыба 2", name: 'Рыба2', damage: 10, health: 20, rarity: 'common' },
  { id: 3, src: "/Aquarium/fish3.png", alt: "рыба 3", name: 'Рыба3', damage: 10, health: 20, rarity: 'common' },
  { id: 4, src: "/Aquarium/fish4.png", alt: "рыба 4", name: 'Рыба4', damage: 10, health: 20, rarity: 'rare' },
  { id: 5, src: "/Aquarium/fish5.png", alt: "рыба 5", name: 'Рыба5', damage: 10, health: 20, rarity: 'rare' },
  { id: 6, src: "/Aquarium/fish6.png", alt: "рыба 6", name: 'Рыба6', damage: 10, health: 20, rarity: 'rare' },
  { id: 7, src: "/Aquarium/fish7.png", alt: "рыба 7", name: 'Рыба7', damage: 10, health: 20, rarity: 'legendary' },
  { id: 8, src: "/Aquarium/fish8.png", alt: "рыба 8", name: 'Рыба8', damage: 10, health: 20, rarity: 'legendary' },
  { id: 9, src: "/Aquarium/fish9.png", alt: "рыба 9", name: 'Рыба9', damage: 10, health: 20, rarity: 'legendary' }
]);

// Доступные рыбы (только выбитые) - будет обновляться из useGacha
const availableFishIds = ref([]);
const availableFish = computed(() => {
  return allFish.value.filter(fish => availableFishIds.value.includes(fish.id));
});

const currentIndexFish = ref(0);
const selectedFishIds = ref([]);

let animationId = null;

// загрузка из localStorage
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

// Функция для обновления доступных рыб (вызывается из вне)
function updateAvailableFish(winFishIds) {
  availableFishIds.value = winFishIds;
}

// Следим за изменениями
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