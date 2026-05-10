import { computed, reactive } from 'vue';

const defaultCurrency = [
    {count: 0, type: 'money'},
    {count: 0, type: 'crystal'}
];

// общее количество заработанного за всё время
const defaultTotalEarned = [
    {total: 0, type: 'money'},
    {total: 0, type: 'crystal'}
];
// общее количество заработанного за всё время

const currencyCount = reactive([]);
const totalEarnedCount = reactive([]); // общее количество заработанного за всё время

// сохранение валюты в localStorage
function saveCurrencyToStorage() {
    localStorage.setItem('currency', JSON.stringify(currencyCount));
    localStorage.setItem('totalEarned', JSON.stringify(totalEarnedCount));
};

// загрузка валюты из localStorage
function loadCurrencyFromStorage() {
    const savedCurrency = localStorage.getItem('currency');
    const savedTotalEarned = localStorage.getItem('totalEarned');

    if (savedCurrency) {
        const parsedCurrency = JSON.parse(savedCurrency);
        currencyCount.splice(0, currencyCount.length);
        parsedCurrency.forEach((item) => {
            currencyCount.push(item);
        });
    } else {
        currencyCount.splice(0, currencyCount.length);
        defaultCurrency.forEach((item) => {
            currencyCount.push(item);
        });
    }

    if (savedTotalEarned) {
        const parsedTotalEarned = JSON.parse(savedTotalEarned);
        totalEarnedCount.splice(0, totalEarnedCount.length);
        parsedTotalEarned.forEach((item) => {
            totalEarnedCount.push(item);
        });
    } else {
        totalEarnedCount.splice(0, totalEarnedCount.length);
        defaultTotalEarned.forEach((item) => {
            totalEarnedCount.push(item);
        });
    }

    saveCurrencyToStorage();
};

loadCurrencyFromStorage();

const currency = computed(() => currencyCount);
const totalEarned = computed(() => totalEarnedCount);

// поиск (выбор) валюты по типу
function findCurrency(type) {
    return currencyCount.find((item) => item.type === type);
};

// поиск общего количества по типу
function findTotalEarned(type) {
    return totalEarnedCount.find((item) => item.type === type);
};

// начисление валюты (увеличивает и текущий баланс, и общую статистику)
function addCurrency(type, amount) {
    const current = findCurrency(type);
    const total = findTotalEarned(type);

    if (!current || !total) {
        return
    };
    
    current.count = current.count + amount;
    total.total = total.total + amount;

    saveCurrencyToStorage();
};

// списание валюты (не трогает общую статистику)
function spendCurrency(type, amount) {
    const current = findCurrency(type);

    if (!current) {
        return false;
    };
    if (current.count < amount) {
        return false;
    };

    current.count = current.count - amount;

    saveCurrencyToStorage();
    return true;
};

// экспорт всего и вся
export default function useMoney() {
    return {
        currency,
        totalEarned,
        addCurrency,
        spendCurrency,
        findCurrency,
        findTotalEarned,
        saveCurrencyToStorage,
        loadCurrencyFromStorage
    };
};