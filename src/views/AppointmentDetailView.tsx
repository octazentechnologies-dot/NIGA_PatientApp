import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import { CancelAppointmentSheet } from '../components/CancelAppointmentSheet';
import { SelectExistingDocumentSheet } from '../components/SelectExistingDocumentSheet';
import type { AppointmentDetailViewModel } from '../controllers/useAppointmentDetailController';
import { useUploadDocumentController } from '../controllers/useUploadDocumentController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';
import { UploadDocumentView } from './UploadDocumentView';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ICON_BLUE = '#2A7BA3';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const SUCCESS_BORDER = '#CDE8DA';
const FILL = '#FAFAFA';
const AMBER = '#E08A2E';
const ACTION = '#2A7BA3';

export function AppointmentDetailView(vm: AppointmentDetailViewModel) {
  const insets = useSafeAreaInsets();
  const showTimer = vm.showJoin && (vm.phase === 'upcoming' || vm.phase === 'live');
  const upload = useUploadDocumentController({
    active: vm.uploadOpen,
    onClose: vm.onCloseUpload,
    onSaved: vm.onUploadSaved,
  });

  return (
    <View style={styles.root}>
      <SafeAreaModal
        visible={vm.uploadOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={vm.onCloseUpload}
      >
        <UploadDocumentView {...upload} />
      </SafeAreaModal>
      <SelectExistingDocumentSheet
        open={vm.selectSheetOpen}
        documents={vm.libraryDocuments}
        selectedId={vm.selectedLibraryId}
        t={vm.t}
        onClose={vm.onCloseSelectSheet}
        onSelect={vm.onSelectExistingDocument}
        onUploadNew={vm.onUploadNewFromSheet}
      />
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('back')}
          onPress={vm.onBack}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <AppText variant="headlineMd" color="#000000" style={styles.title}>
          {vm.t('aptTitle')}
        </AppText>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 28 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={22} color={SUCCESS} />
          <AppText variant="bodyMd" color={SUCCESS} weightOverride="600" style={styles.flex}>
            {vm.bannerLabel}
          </AppText>
        </View>

        {vm.showJoin || vm.showOpenChat ? (
          <View style={styles.card}>
            {showTimer ? (
              <View style={styles.centerBlock}>
                <AppText variant="labelSm" color={MUTED} style={styles.timerLabel}>
                  {vm.t('aptTimeRemaining')}
                </AppText>
                <AppText variant="displayLg" color="#000000" style={styles.timer}>
                  {vm.countdown}
                </AppText>
                <AppText variant="bodyMd" color={MUTED} style={styles.center}>
                  {vm.consultWithLabel}
                </AppText>
              </View>
            ) : (
              <AppText variant="bodyMd" color={MUTED} style={styles.center}>
                {vm.consultWithLabel}
              </AppText>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={vm.onJoin}
              disabled={vm.showJoin ? !vm.canJoin : false}
              style={({ pressed }) => [
                styles.joinBtn,
                pressed && styles.pressed,
                vm.showJoin && !vm.canJoin && styles.disabled,
              ]}
            >
              <Ionicons
                name={
                  vm.showOpenChat
                    ? 'chatbubble'
                    : vm.mode === 'audio'
                      ? 'call'
                      : 'videocam'
                }
                size={20}
                color="#FFFFFF"
              />
              <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
                {vm.showOpenChat ? vm.t('aptOpenChat') : vm.t('aptJoin')}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {vm.isClinic ? (
          <View style={styles.card}>
            <View style={styles.visitHead}>
              <Ionicons name="business-outline" size={22} color={ICON_BLUE} />
              <AppText variant="titleMd" color="#000000">
                {vm.t('aptWhenToVisit')}
              </AppText>
            </View>
            <AppText variant="bodyMd" color="#000000">
              {vm.visitWhenLabel}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('aptClinicHint')}
            </AppText>
          </View>
        ) : null}

        <View style={styles.card}>
          <AppText variant="titleMd" color="#000000">
            {vm.t('aptDetails')}
          </AppText>
          <View style={styles.grid}>
            <DetailCell label={vm.t('aptDateTime')} value={`${vm.dateLine}\n${vm.timeLine}`} />
            <View style={styles.cell}>
              <AppText variant="labelSm" color={MUTED}>
                {vm.t('aptType')}
              </AppText>
              <View style={styles.typeRow}>
                <Ionicons name={vm.modeIcon} size={18} color={MUTED} />
                <AppText variant="bodyMd" color="#000000" style={styles.flex}>
                  {vm.modeConsultLabel}
                </AppText>
              </View>
            </View>
            <DetailCell label={vm.t('aptPatient')} value={vm.patientLabel} />
            <DetailCell label={vm.t('aptBookingId')} value={vm.bookingId} />
          </View>
          <View style={styles.bookedOn}>
            <AppText variant="labelSm" color={MUTED}>
              {vm.t('aptBookedOn').replace('{date}', vm.bookedOnLabel)}
            </AppText>
          </View>
        </View>

        <View style={styles.doctorCard}>
          <View style={styles.avatar}>
            <AppText variant="titleMd" color={ICON_BLUE} languageOverride="en">
              {vm.doctorInitials}
            </AppText>
          </View>
          <View style={styles.flex}>
            <View style={styles.doctorNameRow}>
              <AppText variant="titleMd" color="#000000" style={styles.flex}>
                {vm.doctorName}
              </AppText>
              {vm.verified ? (
                <Ionicons name="checkmark-circle" size={18} color={AMBER} />
              ) : null}
            </View>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.credentials}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <AppText variant="labelSm" color={MUTED}>
              {vm.t('aptReason')}
            </AppText>
            <View style={styles.reasonBox}>
              <AppText variant="bodyMd" color="#000000">
                {vm.reason}
              </AppText>
            </View>
          </View>
          <View style={styles.field}>
            <View style={styles.docsHead}>
              <AppText variant="labelSm" color={MUTED}>
                {vm.t('aptDocuments')}
              </AppText>
              <Pressable accessibilityRole="button" onPress={vm.onAddDocuments}>
                <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
                  {vm.t('aptAddDocument')}
                </AppText>
              </Pressable>
            </View>
            {vm.attachedDocuments.length === 0 ? (
              <View style={styles.emptyDocs}>
                <Ionicons name="document-text-outline" size={20} color={MUTED} />
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t('aptNoDocuments')}
                </AppText>
              </View>
            ) : (
              <View style={styles.docList}>
                {vm.attachedDocuments.map((doc) => (
                  <View key={doc.id} style={styles.docRow}>
                    <Ionicons
                      name={
                        doc.kind === 'pdf'
                          ? 'document-text-outline'
                          : 'image-outline'
                      }
                      size={20}
                      color={MUTED}
                    />
                    <View style={styles.flex}>
                      <AppText variant="bodyMd" color="#000000" numberOfLines={1}>
                        {doc.name}
                      </AppText>
                      <AppText variant="labelSm" color={MUTED}>
                        {doc.sizeLabel}
                      </AppText>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => vm.onRemoveDocument(doc.id)}
                      style={styles.docRemove}
                    >
                      <Ionicons name="close" size={18} color={MUTED} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.payCard}>
          <View style={styles.payIcon}>
            <Ionicons name="card-outline" size={20} color={ICON_BLUE} />
          </View>
          <View style={styles.flex}>
            <AppText variant="titleMd" color="#000000">
              {vm.feeLabel}
            </AppText>
            <AppText variant="labelSm" color={MUTED}>
              {`UPI · ${vm.paymentId}`}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onDownloadReceipt}
            style={styles.receiptBtn}
          >
            <AppText variant="bodyMd" color={ICON_BLUE} weightOverride="600">
              {vm.t('aptReceipt')}
            </AppText>
            <Ionicons name="download-outline" size={16} color={ICON_BLUE} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.prepTitle}>
            <Ionicons name="information-circle-outline" size={20} color={ICON_BLUE} />
            <AppText variant="titleMd" color="#000000">
              {vm.t(vm.isClinic ? 'aptClinicPrepTitle' : 'aptPrepTitle')}
            </AppText>
          </View>
          {(vm.isClinic
            ? (['aptClinicPrep1', 'aptClinicPrep2', 'aptClinicPrep3'] as const)
            : (['aptPrep1', 'aptPrep2', 'aptPrep3'] as const)
          ).map((key) => (
            <View key={key} style={styles.prepRow}>
              <Ionicons name="checkmark-circle" size={20} color={ICON_BLUE} />
              <AppText variant="bodyMd" color="#000000" style={styles.flex}>
                {vm.t(key)}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onChangeTime}
            style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
          >
            <AppText variant="titleMd" color={ICON_BLUE}>
              {vm.t('aptChangeTime')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onCancel}
            style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
          >
            <AppText variant="titleMd" color={colors.error}>
              {vm.t('aptCancel')}
            </AppText>
          </Pressable>
        </View>
        <AppText variant="labelSm" color={MUTED} style={styles.center}>
          {vm.t('aptRescheduleHint')}
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onGetHelp}
          style={styles.helpRow}
        >
          <Ionicons name="headset-outline" size={20} color={ICON_BLUE} />
          <AppText variant="titleMd" color={ICON_BLUE}>
            {vm.t('aptGetHelp')}
          </AppText>
        </Pressable>
      </ScrollView>

      <CancelAppointmentSheet
        language={vm.language}
        t={vm.t}
        cancelSheetOpen={vm.cancelSheetOpen}
        cancelReason={vm.cancelReason}
        cancelNote={vm.cancelNote}
        canConfirmCancel={vm.canConfirmCancel}
        refundTitle={vm.refundTitle}
        refundBody={vm.refundBody}
        onCloseCancelSheet={vm.onCloseCancelSheet}
        onSelectCancelReason={vm.onSelectCancelReason}
        onChangeCancelNote={vm.onChangeCancelNote}
        onConfirmCancel={vm.onConfirmCancel}
      />
    </View>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <AppText variant="labelSm" color={MUTED}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color="#000000">
        {value}
      </AppText>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  title: {
    flex: 1,
    textAlign: 'left',
    fontSize: scaleFont(22),
    lineHeight: scaleFont(30),
  },
  iconButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SUCCESS_FILL,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 12,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 6,
  },
  timerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timer: {
    fontSize: scaleFont(32),
    lineHeight: scaleFont(40),
    letterSpacing: 1,
  },
  center: {
    textAlign: 'center',
  },
  joinBtn: {
    minHeight: 48,
    borderRadius: radii.button,
    backgroundColor: ACTION,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
  },
  visitHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cell: {
    width: '47%',
    gap: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookedOn: {
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingTop: 12,
  },
  doctorCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: '#E6F5FE',
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  field: {
    gap: 8,
  },
  reasonBox: {
    backgroundColor: FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: 12,
  },
  docsHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyDocs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderStyle: 'dashed',
    borderRadius: radii.sm,
    padding: 12,
  },
  docList: {
    gap: spacing.sm,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: 12,
  },
  docRemove: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prepTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  ghostBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  helpRow: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
  flex: {
    flex: 1,
  },
});
