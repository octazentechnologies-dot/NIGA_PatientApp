import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useOfflineModeController } from '../controllers/useOfflineModeController';
import { OfflineModeView } from '../views/OfflineModeView';

/** Full-screen offline gate that covers the whole app when connectivity drops. */
export function OfflineModeGate({ children }: { children: ReactNode }) {
  const offline = useOfflineModeController();

  return (
    <View style={styles.root}>
      {children}
      {offline.isOffline ? <OfflineModeView {...offline} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
