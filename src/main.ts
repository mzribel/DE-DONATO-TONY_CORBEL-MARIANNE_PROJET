import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from "./router";
import PrimeVue from "primevue/config";
// @ts-ignore
import Aura from '@primeuix/themes/aura';

const app = createApp(App)
    .use(router)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: ".p-dark",
            },
        },
    })
    .mount('#app')

