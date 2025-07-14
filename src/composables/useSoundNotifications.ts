import { Ref, isRef } from 'vue';
import { ringtones } from "../types/ringtones";

export function useSoundNotification(file_id: number | Ref<number>, enableSound: Ref<boolean> | boolean) {
    let audio: HTMLAudioElement | null = null;

    function playSound() {
        let file_path:string = ringtones.find(r => {
            const id:number = isRef(file_id) ? file_id.value : file_id;
            return r.id === id;
        })?.file;

        if (!file_path) {
            file_path = ringtones[0].file;
        }

        const enabled = isRef(enableSound) ? enableSound.value : enableSound;
        if (!enabled) return;

        // Si un son est déjà en cours, on l'arrête avant d'en jouer un nouveau
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        audio = new Audio(file_path);
        audio.play().catch((err) => console.error('Erreur audio', err));
    }

    return { playSound };
}
