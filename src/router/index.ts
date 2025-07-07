import { createRouter, createWebHashHistory } from 'vue-router';
import { getSession } from '../services/supabase/authService';

import SettingsView from "../views/SettingsView.vue";
import HistoryView from "../views/HistoryView.vue";
import Auth from "../views/Auth/Auth.vue";
import TimerView from "../views/TimerView.vue";

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
        component: Auth,
        props: { activeTab: 'login' }
    },
    { 
        path: '/signup', 
        name: "Signup", 
        component: Auth,
        props: { activeTab: 'signup' }
    },
    { 
        path: '/profile', 
        name: "Profile", 
        component: Auth,
        props: { activeTab: 'profile' },
        meta: { requiresAuth: true }
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});


// Protection des routes
router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const data = await getSession();
        if (!data?.session) {
            next({ name: 'Login' });
        } else {
            next();
        }
    } else {
        next();
    }
});
