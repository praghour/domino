import { ref } from "vue";

const initialFishes = [
  { id: 1, img: "/Aquarium/fish1.png", alt: "рыба 1" , damage: '10', health: '20', name: 'Рыба1'},
  { id: 2, img: "/Aquarium/fish2.png", alt: "рыба 2" , damage: '10', health: '20', name: 'Рыба2'},
  { id: 3, img: "/Aquarium/fish3.png", alt: "рыба 3" , damage: '10', health: '20', name: 'Рыба3'},
  { id: 4, img: "/Aquarium/fish4.png", alt: "рыба 4" , damage: '10', health: '20', name: 'Рыба4'},
  { id: 5, img: "/Aquarium/fish5.png", alt: "рыба 5" , damage: '10', health: '20', name: 'Рыба5'},
  { id: 6, img: "/Aquarium/fish6.png", alt: "рыба 6" , damage: '10', health: '20', name: 'Рыба6'},
  { id: 7, img: "/Aquarium/fish7.png", alt: "рыба 7", damage: '10', health: '20', name: 'Рыба7' },
  { id: 8, img: "/Aquarium/fish8.png", alt: "рыба 8" , damage: '10', health: '20', name: 'Рыба8'},
  { id: 9, img: "/Aquarium/fish9.png", alt: "рыба 9" , damage: '10', health: '20', name: 'Рыба9'}
];
const initialBosses = [
    {id: 1, img: '/Aquarium/fish2.png', name: 'ЗЛАЯ РЫБКА'},
];
function loadFishesFromLocalStorage() {
    const savedFishes = localStorage.getItem('fishes');
    if (savedFishes) {
        return JSON.parse(savedFishes);
    }
    return initialFishes;
}
function loadPartyFromLocalStorage() {
    const savedPartyFishes = localStorage.getItem('partyfishes');
    if (savedPartyFishes) {
        return JSON.parse(savedPartyFishes);
    }
    return [];
}
function loadBossesFromLocalStorage() {
    const savedFishes = localStorage.getItem('fishes');
    if (savedFishes) {
        return JSON.parse(savedFishes);
    }
    return initialBosses;
}
const fishList = ref(loadFishesFromLocalStorage());
const bossList = ref(loadBossesFromLocalStorage());

export default function useFishman() {
    return {
        fishList,
        bossList
    };
}


// import { ref, watch } from "vue";
// import { slidesfish } from "./useAquarium.js";

// const arenaSlides = ref(slidesfish.value.map(fish => ({
//   ...fish,
//   name: "Название",
//   ability: "Способность"
// })));

// const currentIndexArena = ref(0);
// const selectedArenaIds = ref([]);

// // загрузка из localStorage
// const savedSelectedArenaIds = localStorage.getItem("arena_selectedArenaIds");
// if (savedSelectedArenaIds) {
//   selectedArenaIds.value = JSON.parse(savedSelectedArenaIds);
// }

// // следим за изменениями
// watch(selectedArenaIds, (newVal) => {
//   const toSave = newVal.map(card => ({
//     id: card.id,
//     src: card.src,
//     alt: card.alt,
//     name: card.name,
//     ability: card.ability
//   }));
//   localStorage.setItem("arena_selectedArenaIds", JSON.stringify(toSave));
// }, { deep: true });

// // переключения для арены
// function nextSlideArena() {
//   if (currentIndexArena.value + 3 < arenaSlides.value.length) {
//     currentIndexArena.value++;
//   }
// }

// function prevSlideArena() {
//   if (currentIndexArena.value > 0) {
//     currentIndexArena.value--;
//   }
// }

// // выбор карточки арены
// function selectArenaCard(card) {
//   const index = selectedArenaIds.value.findIndex(a => a.id === card.id);
//   if (index === -1) {
//     selectedArenaIds.value.push(card);
//   } else {
//     selectedArenaIds.value.splice(index, 1);
//   }
// }

// export default function useArena() {
//   return {
//     arenaSlides,
//     currentIndexArena,
//     selectedArenaIds,
//     nextSlideArena,
//     prevSlideArena,
//     selectArenaCard,
//     arenaSlides,
//     currentIndexArena,
//     selectedArenaIds
//   };
// }