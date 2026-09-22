import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import type { ConsultNowViewModel } from '../controllers/useConsultNowController';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { ConsultNowOfferSheet } from './ConsultNowOfferSheet';
import { ConsultNowUnavailableView } from './ConsultNowUnavailableView';
import { colors } from '../theme/colors';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const SUCCESS = '#0F7A4E';
const ACTION = '#2A7BA3';
const ICON_BLUE = '#2A7BA3';
const ICON_FILL = '#2E9AD1';
const RING = '#E6F5FE';
const RING_BORDER = '#5CCEF7';
const FILL = '#F2F2F2';
const PENDING = '#8A8A8A';

export function ConsultNowSearchingView(vm: ConsultNowViewModel) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      vm.onCancelSearch();
      return true;
    });
    return () => sub.remove();
  }, [vm.onCancelSearch]);

  if (vm.matchState === 'none') {
    return <ConsultNowUnavailableView {...vm} />;
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingTop: Math.max(insets.top, spacing.lg),
            paddingBottom: spacing.md,
          },
        ]}
      >
        <SearchingPulse />

        <View style={styles.copy}>
          <AppText variant="headlineMd" color="#000000" style={styles.center}>
            {vm.t('searchingTitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.center}>
            {vm.searchSummary}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="titleMd" color="#000000" style={styles.center}>
            {vm.queueLabel}
          </AppText>
          <View style={styles.waitRow}>
            <Ionicons name="time-outline" size={18} color={ICON_FILL} />
            <AppText variant="bodyMd" color={ICON_FILL}>
              {vm.queueWaitLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.steps}>
            <View style={styles.track} />
            <View style={styles.trackActive} />
            <ProgressStep state="done" label={vm.t('searchingStepSent')} />
            <ProgressStep state="active" label={vm.t('searchingStepMatching')} />
            <ProgressStep state="pending" label={vm.t('searchingStepAccepts')} />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.notCharged}>
          <Ionicons name="information-circle-outline" size={14} color={MUTED} />
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('searchingNotCharged')}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('searchingCancel')}
          onPress={vm.onCancelSearch}
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
        >
          <AppText variant="titleMd" color={ACTION}>
            {vm.t('searchingCancel')}
          </AppText>
        </Pressable>
      </View>
      {vm.matchState === 'offer' ? <ConsultNowOfferSheet {...vm} /> : null}
    </View>
  );
}

function SearchingPulse() {
  const outer = useRef(new Animated.Value(0)).current;
  const inner = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.215, 0.61, 0.355, 1),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const first = loop(outer, 0);
    const second = loop(inner, 500);
    first.start();
    second.start();
    return () => {
      first.stop();
      second.stop();
    };
  }, [inner, outer]);

  const ringStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    }),
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 2.5],
        }),
      },
    ],
  });

  return (
    <View style={styles.pulseWrap}>
      <Animated.View style={[styles.ringOuter, ringStyle(outer)]} />
      <Animated.View style={[styles.ringInner, ringStyle(inner)]} />
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="stethoscope" size={36} color={ICON_FILL} />
      </View>
    </View>
  );
}

function ProgressStep({
  state,
  label,
}: {
  state: 'done' | 'active' | 'pending';
  label: string;
}) {
  return (
    <View style={styles.step}>
      <View
        style={[
          styles.dot,
          state === 'done' && styles.dotDone,
          state === 'active' && styles.dotActive,
          state === 'pending' && styles.dotPending,
        ]}
      >
        {state === 'done' ? (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        ) : null}
        {state === 'active' ? <View style={styles.innerDot} /> : null}
      </View>
      <AppText
        variant="labelSm"
        color={
          state === 'done' ? SUCCESS : state === 'active' ? ACTION : PENDING
        }
        weightOverride={state === 'active' ? '600' : '500'}
        style={styles.center}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  pulseWrap: {
    width: 128,
    height: 128,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: radii.full,
    backgroundColor: RING,
    borderWidth: 1,
    borderColor: RING_BORDER,
  },
  ringInner: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: RING,
    borderWidth: 1,
    borderColor: ICON_BLUE,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.sm,
    backgroundColor: RING,
    borderWidth: 2,
    borderColor: ICON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  waitRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: 11,
    left: '16.5%',
    right: '16.5%',
    height: 2,
    backgroundColor: HAIRLINE,
  },
  trackActive: {
    position: 'absolute',
    top: 11,
    left: '16.5%',
    width: '33%',
    height: 2,
    backgroundColor: ICON_BLUE,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  dotDone: {
    backgroundColor: SUCCESS,
  },
  dotActive: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: ICON_BLUE,
  },
  dotPending: {
    backgroundColor: FILL,
    borderWidth: 2,
    borderColor: PENDING,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: ACTION,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.md,
  },
  notCharged: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  cancelBtn: {
    width: '100%',
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
