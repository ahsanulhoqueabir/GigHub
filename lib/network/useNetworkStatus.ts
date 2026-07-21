import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
  isChecking: boolean;
  refresh: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetInfoState | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus(state);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setStatus(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const state = await NetInfo.fetch();
      setStatus(state);
      // Brief delay so user sees spinner animation when retrying
      await new Promise((resolve) => setTimeout(resolve, 600));
      const offline =
        state.isConnected === false || state.isInternetReachable === false;
      return !offline;
    } catch {
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Determine if offline
  // If status is null (initial load before NetInfo resolves), treat as offline if isConnected is explicitly false
  const isConnected = status?.isConnected ?? true;
  const isInternetReachable = status?.isInternetReachable ?? null;

  // Offline if either explicitly disconnected or internet is unreachable
  const isOffline =
    status !== null &&
    (isConnected === false || isInternetReachable === false);

  return {
    isConnected,
    isInternetReachable,
    isOffline,
    isChecking,
    refresh,
  };
}
