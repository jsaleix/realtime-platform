export const SSE_URL = import.meta.env.VITE_SSE_URL??'http://localhost:3000/notification';
export const API_URL = import.meta.env.VITE_API_URL??'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL??'ws://localhost:3000';
export const SOCKET_CONVERSATION_URL = import.meta.env.VITE_SOCKET_CONVERSATION_URL??'ws://localhost:3000/conversation';
export const SOCKET_CHAT_URL = import.meta.env.VITE_SOCKET_CHAT_URL??'ws://localhost:3000/conversation';
export const SOCKET_BOT_URL = import.meta.env.VITE_SOCKET_BOT_URL??'ws://localhost:3000/chatbot';