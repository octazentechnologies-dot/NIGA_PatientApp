import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { OrderDetailsViewModel } from '../controllers/useOrderDetailsController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const ICON_CYAN = '#5CCEF7';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const CHIP_FILL = '#E6F5FE';
const WARN_FILL = '#FCF3E4';
const WARN = '#8A5109';

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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={INK}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('orderDetailTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsHelp')}
            onPress={vm.onHelp}
            style={styles.iconHit}
          >
            <Ionicons name="help-circle-outline" size={24} color={INK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 120 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.deliveredBanner}>
          <Ionicons name="checkmark-circle" size={20} color={SUCCESS} />
          <AppText variant="labelMd" color={SUCCESS} weightOverride="600" style={styles.flex}>
            {vm.deliveredLine}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="labelSm" color={MUTED} weightOverride="600" style={styles.uppercase}>
            {vm.t('orderDetailItems')}
          </AppText>
          {vm.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.flex}>
                <AppText variant="labelMd" color={INK} weightOverride="600">
                  {vm.t(item.nameKey)}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t(item.detailKey)}
                </AppText>
              </View>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {item.priceLabel}
              </AppText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('orderDetailSubtotal')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.subtotalLabel}
            </AppText>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('orderDetailDelivery')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.deliveryLabel}
            </AppText>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.t('orderDetailTotalPaid')}
            </AppText>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.totalPaidLabel}
            </AppText>
          </View>
          <AppText variant="labelSm" color={MUTED} style={styles.payNote}>
            {vm.paymentMethodLine}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenPrescription}
          style={styles.rxCard}
        >
          <View style={styles.rxIcon}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={22} color={ICON_CYAN} />
          </View>
          <AppText variant="bodyMd" color={INK} style={styles.flex}>
            {vm
              .t('orderDetailFulfilledAgainst')
              .replace('{rx}', vm.rxId)
              .replace('{doctor}', vm.doctorName)}
          </AppText>
          <Ionicons name="chevron-forward" size={20} color={MUTED} />
        </Pressable>

        <View style={styles.card}>
          <View style={styles.pharmacyHead}>
            <View style={styles.rxIcon}>
              <MaterialCommunityIcons name="storefront-outline" size={22} color={ICON_CYAN} />
            </View>
            <View style={styles.flex}>
              <View style={styles.pharmacyTitleRow}>
                <AppText variant="labelMd" color={INK} weightOverride="600" style={styles.flex}>
                  {vm.pharmacyName}
                </AppText>
                <View style={styles.licensedPill}>
                  <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
                    {vm.t('orderDetailLicensed')}
                  </AppText>
                </View>
              </View>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.pharmacyLicense}
              </AppText>
            </View>
          </View>
          <AppButton
            label={vm.t('orderDetailContactPharmacy')}
            variant="secondary"
            onPress={vm.onContactPharmacy}
          />
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('orderDetailMaskedNumber')}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.rowGap}>
            <View style={styles.rxIcon}>
              <Ionicons name="document-text-outline" size={22} color={ICON_CYAN} />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.t('orderDetailTaxInvoice').replace('{pharmacy}', vm.pharmacyName)}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.invoiceId}
              </AppText>
            </View>
          </View>
          <AppButton
            label={vm.t('orderDetailDownloadInvoice')}
            variant="secondary"
            onPress={vm.onDownloadInvoice}
          />
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('orderDetailInvoiceNote')}
          </AppText>
        </View>

        {vm.canRefill ? (
          <View style={styles.card}>
            <View style={styles.rowGap}>
              <View style={styles.rxIcon}>
                <Ionicons name="refresh-outline" size={22} color={ICON_CYAN} />
              </View>
              <View style={styles.flex}>
                <AppText variant="headlineMd" color={INK}>
                  {vm.t('orderDetailNeedRefill')}
                </AppText>
                <AppText variant="bodyMd" color={MUTED} style={styles.mtXs}>
                  {vm.t('orderDetailRefillBody')}
                </AppText>
              </View>
            </View>
            <AppButton
              label={vm.t('orderDetailRequestRefill')}
              onPress={vm.onOpenRefill}
            />
            <AppText variant="labelSm" color={MUTED}>
              {vm.t('orderDetailRefillNote')}
            </AppText>
          </View>
        ) : null}

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('orderDetailNeedHelp')}
          </AppText>
          <HelpRow
            label={vm.t('orderDetailHelpWrong')}
            onPress={vm.onHelpWrongItem}
          />
          <HelpRow
            label={vm.t('orderDetailHelpMissing')}
            onPress={vm.onHelpMissingItem}
          />
          <HelpRow
            label={vm.t('orderDetailHelpRefund')}
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
        <AppText variant="labelSm" color={MUTED} style={styles.footerNote}>
          {vm.rxValidTill}
        </AppText>
      </View>

      <RefillRequestSheet vm={vm} />
    </View>
  );
}

function HelpRow({
  label,
  onPress,
  last,
}: {
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.helpRow, !last && styles.helpRowBorder]}
    >
      <AppText variant="bodyLg" color={INK} style={styles.flex}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={MUTED} />
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
              color={MUTED}
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
                    color={INK}
                    weightOverride="600"
                    style={styles.flex}
                  >
                    {vm.t(med.nameKey)}
                  </AppText>
                  <View
                    style={[
                      styles.checkbox,
                      med.selected && styles.checkboxOn,
                    ]}
                  >
                    {med.selected ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>

            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.t('refillReasonLabel')}
            </AppText>
            <TextInput
              value={vm.refillReason}
              onChangeText={vm.onChangeRefillReason}
              placeholder={vm.t('refillReasonPlaceholder')}
              placeholderTextColor={MUTED}
              multiline
              textAlignVertical="top"
              style={styles.reasonInput}
            />

            <AppText variant="labelMd" color={INK} weightOverride="600">
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
                      color={selected ? ACTION_OUTLINE : INK}
                      weightOverride="600"
                    >
                      {vm.t(feeling.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color={MUTED} />
              <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
                {vm.t('refillConsentNote')}
              </AppText>
            </View>

            <AppButton
              label={vm.t('refillSendToDoctor')}
              onPress={vm.onSendRefill}
              disabled={!vm.refillMedicines.some((m) => m.selected)}
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
    backgroundColor: PAGE,
  },
  header: {
    backgroundColor: CARD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
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
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: HAIRLINE,
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
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: SUCCESS_FILL,
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
    borderBottomColor: HAIRLINE,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
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
    backgroundColor: CARD,
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
    backgroundColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  medRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: CARD,
    gap: spacing.sm,
  },
  medRowSelected: {
    backgroundColor: CHIP_FILL,
  },
  medRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD,
  },
  checkboxOn: {
    backgroundColor: ACTION,
    borderColor: ACTION,
  },
  reasonInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: INK,
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
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    justifyContent: 'center',
  },
  chipOn: {
    borderColor: ACTION_OUTLINE,
    backgroundColor: CHIP_FILL,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: PAGE,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.md,
  },
});
