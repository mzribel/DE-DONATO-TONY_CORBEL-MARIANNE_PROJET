export interface RingtoneOption {
    id:number;
    name: string;
    file: string;
}

export const ringtones: RingtoneOption[] = [
    { id:0, name: 'Default ringtone', file: '/sounds/default.mp3' },
    { id:1, name: 'Boom', file: '/sounds/boom.mp3' },
    { id:2, name: 'Wind', file: '/sounds/wind.mp3' },
    { id:3, name: 'Weird noise', file: '/sounds/weird.wav' }
];