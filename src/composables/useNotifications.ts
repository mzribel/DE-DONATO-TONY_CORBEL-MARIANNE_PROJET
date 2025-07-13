import { Ref } from "vue";

export function useNotifications(enableNotifications: Ref<boolean>) {
    function sendNotification(title: string, body?: string) {
        if (!enableNotifications.value) {
            console.log('Notifications désactivées, aucune notification envoyée.');
            return;
        }
        // @ts-ignore
        window.electronAPI.notify(title, body);
    }

    return { sendNotification };
}