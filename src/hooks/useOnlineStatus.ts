// Re-export the shared context-based hook so existing imports keep working.
// The single realtime subscription lives in OnlineStatusProvider (src/contexts/OnlineStatusContext.tsx),
// which prevents multiple cards from subscribing to the same 'online-status' channel.
export { useOnlineStatus } from '@/contexts/OnlineStatusContext';
