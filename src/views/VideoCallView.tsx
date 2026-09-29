import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding, systemBottomInset } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { images } from '../config/images';
import type { VideoCallViewModel } from '../controllers/useVideoCallController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';

const CALL_SURFACE = '#101816';
const CALL_BLACK = '#121212';
const CALL_OVERLAY = 'rgba(26, 26, 26, 0.92)';
const CALL_BORDER = '#2E2E2E';
const CALL_ICON = '#5CCEF7';
const ACTIVE_FILL = colors.primary;
const END_CALL = '#A3231A';
const END_SOFT = '#E07070';
const WHITE = '#FFFFFF';
const MUTED = '#B0B0B0';
const SHEET_MUTED = '#595959';
const INK = '#1F1F1F';
const SCRIM = 'rgba(15, 15, 15, 0.45)';
const AMBER = '#C9A227';
const AMBER_BORDER = '#F2C14E';
const NOTICE_FILL = '#FCF3E4';
const NOTICE_BORDER = '#F2C14E';
const SUCCESS_DOT = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const DOT_GRID = '#2A2A2A';
const REC_FILL = '#A3231A';
const HAIRLINE = '#E6E6E6';
const ERROR_FILL = '#FBEBE9';

export function VideoCallView(vm: VideoCallViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {vm.audioOnly ? <AudioOnlyStage vm={vm} insetsTop={insets.top} /> : <VideoStage vm={vm} />}

      {!vm.audioOnly ? (
        <>
          <View style={[styles.topScrim, { height: 96 + insets.top }]} />
          <View style={[styles.bottomScrim, { height: 160 + insets.bottom }]} />
        </>
      ) : null}

      {vm.audioOnly ? (
        <AudioOnlyHeader vm={vm} topInset={insets.top} />
      ) : (
        <VideoTopBar vm={vm} topInset={insets.top} />
      )}

      {!vm.audioOnly ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('videoCallFlipCamera')}
          onPress={vm.onFlipCamera}
          style={[
            styles.pip,
            { top: Math.max(insets.top, spacing.sm) + 72 },
          ]}
        >
          {vm.cameraOn ? (
            <View style={styles.pipPlaceholder}>
              <AppText variant="titleMd" color={CALL_ICON}>
                {vm.t('videoCallYou')}
              </AppText>
            </View>
          ) : (
            <View style={[styles.pipPlaceholder, styles.pipCameraOff]}>
              <Ionicons name="videocam-off" size={28} color={CALL_ICON} />
            </View>
          )}
          <View style={styles.pipFlipHint}>
            <Ionicons name="camera-reverse-outline" size={18} color={CALL_ICON} />
          </View>
        </Pressable>
      ) : null}

      {vm.toastVisible && vm.connectionOverlay === 'none' ? (
        <View
          style={[
            styles.toast,
            { bottom: 112 + sheetBottomPadding(insets, spacing.md) },
          ]}
        >
          <Ionicons name="desktop-outline" size={16} color={CALL_ICON} />
          <AppText variant="bodyMd" color={WHITE} style={styles.toastText}>
            {vm.toastMessage}
          </AppText>
        </View>
      ) : null}

      {vm.recordingActive ? (
        <View
          style={[
            styles.recordingPill,
            {
              top: Math.max(insets.top, spacing.sm) + (vm.audioOnly ? 56 : 64),
            },
          ]}
        >
          <View style={styles.recordingDot} />
          <AppText variant="labelMd" color={WHITE} weightOverride="600">
            {vm.t('recordActiveLabel')}
          </AppText>
          <AppText variant="labelSm" color={WHITE}>
            {vm.recordingElapsedLabel}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('recordStop')}
            onPress={vm.onStopRecording}
            style={styles.recordingStop}
          >
            <AppText variant="labelMd" color={WHITE} weightOverride="600">
              {vm.t('recordStop')}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      <View
        style={[
          styles.controlsWrap,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.controlsBar}>
          <ControlButton
            active={vm.micOn}
            icon={vm.micOn ? 'mic' : 'mic-off'}
            label={vm.micOn ? vm.t('videoCallMute') : vm.t('videoCallUnmute')}
            onPress={vm.onToggleMic}
          />
          {vm.audioOnly ? (
            <ControlButton
              icon="videocam-off"
              label={vm.t('videoCallCameraOff')}
              onPress={() => undefined}
              disabled
              errorBadge
            />
          ) : (
            <ControlButton
              active={vm.cameraOn}
              icon={vm.cameraOn ? 'videocam' : 'videocam-off'}
              label={
                vm.cameraOn ? vm.t('videoCallCameraOff') : vm.t('videoCallCameraOn')
              }
              onPress={vm.onToggleCamera}
            />
          )}
          {!vm.audioOnly ? (
            <ControlButton
              active={false}
              icon="headset"
              label={vm.t('videoCallSwitchAudio')}
              onPress={vm.onSwitchAudioOnly}
            />
          ) : null}
          <ControlButton
            icon="chatbubble-outline"
            label={vm.t('videoCallChat')}
            onPress={vm.onOpenChat}
            badge={vm.chatUnread > 0 ? String(vm.chatUnread) : undefined}
            badgeTone={vm.audioOnly ? 'amber' : 'primary'}
          />
          {!vm.audioOnly ? (
            <ControlButton
              icon="attach"
              label={vm.t('videoCallAttach')}
              onPress={vm.onAttach}
            />
          ) : null}
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('videoCallEnd')}
            onPress={vm.onEndCall}
            style={({ pressed }) => [styles.endCall, pressed && styles.pressed]}
          >
            <Ionicons name="call" size={22} color={WHITE} style={styles.endIcon} />
          </Pressable>
        </View>
      </View>

      {vm.connectionOverlay === 'reconnecting' ? (
        <ReconnectingOverlay vm={vm} bottomInset={systemBottomInset(insets)} />
      ) : null}
      {vm.connectionOverlay === 'doctorDisconnected' ? (
        <DoctorDisconnectedOverlay vm={vm} bottomInset={systemBottomInset(insets)} />
      ) : null}
      {vm.recordingConsentOpen ? (
        <RecordingConsentSheet vm={vm} bottomInset={systemBottomInset(insets)} />
      ) : null}
      {vm.chatOpen ? <InCallChatSheet vm={vm} /> : null}
    </View>
  );
}

function InCallChatSheet({ vm }: { vm: VideoCallViewModel }) {
  const insets = useSafeAreaInsets();
  const inputFont = fontFamilyFor('400', vm.language, 'sans');

  return (
    <View style={styles.chatRoot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vm.t('close')}
        onPress={vm.onCloseChat}
        style={styles.consentScrim}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatSheet}
      >
        <View style={styles.consentHandle} />
        <View style={styles.chatHeader}>
          <Image source={images.doctorPortrait} style={styles.chatAvatar} />
          <View style={styles.flex}>
            <AppText variant="titleMd" color={INK} numberOfLines={1}>
              {vm.doctorName}
            </AppText>
            <AppText variant="labelSm" color={SHEET_MUTED} numberOfLines={1}>
              {vm.t('videoCallChat')}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('close')}
            onPress={vm.onCloseChat}
            style={styles.chatClose}
          >
            <Ionicons name="close" size={22} color={INK} />
          </Pressable>
        </View>
        <ScrollView
          style={styles.chatThread}
          contentContainerStyle={styles.chatThreadContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {vm.chatMessages.map((message) => {
            const mine = message.from === 'patient';
            return (
              <View
                key={message.id}
                style={[styles.chatBubbleWrap, mine ? styles.chatMine : styles.chatTheirs]}
              >
                <View style={[styles.chatBubble, mine ? styles.chatBubbleMine : styles.chatBubbleTheirs]}>
                  <AppText variant="bodyMd" color={mine ? colors.onButton : INK}>
                    {message.body}
                  </AppText>
                  <AppText
                    variant="labelSm"
                    color={mine ? 'rgba(255,255,255,0.85)' : SHEET_MUTED}
                  >
                    {message.timeLabel}
                  </AppText>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View
          style={[
            styles.chatComposer,
            { paddingBottom: sheetBottomPadding(insets, spacing.sm) },
          ]}
        >
          <View style={styles.chatInputWrap}>
            <TextInput
              value={vm.chatDraft}
              onChangeText={vm.onChangeChatDraft}
              placeholder={vm.t('chatPlaceholder')}
              placeholderTextColor={SHEET_MUTED}
              style={[styles.chatInput, { fontFamily: inputFont }]}
              multiline
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('chatSend')}
            onPress={vm.onSendChat}
            disabled={!vm.canSendChat}
            style={[styles.chatSend, !vm.canSendChat && styles.chatSendOff]}
          >
            <Ionicons name="send" size={20} color={colors.onButton} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function VideoStage({ vm }: { vm: VideoCallViewModel }) {
  return (
    <>
      <Image
        source={images.doctorPortrait}
        resizeMode="cover"
        style={styles.remoteFeed}
        accessibilityLabel={vm.doctorName}
      />
      <View style={styles.feedDim} />
    </>
  );
}

function AudioOnlyStage({
  vm,
  insetsTop,
}: {
  vm: VideoCallViewModel;
  insetsTop: number;
}) {
  return (
    <View style={styles.audioOnlyStage}>
      <View
        style={[
          styles.audioBanner,
          { marginTop: Math.max(insetsTop, spacing.sm) + 64 },
        ]}
      >
        <Ionicons name="videocam-off" size={22} color={AMBER} />
        <View style={styles.audioBannerCopy}>
          <AppText variant="labelMd" color={AMBER} weightOverride="600">
            {vm.t('videoCallPausedTitle')}
          </AppText>
          <AppText variant="bodyMd" color={WHITE}>
            {vm.t('videoCallPausedBody')}
          </AppText>
          <Pressable onPress={vm.onTryVideoAgain} accessibilityRole="link">
            <AppText variant="labelMd" color={AMBER} style={styles.tryVideoLink}>
              {vm.t('videoCallTryVideoAgain')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.audioCenter}>
        <Image
          source={images.doctorPortrait}
          resizeMode="cover"
          style={styles.audioPortrait}
        />
        <View style={styles.audioStatusCard}>
          <AppText variant="titleMd" color={WHITE} style={styles.centerText}>
            {vm.doctorName}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.centerText}>
            {vm.speaking ? vm.t('videoCallSpeaking') : vm.t('videoCallAudioOnlyMode')}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function AudioOnlyHeader({
  vm,
  topInset,
}: {
  vm: VideoCallViewModel;
  topInset: number;
}) {
  return (
    <View style={[styles.audioHeader, { paddingTop: Math.max(topInset, spacing.sm) }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vm.t('back')}
        onPress={vm.onBack}
        style={styles.iconHit}
      >
        <Ionicons name="arrow-back" size={24} color={WHITE} />
      </Pressable>
      <Pressable
        style={styles.audioHeaderCopy}
        onLongPress={vm.onSimulateRecordingRequest}
        delayLongPress={600}
      >
        <AppText variant="labelMd" color={WHITE} weightOverride="600" numberOfLines={1}>
          {vm.doctorName}
        </AppText>
        <View style={styles.timerRow}>
          <View style={[styles.liveDot, styles.liveDotGreen]} />
          <AppText variant="labelSm" color={WHITE} weightOverride="600">
            {vm.durationLabel}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        style={styles.iconHit}
        accessibilityRole="button"
        onLongPress={vm.onSimulateRecordingRequest}
        delayLongPress={600}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={WHITE} />
      </Pressable>
    </View>
  );
}

function VideoTopBar({
  vm,
  topInset,
}: {
  vm: VideoCallViewModel;
  topInset: number;
}) {
  return (
    <View
      style={[
        styles.topBar,
        { paddingTop: Math.max(topInset, spacing.sm) + spacing.sm },
      ]}
    >
      <Pressable
        style={styles.doctorChip}
        onLongPress={vm.onSimulateRecordingRequest}
        delayLongPress={600}
      >
        <Image
          source={images.doctorPortrait}
          resizeMode="cover"
          style={styles.avatar}
        />
        <View style={styles.doctorCopy}>
          <View style={styles.nameRow}>
            <AppText
              variant="labelMd"
              color={WHITE}
              weightOverride="600"
              numberOfLines={1}
              style={styles.doctorName}
            >
              {vm.doctorName}
            </AppText>
            <Ionicons name="checkmark-circle" size={14} color={WHITE} />
          </View>
          <View style={styles.timerRow}>
            <View style={styles.liveDot} />
            <AppText variant="labelSm" color={WHITE} weightOverride="600">
              {vm.durationLabel}
            </AppText>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vm.t('videoCallConnection')}
        onPress={vm.onSimulatePatientDisconnect}
        onLongPress={vm.onSimulateDoctorDisconnect}
        delayLongPress={600}
        style={styles.signalButton}
      >
        <Ionicons name="cellular" size={20} color={CALL_ICON} />
      </Pressable>
    </View>
  );
}

function RecordingConsentSheet({
  vm,
  bottomInset,
}: {
  vm: VideoCallViewModel;
  bottomInset: number;
}) {
  const title = vm
    .t('recordConsentTitle')
    .replace('{name}', `Dr. ${vm.doctorShortName}`);
  const benefit2 = vm
    .t('recordConsentBenefit2')
    .replace('{name}', `Dr. ${vm.doctorShortName}`);
  const allowDisabled = !vm.recordingConsentChecked;

  return (
    <View style={styles.consentRoot} pointerEvents="auto">
      <Pressable style={styles.consentScrim} onPress={vm.onDeclineRecording} />
      <View
        style={[
          styles.consentSheet,
          { paddingBottom: Math.max(bottomInset, 0) + spacing.lg },
        ]}
      >
        <View style={styles.consentHandle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.consentBody}
        >
          <View style={styles.consentHeader}>
            <View style={styles.consentIconBox}>
              <Ionicons name="radio-button-on" size={26} color={REC_FILL} />
            </View>
            <AppText variant="titleMd" color={INK} style={styles.flex}>
              {title}
            </AppText>
          </View>

          <View style={styles.consentCard}>
            <ConsentBullet text={vm.t('recordConsentBenefit1')} />
            <ConsentBullet text={benefit2} />
            <ConsentBullet text={vm.t('recordConsentBenefit3')} />
          </View>

          <View style={styles.consentInfo}>
            <Ionicons name="information-circle" size={20} color={SUCCESS_DOT} />
            <AppText variant="bodyMd" color={INK} style={styles.flex}>
              {vm.t('recordConsentCanSayNo')}
            </AppText>
          </View>

          <View style={styles.consentCard}>
            <AppText variant="labelSm" color={SHEET_MUTED} style={styles.whatTitle}>
              {vm.t('recordConsentWhatTitle')}
            </AppText>
            <View style={styles.whatRow}>
              <Ionicons name="videocam-outline" size={18} color={INK} />
              <AppText variant="bodyMd" color={INK} style={styles.flex}>
                {vm.t('recordConsentWhatYes')}
              </AppText>
            </View>
            <View style={styles.whatRow}>
              <Ionicons name="ban-outline" size={18} color={SHEET_MUTED} />
              <AppText variant="bodyMd" color={SHEET_MUTED} style={styles.flex}>
                {vm.t('recordConsentWhatNo')}
              </AppText>
            </View>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: vm.recordingConsentChecked }}
            onPress={vm.onToggleRecordingConsent}
            style={styles.consentCheckRow}
          >
            <View
              style={[
                styles.checkbox,
                vm.recordingConsentChecked && styles.checkboxOn,
              ]}
            >
              {vm.recordingConsentChecked ? (
                <Ionicons name="checkmark" size={16} color={WHITE} />
              ) : null}
            </View>
            <AppText variant="bodyMd" color={INK} style={styles.flex}>
              {vm.t('recordConsentCheckbox')}
            </AppText>
          </Pressable>

          <View style={styles.consentActions}>
            <AppButton
              label={vm.t('recordConsentDecline')}
              variant="secondary"
              onPress={vm.onDeclineRecording}
              style={styles.consentBtn}
            />
            <AppButton
              label={vm.t('recordConsentAllow')}
              onPress={vm.onAllowRecording}
              disabled={allowDisabled}
              style={styles.consentBtn}
            />
          </View>

          <Pressable accessibilityRole="link" style={styles.noticeLink}>
            <AppText variant="bodyMd" color={ACTIVE_FILL} style={styles.noticeText}>
              {vm.t('recordConsentNotice')}
            </AppText>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function ConsentBullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name="checkmark-circle" size={20} color={ACTIVE_FILL} />
      <AppText variant="bodyMd" color={SHEET_MUTED} style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

function ReconnectingOverlay({
  vm,
  bottomInset,
}: {
  vm: VideoCallViewModel;
  bottomInset: number;
}) {
  const attemptLabel = vm
    .t('reconnectBody')
    .replace('{n}', String(vm.reconnectAttempt))
    .replace('{max}', String(vm.reconnectMaxAttempts));

  return (
    <View style={styles.reconnectRoot} pointerEvents="auto">
      <View style={styles.reconnectCenter}>
        <View style={styles.reconnectIconBox}>
          <Ionicons name="wifi" size={40} color={CALL_ICON} />
          <View style={styles.magnifierBadge}>
            <Ionicons name="search" size={14} color={CALL_BLACK} />
          </View>
        </View>
        <AppText variant="headlineMd" color={WHITE} style={styles.centerText}>
          {vm.t('reconnectTitle')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED} style={styles.centerText}>
          {attemptLabel}
        </AppText>
        <View style={styles.elapsedChip}>
          <Ionicons name="timer-outline" size={16} color={WHITE} />
          <AppText variant="labelMd" color={WHITE}>
            {vm.t('reconnectElapsed').replace('{time}', vm.reconnectElapsedLabel)}
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.reconnectActions,
          { paddingBottom: Math.max(bottomInset, 0) + spacing.lg },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={vm.onSwitchToAudioFromReconnect}
          style={({ pressed }) => [
            styles.switchAudioBtn,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="mic" size={22} color={WHITE} />
          <AppText variant="labelLg" color={WHITE} weightOverride="600">
            {vm.t('reconnectSwitchAudio')}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={vm.onEndFromReconnect}
          style={({ pressed }) => [
            styles.endConsultBtn,
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="labelLg" color={END_SOFT} weightOverride="600">
            {vm.t('reconnectEnd')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function DoctorDisconnectedOverlay({
  vm,
  bottomInset,
}: {
  vm: VideoCallViewModel;
  bottomInset: number;
}) {
  return (
    <View style={styles.doctorDiscRoot} pointerEvents="auto">
      <View style={styles.dotGrid} />
      <View
        style={[
          styles.doctorDiscCard,
          { marginBottom: Math.max(bottomInset, 0) + spacing.md },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.doctorDiscBody}
        >
          <View style={styles.doctorDiscHero}>
            <View style={styles.heroLaptop}>
              <Ionicons name="laptop-outline" size={56} color={colors.primary} />
              <View style={styles.heroX}>
                <Ionicons name="close-circle" size={22} color={END_CALL} />
              </View>
            </View>
            <AppText variant="labelSm" color={MUTED} style={styles.centerText}>
              HelloHomeo
            </AppText>
          </View>

          <AppText variant="headlineMd" color={INK} style={styles.centerText}>
            {vm.t('doctorDiscTitle')}
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.centerText}>
            {vm.t('doctorDiscBody')}
          </AppText>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(8, Math.round(vm.doctorWaitProgress * 100))}%` },
              ]}
            />
          </View>
          <View style={styles.waitRow}>
            <Ionicons name="hourglass-outline" size={16} color={colors.onSurfaceVariant} />
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {vm.t('doctorDiscWaiting').replace('{time}', vm.doctorWaitLabel)}
            </AppText>
          </View>

          <View style={styles.noticeBox}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <View style={styles.noticeCopy}>
              <AppText variant="bodyMd" color={INK}>
                {vm.t('doctorDiscNotice')}
              </AppText>
            </View>
          </View>

          <AppButton
            label={vm.t('doctorDiscWait')}
            variant="secondary"
            onPress={vm.onWaitForDoctor}
          />
          <Pressable
            accessibilityRole="link"
            onPress={vm.onRescheduleFromDoctorDisconnect}
            style={styles.rescheduleLink}
          >
            <AppText variant="labelMd" color={colors.primary} style={styles.centerText}>
              {vm.t('doctorDiscReschedule')}
            </AppText>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
  active = false,
  badge,
  badgeTone = 'primary',
  disabled = false,
  errorBadge = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  badge?: string;
  badgeTone?: 'primary' | 'amber';
  disabled?: boolean;
  errorBadge?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.control,
        active ? styles.controlActive : styles.controlIdle,
        pressed && !disabled && styles.pressed,
        disabled && styles.controlDisabled,
      ]}
    >
      <Ionicons name={icon} size={22} color={active ? WHITE : CALL_ICON} />
      {badge ? (
        <View
          style={[
            styles.badge,
            badgeTone === 'amber' ? styles.badgeAmber : null,
          ]}
        >
          <AppText
            variant="labelSm"
            color={WHITE}
            weightOverride="600"
            style={styles.badgeText}
          >
            {badge}
          </AppText>
        </View>
      ) : null}
      {errorBadge ? (
        <View style={styles.errorBadge}>
          <Ionicons name="close" size={10} color={WHITE} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CALL_SURFACE,
  },
  remoteFeed: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  feedDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SCRIM,
  },
  audioOnlyStage: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CALL_BLACK,
    paddingHorizontal: spacing.gutter,
  },
  audioBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.default,
    padding: spacing.md,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
  },
  audioBannerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  tryVideoLink: {
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
  },
  audioCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: 120,
  },
  audioPortrait: {
    width: 160,
    height: 160,
    borderRadius: radii.default,
    backgroundColor: CALL_BORDER,
  },
  audioStatusCard: {
    backgroundColor: CALL_OVERLAY,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    minWidth: '70%',
  },
  audioHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  audioHeaderCopy: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
  },
  doctorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: CALL_OVERLAY,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: '72%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: CALL_BORDER,
  },
  doctorCopy: {
    flexShrink: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorName: {
    flexShrink: 1,
    fontSize: scaleFont(14),
    lineHeight: scaleFont(18),
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: CALL_ICON,
  },
  liveDotGreen: {
    backgroundColor: SUCCESS_DOT,
  },
  signalButton: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CALL_OVERLAY,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pip: {
    position: 'absolute',
    right: spacing.gutter,
    width: 108,
    height: 152,
    borderRadius: radii.default,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CALL_BORDER,
    backgroundColor: CALL_OVERLAY,
    zIndex: 20,
  },
  pipPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C2523',
  },
  pipCameraOff: {
    backgroundColor: '#151D1B',
  },
  pipFlipHint: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: CALL_OVERLAY,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    left: spacing.gutter,
    right: spacing.gutter,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: CALL_OVERLAY,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    borderRadius: radii.full,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  toastText: {
    flexShrink: 1,
    textAlign: 'center',
  },
  controlsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: CALL_OVERLAY,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    borderRadius: radii.full,
    padding: spacing.sm,
  },
  control: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlActive: {
    backgroundColor: ACTIVE_FILL,
  },
  controlIdle: {
    backgroundColor: CALL_OVERLAY,
    borderWidth: 1,
    borderColor: CALL_BORDER,
  },
  controlDisabled: {
    opacity: 0.85,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: ACTIVE_FILL,
    borderWidth: 1,
    borderColor: CALL_OVERLAY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeAmber: {
    backgroundColor: AMBER,
    minWidth: 10,
    height: 10,
    paddingHorizontal: 0,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  errorBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: END_CALL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: CALL_BORDER,
    marginHorizontal: 2,
  },
  endCall: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: END_CALL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endIcon: {
    transform: [{ rotate: '135deg' }],
  },
  pressed: {
    opacity: 0.85,
  },
  centerText: {
    textAlign: 'center',
  },
  reconnectRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: CALL_BLACK,
    justifyContent: 'space-between',
  },
  reconnectCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  reconnectIconBox: {
    width: 88,
    height: 88,
    borderRadius: radii.default,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  magnifierBadge: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: CALL_ICON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elapsedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#1A1A1A',
  },
  reconnectActions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  switchAudioBtn: {
    minHeight: 56,
    borderRadius: radii.button,
    backgroundColor: colors.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  endConsultBtn: {
    minHeight: 56,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: CALL_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  doctorDiscRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: '#1A1A1A',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  dotGrid: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
    // Simple dotted feel via sparse border pattern isn't available; solid dark is fine.
    backgroundColor: DOT_GRID,
  },
  doctorDiscCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  doctorDiscBody: {
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  doctorDiscHero: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  heroLaptop: {
    width: 120,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroX: {
    position: 'absolute',
    top: 8,
    right: 18,
  },
  progressTrack: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  noticeBox: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: NOTICE_FILL,
    borderWidth: 1,
    borderColor: NOTICE_BORDER,
    borderRadius: radii.default,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  noticeCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rescheduleLink: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  flex: {
    flex: 1,
  },
  recordingPill: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(26, 26, 26, 0.92)',
    borderWidth: 1,
    borderColor: CALL_BORDER,
    borderRadius: radii.full,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 40,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: REC_FILL,
  },
  recordingStop: {
    minHeight: 36,
    minWidth: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: REC_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 60,
    justifyContent: 'flex-end',
  },
  consentScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  consentSheet: {
    backgroundColor: colors.page,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '88%',
    zIndex: 1,
  },
  consentHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  consentBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  consentIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.default,
    backgroundColor: ERROR_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  consentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  whatTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  whatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  consentCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 48,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: ACTIVE_FILL,
    borderColor: ACTIVE_FILL,
  },
  consentActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  consentBtn: {
    flex: 1,
  },
  chatRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 70,
    justifyContent: 'flex-end',
  },
  chatSheet: {
    maxHeight: '82%',
    height: '82%',
    backgroundColor: colors.page,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
  },
  chatClose: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatThread: {
    flex: 1,
  },
  chatThreadContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chatBubbleWrap: {
    maxWidth: '82%',
  },
  chatMine: {
    alignSelf: 'flex-end',
  },
  chatTheirs: {
    alignSelf: 'flex-start',
  },
  chatBubble: {
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chatBubbleMine: {
    backgroundColor: colors.primary,
  },
  chatBubbleTheirs: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  chatComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  chatInputWrap: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  chatInput: {
    color: INK,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  chatSend: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendOff: {
    opacity: 0.45,
  },
  noticeLink: {
    alignSelf: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  noticeText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
