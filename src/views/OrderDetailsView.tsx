import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';
import { colors } from '../theme/colors';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { OrderDetailsViewModel } from '../controllers/useOrderDetailsController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const WARN_FILL = colors.warningContainer;
const WARN = colors.warning;

export function OrderDetailsView(vm: OrderDetailsViewModel) {
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
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={colors.ink}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('orderDetailTitle')}
          </AppText>
          {/* Spacer keeps title alignment after removing help icon */}
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 120 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        {vm.showDeliveredBanner && vm.deliveredLine ? (
          <View style={styles.deliveredBanner}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <AppText
              variant="labelMd"
              color={colors.success}
              weightOverride="600"
              style={styles.flex}
            >
              {vm.deliveredLine}
            </AppText>
          </View>
        ) : null}

        <View style={styles.card}>
          <AppText
            variant="labelSm"
            color={colors.muted}
            weightOverride="600"
            style={styles.uppercase}
          >
            {vm.t('orderDetailItems')}
          </AppText>
          {vm.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.flex}>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                  {item.name}
                </AppText>
                {item.detail ? (
                  <AppText variant="bodyMd" color={colors.muted}>
                    {item.detail}
                  </AppText>
                ) : null}
              </View>
              {item.priceLabel ? (
                <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                  {item.priceLabel}
                </AppText>
              ) : null}
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t('orderDetailSubtotal')}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.subtotalLabel}
            </AppText>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t('orderDetailDelivery')}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.deliveryLabel}
            </AppText>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.t('orderDetailTotalPaid')}
            </AppText>
            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.totalPaidLabel}
            </AppText>
          </View>
          {vm.paymentMethodLine ? (
            <AppText variant="labelSm" color={colors.muted} style={styles.payNote}>
              {vm.paymentMethodLine}
            </AppText>
          ) : null}
        </View>

        {vm.showFulfilledCard ? (
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenPrescription}
            style={styles.rxCard}
          >
            <View style={styles.rxIcon}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={22}
                color={colors.iconFill}
              />
            </View>
            <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
              {vm
                .t('orderDetailFulfilledAgainst')
                .replace('{rx}', vm.rxId || '—')
                .replace('{doctor}', vm.doctorName || '—')}
            </AppText>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ) : null}

        {(vm.pharmacyName || vm.pharmacyLicense) ? (
          <View style={styles.card}>
            <View style={styles.pharmacyHead}>
              <View style={styles.rxIcon}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={22}
                  color={colors.iconFill}
                />
              </View>
              <View style={styles.flex}>
                <View style={styles.pharmacyTitleRow}>
                  <AppText
                    variant="labelMd"
                    color={colors.ink}
                    weightOverride="600"
                    style={styles.flex}
                  >
                    {vm.pharmacyName || vm.t('orderDetailPharmacyFallback')}
                  </AppText>
                  {vm.pharmacyLicensed ? (
                    <View style={styles.licensedPill}>
                      <AppText
                        variant="labelSm"
                        color={colors.success}
                        weightOverride="600"
                      >
                        {vm.t('orderDetailLicensed')}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                {vm.pharmacyLicense ? (
                  <AppText variant="bodyMd" color={colors.muted}>
                    {vm.pharmacyLicense}
                  </AppText>
                ) : null}
                {vm.pharmacyArea ? (
                  <AppText variant="bodyMd" color={colors.muted}>
                    {vm.pharmacyArea}
                  </AppText>
                ) : null}
              </View>
            </View>
            <AppButton
              label={vm.t('orderDetailContactPharmacy')}
              variant="secondary"
              onPress={vm.onContactPharmacy}
            />
            {vm.pharmacyContactNote ? (
              <AppText variant="labelSm" color={colors.muted}>
                {vm.pharmacyContactNote}
              </AppText>
            ) : null}
          </View>
        ) : null}

        {vm.showInvoiceCard ? (
          <View style={styles.card}>
            <View style={styles.rowGap}>
              <View style={styles.rxIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={colors.iconFill}
                />
              </View>
              <View style={styles.flex}>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                  {vm
                    .t('orderDetailTaxInvoice')
                    .replace(
                      '{pharmacy}',
                      vm.pharmacyName || vm.t('orderDetailPharmacyFallback'),
                    )}
                </AppText>
                {vm.invoiceId ? (
                  <AppText variant="bodyMd" color={colors.muted}>
                    {vm.invoiceId}
                  </AppText>
                ) : null}
              </View>
            </View>
            {vm.showInvoiceDownload ? (
              <AppButton
                label={vm.t('orderDetailDownloadInvoice')}
                variant="secondary"
                onPress={vm.onDownloadInvoice}
                loading={vm.invoiceBusy}
                disabled={vm.invoiceBusy}
              />
            ) : null}
            {vm.invoiceMessage ? (
              <AppText variant="bodyMd" color={colors.ink}>
                {vm.invoiceMessage}
              </AppText>
            ) : null}
            <AppText variant="labelSm" color={colors.muted}>
              {vm.t('orderDetailInvoiceNote')}
            </AppText>
          </View>
        ) : null}

        {vm.canRefill ? (
          <View style={styles.card}>
            <View style={styles.rowGap}>
              <View style={styles.rxIcon}>
                <Ionicons name="refresh-outline" size={22} color={colors.iconFill} />
              </View>
              <View style={styles.flex}>
                <AppText variant="headlineMd" color={colors.ink}>
                  {vm.t('orderDetailNeedRefill')}
                </AppText>
                <AppText variant="bodyMd" color={colors.muted} style={styles.mtXs}>
                  {vm.t('orderDetailRefillBody')}
                </AppText>
              </View>
            </View>
            <AppButton
              label={vm.t('orderDetailRequestRefill')}
              onPress={vm.onOpenRefill}
            />
            <AppText variant="labelSm" color={colors.muted}>
              {vm.t('orderDetailRefillNote')}
            </AppText>
            {vm.refillMessage ? (
              <AppText variant="bodyMd" color={colors.ink}>
                {vm.refillMessage}
              </AppText>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink}>
            {vm.t('orderDetailNeedHelp')}
          </AppText>
          <HelpRow
            label={vm.t('orderDetailHelpWrong')}
            badge={vm.helpComingSoon ? vm.t('orderDetailHelpComingSoon') : null}
            onPress={vm.onHelpWrongItem}
          />
          <HelpRow
            label={vm.t('orderDetailHelpMissing')}
            badge={vm.helpComingSoon ? vm.t('orderDetailHelpComingSoon') : null}
            onPress={vm.onHelpMissingItem}
          />
          <HelpRow
            label={vm.t('orderDetailHelpRefund')}
            badge={vm.helpComingSoon ? vm.t('orderDetailHelpComingSoon') : null}
            onPress={vm.onHelpRefund}
            last
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton
          label={vm.t('medsReorder')}
          variant="secondary"
          onPress={vm.onReorder}
        />
        {vm.rxValidTill ? (
          <AppText variant="labelSm" color={colors.muted} style={styles.footerNote}>
            {vm.rxValidTill}
          </AppText>
        ) : null}
      </View>

      <RefillRequestSheet vm={vm} />
    </View>
  );
}

function HelpRow({
  label,
  badge,
  onPress,
  last,
}: {
  label: string;
  badge?: string | null;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.helpRow, !last && styles.helpRowBorder]}
    >
      <AppText variant="bodyLg" color={colors.ink} style={styles.flex}>
        {label}
      </AppText>
      {badge ? (
        <View style={styles.comingSoonPill}>
          <AppText variant="labelSm" color={WARN} weightOverride="600">
            {badge}
          </AppText>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      )}
    </Pressable>
  );
}

function RefillRequestSheet({ vm }: { vm: OrderDetailsViewModel }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={vm.refillOpen}
      onRequestClose={vm.onCloseRefill}
    >
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetScrim} onPress={vm.onCloseRefill} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetBody}
          >
            <View style={styles.awaitingPill}>
              <Ionicons name="time-outline" size={14} color={WARN} />
              <AppText variant="labelSm" color={WARN} weightOverride="600">
                {vm.t('refillAwaitingBadge')}
              </AppText>
            </View>

            <AppText
              variant="labelSm"
              color={colors.muted}
              weightOverride="600"
              style={styles.uppercase}
            >
              {vm.t('refillSelectMedicines')}
            </AppText>
            <View style={styles.medList}>
              {vm.refillMedicines.map((med, index) => (
                <Pressable
                  key={med.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: med.selected }}
                  onPress={() => vm.onToggleRefillMedicine(med.id)}
                  style={[
                    styles.medRow,
                    med.selected && styles.medRowSelected,
                    index < vm.refillMedicines.length - 1 && styles.medRowBorder,
                  ]}
                >
                  <AppText
                    variant="labelMd"
                    color={colors.ink}
                    weightOverride="600"
                    style={styles.flex}
                  >
                    {med.name}
                  </AppText>
                  <View
                    style={[
                      styles.checkbox,
                      med.selected && styles.checkboxOn,
                    ]}
                  >
                    {med.selected ? (
                      <Ionicons name="checkmark" size={14} color={colors.card} />
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>

            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.t('refillReasonLabel')}
            </AppText>
            <TextInput
              value={vm.refillReason}
              onChangeText={vm.onChangeRefillReason}
              placeholder={vm.t('refillReasonPlaceholder')}
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              style={styles.reasonInput}
            />

            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.t('refillFeelingLabel')}
            </AppText>
            <View style={styles.chipWrap}>
              {vm.refillFeelings.map((feeling) => {
                const selected = vm.refillFeeling === feeling.id;
                return (
                  <Pressable
                    key={feeling.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => vm.onSelectFeeling(feeling.id)}
                    style={[styles.chip, selected && styles.chipOn]}
                  >
                    <AppText
                      variant="labelMd"
                      color={selected ? colors.primaryOutline : colors.ink}
                      weightOverride="600"
                    >
                      {vm.t(feeling.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.muted}
              />
              <AppText variant="bodyMd" color={colors.muted} style={styles.flex}>
                {vm.t('refillConsentNote')}
              </AppText>
            </View>

            {vm.refillMessage ? (
              <AppText variant="bodyMd" color={colors.ink}>
                {vm.refillMessage}
              </AppText>
            ) : null}
            <AppButton
              label={vm.t('refillSendToDoctor')}
              onPress={vm.onSendRefill}
            />
          </ScrollView>
        </View>
      </View>
    </SafeAreaModal>
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
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  deliveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successContainer,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  uppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  flex: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  payNote: {
    marginTop: 4,
  },
  rxCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
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
  pharmacyHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pharmacyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  licensedPill: {
    backgroundColor: colors.successContainer,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comingSoonPill: {
    backgroundColor: WARN_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mtXs: {
    marginTop: 4,
  },
  helpRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  helpRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
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
    gap: spacing.sm,
  },
  footerNote: {
    textAlign: 'center',
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 31, 31, 0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '92%',
    paddingHorizontal: spacing.md,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetBody: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  awaitingPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: WARN_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  medList: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  medRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  medRowSelected: {
    backgroundColor: colors.primaryContainer,
  },
  medRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  chipOn: {
    borderColor: colors.primaryOutline,
    backgroundColor: colors.primaryContainer,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
});
