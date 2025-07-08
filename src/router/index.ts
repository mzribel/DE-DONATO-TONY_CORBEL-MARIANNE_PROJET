import { createRouter, createWebHashHistory } from 'vue-router';
import { getSession } from '../services/supabase/authService';

import SettingsView from "../views/SettingsView.vue";
import HistoryView from "../views/HistoryView.vue";
import TimerView from "../views/TimerView.vue";
import ProfileView from "../views/ProfileView.vue";
import Signup from "../views/Auth/Signup.vue";
import Login from "../views/Auth/Login.vue";

const routes = [
    {
        path: '/settings', 
        name: "Settings", 
        component: SettingsView,
        meta: { requiresAuth: true }
    },
    { 
        path: '/',
        name: "Pomodoro", 
        component: TimerView,
        meta: { requiresAuth: true }
    },
    { 
        path: '/history', 
        name: "History", 
        component: HistoryView,
        meta: { requiresAuth: true }
    },
    { 
        path: '/login', 
        name: "Login", 
        component: Login,
    },
    { 
        path: '/signup', 
        name: "Signup", 
        component: Signup,
    },
    { 
        path: '/profile', 
        name: "Profile", 
        component: ProfileView,
        meta: { requiresAuth: true }
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});


// Protection des routes
router.beforeEach(async (to, from, next) => {
    const session = await getSession();
    const isAuthenticated = !!session?.session;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
        next('/');
    } else {
        next();
    }
});