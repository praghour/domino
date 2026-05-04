<script setup>
import task from './components/task.vue';
import useNotice from './composables/useNotice';
import { useRouter } from 'vue-router';
const router = useRouter()
const { noticeText, isNoticeVisible } = useNotice();
</script>

<template>
    <div class="app">
        <!-- выведение уведомлений поверх всего -->
        <div v-if="isNoticeVisible" class="notice_box">
        {{ noticeText }}
        </div>
    </div>
    <button @click="router.push({name: 'arena'})">Кал</button>
</template>

<style scoped>
.notice_box {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  z-index: 1000;
}
</style>