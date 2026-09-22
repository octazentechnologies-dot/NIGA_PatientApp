import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { ReviewOrderViewModel } from '../controllers/useReviewOrderController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';

export function ReviewOrderView(vm: ReviewOrderViewModel) {
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
          <AppText variant="headlineMd" color={INK} style={styles.flex} numberOfLines={1}>
            {vm.t('reviewOrderTitle')}
          </AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              layout.buttonHeight + 48 + sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.pharmacyTop}>
            <View style={styles.pharmacyLeft}>
              <View style={styles.pharmacyIcon}>
                <Ionicons name="medical" size={22} color={INK} />
              </View>
              <View style={styles.flex}>
                <AppText variant="headlineMd" color={INK}>
                  {vm.rxId}
                </AppText>
                <View style={styles.licenceRow}>
                  <View style={styles.licensed}>
                    <Ionicons name="shield-checkmark" size={12} color={SUCCESS} />
                    <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
                      {vm.t('pharmacyLicensed')}
                    </AppText>
                  </View>
                  <AppText variant="labelSm" color={MUTED} style={styles.flex}>
                    {vm.licenceShort}
                  </AppText>
                </View>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.distanceLine}
                </AppText>
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={vm.onChangePharmacy}>
              <AppText variant="labelMd" color={ACTION} weightOverride="600">
                {vm.t('orderMedsChange')}
              </AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('reviewOrderItems')}
          </AppText>
          {vm.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index < vm.items.length - 1 && styles.itemBorder,
              ]}
            >
              <View style={styles.itemIcon}>
                <MaterialCommunityIcons
                  name="bottle-tonic-plus-outline"
                  size={20}
                  color={MUTED}
                />
              </View>
              <View style={styles.flex}>
                <View style={styles.itemTitleRow}>
                  <AppText variant="bodyLg" color={INK} weightOverride="600" style={styles.flex}>
                    {vm.t(item.nameKey)}
                  </AppText>
                  <AppText variant="bodyLg" color={INK} weightOverride="600">
                    {item.priceLabel}
                  </AppText>
                </View>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t(item.doseKey)}
                </AppText>
                <AppText variant="labelMd" color={MUTED}>
                  {vm.t(item.qtyKey)}
                </AppText>
              </View>
            </View>
          ))}
          <View style={styles.subtotalRow}>
            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm.t('reviewOrderSubtotal')}
            </AppText>
            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm.medicinesSubtotal}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.deliveryHead}>
            <View style={styles.deliveryTitleRow}>
              <Ionicons name="home" size={20} color={ACTION} />
              <AppText variant="headlineMd" color={INK}>
                {vm.t('reviewOrderDelivery')}
              </AppText>
            </View>
            <Pressable accessibilityRole="button" onPress={vm.onChangeDelivery}>
              <AppText variant="labelMd" color={ACTION} weightOverride="600">
                {vm.t('orderMedsChange')}
              </AppText>
            </Pressable>
          </View>
          <AppText variant="bodyMd" color={INK}>
            {vm.addressLine}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.recipientLine}
          </AppText>
          <View style={styles.etaBox}>
            <Ionicons name="car-outline" size={20} color={SUCCESS} />
            <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
              {vm.deliveryEta}
            </AppText>
          </View>
          <TextInput
            value={vm.deliveryInstructions}
            onChangeText={vm.onChangeInstructions}
            placeholder={vm.t('reviewOrderInstructions')}
            placeholderTextColor={MUTED}
            style={[
              styles.instructions,
              { fontFamily: fontFamilyFor('400', vm.language, 'sans') },
            ]}
          />
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('reviewOrderPayment')}
          </AppText>
          <PayRow label={vm.t('reviewOrderMedicines')} value={vm.medicinesSubtotal} />
          <PayRow label={vm.t('reviewOrderDeliveryFee')} value={vm.deliveryFee} />
          <PayRow label={vm.t('reviewOrderTaxes')} value={vm.taxes} />
          <View style={styles.totalRow}>
            <AppText variant="headlineMd" color={INK}>
              {vm.t('reviewOrderTotalPayable')}
            </AppText>
            <AppText variant="headlineMd" color={INK}>
              {vm.totalPayable}
            </AppText>
          </View>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('reviewOrderPayNote')}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.consentHead}>
            <Ionicons name="shield-checkmark" size={22} color={ACTION_OUTLINE} />
            <AppText variant="headlineMd" color={INK} style={styles.flex}>
              {vm.t('reviewOrderShareTitle')}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: vm.consentChecked }}
            onPress={vm.onToggleConsent}
            style={styles.consentRow}
          >
            <View style={[styles.checkbox, vm.consentChecked && styles.checkboxOn]}>
              {vm.consentChecked ? (
                <Ionicons name="checkmark" size={14} color={colors.onButton} />
              ) : null}
            </View>
            <AppText variant="bodyMd" color={INK} weightOverride="600" style={styles.flex}>
              {vm.t('reviewOrderConsent').replace('{pharmacy}', vm.pharmacyName)}
            </AppText>
          </Pressable>
          <ShareLine ok text={vm.t('reviewOrderShareMeds')} />
          <ShareLine ok text={vm.t('reviewOrderSharePrescriber')} />
          <ShareLine ok text={vm.t('reviewOrderShareAddress')} />
          <ShareLine ok={false} text={vm.t('reviewOrderNotShared')} />
          <AppText variant="labelSm" color={MUTED} style={styles.consentNote}>
            {vm.t('reviewOrderConsentNote')}
          </AppText>
        </View>

        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onTogglePolicy}
            style={styles.policyHead}
          >
            <AppText variant="bodyLg" color={INK} weightOverride="600" style={styles.flex}>
              {vm.t('reviewOrderPolicyTitle')}
            </AppText>
            <Ionicons
              name={vm.policyOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={MUTED}
            />
          </Pressable>
          {vm.policyOpen ? (
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('reviewOrderPolicyBody')}
            </AppText>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppText variant="headlineMd" color={INK}>
          {vm.t('reviewOrderFooterTotal').replace('{total}', vm.totalPayable)}
        </AppText>
        <AppButton
          label={vm.t('reviewOrderProceed')}
          onPress={vm.onProceedToPay}
          disabled={!vm.canPay}
          style={styles.payBtn}
        />
      </View>
    </View>
  );
}

function PayRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.payRow}>
      <AppText variant="bodyMd" color={INK}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={INK}>
        {value}
      </AppText>
    </View>
  );
}

function ShareLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.shareLine}>
      <Ionicons
        name={ok ? 'checkmark' : 'close'}
        size={18}
        color={ok ? SUCCESS : MUTED}
      />
      <AppText variant="bodyMd" color={ok ? INK : MUTED} style={styles.flex}>
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
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pharmacyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pharmacyLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
  },
  pharmacyIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  licensed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  deliveryHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  deliveryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  instructions: {
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    paddingVertical: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    color: INK,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  consentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: 48,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: colors.card,
  },
  checkboxOn: {
    backgroundColor: ACTION,
    borderColor: ACTION,
  },
  shareLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: spacing.xl,
  },
  consentNote: {
    paddingLeft: spacing.xl,
    marginTop: spacing.xs,
  },
  policyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  payBtn: {
    flex: 1,
    maxWidth: 200,
  },
  flex: {
    flex: 1,
    textAlign: 'left',
  },
});
