import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';

import { isExpoGo } from '../services/notifications/environment';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

async function openAppSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // Expo Go and the iOS simulator have no Settings destination for this app.
  }
}

export type PhoneSetupViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  showBattery: boolean;
  notificationsGranted: boolean;
  microphoneGranted: boolean;
  cameraGranted: boolean;
  batteryGranted: boolean;
  onAllowNotifications: () => void;
  onAllowMicrophone: () => void;
  onAllowCamera: () => void;
  onAllowBattery: () => void;
  onBack: () => void;
  onContinue: () => void;
  onLater: () => void;
};

export function usePhoneSetupController({
  active,
  onBack,
  onContinue,
}: {
  active: boolean;
  onBack: () => void;
  onContinue: () => void;
}): PhoneSetupViewModel {
  const { language, t } = useLocalization();
  const [cameraPermission, requestCamera, refreshCamera] = useCameraPermissions();
  const [microphonePermission, requestMicrophone, refreshMicrophone] =
    useMicrophonePermissions();
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [batteryGranted, setBatteryGranted] = useState(false);
  const showBattery = Platform.OS === 'android';

  const refreshNotifications = useCallback(async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version < 33) {
        setNotificationsGranted(true);
        return;
      }
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      setNotificationsGranted(granted);
      return;
    }

    if (isExpoGo() && Platform.OS !== 'ios') {
      return;
    }

    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    const current = await Notifications.getPermissionsAsync();
    setNotificationsGranted(current.granted);
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }
    void refreshCamera();
    void refreshMicrophone();
    void refreshNotifications();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshCamera();
        void refreshMicrophone();
        void refreshNotifications();
      }
    });
    return () => sub.remove();
  }, [active, refreshCamera, refreshMicrophone, refreshNotifications]);

  const askMedia = (
    granted: boolean,
    canAskAgain: boolean | undefined,
    request: () => Promise<unknown>,
  ) => {
    if (granted) {
      return;
    }
    void (async () => {
      try {
        if (canAskAgain === false) {
          await openAppSettings();
          return;
        }
        await request();
      } catch {
        // Simulator and Expo Go cannot always present the system prompt.
      }
    })();
  };

  return {
    language,
    t,
    showBattery,
    notificationsGranted,
    microphoneGranted: microphonePermission?.granted === true,
    cameraGranted: cameraPermission?.granted === true,
    batteryGranted,
    onAllowNotifications: () => {
      if (notificationsGranted) {
        return;
      }
      void (async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          setNotificationsGranted(result === PermissionsAndroid.RESULTS.GRANTED);
          return;
        }
        if (Platform.OS === 'android') {
          setNotificationsGranted(true);
          return;
        }
        if (isExpoGo() && Platform.OS !== 'ios') {
          return;
        }
        const Notifications =
          require('expo-notifications') as typeof import('expo-notifications');
        const requested = await Notifications.requestPermissionsAsync();
        setNotificationsGranted(requested.granted);
      })().catch(() => undefined);
    },
    onAllowMicrophone: () =>
      askMedia(
        microphonePermission?.granted === true,
        microphonePermission?.canAskAgain,
        requestMicrophone,
      ),
    onAllowCamera: () =>
      askMedia(
        cameraPermission?.granted === true,
        cameraPermission?.canAskAgain,
        requestCamera,
      ),
    onAllowBattery: () => {
      if (Platform.OS !== 'android') {
        return;
      }
      setBatteryGranted(true);
      const openBattery = Linking.sendIntent?.(
        'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
      );
      if (openBattery) {
        void openBattery.catch(() => openAppSettings());
        return;
      }
      void openAppSettings();
    },
    onBack,
    onContinue,
    onLater: onContinue,
  };
}
