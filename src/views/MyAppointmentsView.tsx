import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import type {
  MyAppointmentRow,
  MyAppointmentsViewModel,
} from '../controllers/useMyAppointmentsController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { formatDate, formatLocalDateYmd } from '../utilities/formatters';

function parseYmdToLocalDate(raw: string): Date {
  const parts = raw.split('-').map(Number);
  if (parts.length === 3 && parts.every((p) => !Number.isNaN(p))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

export function MyAppointmentsView(vm: MyAppointmentsViewModel) {
  const { t } = vm;
  const insets = useSafeAreaInsets();
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to' | null>(null);

  const pickerValue = useMemo(() => {
    if (pickerTarget === 'from' && vm.fromDate) {
      return parseYmdToLocalDate(vm.fromDate);
    }
    if (pickerTarget === 'to' && vm.toDate) {
      return parseYmdToLocalDate(vm.toDate);
    }
    if (pickerTarget === 'to' && vm.fromDate) {
      return parseYmdToLocalDate(vm.fromDate);
    }
    return new Date();
  }, [pickerTarget, vm.fromDate, vm.toDate]);

  const minDate = useMemo(() => {
    if (pickerTarget === 'to' && vm.fromDate) {
      return parseYmdToLocalDate(vm.fromDate);
    }
    return undefined;
  }, [pickerTarget, vm.fromDate]);

  const maxDate = useMemo(() => {
    if (pickerTarget === 'from' && vm.toDate) {
      return parseYmdToLocalDate(vm.toDate);
    }
    return undefined;
  }, [pickerTarget, vm.toDate]);

  const onConfirmDate = useCallback(
    (selected: Date) => {
      const ymd = formatLocalDateYmd(selected);
      if (pickerTarget === 'from') {
        vm.onFromDateChange(ymd);
      } else if (pickerTarget === 'to') {
        vm.onToDateChange(ymd);
      }
      setPickerTarget(null);
    },
    [pickerTarget, vm],
  );

  const dateLocale = vm.language === 'mr' ? 'mr-IN' : 'en-IN';

  const dateFilterRow = (
    <View style={styles.dateFilterContainer}>
      <View style={styles.dateRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select from date"
          onPress={() => setPickerTarget('from')}
          style={[styles.dateButton, Boolean(vm.fromDate) && styles.dateButtonActive]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={vm.fromDate ? colors.primary : colors.muted}
          />
          <AppText
            variant="bodyMd"
            color={vm.fromDate ? colors.ink : colors.muted}
            style={styles.dateText}
            numberOfLines={1}
          >
            {vm.fromDate
              ? formatDate(vm.fromDate, dateLocale) ?? vm.fromDate
              : 'From (Date)'}
          </AppText>
          {vm.fromDate ? (
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear from date"
              onPress={(e) => {
                e.stopPropagation?.();
                vm.onFromDateChange('');
              }}
              style={styles.clearHit}
            >
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </Pressable>
          ) : null}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select to date"
          onPress={() => setPickerTarget('to')}
          style={[styles.dateButton, Boolean(vm.toDate) && styles.dateButtonActive]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={vm.toDate ? colors.primary : colors.muted}
          />
          <AppText
            variant="bodyMd"
            color={vm.toDate ? colors.ink : colors.muted}
            style={styles.dateText}
            numberOfLines={1}
          >
            {vm.toDate
              ? formatDate(vm.toDate, dateLocale) ?? vm.toDate
              : 'To (Date)'}
          </AppText>
          {vm.toDate ? (
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear to date"
              onPress={(e) => {
                e.stopPropagation?.();
                vm.onToDateChange('');
              }}
              style={styles.clearHit}
            >
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </Pressable>
          ) : null}
        </Pressable>
      </View>
    </View>
  );

  const listHeader = vm.appointments.length > 0 ? (
    <View style={styles.listHeaderWrap}>
      <AppButton
        variant="secondary"
        label={t('payHistBookConsultation')}
        onPress={vm.onBookNew}
        icon={<Ionicons name="add" size={18} color={colors.button} />}
      />
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
          <AppText variant="headlineMd" color={colors.ink} style={styles.flex}>
            {t('accountAppointments')}
          </AppText>
          {vm.onOpenRequests ? (
            <Pressable
              accessibilityRole="button"
              onPress={vm.onOpenRequests}
              style={styles.iconHit}
            >
              <Ionicons name="time-outline" size={22} color={colors.primary} />
            </Pressable>
          ) : (
            <View style={styles.iconHit} />
          )}
        </View>
        {vm.onOpenRequests ? (
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenRequests}
            style={styles.requestsLink}
          >
            <AppText variant="labelSm" color={colors.primary} weightOverride="600">
              My time requests
            </AppText>
          </Pressable>
        ) : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {vm.statusFilters.map((f) => {
            const on = f.id === vm.statusFilter;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                onPress={() => vm.onSelectStatusFilter(f.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <AppText
                  variant="labelSm"
                  color={on ? colors.onPrimary : colors.ink}
                  weightOverride="600"
                >
                  {f.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
        {dateFilterRow}
      </View>

      {vm.isLoading ? (
        <LoadingState />
      ) : vm.isError ? (
        <ErrorState
          message="Could not load your appointments."
          onRetry={vm.onRetry}
        />
      ) : vm.isEmpty ? (
        <EmptyState
          title={t('doctorsNoBookings')}
          body={
            vm.fromDate || vm.toDate
              ? 'No appointments found for the selected dates.'
              : ''
          }
          actionLabel={t('payHistBookConsultation')}
          onAction={vm.onBookNew}
        />
      ) : (
        <FlatList
          data={vm.appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppointmentCard
              item={item}
              t={t}
              onPress={() => vm.onOpenAppointment(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.body,
            { paddingBottom: 32 + sheetBottomPadding(insets, spacing.md) },
          ]}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} />
          }
          onEndReached={() => {
            if (vm.canLoadMore) {
              vm.onLoadMore();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            vm.canLoadMore ? (
              <AppButton
                label="Load more"
                variant="secondary"
                onPress={vm.onLoadMore}
                style={styles.loadMore}
              />
            ) : null
          }
        />
      )}

      <DatePickerSheet
        visible={pickerTarget !== null}
        value={pickerValue}
        minimumDate={minDate}
        maximumDate={maxDate}
        locale={dateLocale}
        cancelLabel={t('cancel')}
        doneLabel={t('done')}
        onCancel={() => setPickerTarget(null)}
        onConfirm={onConfirmDate}
      />
    </View>
  );
}

function AppointmentCard({
  item,
  t,
  onPress,
}: {
  item: MyAppointmentRow;
  t: MyAppointmentsViewModel['t'];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardHead}>
        <View style={styles.avatar}>
          <AppText variant="titleMd" color={colors.primary} languageOverride="en">
            {item.doctorInitials}
          </AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="titleMd" color={colors.ink} raw>
            {String(item.doctorNameKey)}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted}>
            {item.experienceKey
              ? `${t('payStatusHomeopath')} · ${t(item.experienceKey)}`
              : t('payStatusHomeopath')}
          </AppText>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.visitStatusBg || colors.surfaceContainerHigh },
            ]}
          >
            <AppText
              variant="labelSm"
              color={item.visitStatusColor || colors.muted}
              weightOverride="600"
            >
              {item.visitStatusLabel}
            </AppText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </View>
      <MetaRow icon="calendar-outline" text={item.whenLabel} />
      <MetaRow
        icon={
          item.mode === 'audio'
            ? 'call-outline'
            : item.mode === 'clinic'
              ? 'business-outline'
              : item.mode === 'chat'
                ? 'chatbubble-outline'
                : 'videocam-outline'
        }
        text={item.modeConsultLabel}
      />
      <MetaRow icon="person-outline" text={item.patientLabel} />
      <AppText variant="labelSm" color={colors.primary} weightOverride="600">
        {t('myAptTapToManage')}
      </AppText>
    </Pressable>
  );
}

function MetaRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
        {text}
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
    borderBottomColor: colors.outlineVariant,
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestsLink: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  filters: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateFilterContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listHeaderWrap: {
    marginBottom: spacing.md,
  },
  dateButton: {
    flex: 1,
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
  },
  dateButtonActive: {
    borderColor: colors.primary,
  },
  dateText: {
    flex: 1,
    fontSize: 13,
  },
  clearHit: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
    textAlign: 'left',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sep: {
    height: spacing.md,
  },
  loadMore: {
    marginTop: spacing.md,
  },
  card: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.buttonHeight / 2,
  },
});
