/**
 * Zustand Store pour la gestion de l'etat des messages
 * Gere les threads, filtres, recherche, et synchronisation
 */

import { create } from 'zustand';
import { messagesApi } from '@/lib/api';

export interface MessageThreadUI {
  id: string;
  guestName: string;
  guestEmail?: string;
  platform: string;
  unreadCount: number;
  lastMessageAt: string | null;
  preview: string;
  status: string;
}

export interface MessageUI {
  id: string;
  sender: string;
  senderName: string;
  body: string;
  sentAt: string;
  isRead: boolean;
  platform: string;
}

export interface MessageThreadDetail {
  id: string;
  guestName: string;
  guestEmail?: string;
  platform: string;
  status: string;
  createdAt: string;
  messages: MessageUI[];
}

interface CurrentThreadWrapper {
  thread: MessageThreadDetail;
}

interface MessagesStoreState {
  // State
  threads: MessageThreadUI[];
  selectedThreadId: string | null;
  currentThread: CurrentThreadWrapper | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  totalUnread: number;

  // Filters
  filters: {
    platform?: string;
    status?: string;
    search?: string;
  };

  // Draft management
  drafts: Record<string, string>;

  // Actions
  fetchThreads: (filters?: any) => Promise<void>;
  selectThread: (id: string) => Promise<void>;
  sendMessage: (threadId: string, message: string) => Promise<void>;
  markAsRead: (threadId: string) => Promise<void>;
  sync: (propertyId?: string) => Promise<void>;
  setFilter: (filter: Partial<{ platform?: string; status?: string; search?: string }>) => void;
  saveDraft: (threadId: string, content: string) => void;
  getDraft: (threadId: string) => string;
  clearDraft: (threadId: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useMessagesStore = create<MessagesStoreState>((set, get) => ({
  // Initial state
  threads: [],
  selectedThreadId: null,
  currentThread: null,
  loading: false,
  syncing: false,
  error: null,
  totalUnread: 0,

  filters: {
    platform: undefined,
    status: 'open',
    search: undefined
  },

  drafts: {},

  // Fetch threads avec filtrage
  fetchThreads: async (filters?: any) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const response = await messagesApi.list({
        ...state.filters,
        ...filters
      });

      const threads = response.data?.threads || [];
      const totalUnread = threads.reduce(
        (sum: number, t: any) => sum + (t.unreadCount || 0),
        0
      );

      set({
        threads,
        totalUnread,
        loading: false
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch messages',
        loading: false
      });
    }
  },

  // Selectionner un thread et charger les messages
  selectThread: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await messagesApi.getMessages(id);
      const threadData = response.data;

      // Formater les donnees pour l'interface MessageThreadDetail
      const formattedThread: MessageThreadDetail = {
        id: threadData.id,
        guestName: threadData.guestName,
        guestEmail: threadData.guestEmail,
        platform: threadData.platform,
        status: threadData.status,
        createdAt: threadData.createdAt,
        messages: (threadData.messages || []).map((msg: any) => ({
          id: msg.id,
          sender: msg.sender,
          senderName: msg.senderName,
          body: msg.body,
          sentAt: msg.sentAt,
          isRead: msg.isRead || false,
          platform: msg.platform
        }))
      };

      set({
        selectedThreadId: id,
        currentThread: { thread: formattedThread },
        loading: false
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to load thread',
        loading: false
      });
    }
  },

  // Envoyer un message
  sendMessage: async (threadId: string, message: string) => {
    set({ error: null });
    try {
      await messagesApi.send(threadId, { message });

      // Rafraichir le thread
      await get().selectThread(threadId);

      // Rafraichir la liste des threads
      await get().fetchThreads();

      // Effacer le draft
      get().clearDraft(threadId);
    } catch (err: any) {
      set({
        error: err.message || 'Failed to send message'
      });
      throw err;
    }
  },

  // Marquer comme lu
  markAsRead: async (threadId: string) => {
    try {
      // Mise a jour optimiste
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId ? { ...t, unreadCount: 0 } : t
        ),
        totalUnread: Math.max(0, state.totalUnread - (state.threads.find((t) => t.id === threadId)?.unreadCount || 0))
      }));

      // API call
      await messagesApi.getMessages(threadId);
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    }
  },

  // Synchroniser les messages
  sync: async (propertyId?: string) => {
    set({ syncing: true, error: null });
    try {
      await messagesApi.sync(propertyId);

      // Rafraichir la liste apres sync
      await get().fetchThreads();

      set({ syncing: false });
    } catch (err: any) {
      set({
        error: err.message || 'Sync failed',
        syncing: false
      });
    }
  },

  // Gerer les filtres
  setFilter: (filter: any) => {
    set((state) => ({
      filters: { ...state.filters, ...filter }
    }));
  },

  // Gestion des drafts (localStorage)
  saveDraft: (threadId: string, content: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`draft_${threadId}`, content);
    }
    set((state) => ({
      drafts: { ...state.drafts, [threadId]: content }
    }));
  },

  getDraft: (threadId: string) => {
    const state = get();
    if (state.drafts[threadId]) {
      return state.drafts[threadId];
    }
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem(`draft_${threadId}`);
      if (draft) {
        set((state) => ({
          drafts: { ...state.drafts, [threadId]: draft }
        }));
        return draft;
      }
    }
    return '';
  },

  clearDraft: (threadId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`draft_${threadId}`);
    }
    set((state) => ({
      drafts: { ...state.drafts, [threadId]: '' }
    }));
  },

  // Effacer les erreurs
  clearError: () => set({ error: null }),

  // Reinitialiser
  reset: () => set({
    threads: [],
    selectedThreadId: null,
    currentThread: null,
    loading: false,
    syncing: false,
    error: null,
    totalUnread: 0,
    filters: { platform: undefined, status: 'open', search: undefined },
    drafts: {}
  })
}));
