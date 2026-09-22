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
import { DatePickerSheet } from '../components/DatePickerSheet';
import { WhoForMemberSheet } from '../components/WhoForMemberSheet';
import { images } from '../config/images';
import type {
  DiarySeverity,
  SymptomDiaryViewModel,
} from '../controllers/useSymptomDiaryController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { SymptomDiaryEntryView } from './SymptomDiaryEntryView';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';

export function SymptomDiaryView(vm: SymptomDiaryViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <SafeAreaModal
        visible={vm.entryOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={vm.onCloseEntry}
      >
        <SymptomDiaryEntryView {...vm} />
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
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle} numberOfLines={1}>
            {vm.t('diaryTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('diaryTitle')}
            onPress={vm.onOpenCalendar}
            style={styles.iconHit}
          >
            <Ionicons name="calendar-outline" size={22} color={INK} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenMemberPicker}
            style={styles.memberChip}
          >
            <AppText variant="labelSm" color={MUTED}>
              {vm.memberLabel}
            </AppText>
            <Ionicons name="chevron-down" size={16} color={MUTED} />
          </Pressable>
        </View>
      </View>

      {vm.isEmptyDay ? (
        <View style={styles.flexCol}>
          <View style={styles.dayStripPad}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayStrip}
            >
              {vm.days.map((day) => {
                const selected = day.id === vm.selectedDayId;
                return (
                  <Pressable
                    key={day.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => vm.onSelectDay(day.id)}
                    style={styles.dayItem}
                  >
                    <AppText variant="labelSm" color={MUTED}>
                      {vm.t(day.weekdayKey)}
                    </AppText>
                    <View style={[styles.dayCircle, selected && styles.dayCircleOn]}>
                      <AppText
                        variant="bodyMd"
                        color={selected ? colors.onButton : INK}
                        weightOverride="600"
                      >
                        {day.dateLabel}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <EmptyDiary
            title={vm.t('diaryEmptyTitle')}
            body={vm.t('diaryEmptyBody')}
            cta={vm.t('diaryAddFirst')}
            secure={vm.t('diarySecureShared')}
            onAdd={vm.onOpenEntry}
            bottomInset={insets.bottom}
          />
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.body,
              { paddingBottom: 100 + sheetBottomPadding(insets, spacing.md) },
            ]}
          >
            <View style={styles.streakCard}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={26} color={WARN} />
              </View>
              <View style={styles.flex}>
                <AppText variant="titleMd" color={INK}>
                  {vm.t('diaryStreakTitle')}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t('diaryStreakBody')}
                </AppText>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayStrip}
            >
              {vm.days.map((day) => {
                const selected = day.id === vm.selectedDayId;
                return (
                  <Pressable
                    key={day.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => vm.onSelectDay(day.id)}
                    style={styles.dayItem}
                  >
                    <AppText variant="labelSm" color={MUTED}>
                      {vm.t(day.weekdayKey)}
                    </AppText>
                    <View style={[styles.dayCircle, selected && styles.dayCircleOn]}>
                      <AppText
                        variant="bodyMd"
                        color={selected ? colors.onButton : INK}
                        weightOverride="600"
                      >
                        {day.dateLabel}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {vm.entriesForDay.map((entry) => (
              <View key={entry.id} style={styles.section}>
                <AppText variant="labelSm" color={MUTED} style={styles.sectionLabel}>
                  {vm.t(entry.sectionKey)}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={vm.onOpenEntry}
                  style={styles.entryCard}
                >
                  <View style={styles.entryHead}>
                    <SeverityPill severity={entry.severity} t={vm.t} />
                    <Ionicons name="chevron-forward" size={20} color={MUTED} />
                  </View>
                  <AppText variant="bodyMd" color={INK}>
                    {entry.noteText
                      ? `"${entry.noteText}"`
                      : entry.noteKey
                        ? vm.t(entry.noteKey)
                        : ''}
                  </AppText>
                  {entry.hasPhotos ? (
                    <View style={styles.thumbs}>
                      <Image
                        source={images.categoryAllergy}
                        style={styles.thumb}
                        resizeMode="cover"
                      />
                      <Image
                        source={images.categorySkin}
                        style={styles.thumb}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenEntry}
            style={[
              styles.fab,
              { bottom: 24 + sheetBottomPadding(insets, spacing.sm) },
            ]}
          >
            <Ionicons name="add" size={22} color={colors.onButton} />
            <AppText variant="labelLg" color={colors.onButton} weightOverride="600">
              {vm.t('diaryAddEntry')}
            </AppText>
          </Pressable>
        </>
      )}

      <WhoForMemberSheet
        visible={vm.memberPickerOpen}
        members={vm.members}
        selectedMemberId={vm.memberId}
        t={vm.t}
        onClose={vm.onCloseMemberPicker}
        onSelectMember={vm.onSelectMember}
        onAddMember={vm.onAddMember}
      />

      <DatePickerSheet
        visible={vm.calendarOpen}
        value={vm.calendarValue}
        maximumDate={vm.calendarMaximumDate}
        minimumDate={vm.calendarMinimumDate}
        locale={vm.language === 'mr' ? 'mr-IN' : 'en-IN'}
        cancelLabel={vm.t('cancel')}
        doneLabel={vm.t('done')}
        onCancel={vm.onCloseCalendar}
        onConfirm={vm.onConfirmCalendarDate}
      />
    </View>
  );
}

function EmptyDiary({
  title,
  body,
  cta,
  secure,
  onAdd,
  bottomInset,
}: {
  title: string;
  body: string;
  cta: string;
  secure: string;
  onAdd: () => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.emptyWrap, { paddingBottom: 24 + bottomInset }]}>
      <View style={styles.emptyArt}>
        <Image
          source={images.diaryEmpty}
          style={styles.emptyImage}
          resizeMode="contain"
        />
      </View>
      <AppText variant="headlineMd" color={INK} style={styles.center}>
        {title}
      </AppText>
      <AppText variant="bodyMd" color={MUTED} style={styles.center}>
        {body}
      </AppText>
      <AppButton
        label={cta}
        onPress={onAdd}
        icon={<Ionicons name="add" size={20} color={colors.onButton} />}
        style={styles.emptyCta}
      />
      <View style={styles.secureRow}>
        <Ionicons name="shield-checkmark-outline" size={16} color={MUTED} />
        <AppText variant="labelSm" color={MUTED}>
          {secure}
        </AppText>
      </View>
    </View>
  );
}

function SeverityPill({
  severity,
  t,
}: {
  severity: DiarySeverity;
  t: SymptomDiaryViewModel['t'];
}) {
  const mild = severity === 'mild' || severity === 'none';
  return (
    <View
      style={[
        styles.sevPill,
        { backgroundColor: mild ? SUCCESS_FILL : WARN_FILL },
      ]}
    >
      <View
        style={[
          styles.sevDot,
          { backgroundColor: mild ? SUCCESS : WARN },
        ]}
      />
      <AppText
        variant="labelSm"
        color={mild ? SUCCESS : WARN}
        weightOverride="600"
      >
        {t(
          severity === 'mild'
            ? 'diarySeverityMild'
            : severity === 'moderate'
              ? 'diarySeverityModerate'
              : severity === 'severe'
                ? 'diarySeveritySevere'
                : severity === 'verySevere'
                  ? 'diarySeverityVerySevere'
                  : 'diarySeverityNone',
        )}
      </AppText>
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
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
  memberChip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.card,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  streakCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: WARN_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayStrip: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  dayItem: {
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 44,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleOn: {
    backgroundColor: ACTION,
    borderColor: ACTION,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: spacing.xs,
  },
  entryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  entryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sevPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  sevDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  thumbs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: HAIRLINE,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
    backgroundColor: colors.button,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyArt: {
    width: 200,
    height: 200,
    borderRadius: radii.default,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  emptyImage: {
    width: '100%',
    height: '100%',
  },
  emptyCta: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  flexCol: {
    flex: 1,
  },
  dayStripPad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
});
