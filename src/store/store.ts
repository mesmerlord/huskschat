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
  cumalativeTokensUsed?: number;
  isSummary?: boolean;
};

export type ChatRoomType = {
  id: string;
  name: string;
  messages: ChatMessageType[];
  createdAt: Date;
  tokensUsed: number;
  documentId: string | null;
};

export const IDBStorage = {
  getItem: async (name) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return null;
    }

    const value = await get(name);

    return value || null;
  },
  setItem: async (name, value) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return;
    }

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
  documentId: string | null;
  modelName: string;
};

const getDefaultInitialState: storeState = () => ({
  isAnimating: false,
  apiKey: "",
  siteName: "Husks",
  darkMode: "dark",
  messageRoomList: [],
  currentRoomId: null,
  userPlan: "not_set",
  modelName: "gpt-3.5-turbo-0301",
});
const zustandContext: any = createContext();
export const Provider = zustandContext.Provider;
export const useStore = zustandContext.useStore;

export const getOpenAiCompletion = async (
  messages: ChatMessageType[],
  apiKey
) => {
  const newMessages = messages?.map((msg) => {
    if (Boolean(msg?.content)) {
      return {
        content: msg.content,
        role: msg.role,
      };
    }
  });

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages: newMessages,
  });
  return completion;
};

export const getServerCompletion = async (
  messages: ChatMessageType[],
  roomId,
  modelName
) => {
  const newMessages = messages?.map((msg) => {
    if (Boolean(msg?.content)) {
      return {
        content: msg.content,
        role: msg.role,
      };
    }
  });
  console.log(modelName);
  const response = await fetch("/api/completion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: newMessages,
      roomId,
      modelName: modelName,
    }),
  })
    .then((res) => res)
    .catch((err) => {
      console.error("Error with OpenAI request:", err);
      return err;
    });
  return response;
};

export const getServerDocumentCompletion = async (
  messages: ChatMessageType[],
  documentId,
  roomId
) => {
  const newMessages = messages?.map((msg) => {
    if (Boolean(msg?.content)) {
      return {
        content: msg.content,
        role: msg.role,
      };
    }
  });

  const response = await fetch("/api/completion-from-vector", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: newMessages,
      documentId: documentId,
      roomId,
    }),
  })
    .then((res) => res)
    .catch((err) => {
      console.error("Error with OpenAI request:", err);
      return err;
    });
  return response;
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
        setUserPlan: (userPlan) => set(() => ({ userPlan })),
        setModelName: (modelName) => set(() => ({ modelName })),

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
        replaceRoomMessage: (roomId, messageId, newMessage, tokensUsed = 0) => {
          set(
            produce((draft) => {
              const room = draft.messageRoomList.find(
                (room) => room.id === roomId
              );
              room.messages.pop();
              room.messages.push(newMessage);
              room.tokensUsed += tokensUsed;
            })
          );
        },
        addRoom: (roomId, values: ChatRoomType) => {
          set(
            produce((draft) => {
              draft.messageRoomList.push({
                id: roomId,
                name: roomId,
                messages: [],
                createdAt: new Date(),
                tokensUsed: 0,
                ...values,
              });
              draft.currentRoomId = roomId;
            })
          );
          console.log("addRoom", roomId, get().messageRoomList);
        },
        addRoomMessage: (
          roomId,
          message,
          tokensUsed = 0,
          systemPrompt = null
        ) => {
          if (!message.content) {
            return;
          }
          const existingRoom = get().messageRoomList.find(
            (room) => room.id === roomId
          );

          if (!existingRoom) {
            const messagesToAdd =
              systemPrompt === null ? [message] : [systemPrompt, message];
            set(
              produce((draft) => {
                draft.messageRoomList.push({
                  id: roomId,
                  name: roomId,
                  messages: [...messagesToAdd],
                  tokensUsed: 0,
                });
                draft.currentRoomId = roomId;
              })
            );
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
          userPlan: state.userPlan,
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
