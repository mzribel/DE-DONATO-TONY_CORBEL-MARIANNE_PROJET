// @ts-nocheck TODO: enlever ça
import {supabase} from "../database/supabase.ts";
import type { Session } from '../types';

export const authService = {
  getSession: async () => {
    return await supabase.auth.getSession();
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export const sessionService = {

  saveSession: async (sessionData?: Session) => {
    // TODO: a faire
  },

  getSessions: async (userId?: string) => {
    // TODO: a faire
    return [];
  }
};

export const settingsService = {

  saveSettings: async (userId?: string, settings?: any) => {
    // TODO: a faire
  },


  getSettings: async (userId?: string) => {
    // TODO: a remplacer
    return {
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      longBreakInterval: 4,
      soundEnabled: true,
      notificationsEnabled: true
    };
  }
};