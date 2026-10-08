import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// Setup TanStack Query onlineManager integration
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
});

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<{
    isConnected: boolean;
    isInternetReachable: boolean | null;
  }>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkState({
        isConnected: Boolean(state.isConnected),
        isInternetReachable: state.isInternetReachable,
      });
    });

    NetInfo.fetch().then((state) => {
      setNetworkState({
        isConnected: Boolean(state.isConnected),
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => unsubscribe();
  }, []);

  const isOffline = !networkState.isConnected || networkState.isInternetReachable === false;

  return {
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    isOffline,
  };
}
