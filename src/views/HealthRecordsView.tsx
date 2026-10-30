import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { AppToast } from '../components/AppToast';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { NotificationBell } from '../components/NotificationBell';
import { images } from '../config/images';
import { usePatientTabScrollInset } from '../components/PatientTabBar';
import { useConsultationRecordController } from '../controllers/useConsultationRecordController';
import {
  useHealthRecordsController,
  type RecordsFilterId,
  type RecordsTimelineItem,
} from '../controllers/useHealthRecordsController';
import { usePrescriptionController } from '../controllers/usePrescriptionController';
import { useUploadDocumentController } from '../controllers/useUploadDocumentController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { ConsultationRecordView } from './ConsultationRecordView';
import { PrescriptionView } from './PrescriptionView';
import { UploadDocumentView } from './UploadDocumentView';

const WARN = colors.warning;

function timelineMonthGroups(
  items: RecordsTimelineItem[],
  language: 'en' | 'mr',
): { label: string; items: RecordsTimelineItem[] }[] {
  const locale = language === 'mr' ? 'mr-IN' : 'en-IN';
  const groups: { label: string; items: RecordsTimelineItem[] }[] = [];
  for (const item of items) {
    const parsed = item.occurredAt ? new Date(item.occurredAt) : null;
    const label =
      parsed && !Number.isNaN(parsed.getTime())
        ? parsed.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
        : '';
    const current = groups[groups.length - 1];
    if (current && current.label === label) {
      current.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}
const WARN_FILL = colors.warningContainer;
export function HealthRecordsView({
  onOpenFollowUpPlan,
  onOpenOrderMedicines,
  onOpenNotifications,
  onAddMember,
  notificationCount = 0,
  onBack,
  initialFilter = 'all',
  titleKey,
}: {
  onOpenFollowUpPlan?: () => void;
  onOpenOrderMedicines?: (launch?: import('../utilities/medicineOrderStage').OrderMedicinesLaunch) => void;
  onOpenNotifications?: () => void;
  onAddMember?: () => void;
  notificationCount?: number;
  onBack?: () => void;
  initialFilter?: RecordsFilterId;
  titleKey?: TranslationKey;
} = {}) {
  const vm = useHealthRecordsController({
    onOpenFollowUpPlan,
    onOpenNotifications,
    onAddMember,
    onOpenOrderMedicines,
    initialFilter,
  });
  const insets = useSafeAreaInsets();
  const tabScrollInset = usePatientTabScrollInset();
  const consultationRecord = useConsultationRecordController({
    patientAppId: vm.activePatientAppId,
    onBack: vm.onCloseConsultationRecord,
    onOpenPrescription: vm.onViewPrescription,
    onOpenFollowUp: vm.onOpenFollowUp,
  });
  const prescription = usePrescriptionController({
    patientAppId: vm.activePatientAppId,
    appointmentId: vm.activePatientAppId,
    onBack: vm.onClosePrescription,
    onOrder: (launch) => {
      vm.onClosePrescription();
      onOpenOrderMedicines?.(launch);
    },
  });
  const uploadDocument = useUploadDocumentController({
    active: vm.uploadDocumentOpen,
    onClose: vm.onCloseUploadDocument,
    onSaved: () => vm.onUploadDocumentSaved(),
  });

  return (
    <View style={styles.root}>
      <AppToast
        message={vm.toastMessage}
        variant={vm.toastVariant}
        onDismiss={vm.onDismissToast}
      />
      <ConfirmationModal
        visible={vm.confirmDeleteDocId != null}
        title="Delete Document"
        message={`Are you sure you want to delete "${vm.confirmDeleteDocName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={vm.isDeletingDocument}
        onConfirm={vm.onConfirmDeleteDocument}
        onCancel={vm.onCancelDeleteDocument}
      />
      <SafeAreaModal
        visible={vm.consultationRecordOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={vm.onCloseConsultationRecord}
      >
        <ConsultationRecordView {...consultationRecord} />
      </SafeAreaModal>
      <SafeAreaModal
        visible={vm.prescriptionOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={vm.onClosePrescription}
      >
        <PrescriptionView {...prescription} />
      </SafeAreaModal>
      <SafeAreaModal
        visible={vm.uploadDocumentOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={vm.onCloseUploadDocument}
      >
        <UploadDocumentView {...uploadDocument} />
      </SafeAreaModal>
      <View
        style={[
          styles.topCard,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <View style={styles.headerRow}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('back')}
              onPress={onBack}
              style={styles.iconHit}
            >
              <Ionicons name="arrow-back" size={22} color={colors.ink} />
            </Pressable>
          ) : null}
          <AppText variant="headlineMd" color={colors.ink} style={styles.flex}>
            {vm.t(titleKey ?? 'recordsTitle')}
          </AppText>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('languageLabel')}
              onPress={() =>
                vm.onSelectLanguage(vm.language === 'en' ? 'mr' : 'en')
              }
              style={styles.languageButton}
            >
              <AppText
                variant="labelMd"
                color={colors.ink}
                languageOverride={vm.language === 'en' ? 'en' : 'mr'}
              >
                {vm.language === 'en' ? 'EN' : 'मराठी'}
              </AppText>
            </Pressable>
            <NotificationBell
              count={notificationCount}
              label={vm.t('homeNotifications')}
              onPress={vm.onOpenNotifications}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.membersRow}
        >
          {vm.members.map((member) => {
            const selected = member.id === vm.selectedMemberId;
            return (
              <Pressable
                key={member.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => vm.onSelectMember(member.id)}
                style={styles.memberItem}
              >
                <View
                  style={[
                    styles.memberRing,
                    selected && styles.memberRingSelected,
                    member.pending && styles.memberRingPending,
                  ]}
                >
                  <View style={styles.memberAvatar}>
                    <AppText variant="labelMd" color={selected ? colors.primary : colors.muted}>
                      {member.initials}
                    </AppText>
                  </View>
                  {member.pending ? (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color={colors.muted} />
                    </View>
                  ) : null}
                </View>
                <AppText
                  variant="labelSm"
                  color={selected ? colors.ink : colors.muted}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.memberName}
                  numberOfLines={2}
                  raw
                >
                  {member.label}
                </AppText>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            onPress={vm.onAddMember}
            style={styles.memberItem}
          >
            <View style={styles.addMember}>
              <Ionicons name="add" size={28} color={colors.muted} />
            </View>
            <AppText variant="labelSm" color={colors.muted}>
              {vm.t('recordsAdd')}
            </AppText>
          </Pressable>
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {vm.filters.map((filter) => {
            const selected = filter.id === vm.selectedFilter;
            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => vm.onSelectFilter(filter.id)}
                style={[styles.filterChip, selected && styles.filterChipOn]}
              >
                <AppText
                  variant="labelSm"
                  color={selected ? colors.onButton : colors.ink}
                  weightOverride="600"
                >
                  {vm.t(filter.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenCalendar}
            style={styles.calendarBtn}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.ink} />
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.listBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: onBack
              ? 100 + sheetBottomPadding(insets, spacing.md)
              : tabScrollInset,
          },
        ]}
      >
        {vm.isPendingMember ? (
          <EmptyState
            title={vm.t('recordsPendingTitle')}
            body={vm.t('recordsPendingBody')}
          />
        ) : vm.isEmpty ? (
          <EmptyState
            title={vm.t('recordsEmptyTitle')}
            body={vm.t('recordsEmptyBody')}
            showImage
          />
        ) : (
          <View style={styles.timeline}>
            <View style={styles.timelineLine} />
            {timelineMonthGroups(vm.items, vm.language).map((group) => (
              <View key={group.label || 'undated'} style={styles.monthGroup}>
                {group.label ? (
                  <AppText variant="titleMd" color={colors.ink} style={styles.monthLabel}>
                    {group.label}
                  </AppText>
                ) : null}
                <View style={styles.monthCards}>
                  {group.items.map((item) => (
                    <TimelineCard key={item.id} item={item} vm={vm} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {!vm.isPendingMember ? (
        <View
          style={[
            styles.fabWrap,
            {
              bottom: onBack
                ? 16 + Math.max(insets.bottom, 0)
                : tabScrollInset,
            },
          ]}
        >
          {vm.fabOpen ? (
            <View style={styles.fabMenu}>
              <Pressable
                style={styles.fabMenuItem}
                onPress={vm.onUploadDocument}
                accessibilityRole="button"
              >
                <AppText variant="bodyMd" color={colors.ink}>
                  {vm.t('recordsUploadDoc')}
                </AppText>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.muted} />
              </Pressable>
              <Pressable
                style={styles.fabMenuItem}
                onPress={vm.onAddDiary}
                accessibilityRole="button"
              >
                <AppText variant="bodyMd" color={colors.ink}>
                  {vm.t('recordsAddDiary')}
                </AppText>
                <Ionicons name="create-outline" size={20} color={colors.muted} />
              </Pressable>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('recordsAdd')}
            onPress={vm.onToggleFab}
            style={styles.fab}
          >
            <Ionicons name={vm.fabOpen ? 'close' : 'add'} size={28} color={colors.onButton} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function EmptyState({
  title,
  body,
  showImage = false,
}: {
  title: string;
  body: string;
  showImage?: boolean;
}) {
  return (
    <View style={styles.empty}>
      {showImage ? (
        <Image
          source={images.noRecordsFound}
          style={styles.emptyImage}
          resizeMode="contain"
          accessibilityLabel={title}
        />
      ) : (
        <View style={styles.emptyIcon}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.muted} />
        </View>
      )}
      <AppText variant="titleMd" color={colors.ink} style={styles.center}>
        {title}
      </AppText>
      <AppText variant="bodyMd" color={colors.muted} style={styles.center}>
        {body}
      </AppText>
    </View>
  );
}

function TimelineCard({
  item,
  vm,
}: {
  item: RecordsTimelineItem;
  vm: ReturnType<typeof useHealthRecordsController>;
}) {
  const isStatusRx =
    item.kind === 'prescription' &&
    item.rxStatus != null &&
    item.rxStatus !== 'active';

  const nodeColor =
    item.rxStatus === 'cancelled'
      ? colors.error
      : item.rxStatus === 'expired' || item.rxStatus === 'superseded'
        ? WARN
        : item.kind === 'followup'
          ? colors.success
          : item.kind === 'document'
            ? colors.muted
            : colors.primary;

  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineNode, { backgroundColor: nodeColor }]} />
      <View style={[styles.card, isStatusRx && styles.cardFlush]}>
        {item.kind === 'consultation' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => vm.onOpenConsultationRecord(item.id)}
            style={styles.row}
          >
            <Image source={images.doctorPortrait} style={styles.doctorAvatar} />
            <View style={styles.flex}>
              <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
                {vm.t(item.titleKey)}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t(item.metaKey)}
              </AppText>
              {item.badgeKey ? (
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                  <AppText variant="labelSm" color={colors.success} weightOverride="600">
                    {vm.t(item.badgeKey)}
                  </AppText>
                </View>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ) : null}

        {item.kind === 'prescription' ? (
          isStatusRx ? (
            <PrescriptionStatusCard item={item} vm={vm} />
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.iconBubble}>
                  <Ionicons name="medical-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
                    {vm.t(item.titleKey)}
                  </AppText>
                  <AppText variant="labelSm" color={colors.muted}>
                    {vm.t(item.metaKey)}
                  </AppText>
                  {item.badgeKey ? (
                    <View style={styles.badge}>
                      <AppText variant="labelSm" color={colors.success} weightOverride="600">
                        {vm.t(item.badgeKey)}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.rxActions}>
                <AppButton
                  label={vm.t('recordsView')}
                  variant="secondary"
                  onPress={() => vm.onViewLatestPrescription(item.id)}
                  style={styles.rxBtn}
                />
                <AppButton
                  label={vm.t('recordsOrder')}
                  onPress={() => vm.onOrderPrescription(item.id)}
                  style={styles.rxBtn}
                />
              </View>
            </>
          )
        ) : null}

        {item.kind === 'document' ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (item.documentId != null) {
                  vm.onViewDocument(item.documentId);
                }
              }}
              style={styles.row}
            >
              <View style={styles.docThumb}>
                <Ionicons name="document-text-outline" size={22} color={colors.muted} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyMd" color={colors.ink} weightOverride="600" raw>
                  {vm.t(item.titleKey)}
                </AppText>
                <AppText variant="labelSm" color={colors.muted} raw>
                  {vm.t(item.metaKey)}
                </AppText>
              </View>
              {item.documentId != null ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={vm.t('notifActionDelete')}
                  onPress={() =>
                    vm.onPromptDeleteDocument(
                      item.documentId!,
                      vm.t(item.titleKey),
                    )
                  }
                  hitSlop={8}
                  style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.muted} />
                </Pressable>
              ) : null}
            </Pressable>
            {item.noteKey ? (
              <AppText variant="labelSm" color={colors.muted} style={styles.docNote}>
                {vm.t(item.noteKey)}
              </AppText>
            ) : null}
          </>
        ) : null}

        {item.kind === 'followup' ? (
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenFollowUp}
            style={styles.followRow}
          >
            <View style={styles.flex}>
              <AppText variant="bodyMd" color={colors.ink}>
                {vm.t(item.titleKey)}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t(item.metaKey)}
              </AppText>
            </View>
            <Ionicons name="thumbs-up" size={22} color={colors.success} />
          </Pressable>
        ) : null}

        {item.kind === 'referral' ? (
          <View style={styles.row}>
            <View style={[styles.iconBubble, styles.iconBubbleMuted]}>
              <Ionicons name="share-social-outline" size={20} color={colors.muted} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
                {vm.t(item.titleKey)}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t(item.metaKey)}
              </AppText>
            </View>
          </View>
        ) : null}

        {item.kind === 'diary' ? (
          <View style={styles.followRow}>
            <View style={styles.diaryLeft}>
              <Ionicons name="book-outline" size={20} color={colors.primary} />
              <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
                {vm.t(item.titleKey)}
              </AppText>
            </View>
            <View style={styles.bars}>
              {[4, 8, 6, 10, 12].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.bar,
                    {
                      height,
                      opacity: 0.25 + index * 0.15,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PrescriptionStatusCard({
  item,
  vm,
}: {
  item: RecordsTimelineItem;
  vm: ReturnType<typeof useHealthRecordsController>;
}) {
  const status = item.rxStatus;
  const isDanger = status === 'cancelled';
  const stripInk = isDanger ? colors.error : WARN;
  const stripFill = isDanger ? colors.errorContainer : WARN_FILL;
  const stripIcon =
    status === 'cancelled'
      ? 'close-circle'
      : status === 'superseded'
        ? 'refresh-circle'
        : 'time';

  return (
    <View style={status === 'superseded' ? styles.rxStatusDim : undefined}>
      {item.rxStripKey ? (
        <View style={[styles.rxStatusStrip, { backgroundColor: stripFill }]}>
          <View style={styles.rxStatusStripLeft}>
            <Ionicons name={stripIcon} size={20} color={stripInk} />
            <AppText variant="bodyMd" color={stripInk} style={styles.flex} weightOverride="600">
              {vm.t(item.rxStripKey)}
            </AppText>
          </View>
          {status === 'superseded' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => vm.onViewLatestPrescription(item.id)}
              style={styles.rxLatestLink}
            >
              <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
                {vm.t('rxStatusViewLatest')}
              </AppText>
              <Ionicons name="arrow-forward" size={16} color={colors.primaryOutline} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.rxStatusBody}>
        <View style={styles.rxStatusTitleRow}>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.t(item.titleKey)}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t(item.metaKey)}
            </AppText>
          </View>
          {item.badgeKey ? (
            <View
              style={[
                styles.rxStatusPill,
                { backgroundColor: stripFill, borderColor: colors.outlineVariant },
              ]}
            >
              <AppText
                variant="labelSm"
                color={stripInk}
                weightOverride="600"
                style={styles.rxStatusPillText}
              >
                {vm.t(item.badgeKey)}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.rxStatusFields}>
          {item.rxField1LabelKey && item.rxField1ValueKey ? (
            <View style={styles.rxStatusField}>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t(item.rxField1LabelKey)}
              </AppText>
              <AppText variant="bodyMd" color={colors.ink}>
                {vm.t(item.rxField1ValueKey)}
              </AppText>
            </View>
          ) : null}
          {item.rxField2LabelKey && item.rxField2ValueKey ? (
            <View style={styles.rxStatusField}>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t(item.rxField2LabelKey)}
              </AppText>
              <AppText
                variant="bodyMd"
                color={item.rxField2Alert ? colors.error : colors.ink}
              >
                {vm.t(item.rxField2ValueKey)}
              </AppText>
            </View>
          ) : null}
        </View>

        {status === 'expired' ? (
          <View style={styles.rxStatusFooter}>
            <View style={styles.rxCannotReorder}>
              <Ionicons name="ban-outline" size={18} color={colors.muted} />
              <AppText variant="labelMd" color={colors.muted} weightOverride="600">
                {vm.t('rxStatusCannotReorder')}
              </AppText>
            </View>
          </View>
        ) : null}

        {status === 'cancelled' && item.rxFooterKey ? (
          <View style={styles.rxStatusFooter}>
            <View style={styles.rxInfoBox}>
              <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
              <AppText variant="bodyMd" color={colors.muted} style={styles.flex}>
                {vm.t(item.rxFooterKey)}
              </AppText>
            </View>
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
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  topCard: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: radii.default,
    borderBottomRightRadius: radii.default,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageButton: {
    minHeight: 36,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
    textAlign: 'left',
  },
  listBody: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  body: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  membersRow: {
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingRight: spacing.sm,
  },
  memberItem: {
    width: 72,
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberRing: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 3,
    backgroundColor: colors.card,
  },
  memberRingSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  memberRingPending: {
    opacity: 0.7,
  },
  memberAvatar: {
    flex: 1,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    textAlign: 'center',
  },
  addMember: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.sm,
  },
  filtersRow: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.lg + 28,
    gap: spacing.md,
  },
  timelineLine: {
    position: 'absolute',
    left: spacing.lg + 10,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: colors.outlineVariant,
  },
  monthGroup: {
    gap: spacing.sm,
  },
  monthCards: {
    gap: layout.cardGap,
  },
  monthLabel: {
    marginLeft: -4,
  },
  timelineItem: {
    position: 'relative',
  },
  timelineNode: {
    position: 'absolute',
    left: -22,
    top: 18,
    width: 12,
    height: 12,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: colors.page,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardFlush: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  rxStatusStrip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  rxStatusStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rxLatestLink: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingLeft: 28,
  },
  rxStatusBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  rxStatusDim: {
    opacity: 0.85,
  },
  rxStatusTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rxStatusPill: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rxStatusPillText: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rxStatusFields: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rxStatusField: {
    flex: 1,
    gap: 2,
  },
  rxStatusFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.md,
  },
  rxCannotReorder: {
    minHeight: 48,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    opacity: 0.55,
  },
  rxInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    backgroundColor: colors.successContainer,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleMuted: {
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  rxActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
  },
  rxBtn: {
    flex: 1,
  },
  docThumb: {
    width: 48,
    height: 64,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docNote: {
    fontStyle: 'italic',
    backgroundColor: colors.page,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diaryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  bar: {
    width: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: colors.primary,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyImage: {
    width: 220,
    height: 180,
    marginBottom: spacing.md,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  fabWrap: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenu: {
    gap: spacing.sm,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
});
