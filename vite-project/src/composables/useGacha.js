import { ref } from "vue";
import useFishman from './Arena';
import availableFish from './useAquarium.js'; // исправьте путь при необходимости

export default function useGacha() {
  const { fishList } = useFishman();
  const win = ref([]); // выбитые рыбы
  const lastFish = ref(null);

  // Функция для обновления availableFish с улучшенными значениями
  function updateAvailableFishWithUpgrades() {
    // Создаем карту улучшенных рыб из win
    const upgradedFishMap = new Map();
    win.value.forEach(upgraded => {
      upgradedFishMap.set(upgraded.id, upgraded);
    });
    
    // Обновляем каждый элемент в availableFish, применяя улучшения
    availableFish.value = fishList.value.map(fish => {
      const upgraded = upgradedFishMap.get(fish.id);
      if (upgraded) {
        // Если есть улучшенная версия - используем её характеристики
        return {
          ...fish,
          damage: upgraded.damage !== undefined ? upgraded.damage : fish.damage,
          health: upgraded.health !== undefined ? upgraded.health : fish.health,
          // Сохраняем все остальные поля
          src: fish.img || fish.src,
          img: fish.img,
          alt: fish.name,
          abilitytype: fish.abilitytype, 
          abilityvalue: fish.abilityvalue, 
          ability: fish.ability,
          lvl: fish.lvl
        };
      }
      // Если нет улучшений - возвращаем оригинальную рыбу
      return {
        ...fish,
        damage: fish.damage,
        health: fish.health,
        src: fish.img,
        img: fish.img,
        alt: fish.name,
        abilitytype: fish.abilitytype, 
        abilityvalue: fish.abilityvalue, 
        ability: fish.ability,
        lvl: fish.lvl
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
      
      // Проверяем, нет ли уже такой рыбы в выигранных
      const existingIndex = win.value.findIndex(f => f.id === wonFish.id);
      if (existingIndex === -1) {
        // Если рыбы нет - добавляем новую
        win.value.push(wonFish);
        lastFish.value = wonFish;
      } else {
        // Если рыба уже есть - увеличиваем урон и хп на 1
        const existingFish = win.value[existingIndex];
        existingFish.damage = (existingFish.damage) + 1;
        existingFish.health = (existingFish.health) + 1;
        existingFish.lvl = (existingFish.lvl) +1;
        // Обновляем lastFish копией улучшенной рыбы
        lastFish.value = { ...existingFish };
        
        // Сохраняем в localStorage
        localStorage.setItem('gachaWins', JSON.stringify(win.value));
        
        // Обновляем availableFish с новыми улучшениями
        updateAvailableFishWithUpgrades();
        
        return; // Выходим, чтобы не перезаписывать lastFish
      }
      
      lastFish.value = wonFish;
      localStorage.setItem('gachaWins', JSON.stringify(win.value));
      
      // Обновляем availableFish с новыми улучшениями
      updateAvailableFishWithUpgrades();
    }
  }

  function loadWinsFromLocalStorage() {
    const savedWins = localStorage.getItem('gachaWins');
    if (savedWins) {
      win.value = JSON.parse(savedWins);
      // После загрузки также обновляем availableFish
      updateAvailableFishWithUpgrades();
    }
  }

  // Загружаем сохраненные данные при инициализации
  loadWinsFromLocalStorage();

  return {
    gacha,
    win,
    lastFish,
    loadWinsFromLocalStorage,
    updateAvailableFishWithUpgrades // Экспортируем на всякий случай
  };
}