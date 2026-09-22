import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import type { WaitingRoomViewModel } from '../controllers/useWaitingRoomController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const ICON_SOLID = '#2E9AD1';
const CHIP_FILL = '#E6F5FE';
const FILL = '#FAFAFA';
const PREVIEW_BG = '#F2F2F2';
const SUCCESS = '#0F7A4E';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';
const WARN_BORDER = '#F2C14E';
const DESTRUCTIVE = '#A3231A';
const CONTROL_BORDER = '#8A8A8A';

export function WaitingRoomView(vm: WaitingRoomViewModel) {
  if (vm.variant === 'doctorLate') {
    return <DoctorLateWaitingRoom vm={vm} />;
  }
  return <StandardWaitingRoom vm={vm} />;
}

function StandardWaitingRoom({ vm }: { vm: WaitingRoomViewModel }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
        ]}
      >
        <View style={styles.statusCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="person-outline" size={36} color={INK} />
          </View>

          <Pressable onLongPress={vm.onToggleDemoLate} delayLongPress={600}>
            <AppText variant="headlineMd" color={INK} style={styles.center}>
              {vm.t('waitingRoomTitle')}
            </AppText>
          </Pressable>
          <AppText variant="titleMd" color={INK} style={styles.center}>
            {vm.t('waitingRoomDoctorSoon').replace('{name}', vm.doctorName)}
          </AppText>

          <View style={styles.queueBox}>
            <View style={styles.queueRow}>
              <View style={styles.iconBubble}>
                <Ionicons name="people" size={18} color={ICON_SOLID} />
              </View>
              <AppText variant="bodyLg" color={INK} style={styles.flex}>
                {vm.queuePositionLabel}
              </AppText>
            </View>
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={16} color={MUTED} />
              <AppText variant="bodyMd" color={MUTED}>
                {vm.etaLabel}
              </AppText>
            </View>
            <View style={styles.waitPill}>
              <View style={styles.waitDot} />
              <AppText variant="labelSm" color={WARN} weightOverride="600">
                {vm.waitTimerLabel}
              </AppText>
            </View>
          </View>

          <ProgressStepper
            labels={[
              vm.t('waitingRoomStepJoined'),
              vm.t('waitingRoomStepNotified'),
              vm.t('waitingRoomStepStart'),
            ]}
            completedThrough={1}
          />
        </View>

        <AppText variant="titleMd" color={INK}>
          {vm.t('waitingRoomWhileWait')}
        </AppText>
        <View style={styles.listCard}>
          <WaitAction
            icon="create-outline"
            label={vm.t('waitingRoomReviewQuestions')}
            onPress={vm.onReviewQuestions}
          />
          <View style={styles.listDivider} />
          <WaitAction
            icon="document-text-outline"
            label={vm
              .t('waitingRoomReviewDocs')
              .replace('{count}', String(vm.documentCount))}
            onPress={vm.onReviewDocuments}
          />
          <View style={styles.listDivider} />
          <WaitAction
            icon="book-outline"
            label={vm.t('waitingRoomReadGuide')}
            onPress={vm.onReadGuide}
            last
          />
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={vm.onGetHelp}
          style={({ pressed }) => [styles.helpLink, pressed && styles.pressed]}
        >
          <AppText variant="bodyMd" color={ACTION} style={styles.helpText}>
            {vm.t('waitingRoomHelp')}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onLeave}
          style={({ pressed }) => [styles.leaveBtn, pressed && styles.pressed]}
        >
          <Ionicons name="exit-outline" size={20} color={DESTRUCTIVE} />
          <AppText variant="titleMd" color={DESTRUCTIVE}>
            {vm.t('waitingRoomLeave')}
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function DoctorLateWaitingRoom({ vm }: { vm: WaitingRoomViewModel }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.lateHeader, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('back')}
          onPress={vm.onBack}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color={INK} />
        </Pressable>
        <Pressable
          onLongPress={vm.onToggleDemoLate}
          delayLongPress={600}
          style={styles.flex}
        >
          <AppText
            variant="headlineMd"
            color={INK}
            style={styles.lateTitle}
            numberOfLines={1}
          >
            {vm.t('waitingRoomTeleconsult')}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenSettings}
          style={styles.iconButton}
        >
          <Ionicons name="settings-outline" size={22} color={INK} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.lateBody,
          {
            paddingBottom:
              100 + sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        {vm.weakNetwork ? (
          <View style={styles.weakBanner}>
            <View style={styles.weakCopy}>
              <Ionicons name="warning" size={22} color={WARN} />
              <AppText variant="bodyMd" color={WARN} style={styles.flex} weightOverride="500">
                {vm.t('waitingRoomWeakNet')}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onSwitchToAudio}
              style={({ pressed }) => [styles.switchAudioBtn, pressed && styles.pressed]}
            >
              <AppText variant="labelSm" color="#FFFFFF" weightOverride="600">
                {vm.t('waitingRoomSwitchAudio')}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.doctorCard}>
          <View style={styles.avatar}>
            <AppText variant="titleMd" color={ACTION} languageOverride="en">
              {vm.doctorInitials}
            </AppText>
          </View>
          <AppText variant="titleMd" color={INK}>
            {vm.doctorShortName}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.center}>
            {vm.credentialsLine}
            {' · '}
            {vm.experienceLine}
          </AppText>
          <View style={styles.certifiedPill}>
            <Ionicons name="shield-checkmark" size={16} color={WARN} />
            <AppText variant="labelSm" color={WARN} weightOverride="600">
              {vm.t('waitingRoomCertified')}
            </AppText>
          </View>
        </View>

        <View style={styles.lateStatus}>
          <View style={styles.lateClock}>
            <Ionicons name="time" size={32} color={WARN} />
          </View>
          <View style={styles.lateBanner}>
            <AppText variant="bodyMd" color={INK} weightOverride="600" style={styles.center}>
              {vm.lateMinutesLabel}
            </AppText>
          </View>
          <AppText variant="bodyMd" color={MUTED} style={styles.center}>
            {vm.t('waitingRoomLatePleaseWait')}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onReschedule}
          style={({ pressed }) => [styles.rescheduleBtn, pressed && styles.pressed]}
        >
          <AppText variant="bodyLg" color={ACTION} weightOverride="600">
            {vm.t('waitingRoomChangeTime')}
          </AppText>
        </Pressable>
      </ScrollView>

      <View
        style={[
          styles.callBar,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <CallControl
          icon={vm.muted ? 'mic-off' : 'mic'}
          onPress={vm.onToggleMute}
          label={vm.t('waitingRoomMute')}
        />
        <CallControl
          icon={vm.cameraOff ? 'videocam-off' : 'videocam'}
          onPress={vm.onToggleCamera}
          label={vm.t('waitingRoomCamera')}
          disabled={vm.consultMode === 'audio'}
        />
        <CallControl
          icon="chatbubble"
          onPress={vm.onOpenChat}
          label={vm.t('waitingRoomChat')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('waitingRoomEndCall')}
          onPress={vm.onEndCall}
          style={({ pressed }) => [styles.endCall, pressed && styles.pressed]}
        >
          <Ionicons name="call" size={22} color="#FFFFFF" style={styles.endCallIcon} />
        </Pressable>
      </View>
    </View>
  );
}

function ProgressStepper({
  labels,
  completedThrough,
}: {
  labels: [string, string, string];
  completedThrough: number;
}) {
  const progress = completedThrough <= 0 ? 0 : completedThrough >= 2 ? 1 : 0.5;

  return (
    <View style={styles.stepper}>
      <View style={styles.stepTrack}>
        <View style={[styles.stepTrackFill, { width: `${progress * 100}%` }]} />
      </View>
      {labels.map((label, index) => {
        const done = index <= completedThrough;
        return (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepDot, done ? styles.stepDotDone : styles.stepDotPending]}>
              {done ? (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              ) : (
                <View style={styles.stepDotInner} />
              )}
            </View>
            <AppText
              variant="labelSm"
              color={done ? INK : MUTED}
              style={styles.stepLabel}
            >
              {label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

function WaitAction({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.waitAction,
        last && styles.waitActionLast,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconBubble}>
        <Ionicons name={icon} size={20} color={ICON_SOLID} />
      </View>
      <AppText variant="bodyLg" color={INK} style={styles.flex}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={MUTED} />
    </Pressable>
  );
}

function CallControl({
  icon,
  onPress,
  label,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.callControl,
        disabled && styles.callControlDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={22} color={disabled ? MUTED : INK} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  body: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: PREVIEW_BG,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBox: {
    alignSelf: 'stretch',
    backgroundColor: FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    marginTop: spacing.xs,
  },
  waitDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: WARN,
  },
  stepper: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    position: 'relative',
    gap: spacing.xs,
  },
  stepTrack: {
    position: 'absolute',
    left: '16%',
    right: '16%',
    top: spacing.md + 11,
    height: 2,
    backgroundColor: HAIRLINE,
  },
  stepTrackFill: {
    height: 2,
    backgroundColor: ACTION,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  stepDotDone: {
    backgroundColor: SUCCESS,
  },
  stepDotPending: {
    backgroundColor: PREVIEW_BG,
    borderWidth: 1,
    borderColor: CONTROL_BORDER,
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: CONTROL_BORDER,
  },
  stepLabel: {
    textAlign: 'center',
    lineHeight: scaleFont(16),
  },
  listCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  waitAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 48,
  },
  waitActionLast: {},
  listDivider: {
    height: 1,
    backgroundColor: HAIRLINE,
    marginLeft: 68,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  helpText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  leaveBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: DESTRUCTIVE,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  lateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    paddingHorizontal: spacing.sm,
    minHeight: 56,
  },
  lateTitle: {
    textAlign: 'center',
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lateBody: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  weakBanner: {
    alignSelf: 'stretch',
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  weakCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  switchAudioBtn: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
    backgroundColor: WARN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  certifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    marginTop: spacing.xs,
  },
  lateStatus: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 320,
  },
  lateClock: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lateBanner: {
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rescheduleBtn: {
    alignSelf: 'stretch',
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  callControl: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callControlDisabled: {
    opacity: 0.45,
  },
  endCall: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: DESTRUCTIVE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallIcon: {
    transform: [{ rotate: '135deg' }],
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
