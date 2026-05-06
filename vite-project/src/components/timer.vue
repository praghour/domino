<script setup>
import useTimer from '../composables/useTimer';

const { minutes, timeText, timerStyle, activeMinutes,
startTimer, pauseTimer, resetTimer, setMinutes, minusMinute, plusMinute } = useTimer();
</script>

<template>
    <div class="timer_page">
        <div class="timer_check">
            <div>
                <h2>Фокусировка</h2>
                <p>Сосредоточьтесь на работе без отвлечений</p>
            </div>

            <div class="timer" :style="timerStyle">
                <div class="timer_inner">
                    {{ timeText }}
                </div>
            </div>

            <div class="timer_buttons">
                <button class="blue_button" @click="startTimer">Старт</button>
                <button @click="pauseTimer">Пауза</button>
                <button @click="resetTimer">Сбросить</button>
            </div>

            <p class="timer_note">Сфокусируйтесь на важном. Остальное подождёт</p>
        </div>

        <div class="timer_set">
            <p class="set_title">Настроить время</p>

            <div class="time_control">
                <button @click="minusMinute">−</button>
                <b>{{ minutes }}:00</b>
                <span>мин</span>
                <button @click="plusMinute">+</button>
            </div>

            <div class="time_buttons">
                <button :class="{ active_button: activeMinutes === 15 }" @click="setMinutes(15)">15 мин</button>
                <button :class="{ active_button: activeMinutes === 25 }" @click="setMinutes(25)">25 мин</button>
                <button :class="{ active_button: activeMinutes === 45 }" @click="setMinutes(45)">45 мин</button>
                <button :class="{ active_button: activeMinutes === 60 }" @click="setMinutes(60)">60 мин</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.timer_page {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  padding: 20px;
}

.timer_check,
.timer_set {
  background: white;
  border: 1px solid #dfe6ef;
  border-radius: 18px;
  padding: 25px;
}

.timer_check {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 35px;
}

.timer_check h2 {
  margin: 0;
  color: #111827;
  font-size: 26px;
}

.timer_check p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}

.timer {
  width: 270px;
  height: 270px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer_inner {
  width: 230px;
  height: 230px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 52px;
  font-weight: 700;
}

.timer_buttons,
.time_buttons,
.time_control {
  display: flex;
  align-items: center;
  gap: 12px;
}

button {
  border: none;
  border-radius: 10px;
  background: #edf1f7;
  color: #64748b;
  padding: 14px 22px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.blue_button,
.active_button {
  background: #3478f6;
  color: white;
}

.timer_note {
  font-size: 13px;
}

.timer_set {
  height: fit-content;
}

.set_title {
  margin: 0 0 18px;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.time_control {
  border: 2px solid #dfe6ef;
  border-radius: 12px;
  padding: 8px;
  justify-content: space-between;
}

.time_control button {
  padding: 10px 16px;
  color: #3478f6;
}

.time_control b {
  color: #111827;
  font-size: 24px;
}

.time_control span {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.time_buttons {
  margin-top: 18px;
}

.time_buttons button {
  flex: 1;
  padding: 12px;
  font-size: 14px;
}
</style>