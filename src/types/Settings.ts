export type Settings = {
    id: string,
    user_id:string,
    pomodoro_duration: number,
    short_break_duration: number,
    long_break_duration: number,
    cycles_before_long_break: number,
    notifications_enabled: boolean,
    auto_start_next: boolean
}