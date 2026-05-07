import { ref } from "vue";

const initialFishes = [
    {id: 1, img: '/Aquarium/fish4.png', name: 'РЫБКА', damage: '25', health: '20'},
    {id: 2, img: '/Aquarium/fish3.png', name: 'РЫБКА2', damage: '10', health: '10'}
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
