import type { ReactNode } from 'react';
import { Modal, type ModalProps, Platform } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

/**
 * RN Modal hosts content outside the root SafeArea tree on Android.
 * Under edge-to-edge, statusBarTranslucent + navigationBarTranslucent let
 * WindowInsets flow into the modal so sheet footers clear system nav.
 */
export function SafeAreaModal({
  children,
  ...props
}: ModalProps & { children: ReactNode }) {
  return (
    <Modal
      {...props}
      statusBarTranslucent
      {...(Platform.OS === 'android' ? { navigationBarTranslucent: true } : {})}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {children}
      </SafeAreaProvider>
    </Modal>
  );
}
