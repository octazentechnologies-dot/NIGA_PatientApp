import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { radii } from '../../theme/radii';

type SkeletonPulseProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Shared opacity pulse used by Facebook-style skeleton screens. */
export function SkeletonPulse({ children, style }: SkeletonPulseProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

type SkeletonBoneProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBone({
  width = '100%',
  height = 12,
  radius = radii.full,
  style,
}: SkeletonBoneProps) {
  return (
    <View
      style={[
        styles.bone,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: colors.surfaceContainerHigh,
  },
});
