import {User} from "./index";

export type AuthState = {
    user: User | null;
    session: any | null;
    loading: boolean;
}