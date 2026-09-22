import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { JoinFailedViewModel } from '../controllers/useJoinFailedController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const WARN_AMBER = '#E08A2E';
const ERROR = '#A3231A';
const SUCCESS = '#0F7A4E';

export function JoinFailedView(vm: JoinFailedViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle} numberOfLines={1}>
            {vm.t('joinFailedBrand')}
          </AppText>
          <View style={styles.iconButton} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom: sheetBottomPadding(insets, spacing.lg),
          },
        ]}
      >
        <View style={styles.hero}>
          <ConnectionFailedIllustration />
          <AppText variant="labelSm" color={MUTED} style={styles.heroCaption}>
            {vm.t('joinFailedCaption')}
          </AppText>
        </View>

        <View style={styles.copyBlock}>
          <AppText variant="titleMd" color={INK} style={styles.copyTitle}>
            {vm.t('joinFailedTitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.copyBody}>
            {vm.t('joinFailedBody')}
          </AppText>
        </View>

        <View style={styles.diagnosticsCard}>
          <AppText variant="labelSm" color={MUTED} style={styles.diagnosticsTitle}>
            {vm.t('joinFailedDiagnostics')}
          </AppText>

          <DiagnosticRow
            icon={
              <Ionicons
                name={vm.internetWeak ? 'wifi-outline' : 'wifi'}
                size={22}
                color={vm.internetWeak ? ERROR : ACTION}
              />
            }
            label={vm.t('joinFailedInternet')}
            status={
              <AppText
                variant="labelMd"
                color={vm.internetWeak ? ERROR : SUCCESS}
                style={styles.statusWeight}
              >
                {vm.internetStatusLabel}
              </AppText>
            }
            showSlash={vm.internetWeak}
          />

          <View style={styles.diagDivider} />

          <DiagnosticRow
            icon={<Ionicons name="videocam" size={22} color={ACTION} />}
            label={vm.t('joinFailedCamera')}
            status={<OkStatus label={vm.t('joinFailedStatusOk')} />}
          />

          <View style={styles.diagDivider} />

          <DiagnosticRow
            icon={<Ionicons name="mic" size={22} color={ACTION} />}
            label={vm.t('joinFailedMic')}
            status={<OkStatus label={vm.t('joinFailedStatusOk')} />}
          />
        </View>

        <View style={styles.actions}>
          <AppButton
            label={vm.t('joinFailedTryAgain')}
            loading={vm.joining}
            onPress={vm.onTryAgain}
            icon={
              vm.joining ? undefined : (
                <Ionicons name="refresh" size={20} color={colors.onButton} />
              )
            }
          />
          <AppButton
            label={vm.t('joinFailedJoinAudio')}
            variant="secondary"
            disabled={vm.joining}
            onPress={vm.onJoinAudio}
            icon={<Ionicons name="call-outline" size={20} color={ACTION_OUTLINE} />}
          />
          <AppButton
            label={vm.t('joinFailedAskDoctor')}
            variant="secondary"
            disabled={vm.joining}
            onPress={vm.onAskDoctorCall}
            icon={<Ionicons name="phone-portrait-outline" size={20} color={ACTION_OUTLINE} />}
          />
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={vm.onGetHelp}
          style={styles.helpLink}
        >
          <AppText variant="labelMd" color={ACTION} style={styles.helpText}>
            {vm.t('joinFailedGetHelp')}
          </AppText>
        </Pressable>

        <AppText variant="labelSm" color={MUTED} style={styles.bookingId}>
          {vm.bookingIdLabel}
        </AppText>
      </ScrollView>
    </View>
  );
}

function OkStatus({ label }: { label: string }) {
  return (
    <View style={styles.okRow}>
      <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
      <AppText variant="labelMd" color={SUCCESS} style={styles.statusWeight}>
        {label}
      </AppText>
    </View>
  );
}

function DiagnosticRow({
  icon,
  label,
  status,
  showSlash = false,
}: {
  icon: ReactNode;
  label: string;
  status: ReactNode;
  showSlash?: boolean;
}) {
  return (
    <View style={styles.diagRow}>
      <View style={styles.diagIconWrap}>
        {icon}
        {showSlash ? <View style={styles.slash} /> : null}
      </View>
      <AppText variant="bodyMd" color={INK} style={styles.diagLabel} numberOfLines={2}>
        {label}
      </AppText>
      <View style={styles.diagStatus}>{status}</View>
    </View>
  );
}

function ConnectionFailedIllustration() {
  return (
    <View style={styles.illustration} accessibilityLabel="Connection failed">
      <Ionicons name="warning" size={92} color={WARN_AMBER} />
      <View style={styles.plugBadge}>
        <Ionicons name="flash-off" size={18} color={colors.card} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroCaption: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  illustration: {
    width: 120,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plugBadge: {
    position: 'absolute',
    bottom: 18,
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: WARN_AMBER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  copyTitle: {
    textAlign: 'center',
  },
  copyBody: {
    textAlign: 'center',
  },
  diagnosticsCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  diagnosticsTitle: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    gap: spacing.sm,
  },
  diagIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slash: {
    position: 'absolute',
    width: 22,
    height: 2,
    backgroundColor: ERROR,
    transform: [{ rotate: '-45deg' }],
  },
  diagLabel: {
    flex: 1,
  },
  diagStatus: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  diagDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HAIRLINE,
  },
  okRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusWeight: {
    fontWeight: '700',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  helpLink: {
    alignSelf: 'center',
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  helpText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  bookingId: {
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
});
