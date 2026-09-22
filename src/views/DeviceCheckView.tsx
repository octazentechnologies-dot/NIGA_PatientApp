import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { DeviceCheckViewModel } from '../controllers/useDeviceCheckController';
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
const PREVIEW_BG = '#F2F2F2';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const SUCCESS_BORDER = '#CDE8DA';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';
const WARN_BORDER = '#F2C14E';

export function DeviceCheckView(vm: DeviceCheckViewModel) {
  const insets = useSafeAreaInsets();
  const isWeak = vm.networkQuality === 'weak';

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
          <View style={styles.headerCopy}>
            <Pressable onLongPress={vm.onToggleDemoWeak} delayLongPress={600}>
              <AppText variant="headlineMd" color={INK} style={styles.title} numberOfLines={2}>
                {vm.t('deviceCheckTitle')}
              </AppText>
            </Pressable>
            <AppText variant="labelSm" color={MUTED} numberOfLines={2}>
              {vm.subtitle}
            </AppText>
          </View>
          {isWeak ? (
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={MUTED} />
            </View>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              layout.buttonHeight * 2 + spacing.xl + sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <CameraPreview vm={vm} />

        {isWeak ? <WeakConnectionCard vm={vm} /> : <GoodChecklistCard vm={vm} />}

        {isWeak ? (
          <View style={styles.warnBanner}>
            <Ionicons name="information-circle" size={20} color={WARN} />
            <AppText variant="bodyMd" color={INK} style={styles.flex}>
              {vm.tipLabel}
            </AppText>
          </View>
        ) : null}

        <View style={styles.modeSection}>
          <AppText variant="titleMd" color={INK}>
            {vm.t('deviceCheckModeTitle')}
          </AppText>

          {isWeak ? (
            <>
              <ModeOption
                selected={vm.consultMode === 'audio'}
                title={vm.t('deviceCheckAudio')}
                subtitle={vm.t('deviceCheckAudioWeakHint')}
                icon="call"
                onPress={() => vm.onSelectMode('audio')}
              />
              <ModeOption
                selected={vm.consultMode === 'video'}
                title={vm.t('deviceCheckVideoAudio')}
                subtitle={vm.t('deviceCheckVideoWeakHint')}
                icon="videocam"
                onPress={() => vm.onSelectMode('video')}
              />
            </>
          ) : (
            <>
              <ModeOption
                selected={vm.consultMode === 'video'}
                title={vm.t('deviceCheckVideo')}
                subtitle={vm.t('deviceCheckVideoGoodHint')}
                onPress={() => vm.onSelectMode('video')}
              />
              <ModeOption
                selected={vm.consultMode === 'audio'}
                title={vm.t('deviceCheckAudio')}
                onPress={() => vm.onSelectMode('audio')}
              />
            </>
          )}
        </View>

        {!isWeak ? (
          <View style={styles.tipStrip}>
            <Ionicons name="bulb" size={20} color={ICON_SOLID} />
            <AppText variant="bodyMd" color={INK} style={styles.flex}>
              {vm.tipLabel}
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton
          label={vm.t('deviceCheckJoinWaiting')}
          onPress={vm.onJoinWaitingRoom}
          icon={
            isWeak ? (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            ) : undefined
          }
          iconPosition="end"
        />
        <AppButton
          label={vm.t('deviceCheckSkip')}
          variant="secondary"
          onPress={vm.onSkipCheck}
        />
      </View>
    </View>
  );
}

function CameraPreview({ vm }: { vm: DeviceCheckViewModel }) {
  if (vm.cameraBlocked) {
    return (
      <View style={styles.preview}>
        <View style={styles.blockedOverlay}>
          <Ionicons name="videocam-off" size={40} color={WARN} />
          <AppText variant="titleMd" color={WARN} style={styles.center}>
            {vm.t('deviceCheckCameraBlocked')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.center}>
            {vm.t('deviceCheckCameraBlockedBody')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenSettings}
            style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
          >
            <AppText variant="bodyLg" color={WARN} weightOverride="600">
              {vm.t('deviceCheckOpenSettings')}
            </AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.preview}>
      <Ionicons name="person" size={96} color={HAIRLINE} />
      <View style={styles.previewControls}>
        <Pressable
          accessibilityRole="button"
          onPress={vm.onToggleCameraFacing}
          style={({ pressed }) => [styles.cameraChip, pressed && styles.pressed]}
        >
          <AppText variant="labelSm" color={INK}>
            {vm.cameraFacing === 'front'
              ? vm.t('deviceCheckFrontCamera')
              : vm.t('deviceCheckBackCamera')}
          </AppText>
          <Ionicons name="chevron-down" size={16} color={INK} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('deviceCheckFlipCamera')}
          onPress={vm.onFlipCamera}
          style={({ pressed }) => [styles.flipBtn, pressed && styles.pressed]}
        >
          <Ionicons name="camera-reverse-outline" size={18} color={INK} />
        </Pressable>
      </View>
    </View>
  );
}

function GoodChecklistCard({ vm }: { vm: DeviceCheckViewModel }) {
  return (
    <View style={styles.card}>
      <CheckRow
        icon="videocam"
        title={vm.t('deviceCheckCamera')}
        subtitle={vm.t('deviceCheckCameraWorking')}
        trailing={<SuccessCheck />}
      />
      <View style={styles.divider} />
      <CheckRow
        icon="mic"
        title={vm.t('deviceCheckMic')}
        subtitle={vm.micLabel}
        trailing={<AudioMeter />}
      />
      <View style={styles.divider} />
      <CheckRow
        icon="volume-high"
        title={vm.t('deviceCheckSpeaker')}
        subtitle={vm.speakerLabel}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('deviceCheckPlayTest')}
            onPress={vm.onPlaySpeakerTest}
            style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
          >
            <Ionicons
              name={vm.speakerTesting ? 'pause' : 'play'}
              size={20}
              color={ACTION}
            />
          </Pressable>
        }
      />
      <View style={styles.divider} />
      <CheckRow
        icon="wifi"
        title={vm.t('deviceCheckInternet')}
        subtitle={vm.networkMbpsLabel}
        trailing={
          <View style={styles.goodPill}>
            <Ionicons name="checkmark" size={14} color={SUCCESS} />
            <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
              {vm.t('deviceCheckGood')}
            </AppText>
          </View>
        }
      />
    </View>
  );
}

function WeakConnectionCard({ vm }: { vm: DeviceCheckViewModel }) {
  return (
    <View style={styles.cardPad}>
      <AppText variant="titleMd" color={INK} style={styles.cardTitle}>
        {vm.t('deviceCheckConnectionStatus')}
      </AppText>
      <View style={styles.weakNetBox}>
        <Ionicons name="wifi" size={22} color={WARN} />
        <View style={styles.flex}>
          <View style={styles.weakTitleRow}>
            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm.t('deviceCheckInternet')}
            </AppText>
            <View style={styles.weakPill}>
              <AppText variant="labelSm" color={WARN} weightOverride="600">
                {vm.t('deviceCheckWeakBadge').replace('{mbps}', vm.mbpsLabel)}
              </AppText>
            </View>
          </View>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.t('deviceCheckWeakRecommend')}
          </AppText>
        </View>
      </View>

      <View style={styles.weakRow}>
        <Ionicons name="mic" size={22} color={INK} />
        <View style={styles.flex}>
          <AppText variant="bodyLg" color={INK}>
            {vm.t('deviceCheckMic')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.micLabel}
          </AppText>
        </View>
        <Ionicons name="checkmark-circle" size={22} color={SUCCESS} />
      </View>

      <View style={[styles.weakRow, styles.weakRowLast]}>
        <Ionicons name="volume-high" size={22} color={INK} />
        <View style={styles.flex}>
          <AppText variant="bodyLg" color={INK}>
            {vm.t('deviceCheckSpeaker')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.speakerLabel}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={vm.onPlaySpeakerTest}
          hitSlop={8}
        >
          <AppText variant="labelSm" color={ACTION} weightOverride="600">
            {vm.t('deviceCheckTest')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function ModeOption({
  selected,
  title,
  subtitle,
  icon,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  icon?: 'call' | 'videocam';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeOption,
        selected && styles.modeOptionSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyLg" color={INK} weightOverride="600">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodyMd" color={MUTED}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {icon ? (
        <Ionicons name={icon} size={20} color={selected ? ICON_SOLID : MUTED} />
      ) : null}
    </Pressable>
  );
}

function CheckRow({
  icon,
  title,
  subtitle,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  trailing: ReactNode;
}) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkLeft}>
        <View style={styles.iconBubble}>
          <Ionicons name={icon} size={20} color={ICON_SOLID} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyLg" color={INK} weightOverride="600">
            {title}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {subtitle}
          </AppText>
        </View>
      </View>
      {trailing}
    </View>
  );
}

function SuccessCheck() {
  return (
    <View style={styles.successCircle}>
      <Ionicons name="checkmark" size={14} color={SUCCESS} />
    </View>
  );
}

function AudioMeter() {
  const bar0 = useRef(new Animated.Value(4)).current;
  const bar1 = useRef(new Animated.Value(12)).current;
  const bar2 = useRef(new Animated.Value(20)).current;
  const bar3 = useRef(new Animated.Value(8)).current;
  const bar4 = useRef(new Animated.Value(4)).current;
  const bars = [bar0, bar1, bar2, bar3, bar4];

  useEffect(() => {
    const bases = [8, 16, 24, 10, 6];
    const loops = bars.map((bar, index) => {
      const base = bases[index] ?? 8;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: base + 6,
            duration: 180 + index * 40,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: Math.max(4, base - 4),
            duration: 180 + index * 40,
            useNativeDriver: false,
          }),
        ]),
      );
    });
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, []);

  return (
    <View style={styles.meter}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[styles.meterBar, { height: bar, opacity: index < 3 ? 1 : 0.35 }]}
        />
      ))}
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
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
    minHeight: 64,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: scaleFont(22),
    lineHeight: scaleFont(28),
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: PREVIEW_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radii.md,
    backgroundColor: PREVIEW_BG,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewControls: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cameraChip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flipBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  settingsBtn: {
    marginTop: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: WARN,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  cardPad: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardTitle: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  checkLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: HAIRLINE,
    marginLeft: 68,
  },
  successCircle: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: SUCCESS_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: SUCCESS_FILL,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
  },
  meter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
  },
  meterBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: ACTION,
  },
  weakNetBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
  },
  weakTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  weakPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  weakRowLast: {
    borderBottomWidth: 0,
  },
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
  },
  tipStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  modeSection: {
    gap: spacing.sm,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    minHeight: 48,
  },
  modeOptionSelected: {
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: ACTION,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: ACTION,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: ACTION,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.sm,
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
