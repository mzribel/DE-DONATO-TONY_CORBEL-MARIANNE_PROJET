import { createApp } from 'vue'
import './assets/css/style.css'
import App from './App.vue'
import { router } from "./router";
import PrimeVue from "primevue/config";
// @ts-ignore
import Aura from '@primeuix/themes/aura';
import {definePreset} from "@primeuix/themes";

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{rose.50}',
            100: '{rose.100}',
            200: '{rose.200}',
            300: '{rose.300}',
            400: '{rose.400}',
            500: '{rose.500}',
            600: '{rose.600}',
            700: '{rose.700}',
            800: '{rose.800}',
            900: '{rose.900}',
            950: '{rose.950}'
        }
    }
});

createApp(App)
    .use(router)
    .use(PrimeVue, {
        theme: {
            preset: MyPreset,
            options: {
                darkModeSelector: ".p-dark",
            },
        },
    })
    .mount('#app')

