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
import { images } from '../config/images';
import type { PrescriptionViewModel } from '../controllers/usePrescriptionController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';

export function PrescriptionView(vm: PrescriptionViewModel) {
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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={INK}
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
            <Ionicons name="share-outline" size={22} color={INK} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onDownload}
            style={styles.iconHit}
          >
            <Ionicons name="download-outline" size={22} color={INK} />
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
        <View style={styles.statusBanner}>
          <Ionicons name="checkmark-circle" size={20} color={SUCCESS} />
          <AppText variant="bodyMd" color={SUCCESS} style={styles.flex}>
            {vm.t('rxStatusBanner')}
          </AppText>
        </View>

        <View style={styles.pad}>
          <View style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.flex}>
                <AppText variant="headlineMd" color={INK}>
                  HelloHomeo
                </AppText>
                <AppText variant="labelSm" color={MUTED}>
                  {vm.t('rxNumber')}
                </AppText>
              </View>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.t('rxDate')}
              </AppText>
            </View>

            <View style={styles.doctorBox}>
              <Image source={images.doctorPortrait} style={styles.avatar} />
              <View style={styles.flex}>
                <View style={styles.doctorNameRow}>
                  <AppText variant="titleMd" color={INK} style={styles.flex}>
                    {vm.t('searchResultAnjaliName')}
                  </AppText>
                  <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
                </View>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t('rxDoctorCredentials')}
                </AppText>
                <AppText variant="labelSm" color={MUTED}>
                  {vm.t('rxDoctorCouncil')}
                </AppText>
              </View>
            </View>

            <View style={styles.patientGrid}>
              <PatientField label={vm.t('rxPatientNameLabel')} value={vm.t('rxPatientName')} />
              <PatientField label={vm.t('rxAgeGenderLabel')} value={vm.t('rxAgeGender')} />
              <PatientField label={vm.t('rxWeightLabel')} value={vm.t('rxWeight')} />
              <PatientField label={vm.t('rxDiagnosisLabel')} value={vm.t('rxDiagnosis')} />
            </View>

            <View style={styles.medsHeader}>
              <Ionicons name="document-text-outline" size={22} color={INK} />
              <AppText variant="titleMd" color={INK}>
                {vm.t('rxMedicinesHeading')}
              </AppText>
            </View>

            {vm.medicines.map((med) => (
              <View key={med.nameKey} style={styles.medCard}>
                <AppText variant="bodyLg" color={INK} weightOverride="600">
                  {vm.t(med.nameKey)}
                </AppText>
                <View style={styles.medGrid}>
                  <MedField label={vm.t('rxDoseLabel')} value={vm.t(med.doseKey)} />
                  <MedField label={vm.t('rxTimeLabel')} value={vm.t(med.timeKey)} />
                  <MedField
                    label={vm.t('rxDurationLabel')}
                    value={vm.t(med.durationKey)}
                  />
                  <MedField
                    label={vm.t('rxNoteLabel')}
                    value={vm.t(med.noteKey)}
                    alert={med.noteAlert}
                  />
                </View>
              </View>
            ))}

            <View style={styles.adviceBox}>
              <View style={styles.adviceHeader}>
                <Ionicons name="bulb-outline" size={20} color={INK} />
                <AppText variant="bodyLg" color={INK} weightOverride="600">
                  {vm.t('rxAdviceHeading')}
                </AppText>
              </View>
              {vm.adviceKeys.map((key) => (
                <View key={key} style={styles.adviceRow}>
                  <AppText variant="bodyMd" color={MUTED}>
                    {'\u2022  '}
                    {vm.t(key)}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.signatureBlock}>
              <View style={styles.flex}>
                <AppText variant="labelSm" color={MUTED}>
                  {vm.t('rxSignedAt')}
                </AppText>
                <Pressable
                  accessibilityRole="link"
                  onPress={vm.onVerify}
                  style={styles.verifyRow}
                >
                  <AppText variant="labelSm" color={ACTION} weightOverride="600">
                    {vm.t('rxVerify')}
                  </AppText>
                  <Ionicons name="open-outline" size={14} color={ACTION} />
                </Pressable>
              </View>
              <View style={styles.signatureRight}>
                <AppText variant="headlineMd" color={ACTION} style={styles.signatureScript}>
                  Dr. Anjali Deshmukh
                </AppText>
                <AppText variant="bodyMd" color={INK} weightOverride="600">
                  {vm.t('searchResultAnjaliName')}
                </AppText>
              </View>
            </View>
          </View>

          <AppButton
            label={vm.t('rxOrder')}
            onPress={vm.onOrder}
            icon={<Ionicons name="cart-outline" size={20} color={colors.onButton} />}
          />
          <AppButton
            label={vm.t('rxDownloadPdf')}
            variant="secondary"
            onPress={vm.onDownload}
            icon={<Ionicons name="download-outline" size={20} color={ACTION_OUTLINE} />}
          />
          <AppButton
            label={vm.t('rxShare')}
            variant="secondary"
            onPress={vm.onShare}
            icon={<Ionicons name="share-outline" size={20} color={ACTION_OUTLINE} />}
          />

          <View style={styles.versionStrip}>
            <View style={styles.versionLeft}>
              <Ionicons name="time-outline" size={18} color={MUTED} />
              <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
                {vm.t('rxVersionStrip')}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onOpenVersionHistory}
              style={styles.versionLink}
            >
              <AppText variant="labelMd" color={ACTION} weightOverride="600">
                {vm.t('rxVersionHistory')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PatientField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.patientField}>
      <AppText variant="labelSm" color={MUTED}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={INK} weightOverride="600">
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
      <AppText variant="labelSm" color={MUTED}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={alert ? colors.error : INK}>
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
    borderBottomColor: HAIRLINE,
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
    backgroundColor: SUCCESS_FILL,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    paddingBottom: spacing.md,
  },
  doctorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    borderBottomColor: HAIRLINE,
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
    borderColor: HAIRLINE,
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
    borderColor: HAIRLINE,
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
    borderTopColor: HAIRLINE,
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
    borderColor: HAIRLINE,
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
  flex: {
    flex: 1,
  },
});
