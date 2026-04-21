import { createRouter, createWebHistory } from "vue-router";

import main from "./components/main.vue";

const routes = [
    {path: '/', component: main, name: 'main'}
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});