import { ref, watch, computed } from "vue";
import useFishman from './Arena.js';
import useMoney from './useMoney.js';
import useNotice from './useNotice.js';

const { playerFishCollection } = useFishman();
const { findCurrency, spendCurrency } = useMoney();
const { showNotice } = useNotice();

// ФОНЫ с ценами
const slidesfon = ref([
  { id: 1, src: "/Aquarium/fon1.png", alt: "Солнечный риф", name: "Солнечный риф", price: 0 },
  { id: 2, src: "/Aquarium/fon2.png", alt: "Крушение у киклад", name: "Крушение у киклад", price: 10 },
  { id: 3, src: "/Aquarium/fon3.png", alt: "Жемчужные кварталы", name: "Жемчужные кварталы", price: 20 },
  { id: 4, src: "/Aquarium/fon4.png", alt: "Лиловая бездна", name: "Лиловая бездна", price: 30 },
  { id: 5, src: "/Aquarium/fon5.png", alt: "Тень исполина", name: "Тень исполина", price: 40 },
  { id: 6, src: "/Aquarium/fon6.png", alt: "Олимп под волной", name: "Олимп под волной", price: 80 }
]);

const currentIndexFon = ref(0);
const selectedFonId = ref(1);

// Купленные фоны (первый открыт по умолчанию)
const savedUnlockedFonIds = localStorage.getItem("unlockedFonIds");
const unlockedFonIds = ref(savedUnlockedFonIds ? JSON.parse(savedUnlockedFonIds) : [1]);

// Проверка - открыт ли фон
function isFonUnlocked(fonId) {
  return unlockedFonIds.value.includes(fonId);
}

// Покупка фона
function buyFon(slide) {
  if (isFonUnlocked(slide.id)) {
    showNotice('Информация', 'Этот фон уже куплен!');
    return false;
  }
  
  const crystals = findCurrency('crystal');
  const price = slide.price;
  
  if (!crystals || crystals.count < price) {
    showNotice('Ошибка', `Недостаточно кристаллов! Нужно ${price} кристаллов для покупки фона.`);
    return false;
  }
  
  const success = spendCurrency('crystal', price);
  
  unlockedFonIds.value.push(slide.id);
  localStorage.setItem("unlockedFonIds", JSON.stringify(unlockedFonIds.value));
  showNotice('Успех', `Фон "${slide.name}" куплен!`);
  return true;
}

// Выбор фона (только если открыт)
function selectFon(slide) {
  if (!isFonUnlocked(slide.id)) {
    showNotice('Заблокировано', `Фон "${slide.name}" заблокирован! Купите его за ${slide.price} кристаллов.`);
    return;
  }
  selectedFonId.value = slide.id;
  localStorage.setItem("aquarium_selectedFonId", JSON.stringify(selectedFonId.value));
}

// slidesfon с флагом isUnlocked для отображения в слайдере
const slidesfonWithStatus = computed(() => {
  return slidesfon.value.map(fon => ({
    ...fon,
    isUnlocked: isFonUnlocked(fon.id)
  }));
});

// ВСЕ РЫБЫ
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

// ДОСТУПНЫЕ РЫБЫ (только выбитые)
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

const savedSelectedFonId = localStorage.getItem("aquarium_selectedFonId");
const savedSelectedFishIds = localStorage.getItem("aquarium_selectedFishIds");

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

// Синхронизация availableFishIds с коллекцией игрока
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

// Сохранение выбранных рыб в localStorage
watch(selectedFishIds, (newVal) => {
  const toSave = newVal.map(fish => ({
    id: fish.id,
    src: fish.src,
    alt: fish.alt,
    mirrored: fish.mirrored
  }));
  localStorage.setItem("aquarium_selectedFishIds", JSON.stringify(toSave));
}, { deep: true });

// Функции слайдера фонов
function nextSlideFon() {
  if (currentIndexFon.value + 3 < slidesfonWithStatus.value.length) currentIndexFon.value++;
}

function prevSlideFon() {
  if (currentIndexFon.value > 0) currentIndexFon.value--;
}

// Функции слайдера рыб
function nextSlideFish() {
  if (currentIndexFish.value + 3 < availableFish.value.length) currentIndexFish.value++;
}

function prevSlideFish() {
  if (currentIndexFish.value > 0) currentIndexFish.value--;
}

// Добавление/удаление рыбы в аквариум
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

// Анимация рыб
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
    slidesfon: slidesfonWithStatus,
    currentIndexFon,
    selectedFonId,
    availableFish,
    currentIndexFish,
    selectedFishIds,
    selectFon,
    buyFon,
    isFonUnlocked,
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