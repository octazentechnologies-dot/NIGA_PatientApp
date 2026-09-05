import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
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

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const CHIP_FILL = '#E6F5FE';
const GREY_FILL = '#F2F2F2';
const AMBER_FILL = '#FCF3E4';
const AMBER = '#8A5109';
const AMBER_BORDER = '#F2C14E';
const ICON_BLUE = '#3AA9E0';

const MODES: { id: ConsultMode; icon: keyof typeof Ionicons.glyphMap; labelKey: TranslationKey }[] =
  [
    { id: 'video', icon: 'videocam-outline', labelKey: 'bookVideo' },
    { id: 'audio', icon: 'call-outline', labelKey: 'bookAudio' },
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
  const footerReserve = 128 + Math.max(insets.bottom, spacing.md);
  const consultingLabel = member.self
    ? t('bookMyself')
    : `${member.name} (${member.metaKey ? t(member.metaKey).replace(' • ', ', ') : ''})`;
  const modeFee = (id: ConsultMode) =>
    t(id === 'clinic' ? profile.clinicFeeKey : profile.feeKey);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: Math.max(insets.top, spacing.sm) }}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <AppText variant="headlineMd" color="#000000" style={styles.title}>
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
            <AppText variant="titleMd" color="#000000" style={styles.doctorName}>
              {t(profile.nameKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED} style={styles.creds}>
              {t(shortCredsKey)}
            </AppText>
          </View>
          <AppText variant="titleMd" color="#000000" style={styles.fee}>
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
          <AppText variant="bodyMd" color="#000000">
            {`${t('bookConsultingFor')} `}
            <AppText variant="bodyMd" color="#000000" weightOverride="600">
              {consultingLabel}
            </AppText>
          </AppText>
          <Ionicons name="chevron-down" size={18} color={MUTED} />
        </Pressable>

        <AppText variant="titleMd" color="#000000" style={styles.sectionTitle}>
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
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                ) : null}
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={selected ? ICON_BLUE : MUTED}
                />
                <AppText
                  variant="bodyMd"
                  color="#000000"
                  weightOverride={selected ? '600' : '400'}
                >
                  {t(item.labelKey)}
                </AppText>
                <AppText variant="labelSm" color={MUTED}>
                  {modeFee(item.id)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.dateHead}>
          <AppText variant="titleMd" color="#000000" style={styles.sectionTitle}>
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
                <AppText variant="bodyMd" color={MUTED}>
                  {t('bookWaitlistBody')}
                </AppText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onJoinWaitlist}
              style={({ pressed }) => [styles.waitButton, pressed && styles.pressed]}
            >
              <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
                {t('bookJoinWaitlist')}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {selectedDay ? (
          <>
            <AppText variant="titleMd" color="#000000" style={styles.sectionTitle}>
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
          <Ionicons name="information-circle-outline" size={16} color={MUTED} />
          <AppText variant="labelSm" color={MUTED} style={styles.flex}>
            {t('bookTimezone')}
          </AppText>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.flex}>
          <AppText variant="labelSm" color={MUTED}>
            {t('bookSummary')}
          </AppText>
          <AppText variant="titleMd" color="#000000" style={styles.summary}>
            {summaryLine}
          </AppText>
        </View>
        <View style={styles.footerActions}>
          <AppText variant="titleMd" color="#000000" style={styles.fee}>
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
            <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
              {t(isFull ? 'bookJoinWaitlist' : 'continue')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={memberPickerOpen}
        onRequestClose={onCloseMemberPicker}
      >
        <Pressable style={styles.sheetBackdrop} onPress={onCloseMemberPicker}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <AppText variant="headlineMd" color="#000000">
                {t('bookWhoFor')}
              </AppText>
              <Pressable onPress={onCloseMemberPicker} style={styles.iconButton}>
                <Ionicons name="close" size={22} color="#000000" />
              </Pressable>
            </View>
            {members.map((item) => {
              const selected = item.id === member.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectMember(item.id)}
                  style={[styles.memberRow, selected && styles.memberRowSelected]}
                >
                  <View style={[styles.memberAvatar, selected && styles.memberAvatarSelected]}>
                    <Ionicons
                      name={
                        item.icon === 'child'
                          ? 'happy-outline'
                          : item.icon === 'woman'
                            ? 'person-outline'
                            : 'person-outline'
                      }
                      size={22}
                      color="#000000"
                    />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="titleMd" color="#000000" style={styles.memberName}>
                      {item.self ? t('bookMyself') : item.name.split(' ')[0]}
                    </AppText>
                    <AppText variant="bodyMd" color={selected ? '#000000' : MUTED}>
                      {item.self ? item.name : item.metaKey ? t(item.metaKey) : ''}
                    </AppText>
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color={ICON_BLUE} />
                  ) : null}
                </Pressable>
              );
            })}
            <Pressable onPress={onAddMember} style={styles.addMember}>
              <View style={styles.addAvatar}>
                <Ionicons name="add" size={22} color="#000000" />
              </View>
              <AppText variant="titleMd" color="#000000" style={styles.memberName}>
                {t('bookAddMember')}
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={monthPickerOpen}
        onRequestClose={onCloseMonthPicker}
      >
        <Pressable style={styles.sheetBackdrop} onPress={onCloseMonthPicker}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <AppText variant="headlineMd" color="#000000">
                {t('bookSelectMonth')}
              </AppText>
              <Pressable onPress={onCloseMonthPicker} style={styles.iconButton}>
                <Ionicons name="close" size={22} color="#000000" />
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
                      color="#000000"
                      weightOverride={selected ? '600' : '400'}
                    >
                      {t(MONTH_KEYS[option.month])}
                    </AppText>
                    {sameYear ? null : (
                      <AppText variant="labelSm" color={MUTED}>
                        {String(option.year)}
                      </AppText>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  const dot = disabled ? HAIRLINE : day.status === 'full' ? MUTED : ICON_BLUE;
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
      <AppText variant="labelSm" color={MUTED} style={styles.dateWeek}>
        {weekday}
      </AppText>
      <AppText variant="titleMd" color="#000000" style={styles.dateNum}>
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
        <AppText variant="bodyMd" color="#000000" weightOverride="600" style={styles.flex}>
          {title}
        </AppText>
        <AppText variant="labelSm" color={MUTED}>
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
                color={selected ? '#FFFFFF' : slot.booked ? MUTED : '#000000'}
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
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: scaleFont(22),
    lineHeight: scaleFont(30),
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
    borderBottomColor: HAIRLINE,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  creds: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  fee: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
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
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  modeRow: {
    gap: 12,
    paddingRight: spacing.md,
  },
  modeCard: {
    minWidth: 120,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  modeCardSelected: {
    backgroundColor: CHIP_FILL,
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
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    gap: 2,
  },
  monthCellSelected: {
    backgroundColor: CHIP_FILL,
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
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: '#FFFFFF',
  },
  dateChipSelected: {
    backgroundColor: CHIP_FILL,
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
    fontSize: scaleFont(20),
    lineHeight: scaleFont(26),
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
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
    marginBottom: 4,
  },
  waitButton: {
    minHeight: 48,
    borderRadius: radii.sm,
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
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
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
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
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
    borderRadius: radii.sm,
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#D6D6D6',
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
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
  },
  memberRowSelected: {
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSelected: {
    backgroundColor: '#5CCEF7',
  },
  memberName: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  addMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#8A8A8A',
    borderRadius: radii.sm,
    marginTop: 8,
  },
  addAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: '#F5F5F5',
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
