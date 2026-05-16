import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AssistantState,
  ChatMessage,
  HealthProfile,
  Notification,
  SavedProduct,
  ThemeMode,
} from "@/types";

interface AppState {
  language: string;
  theme: ThemeMode;
  assistantState: AssistantState;
  notifications: Notification[];
  savedProducts: SavedProduct[];
  chatMemory: ChatMessage[];
  healthProfile: HealthProfile;
  hasCompletedLoading: boolean;
  isAuthenticated: boolean;
  setLanguage: (lang: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setAssistantState: (state: AssistantState) => void;
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  addSavedProduct: (product: SavedProduct) => void;
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateHealthProfile: (profile: Partial<HealthProfile>) => void;
  setHasCompletedLoading: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
}

const defaultProfile: HealthProfile = {
  allergies: [],
  conditions: [],
  medications: [],
  dietaryRestrictions: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "en",
      theme: "dark",
      assistantState: "idle",
      notifications: [],
      savedProducts: [],
      chatMemory: [],
      healthProfile: defaultProfile,
      hasCompletedLoading: false,
      isAuthenticated: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setAssistantState: (assistantState) => set({ assistantState }),
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: crypto.randomUUID(),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications,
          ],
        })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      addSavedProduct: (product) =>
        set((s) => ({ savedProducts: [product, ...s.savedProducts] })),
      addChatMessage: (msg) =>
        set((s) => ({
          chatMemory: [
            ...s.chatMemory,
            {
              ...msg,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
          ].slice(-50),
        })),
      updateHealthProfile: (profile) =>
        set((s) => ({
          healthProfile: { ...s.healthProfile, ...profile },
        })),
      setHasCompletedLoading: (hasCompletedLoading) =>
        set({ hasCompletedLoading }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    }),
    {
      name: "sentinox-app",
      partialize: (s) => ({
        language: s.language,
        theme: s.theme,
        savedProducts: s.savedProducts,
        chatMemory: s.chatMemory,
        healthProfile: s.healthProfile,
        hasCompletedLoading: s.hasCompletedLoading,
        isAuthenticated: s.isAuthenticated,
        notifications: s.notifications,
      }),
    }
  )
);
