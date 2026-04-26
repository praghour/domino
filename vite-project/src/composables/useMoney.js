import { computed, reactive } from 'vue';

const defaultCurrency = [
    {count: 0, type: 'money'},
    {count: 0, type: 'crystal'}
];

const currencyCount = reactive([]);

// сохранение валюты в localStorage
function saveCurrencyToStorage() {
    localStorage.setItem('currency', JSON.stringify(currencyCount));
};

// загрузка валюты из localStorage
function loadCurrencyFromStorage() {
    const savedCurrency = localStorage.getItem('currency');

    if (savedCurrency) {
        const parsedCurrency = JSON.parse(savedCurrency);
        currencyCount.splice(0, currencyCount.length);

        parsedCurrency.forEach((item) => {
            currencyCount.push(item);
        });
    } else {
        // если нет в localStorage — берем дефолт
        currencyCount.splice(0, currencyCount.length);

        defaultCurrency.forEach((item) => {
            currencyCount.push(item);
        });

        saveCurrencyToStorage();
    };
};

loadCurrencyFromStorage();

const currency = computed(() => currencyCount);

// поиск (выбор) валюты по типу
function findCurrency(type) {
    return currencyCount.find((item) => item.type === type);
};

// начисление валюты
function addCurrency(type, amount) {
    const current = findCurrency(type);

    if (!current) {
        return
    };
    
    current.count = current.count + amount;

    saveCurrencyToStorage();
};

// списание валюты
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
        addCurrency, spendCurrency, findCurrency, saveCurrencyToStorage, loadCurrencyFromStorage
    };
};