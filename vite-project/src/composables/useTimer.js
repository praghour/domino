import { computed, ref } from 'vue';

const minutes = ref(25);
const activeMinutes = ref(25);
const activeTimerButton = ref('');
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

// отслеживание прошедшего времени
const passedPercent = computed(() => {
    return 100 - progressPercent.value;
});

// отслеживание изменения внешнего вида кружка таймера
const timerStyle = computed(() => {
    return {
        background: `conic-gradient(#edf1f7 0% ${passedPercent.value}%, #3478f6 ${passedPercent.value}% 100%)`
    };
});

// начало отсчёта
function startTimer() {
    if (isStarted.value) {
        return;
    };

    activeTimerButton.value = 'start';
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
    activeTimerButton.value = 'pause';
    isStarted.value = false;
    clearInterval(timerInterval.value);
};

// обновление времени таймера
function resetTimer() {
    pauseTimer();
    activeTimerButton.value = 'reset';
    secondsLeft.value = minutes.value * 60;
};

// изменение времени отсчёта
function setMinutes(newMinutes) {
    minutes.value = newMinutes;
    activeMinutes.value = newMinutes;
    resetTimer();
};

// убавление минут
function minusMinute() {
    if (minutes.value > 1) {
        minutes.value = minutes.value - 1;
        activeMinutes.value = minutes.value;
        resetTimer();
    };
};

// прибавление минут
function plusMinute() {
    minutes.value = minutes.value + 1;
    activeMinutes.value = minutes.value;
    resetTimer();
};

// эскпорт всего и вся
export default function useTimer() {
    return {
        minutes, activeMinutes, activeTimerButton, secondsLeft, isStarted, timeText, timerStyle,
        startTimer, pauseTimer, resetTimer, setMinutes, minusMinute, plusMinute
    };
};