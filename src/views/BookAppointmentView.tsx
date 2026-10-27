import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { WhoForMemberSheet } from '../components/WhoForMemberSheet';
import {
  MONTH_KEYS,
  WEEKDAY_KEYS,
  countOpenSlots,
  type BookingDay,
  type ConsultMode,
  type TimeSlot,
} from '../config/appointmentSlots';
import type { BookAppointmentViewModel } from '../controllers/useBookAppointmentController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';

const GREY_FILL = colors.surfaceVariant;
const AMBER_FILL = colors.warningContainer;
const AMBER = colors.warning;
const AMBER_BORDER = colors.tertiaryContainer;
const ICON_BLUE = colors.primary;

const MODES: { id: ConsultMode; icon: keyof typeof Ionicons.glyphMap; labelKey: TranslationKey }[] =
  [
    { id: 'video', icon: 'videocam-outline', labelKey: 'bookVideo' },
    // { id: 'audio', icon: 'call-outline', labelKey: 'bookAudio' },
    // { id: 'chat', icon: 'chatbubble-outline', labelKey: 'bookChat' },
    { id: 'clinic', icon: 'business-outline', labelKey: 'bookClinic' },
  ];

export function BookAppointmentView({
  t,
  profile,
  shortCredsKey,
  member,
  members,
  memberPickerOpen,
  monthPickerOpen,
  mode,
  days,
  selectedDay,
  selectedSlotId,
  monthLabel,
  monthOptions,
  selectedMonth,
  feeLabel,
  summaryLine,
  waitlistTitle,
  isFull,
  canContinue,
  slotsEmpty,
  slotsLoading,
  bookingError,
  onBack,
  onOpenMemberPicker,
  onCloseMemberPicker,
  onSelectMember,
  onOpenMonthPicker,
  onCloseMonthPicker,
  onSelectMonth,
  onSelectMode,
  onSelectDay,
  onSelectSlot,
  onContinue,
  onJoinWaitlist,
  onAddMember,
}: BookAppointmentViewModel) {
  const insets = useSafeAreaInsets();
  // Live inset only — avoid AOSP 48dp fallback that leaves a large empty band under the CTA.
  const footerBottomPad = Math.max(insets.bottom, spacing.sm);
  const footerReserve = 128 + footerBottomPad;
  const consultingLabel = member.self
    ? t('bookMyself')
    : member.relationshipName
      ? `${member.name} (${member.relationshipName})`
      : member.metaKey
        ? `${member.name} (${t(member.metaKey).replace(' • ', ', ')})`
        : member.name;
  const modeFee = (id: ConsultMode) =>
    id === 'clinic'
      ? profile.clinicFeeLabel || (profile.clinicFeeKey ? t(profile.clinicFeeKey) : '')
      : profile.teleFeeLabel || (profile.feeKey ? t(profile.feeKey) : '');

  return (
    <View style={styles.root}>
      <View
        style={{
          paddingTop: Math.max(insets.top, spacing.sm),
          backgroundColor: colors.card,
        }}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText variant="headlineMd" color={colors.ink} style={styles.title}>
            {t('bookTitle')}
          </AppText>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.doctorStrip}>
          <View style={styles.avatar}>
            <AppText variant="titleMd" color={ICON_BLUE} languageOverride="en">
              {profile.initials}
            </AppText>
          </View>
          <View style={styles.flex}>
            <AppText variant="titleMd" color={colors.ink} style={styles.doctorName}>
              {t(profile.nameKey)}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted} style={styles.creds}>
              {t(shortCredsKey)}
            </AppText>
          </View>
          <AppText variant="titleMd" color={colors.ink} style={styles.fee}>
            {feeLabel}
          </AppText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: footerReserve }]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onOpenMemberPicker}
          style={styles.consultingChip}
        >
          <AppText variant="bodyMd" color={colors.ink}>
            {`${t('bookConsultingFor')} `}
            <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
              {consultingLabel}
            </AppText>
          </AppText>
          <Ionicons name="chevron-down" size={18} color={colors.muted} />
        </Pressable>

        <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
          {t('bookMode')}
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeRow}
        >
          {MODES.map((item) => {
            const selected = item.id === mode;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelectMode(item.id)}
                style={[styles.modeCard, selected && styles.modeCardSelected]}
              >
                {selected ? (
                  <View style={styles.modeCheck}>
                    <Ionicons name="checkmark" size={10} color={colors.card} />
                  </View>
                ) : null}
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={selected ? ICON_BLUE : colors.muted}
                />
                <AppText
                  variant="bodyMd"
                  color={colors.ink}
                  weightOverride={selected ? '600' : '400'}
                >
                  {t(item.labelKey)}
                </AppText>
                <AppText variant="labelSm" color={colors.muted}>
                  {modeFee(item.id)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.dateHead}>
          <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
            {t('bookSelectDate')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('bookSelectMonth')}
            onPress={onOpenMonthPicker}
            style={styles.monthChip}
          >
            <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
              {monthLabel}
            </AppText>
            <Ionicons name="chevron-down" size={14} color={ICON_BLUE} />
          </Pressable>
        </View>
        <ScrollView
          key={`${selectedMonth.year}-${selectedMonth.month}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {days.map((day) => (
            <DateChip
              key={day.id}
              day={day}
              selected={day.id === selectedDay?.id}
              weekday={day.isToday ? t('bookToday') : t(WEEKDAY_KEYS[day.weekdayIndex])}
              onPress={() => onSelectDay(day.id)}
            />
          ))}
        </ScrollView>

        {slotsEmpty ? (
          <View style={styles.waitlist}>
            <AppText variant="bodyMd" color={colors.muted} raw>
              No slots available — ask the doctor for a time
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={onJoinWaitlist}
              style={({ pressed }) => [styles.waitButton, pressed && styles.pressed]}
            >
              <AppText variant="labelMd" color={ICON_BLUE} weightOverride="600">
                {t('bookJoinWaitlist')}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {bookingError ? (
          <AppText variant="bodyMd" color={colors.error} raw>
            {bookingError}
          </AppText>
        ) : null}

        {slotsLoading ? (
          <AppText variant="bodyMd" color={colors.muted} raw>
            Loading slots…
          </AppText>
        ) : null}

        {isFull ? (
          <View style={styles.waitlist}>
            <View style={styles.waitlistRow}>
              <View style={styles.waitIcon}>
                <Ionicons name="hourglass-outline" size={22} color={AMBER} />
              </View>
              <View style={styles.flex}>
                <AppText variant="titleMd" color={AMBER} style={styles.waitTitle}>
                  {waitlistTitle}
                </AppText>
                <AppText variant="bodyMd" color={colors.muted}>
                  {t('bookWaitlistBody')}
                </AppText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onJoinWaitlist}
              style={({ pressed }) => [styles.waitButton, pressed && styles.pressed]}
            >
              <AppText variant="bodyLg" color={colors.card} weightOverride="600">
                {t('bookJoinWaitlist')}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {selectedDay ? (
          <>
            <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
              {t('bookSlots')}
            </AppText>
            <SlotGroup
              icon="sunny-outline"
              title={t('bookMorning')}
              count={t('bookSlotsCount').replace(
                '{count}',
                String(countOpenSlots(selectedDay.morning)),
              )}
              slots={selectedDay.morning}
              selectedId={selectedSlotId}
              t={t}
              onSelect={onSelectSlot}
            />
            <SlotGroup
              icon="partly-sunny-outline"
              title={t('bookAfternoon')}
              count={t('bookSlotsCount').replace(
                '{count}',
                String(countOpenSlots(selectedDay.afternoon)),
              )}
              slots={selectedDay.afternoon}
              selectedId={selectedSlotId}
              t={t}
              onSelect={onSelectSlot}
            />
            {selectedDay.evening.length ? (
              <SlotGroup
                icon="moon-outline"
                title={t('bookEvening')}
                count={t('bookSlotsCount').replace(
                  '{count}',
                  String(countOpenSlots(selectedDay.evening)),
                )}
                slots={selectedDay.evening}
                selectedId={selectedSlotId}
                t={t}
                onSelect={onSelectSlot}
              />
            ) : null}
          </>
        ) : null}

        <View style={styles.tzNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
          <AppText variant="labelSm" color={colors.muted} style={styles.flex}>
            {t('bookTimezone')}
          </AppText>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
        <View style={styles.flex}>
          <AppText variant="labelSm" color={colors.muted}>
            {t('bookSummary')}
          </AppText>
          <AppText variant="titleMd" color={colors.ink} style={styles.summary}>
            {summaryLine}
          </AppText>
        </View>
        <View style={styles.footerActions}>
          <AppText variant="titleMd" color={colors.ink} style={styles.fee}>
            {isFull ? '' : feeLabel}
          </AppText>
          <Pressable
            accessibilityRole="button"
            disabled={!isFull && !canContinue}
            onPress={isFull ? onJoinWaitlist : onContinue}
            style={({ pressed }) => [
              styles.continue,
              !isFull && !canContinue && styles.dateChipClosed,
              pressed && styles.pressed,
            ]}
          >
            <AppText variant="bodyLg" color={colors.card} weightOverride="600">
              {t(isFull ? 'bookJoinWaitlist' : 'continue')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <WhoForMemberSheet
        visible={memberPickerOpen}
        members={members}
        selectedMemberId={member.id}
        t={t}
        onClose={onCloseMemberPicker}
        onSelectMember={onSelectMember}
        onAddMember={onAddMember}
      />

      <SafeAreaModal
        transparent
        animationType="slide"
        visible={monthPickerOpen}
        onRequestClose={onCloseMonthPicker}
      >
        <Pressable style={styles.sheetBackdrop} onPress={onCloseMonthPicker}>
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: sheetBottomPadding(insets, spacing.xl) },
            ]}
            onPress={() => undefined}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <AppText variant="headlineMd" color={colors.ink}>
                {t('bookSelectMonth')}
              </AppText>
              <Pressable onPress={onCloseMonthPicker} style={styles.iconButton}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>
            <View style={styles.monthGrid}>
              {monthOptions.map((option) => {
                const selected =
                  option.year === selectedMonth.year && option.month === selectedMonth.month;
                const sameYear = option.year === monthOptions[0]?.year;
                return (
                  <Pressable
                    key={`${option.year}-${option.month}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onSelectMonth(option)}
                    style={[styles.monthCell, selected && styles.monthCellSelected]}
                  >
                    <AppText
                      variant="bodyMd"
                      color={colors.ink}
                      weightOverride={selected ? '600' : '400'}
                    >
                      {t(MONTH_KEYS[option.month])}
                    </AppText>
                    {sameYear ? null : (
                      <AppText variant="labelSm" color={colors.muted}>
                        {String(option.year)}
                      </AppText>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </SafeAreaModal>
    </View>
  );
}

function DateChip({
  day,
  selected,
  weekday,
  onPress,
}: {
  day: BookingDay;
  selected: boolean;
  weekday: string;
  onPress: () => void;
}) {
  const disabled = day.status === 'closed' || day.status === 'past';
  const dot = disabled ? colors.outlineVariant : day.status === 'full' ? colors.muted : ICON_BLUE;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.dateChip,
        selected && styles.dateChipSelected,
        disabled && styles.dateChipClosed,
      ]}
    >
      <AppText variant="labelSm" color={colors.muted} style={styles.dateWeek}>
        {weekday}
      </AppText>
      <AppText variant="titleMd" color={colors.ink} style={styles.dateNum}>
        {day.dayLabel}
      </AppText>
      <View style={[styles.dateDot, { backgroundColor: dot }]} />
    </Pressable>
  );
}

function SlotGroup({
  icon,
  title,
  count,
  slots,
  selectedId,
  t,
  onSelect,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  count: string;
  slots: TimeSlot[];
  selectedId: string | null;
  t: BookAppointmentViewModel['t'];
  onSelect: (id: string) => void;
}) {
  if (!slots.length) {
    return null;
  }
  return (
    <View style={styles.slotGroup}>
      <View style={styles.slotHead}>
        <Ionicons name={icon} size={18} color={ICON_BLUE} />
        <AppText variant="bodyMd" color={colors.ink} weightOverride="600" style={styles.flex}>
          {title}
        </AppText>
        <AppText variant="labelSm" color={colors.muted}>
          {count}
        </AppText>
      </View>
      <View style={styles.slotGrid}>
        {slots.map((slot) => {
          const selected = slot.id === selectedId;
          return (
            <Pressable
              key={slot.id}
              disabled={slot.booked}
              onPress={() => onSelect(slot.id)}
              style={[
                styles.slot,
                selected && styles.slotSelected,
                slot.booked && styles.slotBooked,
              ]}
            >
              <AppText
                variant="bodyMd"
                color={selected ? colors.card : slot.booked ? colors.muted : colors.ink}
                style={slot.booked ? styles.struck : undefined}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  title: {
    flex: 1,
    textAlign: 'left',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(26),
  },
  iconButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  creds: {
    fontSize: scaleFont(13),
    lineHeight: scaleFont(18),
  },
  fee: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: spacing.gutter,
    gap: spacing.md,
  },
  consultingChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  modeRow: {
    gap: 12,
    paddingRight: spacing.md,
  },
  modeCard: {
    minWidth: 120,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
  },
  modeCardSelected: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
  },
  modeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: ICON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthCell: {
    width: '31%',
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.card,
    gap: 2,
  },
  monthCellSelected: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
  },
  dateRow: {
    gap: 8,
    paddingRight: spacing.md,
  },
  dateChip: {
    width: 56,
    height: 76,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.card,
  },
  dateChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
  },
  dateChipClosed: {
    opacity: 0.45,
  },
  dateWeek: {
    textTransform: 'uppercase',
    fontSize: scaleFont(11),
  },
  dateNum: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    marginTop: 4,
  },
  waitlist: {
    backgroundColor: AMBER_FILL,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 12,
  },
  waitlistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  waitIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(138, 81, 9, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitTitle: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
    marginBottom: 4,
  },
  waitButton: {
    minHeight: 48,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotGroup: {
    gap: 10,
  },
  slotHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slot: {
    width: '31%',
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: colors.card,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotBooked: {
    backgroundColor: GREY_FILL,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  tzNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: 8,
  },
  summary: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  continue: {
    flex: 1,
    minHeight: 48,
    maxWidth: 180,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginBottom: 4,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
  },
  memberRowSelected: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSelected: {
    backgroundColor: colors.iconFill,
  },
  memberName: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  addMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.outline,
    borderRadius: radii.sm,
    marginTop: 8,
  },
  addAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
});
