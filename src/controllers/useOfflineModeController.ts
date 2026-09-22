import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type OfflineAvailableId = 'prescriptions' | 'appointments' | 'emergency';

export type OfflineModeViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  isOffline: boolean;
  checking: boolean;
  onTryAgain: () => void;
  onCallHelpline: () => void;
  onOpenAvailable: (id: OfflineAvailableId) => void;
};

function isReallyOffline(state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}): boolean {
  if (state.isConnected === false) {
    return true;
  }
  if (state.isInternetReachable === false) {
    return true;
  }
  return false;
}

export function useOfflineModeController({
  onOpenPrescriptions,
  onOpenAppointments,
  onOpenEmergencyInfo,
}: {
  onOpenPrescriptions?: () => void;
  onOpenAppointments?: () => void;
  onOpenEmergencyInfo?: () => void;
} = {}): OfflineModeViewModel {
  const { language, t } = useLocalization();
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(isReallyOffline(state));
    });

    void NetInfo.fetch().then((state) => {
      setIsOffline(isReallyOffline(state));
    });

    return unsubscribe;
  }, []);

  const onTryAgain = useCallback(() => {
    setChecking(true);
    void NetInfo.fetch()
      .then((state) => {
        setIsOffline(isReallyOffline(state));
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  return {
    language,
    t,
    isOffline,
    checking,
    onTryAgain,
    onCallHelpline: () => {
      void Linking.openURL('tel:18001234567');
    },
    onOpenAvailable: (id) => {
      if (id === 'prescriptions') {
        onOpenPrescriptions?.();
      } else if (id === 'appointments') {
        onOpenAppointments?.();
      } else {
        onOpenEmergencyInfo?.();
      }
    },
  };
}
