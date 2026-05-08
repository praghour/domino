import { ref, watch } from "vue";
const party = ref([])
const initialFishes = [
  { id: 1, img: "/Aquarium/fish1.png", alt: "рыба 1" , damage: 10, health: 20, name: 'Рыба1', rarity: 'common'},
  { id: 2, img: "/Aquarium/fish2.png", alt: "рыба 2" , damage: 10, health: 20, name: 'Рыба2', rarity: 'common'},
  { id: 3, img: "/Aquarium/fish3.png", alt: "рыба 3" , damage: 10, health: 20, name: 'Рыба3', rarity: 'common'},
  { id: 4, img: "/Aquarium/fish4.png", alt: "рыба 4" , damage: 10, health: 20, name: 'Рыба4', rarity: 'rare'},
  { id: 5, img: "/Aquarium/fish5.png", alt: "рыба 5" , damage: 10, health: 20, name: 'Рыба5', rarity: 'rare'},
  { id: 6, img: "/Aquarium/fish6.png", alt: "рыба 6" , damage: 10, health: 20, name: 'Рыба6', rarity: 'rare'},
  { id: 7, img: "/Aquarium/fish7.png", alt: "рыба 7", damage: 10, health: 20, name: 'Рыба7' , rarity: 'legendary'},
  { id: 8, img: "/Aquarium/fish8.png", alt: "рыба 8" , damage: 10, health: 20, name: 'Рыба8', rarity: 'legendary'},
  { id: 9, img: "/Aquarium/fish9.png", alt: "рыба 9" , damage: 10, health: 20, name: 'Рыба9', rarity: 'legendary'}
];
const initialBosses = [
    {id: 1, img: '/Aquarium/fish2.png', name: 'ЗЛАЯ РЫБКА'},
];
function findFish(fishId){
    return fishList.value.find((fish) => fish.id === fishId)
}
function loadFishesFromLocalStorage() {
    const savedFishes = localStorage.getItem('fishes');
    if (savedFishes) {
        return JSON.parse(savedFishes);
    }
    return initialFishes;
}
function addFishtoParty(fishId) {
    const partyFish = findFish(Number(fishId));
    if (!partyFish) {
        return;
    }
    const fishinparty = party.value.find(fish => fish.id === partyFish.id)
    if (fishinparty){
        return
    }else if(party.value.length >= 4){
        console.log('Нельзя добавить рыбку')
        return;
    }
    else{
        party.value.push({
            id: partyFish.id,
            name: partyFish.name,
            img: partyFish.img,
            damage: partyFish.damage,
            health: partyFish.health
        })
        console.log('рыбка добавлена')
    }
}
function removeFishFromParty(fishId) {
    party.value = party.value.filter(fish => fish.id !== fishId);
    console.log('рыбка удалена');
}
function loadBossesFromLocalStorage() {
    const savedBosses = localStorage.getItem('bosses');
    if (savedBosses) {
        return JSON.parse(savedBosses);
    }
    return initialBosses;
}
watch(
    () => party.value,
    (newparty) => {
        try{
            addFishtoParty(newparty)
        }catch(error){
        }
    }
)
const fishList = ref(loadFishesFromLocalStorage());
const bossList = ref(loadBossesFromLocalStorage());
export default function useFishman() {
    return {
        fishList,
        bossList,
        addFishtoParty,
        removeFishFromParty,
        party
    };
}