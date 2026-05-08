import { ref } from "vue";
import useFishman from '../composables/Arena';

export default function usegacha() {
    const { fishList } = useFishman();
    const win = ref([]);
    const lastFish = ref(null);
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
            win.value.push(wonFish);
            lastFish.value = wonFish; 
            localStorage.setItem('gachaWins', JSON.stringify(win.value));
        }
    }
    function loadWinsFromLocalStorage() {
        const savedWins = localStorage.getItem('gachaWins');
        if (savedWins) {
            win.value = JSON.parse(savedWins);
        }
    }
    loadWinsFromLocalStorage();
    return {
        gacha,
        win,
        lastFish
    };
}