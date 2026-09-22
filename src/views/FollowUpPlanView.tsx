import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { useConsultationRecordController } from '../controllers/useConsultationRecordController';
import type {
  FeelingId,
  FollowUpPlanViewModel,
  FollowUpTaskBadgeTone,
} from '../controllers/useFollowUpPlanController';
import { usePrescriptionController } from '../controllers/usePrescriptionController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { ConsultationRecordView } from './ConsultationRecordView';
import { PrescriptionView } from './PrescriptionView';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';
const CHIP_FILL = '#E6F5FE';
const PLACEHOLDER = '#8A8A8A';

const FEELINGS: {
  id: FeelingId;
  labelKey: 'followUpFeelingImproved' | 'followUpFeelingSame' | 'followUpFeelingWorse' | 'followUpFeelingReturned';
  icon: keyof typeof Ionicons.glyphMap;
  ink: string;
  fill: string;
}[] = [
  {
    id: 'improved',
    labelKey: 'followUpFeelingImproved',
    icon: 'happy-outline',
    ink: SUCCESS,
    fill: SUCCESS_FILL,
  },
  {
    id: 'same',
    labelKey: 'followUpFeelingSame',
    icon: 'remove-outline',
    ink: MUTED,
    fill: colors.page,
  },
  {
    id: 'worse',
    labelKey: 'followUpFeelingWorse',
    icon: 'sad-outline',
    ink: WARN,
    fill: WARN_FILL,
  },
  {
    id: 'returned',
    labelKey: 'followUpFeelingReturned',
    icon: 'alert-circle-outline',
    ink: DANGER,
    fill: DANGER_FILL,
  },
];

export function FollowUpPlanView({
  onOrderMedicines,
  ...vm
}: FollowUpPlanViewModel & { onOrderMedicines?: () => void }) {
  const insets = useSafeAreaInsets();
  const prescription = usePrescriptionController({
    onBack: vm.onClosePrescription,
    onOrder: () => {
      vm.onClosePrescription();
      onOrderMedicines?.();
    },
  });
  const consultationRecord = useConsultationRecordController({
    onBack: vm.onCloseConsultationNote,
    onOpenPrescription: () => {
      vm.onCloseConsultationNote();
      vm.onOpenPrescription();
    },
    onOpenFollowUp: vm.onCloseConsultationNote,
  });

  return (
    <View style={styles.root}>
      <SafeAreaModal
        visible={vm.prescriptionOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={vm.onClosePrescription}
      >
        <PrescriptionView {...prescription} />
      </SafeAreaModal>
      <SafeAreaModal
        visible={vm.consultationNoteOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={vm.onCloseConsultationNote}
      >
        <ConsultationRecordView {...consultationRecord} />
      </SafeAreaModal>

      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={INK}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('followUpTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onToggleReminders}
            style={styles.remindersHit}
          >
            <View>
              <Ionicons
                name={vm.remindersOn ? 'notifications' : 'notifications-outline'}
                size={22}
                color={ACTION}
              />
              {vm.remindersOn ? <View style={styles.bellDot} /> : null}
            </View>
            <AppText variant="labelSm" color={MUTED}>
              {vm.t(vm.remindersOn ? 'followUpRemindersOn' : 'followUpRemindersOff')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingBottom: sheetBottomPadding(insets, spacing.xl) },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.planRow}>
            <View style={styles.flex}>
              <AppText variant="titleMd" color={INK}>
                {vm.doctorPlanLine}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.createdLine}
              </AppText>
              <AppText variant="bodyMd" color={INK} weightOverride="600">
                {vm.patientLine}
              </AppText>
            </View>
            <ProgressRing
              progress={vm.progress}
              doneLabel={vm.t('followUpProgressDone')
                .replace('{done}', String(vm.doneCount))
                .replace('{total}', String(vm.totalCount))}
              doneCaption={vm.t('followUpProgressCaption')}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.reviewTop}>
            <View style={styles.reviewLeft}>
              <View style={styles.calendarBubble}>
                <Ionicons name="calendar-outline" size={20} color={ACTION} />
              </View>
              <View>
                <AppText variant="labelSm" color={MUTED} style={styles.caps}>
                  {vm.t('followUpNextReview')}
                </AppText>
                <AppText variant="titleMd" color={INK}>
                  {vm.nextReviewDate}
                </AppText>
              </View>
            </View>
            <View style={styles.inDaysPill}>
              <AppText variant="labelSm" color={ACTION} weightOverride="600">
                {vm.nextReviewIn}
              </AppText>
            </View>
          </View>
          <AppButton label={vm.t('followUpBook')} onPress={vm.onBookFollowUp} />
          <AppButton
            label={vm.t('followUpReschedule')}
            variant="secondary"
            onPress={vm.onRescheduleReminder}
          />
        </View>

        <View style={styles.card}>
          <AppText variant="titleMd" color={INK}>
            {vm.t('followUpFeelingTitle')}
          </AppText>
          <View style={styles.feelingGrid}>
            {FEELINGS.map((item) => {
              const selected = vm.feeling === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => vm.onSelectFeeling(item.id)}
                  style={[
                    styles.feelingCard,
                    { backgroundColor: item.fill },
                    selected && styles.feelingSelected,
                  ]}
                >
                  {selected ? (
                    <View style={styles.feelingCheck}>
                      <Ionicons name="checkmark" size={12} color={colors.onButton} />
                    </View>
                  ) : null}
                  <Ionicons name={item.icon} size={28} color={item.ink} />
                  <AppText
                    variant="labelSm"
                    color={item.ink}
                    weightOverride="600"
                    style={styles.center}
                  >
                    {vm.t(item.labelKey)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={vm.notes}
            onChangeText={vm.onChangeNotes}
            placeholder={vm.t('followUpNotesPlaceholder')}
            placeholderTextColor={PLACEHOLDER}
            multiline
            textAlignVertical="top"
            style={[
              styles.notes,
              { fontFamily: fontFamilyFor('400', vm.language, 'sans') },
            ]}
          />
          <View style={styles.responseRow}>
            <View style={styles.doctorSees}>
              <Ionicons name="eye-outline" size={14} color={MUTED} />
              <AppText variant="labelSm" color={MUTED} style={styles.flex}>
                {vm.t('followUpDoctorSees')}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onRecordResponse}
              style={styles.recordBtn}
            >
              <AppText variant="labelMd" color={colors.onButton} weightOverride="600">
                {vm.responseRecorded
                  ? vm.t('followUpResponseSaved')
                  : vm.t('followUpRecordResponse')}
              </AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="titleMd" color={INK}>
            {vm.t('followUpTasks')}
          </AppText>
          {vm.tasks.map((task, index) => (
            <View
              key={task.id}
              style={[
                styles.taskRow,
                index < vm.tasks.length - 1 && styles.taskBorder,
              ]}
            >
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.done }}
                onPress={() => vm.onToggleTask(task.id)}
                style={[styles.checkbox, task.done && styles.checkboxOn]}
              >
                {task.done ? (
                  <Ionicons name="checkmark" size={14} color={colors.onButton} />
                ) : null}
              </Pressable>
              <View style={styles.flex}>
                <AppText variant="bodyMd" color={INK} weightOverride="600">
                  {vm.t(task.titleKey)}
                </AppText>
                <View style={styles.taskMeta}>
                  <AppText variant="labelSm" color={MUTED}>
                    {vm.t(task.metaKey)}
                  </AppText>
                  {task.badgeKey && task.badgeTone ? (
                    <View
                      style={[
                        styles.taskBadge,
                        { backgroundColor: badgeFill(task.badgeTone) },
                      ]}
                    >
                      <AppText
                        variant="labelSm"
                        color={badgeInk(task.badgeTone)}
                        weightOverride="600"
                      >
                        {vm.t(task.badgeKey)}
                      </AppText>
                    </View>
                  ) : null}
                  {task.uploadAction ? (
                    <Pressable onPress={vm.onUploadPhoto}>
                      <AppText variant="labelMd" color={ACTION} weightOverride="600">
                        {vm.t('followUpUpload')}
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        <AppText variant="labelSm" color={MUTED} style={styles.linkedLabel}>
          {vm.t('followUpLinked')}
        </AppText>
        <LinkedRow
          icon="medical-outline"
          title={vm.t('followUpLinkedRx')}
          meta={vm.t('followUpLinkedRxMeta')}
          onPress={vm.onOpenPrescription}
        />
        <LinkedRow
          icon="document-text-outline"
          title={vm.t('followUpLinkedNote')}
          meta={vm.t('followUpLinkedNoteMeta')}
          onPress={vm.onOpenConsultationNote}
        />
        <LinkedRow
          icon="book-outline"
          title={vm.t('followUpLinkedDiary')}
          meta={vm.t('followUpLinkedDiaryMeta')}
          onPress={vm.onOpenDiary}
        />
      </ScrollView>
    </View>
  );
}

function ProgressRing({
  progress,
  doneLabel,
  doneCaption,
}: {
  progress: number;
  doneLabel: string;
  doneCaption: string;
}) {
  const size = 64;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={HAIRLINE}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ACTION}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <AppText variant="labelSm" color={ACTION} weightOverride="600">
          {doneLabel}
        </AppText>
        <AppText variant="labelSm" color={MUTED}>
          {doneCaption}
        </AppText>
      </View>
    </View>
  );
}

function LinkedRow({
  icon,
  title,
  meta,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.linkedCard}>
      <View style={styles.linkedIcon}>
        <Ionicons name={icon} size={18} color={ACTION} />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyMd" color={INK} weightOverride="600">
          {title}
        </AppText>
        <AppText variant="labelSm" color={MUTED}>
          {meta}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={MUTED} />
    </Pressable>
  );
}

function badgeFill(tone: FollowUpTaskBadgeTone): string {
  if (tone === 'success') return SUCCESS_FILL;
  if (tone === 'danger') return DANGER_FILL;
  if (tone === 'warn') return WARN_FILL;
  return colors.page;
}

function badgeInk(tone: FollowUpTaskBadgeTone): string {
  if (tone === 'success') return SUCCESS;
  if (tone === 'danger') return DANGER;
  if (tone === 'warn') return WARN;
  return MUTED;
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindersHit: {
    minWidth: 72,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: ACTION,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ringWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  calendarBubble: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caps: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inDaysPill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.page,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  feelingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  feelingCard: {
    width: '48%',
    flexGrow: 1,
    minHeight: 96,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  feelingSelected: {
    borderWidth: 2,
    borderColor: ACTION,
  },
  feelingCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notes: {
    minHeight: 88,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.page,
    padding: spacing.md,
    fontSize: 14,
    color: INK,
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  doctorSees: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordBtn: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
    backgroundColor: colors.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  taskBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: ACTION,
    borderColor: ACTION,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  taskBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  linkedLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: layout.listRowMinHeight,
  },
  linkedIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
});
