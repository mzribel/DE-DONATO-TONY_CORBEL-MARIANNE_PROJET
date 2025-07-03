export type Session = {
    id: number;
    type: string;
    duration: number;
    startTime: string;
    endTime: string;
    userId?: string;
}