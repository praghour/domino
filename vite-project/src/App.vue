<script setup>
import { RouterView } from 'vue-router';
import useNotice from './composables/useNotice';

const { notice, isNoticeVisible } = useNotice();
</script>

<template>
    <div class="app">
        <RouterView />
        <!-- выведение уведомлений поверх всего -->
        <div v-if="isNoticeVisible" class="notice_box">
            <div class="notice_icon">⚠</div>
            <div class="notice_content">
                <div class="notice_title">{{ notice.title }}</div>
                <div class="notice_description">{{ notice.description }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notice_box {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 420px;
    padding: 14px 18px;
    background: #fff7ec;
    border: 2px solid #d8dee8;
    border-radius: 25px;
    display: flex;
    align-items: center;
    gap: 14px;
    z-index: 1000;
}

.notice_icon {
    color: #6b778c;
    font-size: 32px;
    font-weight: 700;
}
.navigation button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
}

.notice_content {
    text-align: left;
}

.notice_title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.notice_description {
    margin-top: 4px;
    font-size: 16px;
    color: #6b778c;
}
</style>