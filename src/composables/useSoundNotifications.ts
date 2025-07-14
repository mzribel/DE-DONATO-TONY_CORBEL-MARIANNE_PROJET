import { Ref, isRef } from 'vue';

export function useSoundNotification(file: string | Ref<string>, enableSound: Ref<boolean> | boolean) {
    let audio: HTMLAudioElement | null = null;

    function playSound() {
        const path = isRef(file) ? file.value : file;
        const enabled = isRef(enableSound) ? enableSound.value : enableSound;

        if (!enabled) return;

        // Si un son est déjà en cours, on l'arrête avant d'en jouer un nouveau
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        audio = new Audio(path);
        audio.play().catch((err) => console.error('Erreur audio', err));
    }

    return { playSound };
}
