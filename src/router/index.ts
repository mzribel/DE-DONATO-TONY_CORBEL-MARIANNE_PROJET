import { createRouter, createWebHashHistory } from 'vue-router';

import HomeView from "../views/HomeView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes = [
    { path: '/', name:"Home", component: HomeView },
    { path: '/settings', name:"Settings", component: SettingsView },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});