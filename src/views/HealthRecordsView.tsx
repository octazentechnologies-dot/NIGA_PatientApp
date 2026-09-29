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
import { spacing } from '../theme/spacing';
import { ConsultationRecordView } from './ConsultationRecordView';
import { PrescriptionView } from './PrescriptionView';
import { UploadDocumentView } from './UploadDocumentView';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const CHIP_FILL = '#E6F5FE';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';

export function HealthRecordsView({
  onOpenFollowUpPlan,
  onOpenOrderMedicines,
  onOpenNotifications,
  notificationCount = 0,
  onBack,
  initialFilter = 'all',
  titleKey,
}: {
  onOpenFollowUpPlan?: () => void;
  onOpenOrderMedicines?: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
  onBack?: () => void;
  initialFilter?: RecordsFilterId;
  titleKey?: TranslationKey;
} = {}) {
  const vm = useHealthRecordsController({
    onOpenFollowUpPlan,
    onOpenNotifications,
    initialFilter,
  });
  const insets = useSafeAreaInsets();
  const tabScrollInset = usePatientTabScrollInset();
  const consultationRecord = useConsultationRecordController({
    onBack: vm.onCloseConsultationRecord,
    onOpenPrescription: vm.onViewPrescription,
    onOpenFollowUp: vm.onOpenFollowUp,
  });
  const prescription = usePrescriptionController({
    onBack: vm.onClosePrescription,
    onOrder: () => {
      vm.onClosePrescription();
      onOpenOrderMedicines?.();
    },
  });
  const uploadDocument = useUploadDocumentController({
    active: vm.uploadDocumentOpen,
    onClose: vm.onCloseUploadDocument,
    onSaved: () => vm.onUploadDocumentSaved(),
  });

  return (
    <View style={styles.root}>
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
              <Ionicons name="arrow-back" size={22} color={INK} />
            </Pressable>
          ) : null}
          <AppText variant="headlineMd" color={INK} style={styles.flex}>
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
                color={INK}
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
                    <AppText variant="labelMd" color={selected ? ACTION : MUTED}>
                      {member.initials}
                    </AppText>
                  </View>
                  {member.pending ? (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color={MUTED} />
                    </View>
                  ) : null}
                </View>
                <AppText
                  variant="labelSm"
                  color={selected ? INK : MUTED}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.memberName}
                  numberOfLines={2}
                >
                  {vm.t(member.nameKey)}
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
              <Ionicons name="add" size={28} color={MUTED} />
            </View>
            <AppText variant="labelSm" color={MUTED}>
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
                  color={selected ? colors.onButton : INK}
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
            <Ionicons name="calendar-outline" size={20} color={INK} />
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
            <AppText variant="titleMd" color={INK} style={styles.monthLabel}>
              {vm.monthLabel}
            </AppText>
            {vm.items.map((item) => (
              <TimelineCard key={item.id} item={item} vm={vm} />
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
                <AppText variant="bodyMd" color={INK}>
                  {vm.t('recordsUploadDoc')}
                </AppText>
                <Ionicons name="cloud-upload-outline" size={20} color={MUTED} />
              </Pressable>
              <Pressable
                style={styles.fabMenuItem}
                onPress={vm.onAddDiary}
                accessibilityRole="button"
              >
                <AppText variant="bodyMd" color={INK}>
                  {vm.t('recordsAddDiary')}
                </AppText>
                <Ionicons name="create-outline" size={20} color={MUTED} />
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
          <Ionicons name="lock-closed-outline" size={36} color={MUTED} />
        </View>
      )}
      <AppText variant="titleMd" color={INK} style={styles.center}>
        {title}
      </AppText>
      <AppText variant="bodyMd" color={MUTED} style={styles.center}>
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
      ? DANGER
      : item.rxStatus === 'expired' || item.rxStatus === 'superseded'
        ? WARN
        : item.kind === 'followup'
          ? SUCCESS
          : item.kind === 'document'
            ? MUTED
            : ACTION;

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
              <AppText variant="bodyMd" color={INK} weightOverride="600">
                {vm.t(item.titleKey)}
              </AppText>
              <AppText variant="labelSm" color={MUTED}>
                {vm.t(item.metaKey)}
              </AppText>
              {item.badgeKey ? (
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={12} color={SUCCESS} />
                  <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
                    {vm.t(item.badgeKey)}
                  </AppText>
                </View>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={MUTED} />
          </Pressable>
        ) : null}

        {item.kind === 'prescription' ? (
          isStatusRx ? (
            <PrescriptionStatusCard item={item} vm={vm} />
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.iconBubble}>
                  <Ionicons name="medical-outline" size={20} color={ACTION} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyMd" color={INK} weightOverride="600">
                    {vm.t(item.titleKey)}
                  </AppText>
                  <AppText variant="labelSm" color={MUTED}>
                    {vm.t(item.metaKey)}
                  </AppText>
                  {item.badgeKey ? (
                    <View style={styles.badge}>
                      <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
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
                  onPress={vm.onViewPrescription}
                  style={styles.rxBtn}
                />
                <AppButton
                  label={vm.t('recordsOrder')}
                  onPress={vm.onOrderPrescription}
                  style={styles.rxBtn}
                />
              </View>
            </>
          )
        ) : null}

        {item.kind === 'document' ? (
          <>
            <View style={styles.row}>
              <View style={styles.docThumb}>
                <Ionicons name="document-text-outline" size={22} color={MUTED} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyMd" color={INK} weightOverride="600">
                  {vm.t(item.titleKey)}
                </AppText>
                <AppText variant="labelSm" color={MUTED}>
                  {vm.t(item.metaKey)}
                </AppText>
              </View>
            </View>
            {item.noteKey ? (
              <AppText variant="labelSm" color={MUTED} style={styles.docNote}>
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
              <AppText variant="bodyMd" color={INK}>
                {vm.t(item.titleKey)}
              </AppText>
              <AppText variant="labelSm" color={MUTED}>
                {vm.t(item.metaKey)}
              </AppText>
            </View>
            <Ionicons name="thumbs-up" size={22} color={SUCCESS} />
          </Pressable>
        ) : null}

        {item.kind === 'referral' ? (
          <View style={styles.row}>
            <View style={[styles.iconBubble, styles.iconBubbleMuted]}>
              <Ionicons name="share-social-outline" size={20} color={MUTED} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyMd" color={INK} weightOverride="600">
                {vm.t(item.titleKey)}
              </AppText>
              <AppText variant="labelSm" color={MUTED}>
                {vm.t(item.metaKey)}
              </AppText>
            </View>
          </View>
        ) : null}

        {item.kind === 'diary' ? (
          <View style={styles.followRow}>
            <View style={styles.diaryLeft}>
              <Ionicons name="book-outline" size={20} color={ACTION} />
              <AppText variant="bodyMd" color={INK} weightOverride="600">
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
  const stripInk = isDanger ? DANGER : WARN;
  const stripFill = isDanger ? DANGER_FILL : WARN_FILL;
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
              <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
                {vm.t('rxStatusViewLatest')}
              </AppText>
              <Ionicons name="arrow-forward" size={16} color={ACTION_OUTLINE} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.rxStatusBody}>
        <View style={styles.rxStatusTitleRow}>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={INK}>
              {vm.t(item.titleKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t(item.metaKey)}
            </AppText>
          </View>
          {item.badgeKey ? (
            <View
              style={[
                styles.rxStatusPill,
                { backgroundColor: stripFill, borderColor: HAIRLINE },
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
              <AppText variant="labelSm" color={MUTED}>
                {vm.t(item.rxField1LabelKey)}
              </AppText>
              <AppText variant="bodyMd" color={INK}>
                {vm.t(item.rxField1ValueKey)}
              </AppText>
            </View>
          ) : null}
          {item.rxField2LabelKey && item.rxField2ValueKey ? (
            <View style={styles.rxStatusField}>
              <AppText variant="labelSm" color={MUTED}>
                {vm.t(item.rxField2LabelKey)}
              </AppText>
              <AppText
                variant="bodyMd"
                color={item.rxField2Alert ? DANGER : INK}
              >
                {vm.t(item.rxField2ValueKey)}
              </AppText>
            </View>
          ) : null}
        </View>

        {status === 'expired' ? (
          <View style={styles.rxStatusFooter}>
            <View style={styles.rxCannotReorder}>
              <Ionicons name="ban-outline" size={18} color={MUTED} />
              <AppText variant="labelMd" color={MUTED} weightOverride="600">
                {vm.t('rxStatusCannotReorder')}
              </AppText>
            </View>
          </View>
        ) : null}

        {status === 'cancelled' && item.rxFooterKey ? (
          <View style={styles.rxStatusFooter}>
            <View style={styles.rxInfoBox}>
              <Ionicons name="information-circle-outline" size={18} color={MUTED} />
              <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
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
    borderBottomColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    padding: 3,
    backgroundColor: colors.card,
  },
  memberRingSelected: {
    borderWidth: 2,
    borderColor: ACTION,
    backgroundColor: CHIP_FILL,
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
    borderColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipOn: {
    backgroundColor: INK,
    borderColor: INK,
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: HAIRLINE,
  },
  monthLabel: {
    marginLeft: -4,
    marginBottom: spacing.xs,
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
    borderColor: HAIRLINE,
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
    borderBottomColor: HAIRLINE,
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
    borderTopColor: HAIRLINE,
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
    borderColor: HAIRLINE,
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
    backgroundColor: HAIRLINE,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleMuted: {
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  rxActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
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
    borderColor: HAIRLINE,
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
    backgroundColor: ACTION,
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
    borderColor: HAIRLINE,
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
    backgroundColor: ACTION,
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
    borderColor: HAIRLINE,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
});
