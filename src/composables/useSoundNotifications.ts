import { Ref, isRef } from 'vue';

export function useSoundNotification(enableSound: Ref<boolean> | boolean, filename="sounds/notification.mp3") {
    const sound_path = "/"
    // Créer l'élément audio une seule fois
    const audio = new Audio(sound_path+filename);

    function playSound() {
        const enabled = isRef(enableSound) ? enableSound.value : enableSound;
        if (!enabled) {
            console.log('Son désactivé, pas de son joué.');
            return;
        }

        audio.currentTime = 0; // recommence le son
        audio.play().catch((err) => {
            console.error('Erreur lecture audio :', err);
        });
    }

    return { playSound };
}