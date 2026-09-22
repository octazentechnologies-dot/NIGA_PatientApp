import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Which safe-area edges to pad. Default all four. */
  edges?: Edge[];
  backgroundColor?: string;
};

/**
 * Shared screen shell. All system-bar spacing comes from useSafeAreaInsets.
 * Tab-hosted screens should pass edges={['top','left','right']} — the custom
 * tab bar consumes the bottom inset.
 */
export function Screen({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = colors.page,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        { flex: 1, backgroundColor },
        edges.includes('top') && { paddingTop: insets.top },
        edges.includes('bottom') && { paddingBottom: insets.bottom },
        edges.includes('left') && { paddingLeft: insets.left },
        edges.includes('right') && { paddingRight: insets.right },
        style,
      ]}
    >
      {children}
    </View>
  );
}
