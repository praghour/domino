import { createRouter, createWebHistory } from "vue-router";
import DEATHARENA from "./components/DEATHARENA.vue";
import main from "./components/main.vue";
import task from "./components/task.vue";
import taskForm from "./components/taskForm.vue";
import Aquarium from "./components/Aquarium.vue";
import timer from "./components/timer.vue"

const routes = [
    {path: '/', component: main, name: 'main'},
    {path: '/task/:id([0-9]+)', component: task, name: 'task', children: [
        {path: 'form', component: taskForm, name: 'taskForm'}
    ]},
    {path: '/DEATHARENA', component: DEATHARENA, name: 'arena'},
    {path: '/Aquarium', component: Aquarium, name: 'aquarium'},
    {path: '/timer', component: timer, name: 'timer'}
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});