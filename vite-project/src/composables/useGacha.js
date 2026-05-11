import { ref } from "vue";
import useFishman from './Arena';
import availableFish from './useAquarium.js';

export default function useGacha() {
  const { fishList } = useFishman();
  const win = ref([]);
  const lastFish = ref(null);

  function updateAvailableFishWithUpgrades() {
    const upgradedFishMap = new Map();
    win.value.forEach(upgraded => {
      upgradedFishMap.set(upgraded.id, upgraded);
    });
    
    availableFish.value = fishList.value.map(fish => {
      const upgraded = upgradedFishMap.get(fish.id);
      if (upgraded) {
        return {
          ...upgraded,  // используем upgraded, а не fish
          src: upgraded.src || fish.src,
          alt: upgraded.name,
          abilitytype: upgraded.abilitytype, 
          abilityvalue: upgraded.abilityvalue, 
          ability: upgraded.ability,
        };
      }
      return {
        ...fish,
        src: fish.img,
        alt: fish.name,
        abilitytype: fish.abilitytype, 
        abilityvalue: fish.abilityvalue, 
        ability: fish.ability,
      };
    });
  }

  function gacha() {
    let chance = Math.floor(Math.random() * 100) + 1;
    let availableFishes = [];
    
    if (chance <= 5) {
      availableFishes = fishList.value.slice(6, 9);
    } else if (chance <= 20) {
      availableFishes = fishList.value.slice(3, 6);
    } else {
      availableFishes = fishList.value.slice(0, 3);
    }
    
    if (availableFishes.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableFishes.length);
      const wonFish = { ...availableFishes[randomIndex] };
      
      const existingIndex = win.value.findIndex(f => f.id === wonFish.id);
      if (existingIndex === -1) {
        win.value.push(wonFish);
        lastFish.value = wonFish;
      } else {
        const existingFish = win.value[existingIndex];
        existingFish.damage = (existingFish.damage) + 1;
        existingFish.health = (existingFish.health) + 1;
        existingFish.lvl = (existingFish.lvl) + 1;
        lastFish.value = { ...existingFish };
        
        localStorage.setItem('gachaWins', JSON.stringify(win.value));
        updateAvailableFishWithUpgrades();
        return;
      }
      
      lastFish.value = wonFish;
      localStorage.setItem('gachaWins', JSON.stringify(win.value));
      updateAvailableFishWithUpgrades();
    }
  }

  function loadWinsFromLocalStorage() {
    const savedWins = localStorage.getItem('gachaWins');
    if (savedWins) {
      win.value = JSON.parse(savedWins);
      updateAvailableFishWithUpgrades();
    }
     if (win.value.length === 0) {
      const starterFish = fishList.value.find(f => f.id === 1);
      if (starterFish) {
        win.value.push({ ...starterFish });
        localStorage.setItem('gachaWins', JSON.stringify(win.value));
      }
    }
    updateAvailableFishWithUpgrades();
  }

  loadWinsFromLocalStorage();

  return {
    gacha,
    win,
    lastFish,
    loadWinsFromLocalStorage,
    updateAvailableFishWithUpgrades
  };
}