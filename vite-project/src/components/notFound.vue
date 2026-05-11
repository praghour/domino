<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goMain() {
    router.push({name: 'main'});
};
</script>

<template>
    <main class="not_found_page">
        <section class="not_found_card">
            <h1>404</h1>
            <h2>Страница не найдена</h2>
            <p>Такой страницы нет или ссылка была введена неправильно.</p>
            <button @click="goMain">На главную</button>
        </section>
    </main>
</template>

<style scoped>
.not_found_page {
    width: min(100% - 80px, 1362px);
    min-height: 520px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
}

.not_found_card {
    width: 520px;
    padding: 40px;
    background: white;
    border: 1px solid #e5eaf1;
    border-radius: 20px;
    text-align: center;
}

.not_found_card h1 {
    margin: 0;
    color: #2d78f5;
    font-size: 80px;
    font-weight: 700;
}

.not_found_card h2 {
    margin: 10px 0 0;
    color: #0d1627;
    font-size: 24px;
}

.not_found_card p {
    margin: 14px 0 28px;
    color: #66748a;
    font-size: 14px;
}

.not_found_card button {
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    background: #2d78f5;
    color: white;
    font-size: 14px;
    font-weight: 600;

    cursor: pointer;
}
</style>