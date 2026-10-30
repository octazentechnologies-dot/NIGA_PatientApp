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
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { images } from '../config/images';
import type { ConsultationCompleteViewModel } from '../controllers/useConsultationCompleteController';
import { usePrescriptionController } from '../controllers/usePrescriptionController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { PrescriptionView } from './PrescriptionView';

const STAR_IDLE = colors.outline;
const STAR_FILL = colors.tertiaryContainer;
export function ConsultationCompleteView(vm: ConsultationCompleteViewModel) {
  const insets = useSafeAreaInsets();
  const prescription = usePrescriptionController({
    onBack: vm.onClosePrescription,
    onOrder: (launch) => {
      vm.onClosePrescription();
      vm.onOrderMedicines(launch);
    },
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

      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide} />
          <AppText variant="headlineMd" color={colors.ink} style={styles.brand}>
            {vm.t('brandName')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('homeTabAccount')}
            onPress={vm.onOpenSettings}
            style={styles.settingsHit}
          >
            <View style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={18} color={colors.card} />
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              layout.buttonHeight + spacing.xl + sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <AppText variant="titleMd" color={colors.success} style={styles.flex}>
            {vm.completedBanner}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <Image source={images.doctorPortrait} style={styles.avatar} />
            <View style={styles.doctorCopy}>
              <AppText variant="titleMd" color={colors.ink}>
                {vm.doctorName}
              </AppText>
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.credentials}
              </AppText>
              <View style={styles.whenRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.muted} />
                <AppText variant="labelSm" color={colors.muted} style={styles.flex}>
                  {vm.whenLine}
                </AppText>
              </View>
              <View style={styles.patientChip}>
                <AppText variant="labelSm" color={colors.ink}>
                  {vm.patientChip}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rxHeader}>
            <View style={styles.rxIcon}>
              <Ionicons name="document-text" size={20} color={colors.iconFill} />
            </View>
            <AppText variant="titleMd" color={colors.ink} style={styles.flex}>
              {vm.t('completeRxReady')}
            </AppText>
          </View>
          <AppButton
            label={vm.t('completeViewRx')}
            onPress={vm.onViewPrescription}
          />
        </View>

        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('completeWhatsNext')}
        </AppText>

        <NextCard
          icon="document-text-outline"
          title={vm.t('completeNextRxTitle')}
          body={vm.t('completeNextRxBody')}
          action={vm.t('completeOpen')}
          onPress={vm.onOpenPrescription}
        />
        <NextCard
          icon="medkit-outline"
          title={vm.t('completeNextOrderTitle')}
          body={vm.t('completeNextOrderBody')}
          note={vm.t('completeNextOrderNote')}
          action={vm.t('completeOrderNow')}
          onPress={() => vm.onOrderMedicines()}
        />
        <NextCard
          icon="calendar-outline"
          title={vm.t('completeNextFollowTitle')}
          body={vm.followUpPlanMeta}
          action={vm.t('completeViewTasks')}
          onPress={vm.onViewFollowUpTasks}
        />

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink} style={styles.summaryTitle}>
            {vm.t('completeSummaryTitle')}
          </AppText>
          {vm.isLoading ? <LoadingState /> : null}
          {vm.isError ? (
            <ErrorState message="Could not load the consultation summary." onRetry={vm.onRetry} />
          ) : null}
          {vm.discussed ? (
            <SummaryBlock label={vm.t('completeDiscussed')} body={vm.discussed} />
          ) : null}
          {vm.advice ? (
            <SummaryBlock label={vm.t('completeAdvice')} body={vm.advice} />
          ) : null}
          {vm.nextFollowUp ? (
            <SummaryBlock label={vm.t('completeNextFollowUp')} body={vm.nextFollowUp} />
          ) : null}
          {vm.summaryNote ? (
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
              <AppText variant="labelSm" color={colors.muted} style={styles.flex} raw>
                {vm.summaryNote}
              </AppText>
            </View>
          ) : null}
          {!vm.isLoading && !vm.isError && !vm.summaryNote ? (
            <AppText variant="bodyMd" color={colors.muted} raw>
              No consultation summary yet.
            </AppText>
          ) : null}
        </View>

        <View style={[styles.card, styles.rateCard]}>
          <AppText variant="titleMd" color={colors.ink} style={styles.center}>
            {vm.t('completeRateTitle')}
          </AppText>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value}`}
                onPress={() => vm.onSelectRating(value)}
                style={styles.starHit}
              >
                <Ionicons
                  name={vm.rating >= value ? 'star' : 'star-outline'}
                  size={32}
                  color={vm.rating >= value ? STAR_FILL : STAR_IDLE}
                />
              </Pressable>
            ))}
          </View>
          <Pressable onPress={vm.onWriteReview} accessibilityRole="link">
            <AppText variant="labelMd" color={colors.primary} style={styles.reviewLink}>
              {vm.t('completeWriteReview')}
            </AppText>
          </Pressable>
        </View>

        <Pressable
          onPress={vm.onReportProblem}
          accessibilityRole="link"
          style={styles.reportRow}
        >
          <Ionicons name="warning-outline" size={16} color={colors.muted} />
          <AppText variant="labelSm" color={colors.muted}>
            {vm.t('completeReport')}
          </AppText>
        </Pressable>

        <AppButton label={vm.t('completeBackHome')} onPress={vm.onBackHome} />
      </ScrollView>
    </View>
  );
}

function NextCard({
  icon,
  title,
  body,
  note,
  action,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  note?: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.nextIcon}>
        <Ionicons name={icon} size={22} color={colors.iconFill} />
      </View>
      <AppText variant="titleMd" color={colors.ink}>
        {title}
      </AppText>
      <AppText variant="bodyMd" color={colors.muted}>
        {body}
      </AppText>
      {note ? (
        <AppText variant="labelSm" color={colors.muted} style={styles.noteItalic}>
          {note}
        </AppText>
      ) : null}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={styles.actionRow}
      >
        <AppText variant="labelMd" color={colors.primary} weightOverride="600">
          {action}
        </AppText>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

function SummaryBlock({ label, body }: { label: string; body: string }) {
  return (
    <View style={styles.summaryBlock}>
      <AppText variant="titleMd" color={colors.ink}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={colors.muted}>
        {body}
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: 48,
  },
  brand: {
    flex: 1,
    textAlign: 'center',
  },
  settingsHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  successBanner: {
    backgroundColor: colors.successContainer,
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  doctorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  doctorCopy: {
    flex: 1,
    gap: 4,
  },
  whenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  patientChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.xs,
  },
  rxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rxIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 48,
  },
  noteItalic: {
    fontStyle: 'italic',
  },
  summaryTitle: {
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    marginBottom: spacing.xs,
  },
  summaryBlock: {
    gap: 4,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  rateCard: {
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewLink: {
    textDecorationLine: 'underline',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 48,
  },
});
