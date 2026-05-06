import { computed, ref } from 'vue';

const minutes = ref(25);
const secondsLeft = ref(minutes.value * 60);

const isStarted = ref(false);
const timerInterval = ref(null);

// отслеживание надписи об оставшемся времени в таймере
const timeText = computed(() => {
    const currentMinutes = Math.floor(secondsLeft.value / 60);
    const currentSeconds = secondsLeft.value % 60;

    let minuteText = currentMinutes;
    let secondText = currentSeconds;

    if (currentMinutes < 10) {
        minuteText = '0' + currentMinutes;
    };
    if (currentSeconds < 10) {
        secondText = '0' + currentSeconds;
    };

    return minuteText + ':' + secondText;
});

// отслеживание оставшегося времени
const progressPercent = computed(() => {
    const fullTime = minutes.value * 60;

    if (fullTime === 0) {
        return 0;
    };

    return Math.round(secondsLeft.value / fullTime * 100);
});

// отслеживание изменения внешнего вида кружка таймера
const timerStyle = computed(() => {
    return {
        background: `conic-gradient(#3478f6 0% ${progressPercent.value}%, #edf1f7 ${progressPercent.value}% 100%)`
    };
});

// начало отсчёта
function startTimer() {
    if (isStarted.value) {
        return;
    };

    isStarted.value = true;

    timerInterval.value = setInterval(() => {
        if (secondsLeft.value > 0) {
            secondsLeft.value = secondsLeft.value - 1;
        } else {
            pauseTimer();
        };
    }, 1000);
};

// приостановка отсчёта
function pauseTimer() {
    isStarted.value = false;
    clearInterval(timerInterval.value);
};

// обновление времени таймера
function resetTimer() {
    pauseTimer();
    secondsLeft.value = minutes.value * 60;
};

// изменение времени отсчёта
function setMinutes(newMinutes) {
    minutes.value = newMinutes;
    resetTimer();
};

// убавление минут
function minusMinute() {
    if (minutes.value > 1) {
        minutes.value = minutes.value - 1;
        resetTimer();
    };
};

// прибавление минут
function plusMinute() {
    minutes.value = minutes.value + 1;
    resetTimer();
};

// эскпорт всего и вся
export default function useTimer() {
    return {
        minutes, secondsLeft, isStarted, timeText, timerStyle,
        startTimer, pauseTimer, resetTimer, setMinutes, minusMinute, plusMinute
    };
};