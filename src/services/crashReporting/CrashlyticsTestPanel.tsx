import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  crashlyticsTestEnabled,
  recordTestNonFatal,
  triggerTestNativeCrash,
} from './crashReporting';

/**
 * Shown only when EXPO_PUBLIC_CRASHLYTICS_TEST=1.
 * That flag is not set for preview or production, so users never see this.
 */
export function CrashlyticsTestPanel() {
  if (!crashlyticsTestEnabled()) {
    return null;
  }
  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Pressable style={styles.button} onPress={recordTestNonFatal}>
        <Text style={styles.label}>Test non-fatal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={triggerTestNativeCrash}>
        <Text style={styles.label}>Test native crash</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 12,
    bottom: 96,
    gap: 8,
  },
  button: {
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
