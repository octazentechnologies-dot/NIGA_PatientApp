import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { AppButton } from '../components/AppButton';
import { AppSwitch } from '../components/AppSwitch';
import { AppText } from '../components/AppText';
import type {
  ReminderCategoryId,
  ReminderFrequencyId,
  ReminderSnoozeId,
  ReminderWeekdayId,
  RemindersCentreViewModel,
} from '../controllers/useRemindersCentreController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const CHART = '#3AA9E0';
const CHIP_FILL = '#E6F5FE';
const ERROR = '#BA1A1A';
const ASTRO = '#6B3FA0';
const ASTRO_FILL = '#F3EEFA';
const FIELD_BORDER = '#8A8A8A';
const OUTLINE_ACTION = '#276F93';

const CATEGORIES: {
  id: ReminderCategoryId;
  labelKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
  wide?: boolean;
}[] = [
  { id: 'medicine', labelKey: 'remCatMedicine', icon: 'medkit-outline' },
  { id: 'diary', labelKey: 'remCatDiary', icon: 'book-outline' },
  { id: 'pain', labelKey: 'remCatPain', icon: 'body-outline' },
  { id: 'appt', labelKey: 'remCatAppt', icon: 'calendar-outline' },
  { id: 'water', labelKey: 'remCatWater', icon: 'water-outline' },
  { id: 'sleep', labelKey: 'remCatSleep', icon: 'moon-outline' },
  { id: 'custom', labelKey: 'remCatCustom', icon: 'add-circle-outline', wide: true },
];

const FREQUENCIES: { id: ReminderFrequencyId; labelKey: TranslationKey }[] = [
  { id: 'once', labelKey: 'remFreqOnce' },
  { id: 'daily', labelKey: 'remFreqDaily' },
  { id: 'specific', labelKey: 'remFreqSpecific' },
  { id: 'weekly', labelKey: 'remFreqWeekly' },
  { id: 'monthly', labelKey: 'remFreqMonthly' },
];

const WEEKDAYS: { id: ReminderWeekdayId; labelKey: TranslationKey }[] = [
  { id: 'm', labelKey: 'remDayM' },
  { id: 't', labelKey: 'remDayT' },
  { id: 'w', labelKey: 'remDayW' },
  { id: 't2', labelKey: 'remDayT2' },
  { id: 'f', labelKey: 'remDayF' },
  { id: 's', labelKey: 'remDayS' },
  { id: 's2', labelKey: 'remDayS2' },
];

const SNOOZES: { id: ReminderSnoozeId; labelKey: TranslationKey }[] = [
  { id: '5', labelKey: 'remSnooze5' },
  { id: '10', labelKey: 'remSnooze10' },
  { id: '30', labelKey: 'remSnooze30' },
];

export function RemindersCentreView(vm: RemindersCentreViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={22} color={INK} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={INK}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('remTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenMemberPicker}
            style={styles.memberChip}
          >
            <AppText variant="labelSm" color={INK} weightOverride="600">
              {vm.memberLabel}
            </AppText>
            <Ionicons name="chevron-down" size={16} color={MUTED} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('remSettingsTitle')}
            onPress={vm.onOpenSettings}
            style={styles.iconHit}
          >
            <Ionicons name="settings-outline" size={22} color={INK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              100 + sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        {vm.isEmpty ? <EmptyState vm={vm} /> : <FilledState vm={vm} />}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={vm.onAddReminder}
        style={[
          styles.fab,
          { bottom: 24 + Math.max(insets.bottom - 8, 0) },
        ]}
      >
        <Ionicons name="add" size={20} color={colors.onButton} />
        <AppText variant="labelSm" color={colors.onButton} weightOverride="600">
          {vm.t('remAddOwn')}
        </AppText>
      </Pressable>

      <MemberPickerSheet vm={vm} />
      <EditReminderSheet vm={vm} />
    </View>
  );
}

function EmptyState({ vm }: { vm: RemindersCentreViewModel }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name="checkmark-circle" size={48} color={CHART} />
      </View>
      <AppText variant="headlineMd" color={INK} style={styles.center}>
        {vm.t('remEmptyTitle')}
      </AppText>
      <AppText variant="bodyMd" color={MUTED} style={styles.center}>
        {vm.t('remEmptyBody')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={vm.onViewPastReminders}
        style={styles.outlineBtn}
      >
        <Ionicons name="refresh-outline" size={18} color={OUTLINE_ACTION} />
        <AppText variant="labelLg" color={OUTLINE_ACTION} weightOverride="600">
          {vm.t('remViewPast')}
        </AppText>
      </Pressable>
    </View>
  );
}

function FilledState({ vm }: { vm: RemindersCentreViewModel }) {
  const circumference = 2 * Math.PI * 20;
  const progress = vm.todayTotal === 0 ? 0 : vm.todayDone / vm.todayTotal;
  const offset = circumference * (1 - progress);

  return (
    <>
      <View style={styles.progressCard}>
        <View style={styles.flex}>
          <AppText variant="titleMd" color={INK}>
            {vm.t('remTodayProgress')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.progressLabel}
          </AppText>
        </View>
        <View style={styles.ringWrap}>
          <Svg width={56} height={56} viewBox="0 0 48 48">
            <Circle
              cx={24}
              cy={24}
              r={20}
              fill="none"
              stroke={HAIRLINE}
              strokeWidth={4}
            />
            <Circle
              cx={24}
              cy={24}
              r={20}
              fill="none"
              stroke={CHART}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={offset}
              rotation="-90"
              origin="24, 24"
            />
          </Svg>
          <View style={styles.ringLabel}>
            <AppText variant="labelSm" color={INK} weightOverride="600">
              {vm.todayDone}/{vm.todayTotal}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="medkit" size={20} color={INK} />
          <AppText variant="titleMd" color={INK}>
            {vm.t('remFromDoctor')}
          </AppText>
        </View>
        <AppText variant="labelSm" color={MUTED}>
          {vm.t('remFromDoctorHint')}
        </AppText>
      </View>

      <View style={styles.listCard}>
        {vm.doctorItems.map((item, index) => {
          const last = index === vm.doctorItems.length - 1;
          if (item.kind === 'done') {
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => vm.onEditMedicineReminder(item.id)}
                style={[styles.listRow, !last && styles.listRowBorder]}
              >
                <View style={styles.flex}>
                  <AppText
                    variant="bodyLg"
                    color={INK}
                    style={item.done ? styles.struck : undefined}
                  >
                    {vm.t(item.titleKey)}
                  </AppText>
                  <AppText
                    variant="bodyMd"
                    color={MUTED}
                    style={item.done ? styles.struckMuted : undefined}
                  >
                    {vm.t(item.detailKey)}
                  </AppText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => vm.onMarkMedicineDone(item.id)}
                  style={styles.iconHitSm}
                >
                  <Ionicons
                    name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color={ACTION}
                  />
                </Pressable>
              </Pressable>
            );
          }
          if (item.kind === 'toggle') {
            return (
              <View
                key={item.id}
                style={[styles.listRow, !last && styles.listRowBorder]}
              >
                <View style={styles.flex}>
                  <AppText variant="bodyLg" color={INK}>
                    {vm.t(item.titleKey)}
                  </AppText>
                  <AppText variant="bodyMd" color={MUTED}>
                    {vm.t(item.detailKey)}
                  </AppText>
                </View>
                <AppSwitch
                  value={Boolean(item.enabled)}
                  onValueChange={() => vm.onToggleDoctorItem(item.id)}
                />
              </View>
            );
          }
          if (item.kind === 'action') {
            return (
              <View
                key={item.id}
                style={[styles.actionBlock, !last && styles.listRowBorder]}
              >
                <AppText variant="bodyLg" color={INK}>
                  {vm.t(item.titleKey)}
                </AppText>
                <View style={styles.warnRow}>
                  <Ionicons name="warning" size={16} color={ERROR} />
                  <AppText variant="bodyMd" color={ERROR}>
                    {vm.t(item.detailKey)}
                  </AppText>
                </View>
                <AppButton
                  label={vm.t('remBookConsultation')}
                  onPress={vm.onBookConsultation}
                />
              </View>
            );
          }
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={vm.onOpenPainPoints}
              style={[styles.listRow, !last && styles.listRowBorder]}
            >
              <View style={styles.flex}>
                <AppText variant="bodyLg" color={INK}>
                  {vm.t(item.titleKey)}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t(item.detailKey)}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={22} color={MUTED} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHead}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="leaf" size={20} color={ASTRO} />
          <AppText variant="titleMd" color={ASTRO}>
            {vm.t('remAstroTitle')}
          </AppText>
          <View style={styles.nonClinicalPill}>
            <AppText variant="labelSm" color={ASTRO} weightOverride="600">
              {vm.t('remNonClinical')}
            </AppText>
          </View>
        </View>
        <View style={styles.astroStrip}>
          <AppText variant="labelSm" color={ASTRO}>
            {vm.t('remAstroStrip')}
          </AppText>
        </View>
        <AppText variant="labelSm" color={MUTED}>
          {vm.t('remAstroHint')}
        </AppText>
      </View>

      <View style={styles.listCard}>
        {vm.selfCareItems.map((item, index) => {
          const last = index === vm.selfCareItems.length - 1;
          if (item.kind === 'info') {
            return (
              <View
                key={item.id}
                style={[styles.listRow, !last && styles.listRowBorder]}
              >
                <View style={styles.flex}>
                  <AppText variant="bodyLg" color={INK}>
                    {vm.t(item.titleKey)}
                  </AppText>
                  <AppText variant="bodyMd" color={ASTRO} weightOverride="600">
                    {vm.t(item.detailKey)}
                  </AppText>
                </View>
                <View style={styles.astroIconBubble}>
                  <Ionicons name="calendar" size={20} color={ASTRO} />
                </View>
              </View>
            );
          }
          return (
            <View
              key={item.id}
              style={[styles.listRow, !last && styles.listRowBorder]}
            >
              <View style={styles.flex}>
                <AppText variant="bodyLg" color={INK}>
                  {vm.t(item.titleKey)}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t(item.detailKey)}
                </AppText>
              </View>
              <AppSwitch
                value={Boolean(item.enabled)}
                onValueChange={() => vm.onToggleSelfCareItem(item.id)}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.quietCard}>
        <View style={styles.flex}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="moon" size={20} color={INK} />
            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm.t('remQuietHours')}
            </AppText>
          </View>
          <View style={styles.quietRange}>
            <AppText variant="bodyMd" color={INK} weightOverride="600">
              {vm.quietHoursRange}
            </AppText>
          </View>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('remQuietHint')}
          </AppText>
        </View>
        <AppSwitch
          value={vm.quietHoursOn}
          onValueChange={vm.onToggleQuietHours}
        />
      </View>
    </>
  );
}

function MemberPickerSheet({ vm }: { vm: RemindersCentreViewModel }) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={vm.memberPickerOpen}
      onRequestClose={vm.onCloseMemberPicker}
    >
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetScrim} onPress={vm.onCloseMemberPicker} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <AppText variant="titleMd" color={INK} style={styles.sheetTitle}>
            {vm.t('remShowingFor')}
          </AppText>
          {vm.members.map((member) => {
            const selected = member.id === vm.memberId;
            return (
              <Pressable
                key={member.id}
                accessibilityRole="button"
                onPress={() => vm.onSelectMember(member.id)}
                style={styles.sheetRow}
              >
                <AppText
                  variant="bodyLg"
                  color={INK}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.flex}
                >
                  {member.label}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={20} color={ACTION} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaModal>
  );
}

function EditReminderSheet({ vm }: { vm: RemindersCentreViewModel }) {
  const insets = useSafeAreaInsets();
  const isEdit = vm.editorMode === 'edit';

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={vm.editorOpen}
      onRequestClose={vm.onCloseEditor}
    >
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetScrim} onPress={vm.onCloseEditor} />
        <View
          style={[
            styles.editorSheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.md) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.editorHeader}>
            <AppText variant="headlineMd" color={INK} style={styles.flex}>
              {vm.t(isEdit ? 'remEditorEditTitle' : 'remEditorAddTitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('close')}
              onPress={vm.onCloseEditor}
              style={styles.iconHit}
            >
              <Ionicons name="close" size={22} color={INK} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.editorBody}
          >
            {isEdit ? (
              <View style={styles.linkedCard}>
                <View style={styles.linkedHead}>
                  <View style={styles.linkedIcon}>
                    <Ionicons name="medkit" size={22} color={ACTION} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="titleMd" color={INK}>
                      {vm.t('remLinkedTo').replace('{name}', vm.linkedMedicineName)}
                    </AppText>
                    <AppText variant="bodyMd" color={MUTED}>
                      {vm.linkedRxId}
                    </AppText>
                  </View>
                </View>
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={16} color={MUTED} />
                  <AppText variant="labelSm" color={MUTED} style={styles.flex}>
                    {vm.t('remLinkedNote')}
                  </AppText>
                </View>
              </View>
            ) : null}

            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm.t('remWhatFor')}
            </AppText>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => {
                const on = cat.id === vm.editorCategory;
                return (
                  <Pressable
                    key={cat.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => vm.onSelectCategory(cat.id)}
                    style={[
                      styles.catCell,
                      cat.wide && styles.catWide,
                      on && styles.catCellOn,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={22}
                      color={on ? ACTION : MUTED}
                    />
                    <AppText
                      variant="labelSm"
                      color={INK}
                      weightOverride={on ? '600' : '500'}
                      style={styles.center}
                    >
                      {vm.t(cat.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.field}>
              <AppText variant="labelSm" color={MUTED} style={styles.fieldLabel}>
                {vm.t('remFieldTitle')}
              </AppText>
              <TextInput
                value={vm.editorTitle}
                onChangeText={vm.onChangeTitle}
                placeholder={vm.t('remFieldTitle')}
                placeholderTextColor={MUTED}
                style={styles.input}
              />
            </View>

            <AppText variant="titleMd" color={INK}>
              {vm.t('remWhen')}
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.freqRow}
            >
              {FREQUENCIES.map((freq) => {
                const on = freq.id === vm.editorFrequency;
                return (
                  <Pressable
                    key={freq.id}
                    accessibilityRole="button"
                    onPress={() => vm.onSelectFrequency(freq.id)}
                    style={[styles.freqChip, on && styles.freqChipOn]}
                  >
                    <AppText
                      variant="labelSm"
                      color={on ? INK : MUTED}
                      weightOverride={on ? '600' : '500'}
                    >
                      {vm.t(freq.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.dayRow}>
              {WEEKDAYS.map((day) => {
                const on = vm.editorDays.includes(day.id);
                return (
                  <Pressable
                    key={day.id}
                    accessibilityRole="button"
                    onPress={() => vm.onToggleDay(day.id)}
                    style={[styles.dayChip, on && styles.dayChipOn]}
                  >
                    <AppText
                      variant="labelSm"
                      color={on ? INK : MUTED}
                      weightOverride={on ? '600' : '500'}
                    >
                      {vm.t(day.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('remTimes')}
            </AppText>
            <View style={styles.timesRow}>
              {vm.editorTimes.map((time) => (
                <View key={time} style={styles.timeChip}>
                  <AppText variant="bodyMd" color={INK}>
                    {time}
                  </AppText>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => vm.onRemoveTime(time)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={16} color={MUTED} />
                  </Pressable>
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={vm.onAddTime}
                style={styles.addTimeChip}
              >
                <Ionicons name="add" size={18} color={ACTION} />
                <AppText variant="labelSm" color={ACTION} weightOverride="600">
                  {vm.t('remAddTime')}
                </AppText>
              </Pressable>
            </View>

            <View style={styles.divider} />

            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm.t('remNotifyBy')}
            </AppText>
            <NotifyRow
              icon="notifications-outline"
              label={vm.t('remNotifyPush')}
              value={vm.editorNotifyPush}
              onToggle={vm.onToggleNotifyPush}
            />
            <NotifyRow
              icon="chatbubble-ellipses-outline"
              label={vm.t('remNotifySms')}
              value={vm.editorNotifySms}
              onToggle={vm.onToggleNotifySms}
            />
            <NotifyRow
              icon="logo-whatsapp"
              label={vm.t('remNotifyWhatsApp')}
              value={vm.editorNotifyWhatsApp}
              onToggle={vm.onToggleNotifyWhatsApp}
            />

            <View style={styles.snoozeHead}>
              <AppText variant="bodyLg" color={INK} weightOverride="600">
                {vm.t('remSnoozeAllowed')}
              </AppText>
              <AppSwitch
                value={vm.editorSnoozeOn}
                onValueChange={vm.onToggleSnooze}
              />
            </View>
            {vm.editorSnoozeOn ? (
              <View style={styles.snoozeRow}>
                {SNOOZES.map((item) => {
                  const on = item.id === vm.editorSnooze;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      onPress={() => vm.onSelectSnooze(item.id)}
                      style={[styles.snoozeChip, on && styles.snoozeChipOn]}
                    >
                      <AppText
                        variant="labelSm"
                        color={on ? INK : MUTED}
                        weightOverride={on ? '600' : '500'}
                      >
                        {vm.t(item.labelKey)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.field}>
              <AppText variant="labelSm" color={MUTED} style={styles.fieldLabel}>
                {vm.t('remNotes')}
              </AppText>
              <TextInput
                value={vm.editorNotes}
                onChangeText={vm.onChangeNotes}
                placeholder={vm.t('remNotes')}
                placeholderTextColor={MUTED}
                multiline
                style={[styles.input, styles.notesInput]}
              />
            </View>
          </ScrollView>

          <View style={styles.editorFooter}>
            <AppButton
              label={vm.t('remSave')}
              onPress={vm.onSaveReminder}
            />
          </View>
        </View>
      </View>
    </SafeAreaModal>
  );
}

function NotifyRow({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.notifyRow}>
      <View style={styles.notifyLabel}>
        <Ionicons name={icon} size={20} color={MUTED} />
        <AppText variant="bodyMd" color={INK}>
          {label}
        </AppText>
      </View>
      <AppSwitch value={value} onValueChange={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE,
  },
  header: {
    backgroundColor: CARD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
      textAlign: 'left',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHitSm: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberChip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: PAGE,
    marginRight: 2,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  progressCard: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ringWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  listCard: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    overflow: 'hidden',
  },
  listRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  struck: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  struckMuted: {
    opacity: 0.6,
  },
  actionBlock: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nonClinicalPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: ASTRO_FILL,
    borderWidth: 1,
    borderColor: ASTRO,
  },
  astroStrip: {
    backgroundColor: ASTRO_FILL,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  astroIconBubble: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: ASTRO_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quietCard: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  quietRange: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  emptyWrap: {
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  outlineBtn: {
    marginTop: spacing.md,
    minHeight: layout.buttonHeight,
    minWidth: 220,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: OUTLINE_ACTION,
    backgroundColor: CARD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radii.default,
    backgroundColor: ACTION,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 31, 31, 0.4)',
  },
  sheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    marginBottom: spacing.sm,
  },
  sheetRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editorSheet: {
    maxHeight: '92%',
    backgroundColor: CARD,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    borderTopWidth: 1,
    borderColor: HAIRLINE,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
    paddingBottom: spacing.sm,
  },
  editorBody: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  editorFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    padding: spacing.lg,
    backgroundColor: CARD,
  },
  linkedCard: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    padding: spacing.md,
    gap: spacing.sm,
  },
  linkedHead: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  linkedIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catCell: {
    width: '23%',
    flexGrow: 1,
    minHeight: 72,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: 4,
  },
  catWide: {
    width: '47%',
  },
  catCellOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHART,
  },
  field: {
    position: 'relative',
  },
  fieldLabel: {
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: INK,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  freqRow: {
    gap: spacing.sm,
  },
  freqChip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqChipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHART,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    minWidth: 40,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHART,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  timeChip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    backgroundColor: CARD,
  },
  addTimeChip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.default,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ACTION,
    backgroundColor: CARD,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HAIRLINE,
  },
  notifyRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
  },
  notifyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  snoozeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snoozeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  snoozeChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeChipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHART,
  },
});
