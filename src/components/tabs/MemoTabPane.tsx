import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type KeepAliveTabProps = {
  active: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Keep-alive tab host pane.
 * While inactive, skip React re-renders entirely so sibling tab switches
 * do not rebuild hidden trees (HomeView's main jank source).
 */
export const KeepAliveTab = memo(
  function KeepAliveTab({ active, style, children }: KeepAliveTabProps) {
    return (
      <View
        style={[styles.pane, style, active ? null : styles.hidden]}
        pointerEvents={active ? 'auto' : 'none'}
        collapsable={false}
      >
        {children}
      </View>
    );
  },
  (prev, next) => {
    if (!prev.active && !next.active) {
      return true;
    }
    return (
      prev.active === next.active &&
      prev.style === next.style &&
      prev.children === next.children
    );
  },
);

/** @deprecated alias */
export const MemoTabPane = KeepAliveTab;

/** Same inactive-skip rule; used when the child element is built inside the memo boundary. */
export function tabPanePropsEqual<T extends { active: boolean }>(
  prev: T,
  next: T,
): boolean {
  if (!prev.active && !next.active) {
    return true;
  }
  const prevKeys = Object.keys(prev) as (keyof T)[];
  const nextKeys = Object.keys(next) as (keyof T)[];
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  for (const key of prevKeys) {
    if (prev[key] !== next[key]) {
      return false;
    }
  }
  return true;
}

const styles = StyleSheet.create({
  pane: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});
