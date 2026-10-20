import { type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
import type { BookingPaymentViewModel } from '../controllers/useBookingPaymentController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';

const ICON_BLUE = colors.primary;
const SELECT_FILL = colors.primaryContainer;
const AMBER_FILL = colors.warningContainer;
const AMBER = colors.warning;
const AMBER_BORDER = colors.tertiaryContainer;
const PLACEHOLDER = colors.outline;

export function BookingPaymentView({
  language,
  t,
  paymentSummaryLine,
  doctorFeeLabel,
  platformFeeLabel,
  taxesLabel,
  totalLabel,
  breakdownOpen,
  usesGatewayCheckout,
  method,
  upiId,
  banks,
  wallets,
  selectedBankId,
  selectedWalletId,
  bankPickerOpen,
  walletPickerOpen,
  selectedBankLabel,
  payLabel,
  payBusy,
  payError,
  showPayAtClinic,
  onBack,
  onToggleBreakdown,
  onSelectMethod,
  onChangeUpiId,
  onOpenBankPicker,
  onCloseBankPicker,
  onSelectBank,
  onOpenWalletPicker,
  onCloseWalletPicker,
  onSelectWallet,
  onAddCard,
  onPay,
  onPayAtClinic,
}: BookingPaymentViewModel) {
  const insets = useSafeAreaInsets();
  const footerReserve =
    (showPayAtClinic ? 108 : 72) + sheetBottomPadding(insets, spacing.sm);
  const payDisabled = payBusy;

  return (
    <View style={styles.root}>
      <View
        style={{
          paddingTop: Math.max(insets.top, spacing.sm),
          backgroundColor: colors.card,
        }}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText variant="headlineMd" color={colors.ink} style={styles.title}>
            {t('payTitle')}
          </AppText>
          <View style={styles.iconButton}>
            <Ionicons name="lock-closed" size={18} color={colors.ink} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: footerReserve }]}
      >
        <View style={styles.amountCard}>
          <AppText variant="displayLg" color={colors.ink} style={styles.amount}>
            {totalLabel}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted} style={styles.summary}>
            {paymentSummaryLine}
          </AppText>
          {breakdownOpen ? (
            <View style={styles.breakdown}>
              {doctorFeeLabel ? (
                <BreakdownRow label={t('reviewDoctorFee')} value={doctorFeeLabel} />
              ) : null}
              {platformFeeLabel ? (
                <BreakdownRow label={t('reviewPlatformFee')} value={platformFeeLabel} />
              ) : null}
              {taxesLabel ? (
                <BreakdownRow label={t('reviewTaxes')} value={taxesLabel} />
              ) : null}
              <View style={styles.hairline} />
              {totalLabel ? (
                <BreakdownRow label={t('reviewTotalPayable')} value={totalLabel} bold />
              ) : null}
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onToggleBreakdown}
            style={styles.breakdownLink}
          >
            <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
              {t(breakdownOpen ? 'payHideBreakdown' : 'payViewBreakdown')}
            </AppText>
            <Ionicons
              name={breakdownOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={ICON_BLUE}
            />
          </Pressable>
        </View>

        {usesGatewayCheckout ? (
          <View style={styles.group}>
            <View style={styles.groupBody}>
              <AppText variant="bodyMd" color={colors.muted}>
                Card, UPI, and netbanking open in the secure Razorpay Checkout. Amounts come from the
                server order — the app never sets the price.
              </AppText>
              {payError ? (
                <AppText variant="bodyMd" color={colors.error} style={{ marginTop: spacing.sm }}>
                  {payError}
                </AppText>
              ) : null}
            </View>
          </View>
        ) : (
          <>
            <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
              {t('payMethod')}
            </AppText>

            <View style={styles.group}>
              <View style={styles.groupHead}>
                <AppText variant="bodyLg" color={colors.ink}>
                  {t('payUpi')}
                </AppText>
                <View style={styles.brandRow}>
                  <BrandChip label="GPay" tint={colors.link} />
                  <BrandChip label="Pe" tint={colors.astro} />
                </View>
              </View>
              <View style={styles.groupBody}>
                <MethodRow
                  selected={method === 'gpay'}
                  label={t('payGpay')}
                  onPress={() => onSelectMethod('gpay')}
                  mark={<BrandMark label="G" tint={colors.link} />}
                />
                <MethodRow
                  selected={method === 'phonepe'}
                  label={t('payPhonePe')}
                  onPress={() => onSelectMethod('phonepe')}
                  mark={<BrandMark label="Pe" tint={colors.astro} />}
                />
                <MethodRow
                  selected={method === 'paytm'}
                  label={t('payPaytm')}
                  onPress={() => onSelectMethod('paytm')}
                  mark={<BrandMark label="Pay" tint="#00BAF2" />}
                />
                <MethodRow
                  selected={method === 'upi'}
                  label={t('payEnterUpi')}
                  onPress={() => onSelectMethod('upi')}
                  mark={
                    <View style={styles.dashedMark}>
                      <Ionicons name="add" size={18} color={ICON_BLUE} />
                    </View>
                  }
                />
                {method === 'upi' ? (
                  <TextInput
                    value={upiId}
                    onChangeText={onChangeUpiId}
                    placeholder={t('payUpiPlaceholder')}
                    placeholderTextColor={PLACEHOLDER}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.upiInput,
                      { fontFamily: fontFamilyFor('400', language, 'sans') },
                    ]}
                  />
                ) : null}
              </View>
            </View>

            <View style={styles.group}>
              <View style={styles.groupHead}>
                <AppText variant="bodyLg" color={colors.ink} style={styles.flex}>
                  {t('payCards')}
                </AppText>
                <View style={styles.brandRow}>
                  <BrandChip label="VISA" tint="#1A1F71" />
                  <BrandChip label="MC" tint="#EB001B" />
                </View>
              </View>
              <View style={styles.groupBody}>
                <MethodRow
                  selected={method === 'hdfc'}
                  label={t('paySavedCard')}
                  meta={t('paySavedCardMeta')}
                  badge={t('paySavedBadge')}
                  onPress={() => onSelectMethod('hdfc')}
                  mark={
                    <View style={styles.cardMark}>
                      <Ionicons name="card-outline" size={18} color={ICON_BLUE} />
                    </View>
                  }
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={onAddCard}
                  style={[styles.addCard, method === 'addCard' && styles.methodSelected]}
                >
                  <View style={styles.radioSlot} />
                  <View style={styles.dashedMark}>
                    <Ionicons name="add" size={18} color={ICON_BLUE} />
                  </View>
                  <AppText
                    variant="bodyLg"
                    color={ICON_BLUE}
                    weightOverride="600"
                    style={styles.flex}
                  >
                    {t('payAddCard')}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onOpenBankPicker}
              style={[styles.rowCard, method === 'netbanking' && styles.methodSelected]}
            >
              <View style={styles.circleMark}>
                <Ionicons name="business-outline" size={18} color={ICON_BLUE} />
              </View>
              <AppText variant="bodyLg" color={colors.ink} style={styles.flex}>
                {t('payNetbanking')}
              </AppText>
              <AppText variant="bodyMd" color={colors.muted}>
                {selectedBankLabel}
              </AppText>
              <Ionicons name="chevron-down" size={18} color={colors.muted} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onOpenWalletPicker}
              style={[styles.rowCard, method === 'wallet' && styles.methodSelected]}
            >
              <View style={styles.circleMark}>
                <Ionicons name="wallet-outline" size={18} color={ICON_BLUE} />
              </View>
              <AppText variant="bodyLg" color={colors.ink} style={styles.flex}>
                {t('payWallets')}
              </AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </>
        )}

        <View style={styles.trust}>
          <TrustCell icon="shield-checkmark-outline" label={t('payPci')} />
          <View style={styles.trustRule} />
          <TrustCell icon="lock-closed-outline" label={t('payNoStore')} />
          <View style={styles.trustRule} />
          <TrustCell icon="cash-outline" label={t('payRefunds')} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.sm) },
        ]}
      >
        <AppButton
          label={payLabel}
          onPress={onPay}
          disabled={payDisabled}
          icon={<Ionicons name="lock-closed" size={16} color={colors.card} />}
        />
        {showPayAtClinic ? (
          <Pressable
            accessibilityRole="button"
            onPress={onPayAtClinic}
            disabled={payBusy}
            style={styles.clinicLink}
          >
            <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
              {t('payAtClinicInstead')}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <PickerSheet
        visible={bankPickerOpen}
        title={t('paySelectBank')}
        options={banks.map((item) => ({
          id: item.id,
          label: t(item.nameKey),
          selected: item.id === selectedBankId,
        }))}
        onClose={onCloseBankPicker}
        onSelect={onSelectBank}
      />
      <PickerSheet
        visible={walletPickerOpen}
        title={t('payWallets')}
        options={wallets.map((item) => ({
          id: item.id,
          label: t(item.nameKey),
          selected: item.id === selectedWalletId,
        }))}
        onClose={onCloseWalletPicker}
        onSelect={onSelectWallet}
      />
    </View>
  );
}

function BreakdownRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.breakRow}>
      <AppText variant="bodyMd" color={colors.ink} weightOverride={bold ? '600' : '400'}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={colors.ink} weightOverride={bold ? '600' : '400'}>
        {value}
      </AppText>
    </View>
  );
}

function MethodRow({
  selected,
  label,
  meta,
  badge,
  mark,
  onPress,
}: {
  selected: boolean;
  label: string;
  meta?: string;
  badge?: string;
  mark: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.methodRow, selected && styles.methodSelected]}
    >
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={selected ? ICON_BLUE : PLACEHOLDER}
      />
      {mark}
      <View style={styles.flex}>
        <AppText variant="bodyLg" color={colors.ink}>
          {label}
        </AppText>
        {meta ? (
          <View style={styles.metaRow}>
            <AppText variant="bodyMd" color={colors.muted}>
              {meta}
            </AppText>
            {badge ? (
              <View style={styles.badge}>
                <AppText variant="labelSm" color={colors.muted} style={styles.badgeText}>
                  {badge}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function BrandMark({ label, tint }: { label: string; tint: string }) {
  return (
    <View style={[styles.brandMark, { backgroundColor: `${tint}14` }]}>
      <AppText variant="labelSm" color={tint} weightOverride="600" languageOverride="en">
        {label}
      </AppText>
    </View>
  );
}

function BrandChip({ label, tint }: { label: string; tint: string }) {
  return (
    <AppText variant="labelSm" color={tint} weightOverride="600" languageOverride="en" style={styles.chip}>
      {label}
    </AppText>
  );
}

function TrustCell({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.trustCell}>
      <Ionicons name={icon} size={18} color={ICON_BLUE} />
      <AppText variant="labelSm" color={colors.muted} style={styles.trustLabel}>
        {label}
      </AppText>
    </View>
  );
}

function PickerSheet({
  visible,
  title,
  options,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: { id: string; label: string; selected: boolean }[];
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaModal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.xl) },
          ]}
          onPress={() => undefined}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <AppText variant="headlineMd" color={colors.ink}>
              {title}
            </AppText>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>
          {options.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[styles.sheetRow, item.selected && styles.methodSelected]}
            >
              <AppText variant="bodyLg" color={colors.ink} style={styles.flex}>
                {item.label}
              </AppText>
              {item.selected ? (
                <Ionicons name="checkmark-circle" size={20} color={ICON_BLUE} />
              ) : null}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  topBar: {
    backgroundColor: colors.card,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  title: {
    flex: 1,
    textAlign: 'left',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(26),
  },
  iconButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: AMBER_FILL,
    borderBottomWidth: 1,
    borderBottomColor: AMBER_BORDER,
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: spacing.gutter,
    gap: 12,
  },
  amountCard: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
  },
  amount: {
    fontSize: scaleFont(24),
    lineHeight: scaleFont(30),
  },
  summary: {
    textAlign: 'center',
    maxWidth: 260,
  },
  breakdown: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 8,
  },
  breakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  hairline: {
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  breakdownLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
    marginTop: 8,
  },
  group: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  groupBody: {
    padding: 8,
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    opacity: 0.7,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodSelected: {
    borderColor: ICON_BLUE,
    borderWidth: 1.5,
    backgroundColor: SELECT_FILL,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    textTransform: 'uppercase',
    fontSize: scaleFont(10),
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dashedMark: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: PLACEHOLDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  cardMark: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  circleMark: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.sm,
  },
  radioSlot: {
    width: 20,
  },
  upiInput: {
    borderWidth: 1,
    borderColor: PLACEHOLDER,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: scaleFont(14),
    color: colors.ink,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  trustCell: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  trustLabel: {
    textAlign: 'center',
    fontSize: scaleFont(10),
    lineHeight: scaleFont(14),
  },
  trustRule: {
    width: 1,
    height: 40,
    backgroundColor: colors.outlineVariant,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  clinicLink: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginBottom: 4,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
});
