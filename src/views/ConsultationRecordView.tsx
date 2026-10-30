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

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { AppToast } from '../components/AppToast';
import { images } from '../config/images';
import type { ConsultationRecordViewModel } from '../controllers/useConsultationRecordController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const WARN = colors.warning;
const WARN_FILL = colors.warningContainer;
export function ConsultationRecordView(vm: ConsultationRecordViewModel) {
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
            {vm.t('consultRecordTitle')}
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
              layout.buttonHeight +
              spacing.xl +
              sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <View style={styles.signedBanner}>
          <View style={styles.signedRow}>
            <Ionicons name="lock-closed" size={18} color={colors.success} />
            <AppText variant="labelMd" color={colors.success} style={styles.flex}>
              {vm.signedBanner}
            </AppText>
          </View>
          <AppText variant="labelSm" color={colors.success} style={styles.signedSub}>
            {vm.t('consultRecordImmutable')}
          </AppText>
        </View>

        <View style={styles.pad}>
          <View style={styles.card}>
            <View style={styles.doctorRow}>
              <View>
                <Image source={images.doctorPortrait} style={styles.avatar} />
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                </View>
              </View>
              <View style={styles.flex}>
                <AppText variant="titleMd" color={colors.ink}>
                  {vm.doctorName}
                </AppText>
                <AppText variant="bodyMd" color={colors.muted}>
                  {vm.credentials}
                </AppText>
                <AppText variant="labelSm" color={colors.muted}>
                  {vm.regNo}
                </AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <MetaRow
              icon="person-outline"
              label={vm.t('consultRecordPatientLabel')}
              value={vm.patientLine}
            />
            <MetaRow
              icon="videocam-outline"
              label={vm.t('consultRecordConsultLabel')}
              value={vm.consultLine}
            />
            <MetaRow
              icon="pricetag-outline"
              label={vm.t('consultRecordIdLabel')}
              value={vm.recordId}
            />
          </View>

          <View style={styles.versionStrip}>
            <View style={styles.versionLeft}>
              <Ionicons name="time-outline" size={18} color={colors.muted} />
              <AppText variant="bodyMd" color={colors.muted} style={styles.flex}>
                {vm.versionStripLabel}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onOpenVersionHistory}
              style={styles.versionLink}
            >
              <AppText variant="labelMd" color={colors.primary} weightOverride="600">
                {vm.t('consultRecordVersionHistory')}
              </AppText>
            </Pressable>
          </View>

          <AppText variant="headlineMd" color={colors.ink} style={styles.sectionTitle}>
            {vm.t('consultRecordClinicalNotes')}
          </AppText>

          {vm.notes.map((note) => (
            <View key={note.id} style={styles.accordion}>
              <Pressable
                accessibilityRole="button"
                onPress={() => vm.onToggleNote(note.id)}
                style={styles.accordionHeader}
              >
                <AppText variant="bodyLg" color={colors.ink} style={styles.flex}>
                  {vm.t(note.titleKey)}
                </AppText>
                <Ionicons
                  name={note.open ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
              {note.open ? (
                <View style={styles.accordionBody}>
                  <AppText variant="bodyMd" color={colors.muted}>
                    {vm.t(note.bodyKey)}
                  </AppText>
                </View>
              ) : null}
            </View>
          ))}

          <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
            {vm.t('consultRecordAttachments')}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachRow}
          >
            <View style={styles.attachCard}>
              <Ionicons name="document-text-outline" size={36} color={colors.muted} />
              <AppText variant="labelSm" color={colors.muted} numberOfLines={2} style={styles.center}>
                {vm.t('consultRecordAttachLab')}
              </AppText>
            </View>
            <View style={styles.attachCard}>
              <Image
                source={images.categoryAllergy}
                style={styles.attachImage}
                resizeMode="cover"
              />
              <AppText variant="labelSm" color={colors.muted} numberOfLines={1} style={styles.center}>
                {vm.t('consultRecordAttachAllergy')}
              </AppText>
            </View>
          </ScrollView>

          <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
            {vm.t('consultRecordLinked')}
          </AppText>
          <Pressable
            style={styles.linkedCard}
            onPress={vm.onOpenPrescription}
            accessibilityRole="button"
          >
            <View style={styles.linkedIcon}>
              <Ionicons name="medical-outline" size={20} color={colors.success} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
                {vm.t('recordsRxTitle')}
              </AppText>
              <View style={styles.activeRow}>
                <View style={styles.activeDot} />
                <AppText variant="labelSm" color={colors.success} weightOverride="600">
                  {vm.t('recordsRxActive')}
                </AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
          <Pressable
            style={styles.linkedCard}
            onPress={vm.onOpenFollowUp}
            accessibilityRole="button"
          >
            <View style={[styles.linkedIcon, styles.linkedIconBlue]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
                {vm.t('consultRecordFollowUp')}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t('consultRecordFollowUpMeta')}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

          <AppButton
            label={vm.t('consultRecordDownloadPdf')}
            onPress={vm.onDownload}
            icon={<Ionicons name="download-outline" size={20} color={colors.onButton} />}
            style={styles.downloadBtn}
          />
          <AppText variant="labelSm" color={colors.muted} style={styles.downloadHint}>
            {vm.t('consultRecordDownloadHint')}
          </AppText>
        </View>
      </ScrollView>

      <SafeAreaModal
        transparent
        animationType="slide"
        visible={vm.versionHistoryOpen}
        onRequestClose={vm.onCloseVersionHistory}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={vm.onCloseVersionHistory} />
          <View
            style={[
              styles.sheet,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <AppText variant="headlineMd" color={colors.ink} style={styles.flex}>
                {vm.t('consultRecordVersionHistory')}
              </AppText>
              <Pressable
                accessibilityRole="button"
                onPress={vm.onCloseVersionHistory}
                style={styles.iconHit}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <AppText variant="bodyMd" color={colors.muted} style={styles.sheetSub}>
              {vm.t('consultRecordVersionHistoryHint')}
            </AppText>
            {vm.versions.map((version) => (
              <View key={version.id} style={styles.versionCard}>
                <View style={styles.flex}>
                  <View style={styles.versionTitleRow}>
                    <AppText
                      variant="titleMd"
                      color={version.current ? colors.ink : colors.muted}
                    >
                      {version.label}
                    </AppText>
                    <View
                      style={[
                        styles.versionBadge,
                        version.current ? styles.badgeCurrent : styles.badgeOld,
                      ]}
                    >
                      <AppText
                        variant="labelSm"
                        color={version.current ? colors.success : WARN}
                        weightOverride="600"
                      >
                        {vm.t(
                          version.current
                            ? 'consultRecordVersionCurrent'
                            : 'consultRecordVersionSuperseded',
                        )}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="labelSm" color={colors.muted}>
                    {vm.t(version.dateKey)}
                  </AppText>
                  {version.noteKey ? (
                    <AppText variant="bodyMd" color={colors.muted}>
                      {vm.t(version.noteKey)}
                    </AppText>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => vm.onSelectVersion(version.id)}
                  style={styles.viewVersionBtn}
                >
                  <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
                    {vm.t('recordsView')}
                  </AppText>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaModal>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={20} color={colors.muted} />
      <View style={styles.flex}>
        <AppText variant="labelSm" color={colors.muted} style={styles.metaLabel}>
          {label}
        </AppText>
        <AppText variant="bodyLg" color={colors.ink}>
          {value}
        </AppText>
      </View>
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
  signedBanner: {
    backgroundColor: colors.successContainer,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 4,
  },
  signedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signedSub: {
    paddingLeft: 26,
  },
  pad: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  doctorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: colors.card,
    borderRadius: radii.full,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  metaLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  flex: {
    flex: 1,
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
  sectionTitle: {
    marginTop: spacing.xs,
  },
  accordion: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    overflow: 'hidden',
  },
  accordionHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  attachRow: {
    gap: spacing.md,
  },
  attachCard: {
    width: 128,
    height: 160,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  attachImage: {
    width: '100%',
    height: 96,
    borderRadius: radii.sm,
    backgroundColor: colors.outlineVariant,
  },
  center: {
    textAlign: 'center',
  },
  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: 64,
  },
  linkedIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedIconBlue: {
    backgroundColor: colors.primaryContainer,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.success,
  },
  downloadBtn: {
    marginTop: spacing.sm,
  },
  downloadHint: {
    textAlign: 'center',
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 31, 31, 0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: '80%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetSub: {
    marginBottom: spacing.md,
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  versionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  versionBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeCurrent: {
    backgroundColor: colors.successContainer,
  },
  badgeOld: {
    backgroundColor: WARN_FILL,
  },
  viewVersionBtn: {
    minHeight: 40,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.primaryOutline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
