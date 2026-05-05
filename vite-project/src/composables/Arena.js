import { ref } from "vue";

// Начальные данные
const initialFishes = [
    {id: 1, img: '/public/9c4376f25bb8b50e1a68e0179822e0c8be46a21d.png', name: 'РЫБКА', damage: '5', health: '20'},
    {id: 2, img: '/public/521b9042ce95ddefe17abdbf17725d55b2462238.png', name: 'РЫБКА2', damage: '10', health: '20'}
];

// Функция загрузки рыб из localStorage
function loadFishesFromLocalStorage() {
    const savedFishes = localStorage.getItem('fishes');
    if (savedFishes) {
        return JSON.parse(savedFishes);
    }
    return initialFishes;
}

// Создаем reactive данные
const fishList = ref(loadFishesFromLocalStorage());

// Экспортируем composable
export default function useFishman() {
    return {
        fishList
    };
}