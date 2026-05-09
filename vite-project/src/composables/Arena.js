import { ref, watch, computed } from "vue";

const playerFishCollection = ref({});
const partyIds = ref([]);

const party = computed(() => {
  return partyIds.value
    .map(id => playerFishCollection.value[id])
    .filter(fish => fish);
});

const initialFishes = ref([
  { id: 1, img: "/Aquarium/fish1.png", alt: "рыба 1", damage: 5, health: 10, name: 'Рыба1', rarity: 'common', abilitytype: 'damage', abilityvalue: 5, ability: "claw", lvl: 1 },
  { id: 2, img: "/Aquarium/fish2.png", alt: "рыба 2", damage: 5, health: 10, name: 'Рыба2', rarity: 'common', abilitytype: 'damage', abilityvalue: 5, ability: "chew", lvl: 1 },
  { id: 3, img: "/Aquarium/fish3.png", alt: "рыба 3", damage: 5, health: 10, name: 'Рыба3', rarity: 'common', abilitytype: 'heal', abilityvalue: 3, ability: "feed", lvl: 1 },
  { id: 4, img: "/Aquarium/fish4.png", alt: "рыба 4", damage: 10, health: 20, name: 'Рыба4', rarity: 'rare', abilitytype: 'damage', abilityvalue: 10, ability: "jaw", lvl: 1 },
  { id: 5, img: "/Aquarium/fish5.png", alt: "рыба 5", damage: 10, health: 20, name: 'Рыба5', rarity: 'rare', abilitytype: 'damage', abilityvalue: 10, ability: "punch", lvl: 1 },
  { id: 6, img: "/Aquarium/fish6.png", alt: "рыба 6", damage: 10, health: 20, name: 'Рыба6', rarity: 'rare', abilitytype: 'heal', abilityvalue: 5, ability: "brbrpatapims", lvl: 1 },
  { id: 7, img: "/Aquarium/fish7.png", alt: "рыба 7", damage: 30, health: 40, name: 'Рыба7', rarity: 'legendary', abilitytype: 'heal', abilityvalue: 20, ability: "kiss", lvl: 1 },
  { id: 8, img: "/Aquarium/fish8.png", alt: "рыба 8", damage: 30, health: 40, name: 'Рыба8', rarity: 'legendary', abilitytype: 'damage', abilityvalue: 30, ability: "lowkick", lvl: 1 },
  { id: 9, img: "/Aquarium/fish9.png", alt: "рыба 9", damage: 30, health: 40, name: 'Рыба9', rarity: 'legendary', abilitytype: 'damage', abilityvalue: 30, ability: "swalala", lvl: 1 }
]);

const initialBosses = ref([
  { id: 1, img: '/Aquarium/boss1.png', name: 'ЗЛАЯ РЫБКА1' },
  { id: 2, img: '/Aquarium/boss2.png', name: 'ЗЛАЯ РЫБКА2' },
  { id: 3, img: '/Aquarium/boss3.png', name: 'ЗЛАЯ РЫБКА3' },
  { id: 4, img: '/Aquarium/boss4.png', name: 'ЗЛАЯ РЫБКА4' },
  { id: 5, img: '/Aquarium/boss5.png', name: 'ЗЛАЯ РЫБКА5' }
]);

function loadCollectionFromLocalStorage() {
  const savedCollection = localStorage.getItem('playerFishCollection');
  if (savedCollection) {
    playerFishCollection.value = JSON.parse(savedCollection);
  } else {
    const initialCollection = {};
    initialFishes.value.forEach(fish => {
      initialCollection[fish.id] = { ...fish };
    });
    playerFishCollection.value = initialCollection;
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
    bossList: initialBosses,
    party,
    partyIds,
    playerFishCollection,
    addFishtoParty,
    removeFishFromParty,
    addOrUpdateFish
  };
}