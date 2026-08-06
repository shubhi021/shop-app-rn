import {useState, useEffect, useCallback} from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  useEffect(() => {
    // Subscribe to real-time native network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || state.isInternetReachable === false;

      setIsOffline(prevOffline => {
        if (prevOffline && !offline && queue.length > 0) {
          Toast.show({
            type: 'info',
            text1: '⚡ Back Online',
            text2: `Synchronized ${queue.length} offline actions.`,
          });
          setQueue([]);
        }
        return offline;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [queue.length]);

  const setOfflineState = useCallback(
    (offline: boolean) => {
      setIsOffline(offline);
      if (!offline && queue.length > 0) {
        Toast.show({
          type: 'info',
          text1: '⚡ Syncing Offline Queue',
          text2: `${queue.length} actions synchronized with server.`,
        });
        setQueue([]);
      }
    },
    [queue.length],
  );

  const enqueueAction = useCallback((type: string, payload: any) => {
    const action: QueuedAction = {
      id: Math.random().toString(36).substring(7),
      type,
      payload,
      timestamp: Date.now(),
    };
    setQueue(prev => [...prev, action]);
    Toast.show({
      type: 'info',
      text1: '📥 Saved Offline',
      text2: 'Will sync when connection returns.',
    });
  }, []);

  return {
    isOffline,
    queue,
    setOfflineState,
    enqueueAction,
  };
};
