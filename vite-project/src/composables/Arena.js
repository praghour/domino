import { ref, watch, computed } from "vue";

const playerFishCollection = ref({});
const partyIds = ref([]);

const party = computed(() => {
  return partyIds.value
    .map(id => playerFishCollection.value[id])
    .filter(fish => fish);
});

const initialFishes = ref([
  { id: 1, src: "/Aquarium/fish1.png", alt: "рыба 1", damage: 5, health: 10, name: 'Плавник', rarity: 'Обычная', abilitytype: 'damage', abilityvalue: 5, ability: "Удар плавником: +5 dmg", lvl: 1 },
  { id: 2, src: "/Aquarium/fish2.png", alt: "рыба 2", damage: 5, health: 10, name: 'Пузырёк', rarity: 'Обычная', abilitytype: 'damage', abilityvalue: 5, ability: "Укус: +5 dmg", lvl: 1 },
  { id: 3, src: "/Aquarium/fish3.png", alt: "рыба 3", damage: 5, health: 10, name: 'Чешуйка', rarity: 'Обычная', abilitytype: 'heal', abilityvalue: 3, ability: "Пластырь: heal +3", lvl: 1 },
  { id: 4, src: "/Aquarium/fish4.png", alt: "рыба 4", damage: 10, health: 20, name: 'Карась', rarity: 'Редкая', abilitytype: 'damage', abilityvalue: 10, ability: "Круговорот: +10 dmg", lvl: 1 },
  { id: 5, src: "/Aquarium/fish5.png", alt: "рыба 5", damage: 10, health: 20, name: 'Асхен', rarity: 'Редкая', abilitytype: 'damage', abilityvalue: 10, ability: "Атака грифона: +10 dmg", lvl: 1 },
  { id: 6, src: "/Aquarium/fish6.png", alt: "рыба 6", damage: 10, health: 20, name: 'Абсолют', rarity: 'Редкая', abilitytype: 'heal', abilityvalue: 7, ability: "Целебное течение:  heal +7", lvl: 1 },
  { id: 7, src: "/Aquarium/fish7.png", alt: "рыба 7", damage: 30, health: 40, name: 'Центурион', rarity: 'Легендарная', abilitytype: 'heal', abilityvalue: 20, ability: "Поцелуй солнца: heal +20", lvl: 1 },
  { id: 8, src: "/Aquarium/fish8.png", alt: "рыба 8", damage: 30, health: 40, name: 'Ноктюрн', rarity: 'Легендарная', abilitytype: 'damage', abilityvalue: 30, ability: "Кошмарные воды: +30 dmg", lvl: 1 },
  { id: 9, src: "/Aquarium/fish9.png", alt: "рыба 9", damage: 30, health: 40, name: 'Немезида', rarity: 'Легендарная', abilitytype: 'damage', abilityvalue: 30, ability: "Падение луны: +30 dmg", lvl: 1 }
]);

function loadCollectionFromLocalStorage() {
  const savedCollection = localStorage.getItem('playerFishCollection');
  if (savedCollection) {
    playerFishCollection.value = JSON.parse(savedCollection);
  } else {
    const starterFish = initialFishes.value.find(fish => fish.id === 1);
    playerFishCollection.value = {
      1: { ...starterFish }
    };
    localStorage.setItem('playerFishCollection', JSON.stringify(playerFishCollection.value));
  }
}

function loadPartyIdsFromLocalStorage() {
  const savedPartyIds = localStorage.getItem('partyIds');
  if (savedPartyIds) {
    partyIds.value = JSON.parse(savedPartyIds);
  }
}

function addOrUpdateFish(fish) {
  playerFishCollection.value[fish.id] = { ...fish };
}

function addFishtoParty(fishId) {
  if (partyIds.value.length >= 4) {
    console.log('В отряде не может быть больше 4 рыбок!');
    return false;
  }
  
  if (!partyIds.value.includes(fishId)) {
    partyIds.value.push(fishId);
    return true;
  }
  return false;
}

function removeFishFromParty(fishId) {
  const index = partyIds.value.indexOf(fishId);
  if (index !== -1) {
    partyIds.value.splice(index, 1);
  }
}

watch(partyIds, () => {
  localStorage.setItem('partyIds', JSON.stringify(partyIds.value));
}, { deep: true });

watch(playerFishCollection, () => {
  localStorage.setItem('playerFishCollection', JSON.stringify(playerFishCollection.value));
}, { deep: true });

loadCollectionFromLocalStorage();
loadPartyIdsFromLocalStorage();

export default function useFishman() {
  return {
    fishList: initialFishes,
    party,
    partyIds,
    playerFishCollection,
    addFishtoParty,
    removeFishFromParty,
    addOrUpdateFish
  };
}