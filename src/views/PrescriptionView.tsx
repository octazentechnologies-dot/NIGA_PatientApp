import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import type { PrescriptionViewModel } from '../controllers/usePrescriptionController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { AppToast } from '../components/AppToast';

export function PrescriptionView(vm: PrescriptionViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <AppToast
        message={vm.toastMessage}
        variant={vm.toastVariant}
        onDismiss={vm.onDismissToast}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={colors.ink}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('rxTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onShare}
            style={styles.iconHit}
          >
            <Ionicons name="share-outline" size={22} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onDownload}
            style={styles.iconHit}
          >
            <Ionicons name="download-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              layout.buttonHeight * 3 +
              spacing.xl * 2 +
              sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        {vm.loading ? (
          <View style={styles.centerBox}>
            <LoadingState label="Loading prescription..." />
          </View>
        ) : vm.isError ? (
          <View style={styles.centerBox}>
            <ErrorState
              message="Could not load prescription from server."
              onRetry={vm.onRetry}
            />
          </View>
        ) : vm.isEmpty ? (
          <View style={styles.centerBox}>
            <EmptyState
              title="No Prescription Found"
              body="No medicines or prescription details were found for this appointment."
            />
          </View>
        ) : (
          <>
            <View style={styles.statusBanner}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <AppText variant="bodyMd" color={colors.success} style={styles.flex}>
                {vm.t('rxStatusBanner')}
              </AppText>
            </View>

            <View style={styles.pad}>
              <View style={styles.docCard}>
                <View style={styles.docHeader}>
                  <View style={styles.flex}>
                    <AppText variant="headlineMd" color={colors.ink}>
                      HelloHomeo
                    </AppText>
                    <AppText variant="labelSm" color={colors.muted} raw>
                      {vm.rxNumber}
                    </AppText>
                  </View>
                  <AppText variant="bodyMd" color={colors.muted} raw>
                    {vm.rxDate}
                  </AppText>
                </View>

                <View style={styles.doctorBox}>
                  <View style={styles.avatar}>
                    <AppText variant="titleMd" color={colors.primary} languageOverride="en">
                      {vm.doctorInitials}
                    </AppText>
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.doctorNameRow}>
                      <AppText variant="titleMd" color={colors.ink} style={styles.flex} raw>
                        {vm.doctorName}
                      </AppText>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    </View>
                    {vm.doctorCredentials ? (
                      <AppText variant="bodyMd" color={colors.muted} raw>
                        {vm.doctorCredentials}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                {vm.patientName ? (
                  <View style={styles.patientGrid}>
                    <PatientField label={vm.t('rxPatientNameLabel')} value={vm.patientName} />
                  </View>
                ) : null}

                <View style={styles.medsHeader}>
                  <Ionicons name="document-text-outline" size={22} color={colors.ink} />
                  <AppText variant="titleMd" color={colors.ink}>
                    {vm.t('rxMedicinesHeading')}
                  </AppText>
                </View>

                {vm.medicines.length === 0 ? (
                  <View style={styles.pdfOnlyCard}>
                    <View style={styles.pdfOnlyIconWrap}>
                      <Ionicons name="document-text" size={28} color={colors.primary} />
                    </View>
                    <AppText
                      variant="titleMd"
                      color={colors.ink}
                      style={styles.pdfOnlyTitle}
                      raw
                    >
                      {vm.itemCount && vm.itemCount > 0
                        ? `Prescription signed (${vm.itemCount} item${vm.itemCount > 1 ? 's' : ''})`
                        : 'Official signed prescription'}
                    </AppText>
                    <AppText
                      variant="bodyMd"
                      color={colors.muted}
                      style={styles.pdfOnlySubtitle}
                    >
                      View the complete signed prescription PDF below or download for pharmacy use.
                    </AppText>
                    <AppButton
                      label="View Prescription PDF"
                      variant="secondary"
                      onPress={vm.onDownload}
                      icon={
                        <Ionicons
                          name="eye-outline"
                          size={18}
                          color={colors.primary}
                        />
                      }
                    />
                  </View>
                ) : (
                  vm.medicines.map((med, idx) => (
                    <View key={`${med.name}-${idx}`} style={styles.medCard}>
                      <AppText variant="bodyLg" color={colors.ink} weightOverride="600" raw>
                        {med.name}
                      </AppText>
                      <View style={styles.medGrid}>
                        <MedField label={vm.t('rxDoseLabel')} value={med.dose} />
                        <MedField label={vm.t('rxTimeLabel')} value={med.time} />
                        <MedField
                          label={vm.t('rxDurationLabel')}
                          value={med.duration}
                        />
                        <MedField
                          label={vm.t('rxNoteLabel')}
                          value={med.note}
                          alert={med.noteAlert}
                        />
                      </View>
                    </View>
                  ))
                )}

                <View style={styles.signatureBlock}>
                  <View style={styles.flex}>
                    <AppText variant="labelSm" color={colors.muted}>
                      {vm.t('rxSignedAt')}
                    </AppText>
                    <Pressable
                      accessibilityRole="link"
                      onPress={vm.onVerify}
                      style={styles.verifyRow}
                    >
                      <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                        {vm.t('rxVerify')}
                      </AppText>
                      <Ionicons name="open-outline" size={14} color={colors.primary} />
                    </Pressable>
                  </View>
                  <View style={styles.signatureRight}>
                    <AppText variant="headlineMd" color={colors.primary} style={styles.signatureScript} raw>
                      {vm.doctorName}
                    </AppText>
                    <AppText variant="bodyMd" color={colors.ink} weightOverride="600" raw>
                      {vm.doctorName}
                    </AppText>
                  </View>
                </View>
              </View>

              {!vm.canOrder ? (
                <AppText variant="bodyMd" color={colors.error}>
                  {vm.t('rxMustSign')}
                </AppText>
              ) : null}
              <AppButton
                label={vm.t('rxOrder')}
                onPress={vm.onOrder}
                disabled={!vm.canOrder}
                icon={<Ionicons name="cart-outline" size={20} color={colors.onButton} />}
              />
              <AppButton
                label={vm.refillBusy ? vm.t('rxRequestRefill') : vm.t('rxRequestRefill')}
                variant="secondary"
                onPress={vm.onRequestRefill}
                disabled={!vm.canOrder || vm.refillBusy}
              />
              <AppButton
                label={vm.t('rxDownloadPdf')}
                variant="secondary"
                onPress={vm.onDownload}
                icon={<Ionicons name="download-outline" size={20} color={colors.primaryOutline} />}
              />
              <AppButton
                label={vm.t('rxShare')}
                variant="secondary"
                onPress={vm.onShare}
                icon={<Ionicons name="share-outline" size={20} color={colors.primaryOutline} />}
              />
            </View>

            <View style={styles.versionStrip}>
              <View style={styles.versionLeft}>
                <Ionicons name="time-outline" size={18} color={colors.muted} />
                <AppText variant="bodyMd" color={colors.muted} style={styles.flex}>
                  {vm.t('rxVersionStrip')}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={vm.onOpenVersionHistory}
                style={styles.versionLink}
              >
                <AppText variant="labelMd" color={colors.primary} weightOverride="600">
                  {vm.t('rxVersionHistory')}
                </AppText>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function PatientField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.patientField}>
      <AppText variant="labelSm" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
        {value}
      </AppText>
    </View>
  );
}

function MedField({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <View style={styles.medField}>
      <AppText variant="labelSm" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={alert ? colors.error : colors.ink}>
        {value}
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
    minHeight: 48,
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
  body: {
    gap: 0,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successContainer,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pad: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  docCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.md,
  },
  doctorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  patientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.md,
    rowGap: spacing.md,
  },
  patientField: {
    width: '50%',
    paddingRight: spacing.sm,
    gap: 2,
  },
  medsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  medCard: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.card,
  },
  medGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  medField: {
    width: '50%',
    paddingRight: spacing.sm,
    gap: 2,
  },
  adviceBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adviceRow: {
    paddingLeft: spacing.xs,
  },
  signatureBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    minHeight: 32,
  },
  signatureRight: {
    alignItems: 'flex-end',
  },
  signatureScript: {
    fontStyle: 'italic',
    opacity: 0.7,
    marginBottom: 2,
  },
  versionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  versionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  versionLink: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  pdfOnlyCard: {
    backgroundColor: colors.surfaceVariant ?? colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pdfOnlyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  pdfOnlyTitle: {
    textAlign: 'center',
  },
  pdfOnlySubtitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
