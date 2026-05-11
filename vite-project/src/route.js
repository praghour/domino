import { createRouter, createWebHistory } from "vue-router";
import DEATHARENA from "./components/DEATHARENA.vue";
import main from "./components/main.vue";
import task from "./components/task.vue";
import Aquarium from "./components/Aquarium.vue";
import timer from "./components/timer.vue";
import Achievements from "./components/Achievements.vue";

import notFound from "./components/notFound.vue";

const routes = [
    {path: '/', component: main, name: 'main'},
    {path: '/task/:id([0-9]+)', component: task, name: 'task'},
    {path: '/DEATHARENA', component: DEATHARENA, name: 'arena'},
    {path: '/Aquarium', component: Aquarium, name: 'aquarium'},
    {path: '/timer', component: timer, name: 'timer'},
    {path: '/achievements', component: Achievements, name: 'achievements'},
    {path: '/:pathMatch(.*)*', component: notFound, name: 'notFound'}
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});