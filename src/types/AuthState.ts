import { User } from "./User";

export type AuthState = {
    user: User | null;
    session: any | null;
    loading: boolean;
}