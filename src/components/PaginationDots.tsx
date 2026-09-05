import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';

type PaginationDotsProps = {
  count: number;
  activeIndex: number;
};

export function PaginationDots({ count, activeIndex }: PaginationDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.dotActive : styles.dotIdle,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: radii.full,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.button,
  },
  dotIdle: {
    width: 8,
    backgroundColor: colors.surfaceVariant,
  },
});
