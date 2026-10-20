import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import {
  RESCHEDULE_REASONS,
  type AppointmentDetailViewModel,
} from '../controllers/useAppointmentDetailController';
import type { TimeSlot } from '../config/appointmentSlots';
import { WEEKDAY_KEYS } from '../config/appointmentSlots';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';

const FILL = colors.surfaceVariant;
const ICON_BLUE = colors.primary;
const AMBER = colors.warning;
const AMBER_FILL = colors.warningContainer;
const AMBER_BORDER = colors.tertiaryContainer;

export function RescheduleAppointmentView(vm: AppointmentDetailViewModel) {
  const insets = useSafeAreaInsets();
  const selectedDay = vm.selectedRescheduleDay;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('back')}
          onPress={vm.onCloseReschedule}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <AppText variant="headlineMd" color={colors.ink} style={styles.title}>
          {vm.t('rescheduleTitle')}
        </AppText>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 140 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.card}>
          <AppText variant="labelSm" color={colors.muted} style={styles.overline}>
            {vm.t('rescheduleCurrent')}
          </AppText>
          <View style={styles.currentRow}>
            <Ionicons name="calendar" size={18} color={ICON_BLUE} />
            <AppText variant="bodyLg" color={colors.muted} style={styles.strike}>
              {vm.currentAppointmentLine}
            </AppText>
          </View>
        </View>

        <View style={styles.policy}>
          <Ionicons name="information-circle" size={20} color={AMBER} />
          <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
            {vm.reschedulePolicy}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="titleMd" color={colors.ink}>
            {vm.t('rescheduleSelectTime')}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {vm.rescheduleDays.map((day) => {
              const selected = day.id === selectedDay?.id;
              const disabled = day.status === 'closed' || day.status === 'full';
              return (
                <Pressable
                  key={day.id}
                  disabled={disabled}
                  onPress={() => vm.onSelectRescheduleDay(day.id)}
                  style={[
                    styles.dateChip,
                    selected && styles.dateChipSelected,
                    disabled && styles.dateChipDisabled,
                  ]}
                >
                  <AppText
                    variant="labelSm"
                    color={disabled ? colors.muted : selected ? colors.ink : colors.muted}
                    style={styles.dateWeek}
                  >
                    {vm.t(WEEKDAY_KEYS[day.weekdayIndex])}
                  </AppText>
                  <AppText
                    variant="titleMd"
                    color={disabled ? colors.muted : colors.ink}
                  >
                    {day.dayLabel}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedDay ? (
            <>
              <SlotRow
                title={vm.t('rescheduleMorning')}
                slots={selectedDay.morning}
                selectedId={vm.selectedRescheduleSlotId}
                busySlotId={vm.busySlotId}
                t={vm.t}
                onSelect={vm.onSelectRescheduleSlot}
              />
              <SlotRow
                title={vm.t('rescheduleAfternoon')}
                slots={selectedDay.afternoon}
                selectedId={vm.selectedRescheduleSlotId}
                busySlotId={vm.busySlotId}
                t={vm.t}
                onSelect={vm.onSelectRescheduleSlot}
              />
              {selectedDay.evening.length ? (
                <SlotRow
                  title={vm.t('rescheduleEvening')}
                  slots={selectedDay.evening}
                  selectedId={vm.selectedRescheduleSlotId}
                  busySlotId={vm.busySlotId}
                  t={vm.t}
                  onSelect={vm.onSelectRescheduleSlot}
                />
              ) : null}
            </>
          ) : null}
        </View>

        <View style={styles.reasonBlock}>
          <AppText variant="titleMd" color={colors.ink}>
            {vm.t('rescheduleWhy')}
            <AppText variant="titleMd" color={colors.error}>
              {' *'}
            </AppText>
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={
              vm.rescheduleReasonOpen
                ? vm.onCloseRescheduleReason
                : vm.onOpenRescheduleReason
            }
            style={styles.reasonField}
          >
            <AppText
              variant="bodyLg"
              color={vm.rescheduleReasonLabel ? colors.ink : colors.muted}
              style={styles.flex}
            >
              {vm.rescheduleReasonLabel || vm.t('rescheduleReasonPlaceholder')}
            </AppText>
            <Ionicons
              name={vm.rescheduleReasonOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
          {vm.rescheduleReasonOpen ? (
            <View style={styles.dropdown}>
              {RESCHEDULE_REASONS.map((item) => {
                const selected = item.id === vm.rescheduleReason;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => vm.onSelectRescheduleReason(item.id)}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <AppText variant="bodyMd" color={colors.ink}>
                      {vm.t(item.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {vm.rescheduleReason === 'other' ? (
            <TextInput
              value={vm.rescheduleNote}
              onChangeText={vm.onChangeRescheduleNote}
              placeholder={vm.t('rescheduleSpecify')}
              placeholderTextColor={colors.muted}
              multiline
              style={[
                styles.note,
                { fontFamily: fontFamilyFor('400', vm.language, 'sans') },
              ]}
            />
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: sheetBottomPadding(insets, spacing.md) }]}>
        <View style={styles.summary}>
          <AppText variant="bodyLg" color={colors.muted} style={styles.strike}>
            {vm.currentShortWhen}
          </AppText>
          <Ionicons name="arrow-forward" size={18} color={ICON_BLUE} />
          <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
            {vm.nextShortWhen || '—'}
          </AppText>
        </View>
        {vm.rescheduleError ? (
          <AppText variant="bodyMd" color={colors.error} raw>
            {vm.rescheduleError}
          </AppText>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={!vm.canConfirmReschedule}
          onPress={vm.onConfirmReschedule}
          style={({ pressed }) => [
            styles.confirm,
            !vm.canConfirmReschedule && styles.disabled,
            pressed && vm.canConfirmReschedule && styles.pressed,
          ]}
        >
          <AppText variant="titleMd" color={colors.card}>
            {vm.t('rescheduleConfirm')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function SlotRow({
  title,
  slots,
  selectedId,
  busySlotId,
  t,
  onSelect,
}: {
  title: string;
  slots: TimeSlot[];
  selectedId: string | null;
  busySlotId: string;
  t: AppointmentDetailViewModel['t'];
  onSelect: (id: string) => void;
}) {
  if (!slots.length) {
    return null;
  }
  return (
    <View style={styles.slotBlock}>
      <AppText variant="labelSm" color={colors.muted} style={styles.overline}>
        {title}
      </AppText>
      <View style={styles.slotGrid}>
        {slots.map((slot) => {
          const taken = Boolean(slot.booked) || slot.id === busySlotId;
          const selected = slot.id === selectedId && !taken;
          return (
            <Pressable
              key={slot.id}
              disabled={taken}
              onPress={() => onSelect(slot.id)}
              style={[
                styles.slot,
                selected && styles.slotSelected,
                taken && styles.slotTaken,
              ]}
            >
              <AppText
                variant="bodyMd"
                color={taken ? colors.muted : selected ? colors.card : colors.ink}
                weightOverride={selected ? '600' : '400'}
                style={taken ? styles.strike : undefined}
              >
                {t(slot.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
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
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'left',
  },
  body: {
    padding: spacing.md,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 12,
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strike: {
    textDecorationLine: 'line-through',
    flexShrink: 1,
  },
  policy: {
    backgroundColor: AMBER_FILL,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.sm,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dateRow: {
    gap: 8,
  },
  dateChip: {
    width: 64,
    height: 80,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dateChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: ICON_BLUE,
    borderWidth: 1.5,
  },
  dateChipDisabled: {
    backgroundColor: FILL,
  },
  dateWeek: {
    textTransform: 'uppercase',
  },
  slotBlock: {
    gap: 8,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    minWidth: '30%',
    flexGrow: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotTaken: {
    backgroundColor: FILL,
  },
  reasonBlock: {
    gap: 8,
    paddingBottom: spacing.md,
  },
  reasonField: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  option: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primaryContainer,
  },
  note: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 12,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirm: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
});
