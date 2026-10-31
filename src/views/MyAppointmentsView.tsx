import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Image,
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
  const [imgError, setImgError] = useState(false);
  const statusUpper = (item.visitStatus || '').toUpperCase();
  const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'COMPLETE';
  const isCancelled = statusUpper === 'CANCELLED' || statusUpper === 'DECLINED';
  const isEnded = isCompleted || isCancelled;

  // Contextual action text based on status
  const actionLabel = isEnded
    ? t('myAptTapToViewDetails')
    : t('myAptTapToManage');
  const actionColor = isEnded ? colors.muted : colors.primary;

  // Doctor specialization fallback
  const doctorSpecialty =
    item.doctorSpecialization?.trim() ||
    (item.experienceKey
      ? `${t('payStatusHomeopath')} · ${t(item.experienceKey)}`
      : t('payStatusHomeopath'));

  // Status badge styling
  const statusBg = item.visitStatusBg || colors.surfaceContainerHigh;
  const statusColor = item.visitStatusColor || colors.muted;
  const statusBorder = item.visitStatusBorder || colors.outlineVariant;

  const modeIcon: keyof typeof Ionicons.glyphMap =
    item.mode === 'audio'
      ? 'call-outline'
      : item.mode === 'clinic'
        ? 'business-outline'
        : item.mode === 'chat'
          ? 'chatbubble-outline'
          : 'videocam-outline';

  const hasPhoto = Boolean(item.doctorPhotoUrl) && !imgError;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${String(item.doctorNameKey)}, ${item.visitStatusLabel}, ${item.whenLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Card Header: Avatar (left) + Name & Specialization & Status Badge (below spec) + Right Chevron */}
      <View style={styles.cardHead}>
        <View style={styles.avatar}>
          {hasPhoto ? (
            <Image
              source={{ uri: item.doctorPhotoUrl! }}
              style={styles.avatarImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <AppText
              variant="titleMd"
              color={colors.primary}
              weightOverride="700"
              languageOverride="en"
            >
              {item.doctorInitials || 'DR'}
            </AppText>
          )}
        </View>

        <View style={styles.headInfo}>
          <AppText
            variant="titleMd"
            color={colors.ink}
            weightOverride="700"
            numberOfLines={1}
            raw
          >
            {String(item.doctorNameKey) || 'Doctor'}
          </AppText>
          <AppText
            variant="bodyMd"
            color={colors.muted}
            numberOfLines={1}
            style={styles.specText}
          >
            {doctorSpecialty}
          </AppText>

          {/* Status badge placed below specialization */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: statusBg,
                borderColor: statusBorder,
              },
            ]}
          >
            <AppText
              variant="labelSm"
              color={statusColor}
              weightOverride="600"
            >
              {item.visitStatusLabel || 'Unknown'}
            </AppText>
          </View>
        </View>

        <View style={styles.chevronWrap}>
          <Ionicons name="chevron-forward" size={18} color={colors.outline} />
        </View>
      </View>

      <View style={styles.cardDivider} />

      {/* Metadata Rows: Date/Time, Consultation Mode, Consulting For / Patient */}
      <View style={styles.metaSection}>
        <View style={styles.metaRow}>
          <View style={styles.metaIconBubble}>
            <Ionicons name="calendar-outline" size={15} color={colors.primary} />
          </View>
          <AppText
            variant="bodyMd"
            color={colors.ink}
            weightOverride="500"
            style={styles.flex}
            numberOfLines={1}
          >
            {item.whenLabel}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaIconBubble}>
            <Ionicons name={modeIcon} size={15} color={colors.primary} />
          </View>
          <AppText
            variant="bodyMd"
            color={colors.ink}
            style={styles.flex}
            numberOfLines={1}
          >
            {item.modeConsultLabel}
          </AppText>
        </View>

        {item.patientLabel ? (
          <View style={styles.metaRow}>
            <View style={styles.metaIconBubble}>
              <Ionicons name="person-outline" size={15} color={colors.primary} />
            </View>
            <AppText variant="bodyMd" color={colors.ink} style={styles.flex} numberOfLines={1}>
              <AppText variant="bodyMd" color={colors.muted}>
                {`${t('homeForPrefix')}: `}
              </AppText>
              <AppText variant="bodyMd" color={colors.ink} weightOverride="600" raw>
                {item.patientLabel}
              </AppText>
            </AppText>
          </View>
        ) : null}
      </View>

      {/* Bottom Contextual Action Area */}
      <View style={styles.actionArea}>
        <AppText
          variant="labelSm"
          color={actionColor}
          weightOverride="600"
          style={styles.flex}
          numberOfLines={1}
        >
          {actionLabel}
        </AppText>
        <Ionicons name="chevron-forward" size={14} color={actionColor} />
      </View>
    </Pressable>
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
    borderColor: '#E8ECF0',
    backgroundColor: colors.card,
    padding: spacing.md,
    shadowColor: '#0F2B48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.88,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.ms,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FB',
    borderWidth: 1,
    borderColor: '#D9ECF6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  headInfo: {
    flex: 1,
    gap: 2,
  },
  specText: {
    marginTop: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chevronWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: spacing.sm + 2,
  },
  metaSection: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F0F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    marginTop: 10,
    paddingTop: 10,
  },
});
