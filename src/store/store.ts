// @ts-nocheck
import { useLayoutEffect } from "react";
import createContext from "zustand/context";
import create from "zustand";
// import axios from 'axios';
import { persist } from "zustand/middleware";
import { Configuration, OpenAIApi } from "openai";
import { get, set } from "idb-keyval";
import produce from "immer";

let store;

export enum ChatCompletionRequestMessageRoleEnum {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export type ChatMessageType = {
  id: string;
  content: string | null;
  role: typeof ChatCompletionRequestMessageRoleEnum[keyof typeof ChatCompletionRequestMessageRoleEnum];
};

export type ChatRoomType = {
  id: string;
  name: string;
  messages: ChatMessageType[];
  createdAt: Date;
  tokensUsed: number;
};

export const IDBStorage = {
  getItem: async (name) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return null;
    }

    const value = await get(name);

    console.log("load indexeddb called");
    return value || null;
  },
  setItem: async (name, value) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return;
    }
    console.log("set indexeddb called");

    await set(name, value);
  },
};

export type storeState = {
  isAnimating: boolean;
  apiKey: string;
  siteName: string;
  darkMode: string;
  messageRoomList: ChatRoomType[];
  currentRoom: string | null;
};

const getDefaultInitialState: storeState = () => ({
  isAnimating: false,
  apiKey: "",
  siteName: "Husks",
  darkMode: "dark",
  messageRoomList: [],
  currentRoomId: null,
});
const zustandContext: any = createContext();
export const Provider = zustandContext.Provider;
export const useStore = zustandContext.useStore;

export const getOpenAiCompletion = async (
  messages: ChatMessageType[],
  apiKey
) => {
  const newMessages = messages?.map((msg) => {
    return {
      content: msg.content,
      role: msg.role,
    };
  });

  const configuration = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages: newMessages,
  });
  console.log("completion", completion);
  return completion;
};

export const initializeStore = (preloadedState = {}) => {
  return create(
    persist(
      (set, get) => ({
        ...getDefaultInitialState(),
        ...preloadedState,
        setIsAnimating: (isAnimating) => set(() => ({ isAnimating })),
        setApiKey: (apiKey) => set(() => ({ apiKey })),
        setCurrentRoomId: (roomId) => set(() => ({ currentRoomId: roomId })),
        setRoomName: (roomId, name) => {
          set(
            produce((draft) => {
              const room = draft.messageRoomList.find(
                (room) => room.id === roomId
              );
              room.name = name;
            })
          );
        },
        setApiKey: (apiKey) => set(() => ({ apiKey })),
        deleteRoom: (roomId) => {
          set(
            produce((draft) => {
              const rooms = draft.messageRoomList.filter(
                (room) => room.id !== roomId
              );
              draft.messageRoomList = rooms;

              if (draft.currentRoomId === roomId) {
                draft.currentRoomId = null;
              }
            })
          );
        },
        switchDarkMode: () => {
          set(
            produce((draft) => {
              draft.darkMode = draft.darkMode === "dark" ? "light" : "dark";
            })
          );
        },

        addRoomMessage: (
          roomId,
          message,
          tokensUsed = 0,
          systemPrompt = null
        ) => {
          const existingRoom = get().messageRoomList.find(
            (room) => room.id === roomId
          );
          if (!existingRoom) {
            set((state) => ({
              messageRoomList: [
                ...state.messageRoomList,
                {
                  id: roomId,
                  name: roomId,
                  messages: [systemPrompt, message],
                  tokensUsed: 0,
                },
              ],
              currentRoomId: roomId,
            }));
          } else {
            set(
              produce((draft) => {
                const room = draft.messageRoomList.find(
                  (room) => room.id === roomId
                );
                room.tokensUsed += tokensUsed;
                room.messages.push(message);
              })
            );
          }
        },
      }),

      {
        name: "husks",
        getStorage: () => IDBStorage,
        partialize: (state) => ({
          messageRoomList: state.messageRoomList,
          darkMode: state.darkMode,
          apiKey: state.apiKey,
        }),
        version: 1,
      }
    )
  );
};

export function useCreateStore(serverInitialState) {
  if (typeof window === "undefined") {
    return () => initializeStore(serverInitialState);
  }

  // Client side code:
  // Next.js always re-uses same store regardless of whether page is a SSR or SSG or CSR type.
  const isReusingStore = Boolean(store);
  store = store ?? initializeStore(serverInitialState);
  // When next.js re-renders _app while re-using an older store, then replace current state with
  // the new state (in the next render cycle).
  // (Why next render cycle? Because react cannot re-render while a render is already in progress.
  // i.e. we cannot do a setState() as that will initiate a re-render)
  //
  // eslint complaining "React Hooks must be called in the exact same order in every component render"
  // is ignorable as this code runs in same order in a given environment (i.e. client or server)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => {
    // serverInitialState is undefined for CSR pages. It is up to you if you want to reset
    // states on CSR page navigation or not. I have chosen not to, but if you choose to,
    // then add `serverInitialState = getDefaultInitialState()` here.
    if (serverInitialState && isReusingStore) {
      store.setState(
        {
          // re-use functions from existing store
          ...store.getState(),
          // but reset all other properties.
          ...serverInitialState,
        },
        true // replace states, rather than shallow merging
      );
    }
  });

  return () => store;
}
