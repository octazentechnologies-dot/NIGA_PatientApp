import { useEffect, useRef, type PropsWithChildren } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { images } from '../config/images';
import type { SplashViewModel } from '../controllers/useSplashController';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { moderateScale } from '../utilities/scale';

type FadeInProps = PropsWithChildren<{
  delayMs: number;
  style?: object;
}>;

function FadeInUp({ delayMs, style, children }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        delay: delayMs,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        delay: delayMs,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delayMs, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

function Pulsing({ children }: PropsWithChildren) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export function SplashView({
  brandName,
  tagline,
  loadingEnglish,
  loadingMarathi,
}: SplashViewModel) {
  const insets = useSafeAreaInsets();
  const wash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(wash, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wash, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    drift.start();
    return () => drift.stop();
  }, [wash]);

  const washOpacity = wash.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.2],
  });

  return (
    <View style={styles.root}>
      <Animated.View
        pointerEvents="none"
        style={[styles.wash, { opacity: washOpacity }]}
      />

      <View style={styles.center}>
        <FadeInUp delayMs={0}>
          <Image
            source={images.favicon}
            accessibilityRole="image"
            accessibilityLabel={brandName}
            resizeMode="contain"
            style={styles.mark}
          />
        </FadeInUp>
        <FadeInUp delayMs={100} style={styles.brandWrap}>
          <AppText variant="headlineLg" color="#000000" style={styles.brand}>
            {brandName}
          </AppText>
        </FadeInUp>
        <FadeInUp delayMs={200}>
          <AppText variant="titleMd" color="#000000" style={styles.tagline}>
            {tagline}
          </AppText>
        </FadeInUp>
      </View>

      <FadeInUp
        delayMs={500}
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md }]}
      >
        <Pulsing>
          <AppText
            variant="labelSm"
            color="#000000"
            languageOverride="en"
            style={styles.loadingEn}
          >
            {loadingEnglish}
          </AppText>
          <AppText
            variant="labelSm"
            color="#000000"
            languageOverride="mr"
            style={styles.loadingMr}
          >
            {loadingMarathi}
          </AppText>
        </Pulsing>
      </FadeInUp>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryFixed,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  mark: {
    width: moderateScale(120),
    height: moderateScale(120),
    tintColor: '#000000',
  },
  brandWrap: {
    marginTop: spacing.lg + spacing.sm,
    marginBottom: spacing.sm,
  },
  brand: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
  },
  loadingEn: {
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  loadingMr: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
