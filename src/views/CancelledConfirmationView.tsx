import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import type { AppointmentDetailViewModel } from '../controllers/useAppointmentDetailController';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { colors } from '../theme/colors';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ERROR = '#A3231A';
const ERROR_FILL = '#FBEBE9';
const SUCCESS = '#0F7A4E';
const ACTION = '#2A7BA3';
const AMBER = '#8A5109';
const AMBER_FILL = '#FCF3E4';
const ICON_BLUE = '#2A7BA3';
const FILL = '#F2F2F2';

export function CancelledConfirmationView(vm: AppointmentDetailViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('back')}
          onPress={vm.onCloseCancelled}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={24} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 28 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.hero}>
          <View style={styles.errorMark}>
            <Ionicons name="close" size={28} color={ERROR} />
          </View>
          <AppText variant="headlineMd" color="#000000" style={styles.center}>
            {vm.t('cancelledTitle')}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <AppText variant="titleMd" color={ICON_BLUE} languageOverride="en">
                {vm.doctorInitials}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="titleMd" color="#000000">
                {vm.doctorName}
              </AppText>
              <View style={styles.whenRow}>
                <Ionicons name="calendar-outline" size={14} color={MUTED} />
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.cancelledWhenLabel}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.timeline}>
            <View style={styles.line} />
            <TimelineStep
              state="done"
              title={vm.t('cancelledRefundInitiated')}
              subtitle={vm.refundInitiatedLabel}
            />
            <TimelineStep
              state="active"
              title={vm.t('cancelledBankProcessed')}
              badge={vm.t('cancelledInProgress')}
            />
            <TimelineStep
              state="pending"
              title={vm.t('cancelledCredited')}
              subtitle={vm.refundExpectedLabel}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onBookAnother}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
        >
          <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
            {vm.t('cancelledBookAnother')}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={vm.onViewRefund}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
        >
          <AppText variant="bodyLg" color={ACTION} weightOverride="600">
            {vm.t('cancelledViewRefund')}
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function TimelineStep({
  state,
  title,
  subtitle,
  badge,
}: {
  state: 'done' | 'active' | 'pending';
  title: string;
  subtitle?: string;
  badge?: string;
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
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        ) : state === 'active' ? (
          <View style={styles.innerDot} />
        ) : null}
      </View>
      <View style={styles.flex}>
        <AppText
          variant="bodyMd"
          color={state === 'pending' ? MUTED : '#000000'}
          weightOverride="600"
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="labelSm" color={MUTED}>
            {subtitle}
          </AppText>
        ) : null}
        {badge ? (
          <View style={styles.badge}>
            <AppText variant="labelSm" color={AMBER} weightOverride="600">
              {badge}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  topBar: {
    backgroundColor: colors.card,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  errorMark: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: ERROR_FILL,
    borderWidth: 1,
    borderColor: ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: HAIRLINE,
  },
  timeline: {
    gap: 20,
    paddingLeft: 2,
  },
  line: {
    position: 'absolute',
    left: 11,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: ICON_BLUE,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotDone: {
    backgroundColor: SUCCESS,
  },
  dotActive: {
    backgroundColor: AMBER_FILL,
    borderWidth: 1.5,
    borderColor: AMBER,
  },
  dotPending: {
    backgroundColor: FILL,
    borderWidth: 1.5,
    borderColor: '#8A8A8A',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: AMBER,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: AMBER_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  primaryBtn: {
    width: '100%',
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    width: '100%',
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
