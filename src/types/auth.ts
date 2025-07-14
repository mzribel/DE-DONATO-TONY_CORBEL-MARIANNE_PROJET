import { User } from "./users";

export type AuthState = {
    user: User | null;
    session: any | null;
    loading: boolean;
}