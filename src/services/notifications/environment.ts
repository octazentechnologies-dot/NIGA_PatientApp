import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Expo Go (StoreClient) no longer supports Android remote push from
 * expo-notifications (SDK 53+). Skip native notification APIs there so the
 * app can still boot for UI work; use a dev/preview/production build for push.
 */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function pushNotificationsSupported(): boolean {
  return !isExpoGo();
}
