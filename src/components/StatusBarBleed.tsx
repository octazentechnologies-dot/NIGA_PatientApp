import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Paints the status-bar strip under edge-to-edge (system bar is translucent).
 * Does not affect layout — headers / Screen still apply their own top inset.
 */
export function StatusBarBleed({ color }: { color: string }) {
  const insets = useSafeAreaInsets();
  if (insets.top <= 0) {
    return null;
  }
  return (
    <View
      pointerEvents="none"
      style={[styles.bleed, { height: insets.top, backgroundColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  bleed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});
