import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppScreenHeader } from '../components/AppScreenHeader';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import type { AppointmentRequestsViewModel } from '../controllers/useAppointmentRequestsController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

export function AppointmentRequestsView(vm: AppointmentRequestsViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <AppScreenHeader
        title="My requests"
        onBack={vm.onBack}
        backLabel={vm.t('back')}
      />
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {vm.filters.map((f) => {
            const on = f.id === vm.filter;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                onPress={() => vm.onSelectFilter(f.id)}
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
      </View>

      {vm.loading && vm.rows.length === 0 ? (
        <LoadingState />
      ) : vm.isError && vm.rows.length === 0 ? (
        <ErrorState
          message="Could not load your requests."
          onRetry={vm.onRetry}
        />
      ) : vm.isEmpty ? (
        <EmptyState
          title="No requests yet"
          body="When you ask a doctor for a time, it will show here."
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.body,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
        >
          {vm.notice ? (
            <AppText variant="bodyMd" color={colors.muted} raw style={styles.notice}>
              {vm.notice}
            </AppText>
          ) : null}
          {vm.rows.map((row) => (
            <View key={row.id} style={styles.card}>
              <View style={styles.cardTop}>
                <AppText variant="titleMd" color={colors.ink} style={styles.flex} raw>
                  {row.doctorName}
                </AppText>
                <View style={[styles.badge, { backgroundColor: row.statusBg }]}>
                  <AppText variant="labelSm" color={row.statusColor} weightOverride="600">
                    {row.statusLabel}
                  </AppText>
                </View>
              </View>
              {row.whenLabel ? (
                <AppText variant="bodyMd" color={colors.muted} raw>
                  Asked for {row.whenLabel}
                </AppText>
              ) : null}
              {row.proposedLabel ? (
                <AppText variant="bodyMd" color={colors.ink} weightOverride="600" raw>
                  Doctor proposed {row.proposedLabel}
                </AppText>
              ) : null}
              {row.reason ? (
                <AppText variant="bodyMd" color={colors.muted} raw>
                  {row.reason}
                </AppText>
              ) : null}
              {row.consultMode ? (
                <AppText variant="labelSm" color={colors.muted} raw>
                  {row.consultMode}
                </AppText>
              ) : null}
              <View style={styles.actions}>
                {row.canRespond ? (
                  <>
                    <AppButton
                      label="Accept"
                      onPress={() => vm.onAccept(row.id)}
                      disabled={vm.busyId === row.id}
                      style={styles.actionBtn}
                    />
                    <AppButton
                      label="Decline"
                      variant="secondary"
                      onPress={() => vm.onDecline(row.id)}
                      disabled={vm.busyId === row.id}
                      style={styles.actionBtn}
                    />
                  </>
                ) : null}
                {row.canCancel ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => vm.onCancel(row.id)}
                    disabled={vm.busyId === row.id}
                    style={styles.cancelHit}
                  >
                    <AppText variant="labelSm" color={colors.error} weightOverride="600">
                      Cancel request
                    </AppText>
                  </Pressable>
                ) : null}
                {row.patientAppId != null ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => vm.onOpenVisit(row.patientAppId!)}
                    style={styles.cancelHit}
                  >
                    <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                      Open visit
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
          {vm.canLoadMore ? (
            <AppButton label="Load more" variant="secondary" onPress={vm.onLoadMore} />
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
  filterBar: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingTop: spacing.sm,
  },
  filters: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.card,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  body: { padding: spacing.lg, gap: spacing.md },
  notice: { marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.button,
  },
  actions: { marginTop: spacing.sm, gap: spacing.sm },
  actionBtn: { minHeight: 48 },
  cancelHit: { minHeight: 48, justifyContent: 'center' },
});
