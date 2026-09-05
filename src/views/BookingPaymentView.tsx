import { type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import type { BookingPaymentViewModel } from '../controllers/useBookingPaymentController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ICON_BLUE = '#3AA9E0';
const SELECT_FILL = '#F4FAFD';
const AMBER_FILL = '#FCF3E4';
const AMBER = '#8A5109';
const AMBER_BORDER = '#F2C14E';
const PLACEHOLDER = '#8A8A8A';

export function BookingPaymentView({
  language,
  t,
  paymentSummaryLine,
  doctorFeeLabel,
  platformFeeLabel,
  taxesLabel,
  totalLabel,
  holdLabel,
  breakdownOpen,
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
}: BookingPaymentViewModel) {
  const insets = useSafeAreaInsets();
  const footerReserve = 88 + Math.max(insets.bottom, spacing.md);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: Math.max(insets.top, spacing.sm) }}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <AppText variant="headlineMd" color="#000000" style={styles.title}>
            {t('payTitle')}
          </AppText>
          <View style={styles.iconButton}>
            <Ionicons name="lock-closed" size={18} color="#000000" />
          </View>
        </View>
        <View style={styles.holdBar}>
          <Ionicons name="time-outline" size={16} color={AMBER} />
          <AppText variant="labelSm" color={AMBER} weightOverride="600">
            {holdLabel}
          </AppText>
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
          <AppText variant="displayLg" color="#000000" style={styles.amount}>
            {totalLabel}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.summary}>
            {paymentSummaryLine}
          </AppText>
          {breakdownOpen ? (
            <View style={styles.breakdown}>
              <BreakdownRow label={t('reviewDoctorFee')} value={doctorFeeLabel} />
              <BreakdownRow label={t('reviewPlatformFee')} value={platformFeeLabel} />
              <BreakdownRow label={t('reviewTaxes')} value={taxesLabel} />
              <View style={styles.hairline} />
              <BreakdownRow label={t('reviewTotalPayable')} value={totalLabel} bold />
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

        <AppText variant="titleMd" color="#000000" style={styles.sectionTitle}>
          {t('payMethod')}
        </AppText>

        <View style={styles.group}>
          <View style={styles.groupHead}>
            <AppText variant="bodyLg" color="#000000">
              {t('payUpi')}
            </AppText>
            <View style={styles.brandRow}>
              <BrandChip label="GPay" tint="#4285F4" />
              <BrandChip label="Pe" tint="#5F259F" />
            </View>
          </View>
          <View style={styles.groupBody}>
            <MethodRow
              selected={method === 'gpay'}
              label={t('payGpay')}
              onPress={() => onSelectMethod('gpay')}
              mark={<BrandMark label="G" tint="#4285F4" />}
            />
            <MethodRow
              selected={method === 'phonepe'}
              label={t('payPhonePe')}
              onPress={() => onSelectMethod('phonepe')}
              mark={<BrandMark label="Pe" tint="#5F259F" />}
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
            <AppText variant="bodyLg" color="#000000" style={styles.flex}>
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
              <AppText variant="bodyLg" color={ICON_BLUE} weightOverride="600" style={styles.flex}>
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
          <AppText variant="bodyLg" color="#000000" style={styles.flex}>
            {t('payNetbanking')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {selectedBankLabel}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={MUTED} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenWalletPicker}
          style={[styles.rowCard, method === 'wallet' && styles.methodSelected]}
        >
          <View style={styles.circleMark}>
            <Ionicons name="wallet-outline" size={18} color={ICON_BLUE} />
          </View>
          <AppText variant="bodyLg" color="#000000" style={styles.flex}>
            {t('payWallets')}
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </Pressable>

        <View style={styles.trust}>
          <TrustCell icon="shield-checkmark-outline" label={t('payPci')} />
          <View style={styles.trustRule} />
          <TrustCell icon="lock-closed-outline" label={t('payNoStore')} />
          <View style={styles.trustRule} />
          <TrustCell icon="cash-outline" label={t('payRefunds')} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable
          accessibilityRole="button"
          onPress={onPay}
          style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
        >
          <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
          <AppText variant="titleMd" color="#FFFFFF">
            {payLabel}
          </AppText>
        </Pressable>
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
      <AppText variant="bodyMd" color="#000000" weightOverride={bold ? '600' : '400'}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color="#000000" weightOverride={bold ? '600' : '400'}>
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
        <AppText variant="bodyLg" color="#000000">
          {label}
        </AppText>
        {meta ? (
          <View style={styles.metaRow}>
            <AppText variant="bodyMd" color={MUTED}>
              {meta}
            </AppText>
            {badge ? (
              <View style={styles.badge}>
                <AppText variant="labelSm" color={MUTED} style={styles.badgeText}>
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
      <AppText variant="labelSm" color={MUTED} style={styles.trustLabel}>
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
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <AppText variant="headlineMd" color="#000000">
              {title}
            </AppText>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={22} color="#000000" />
            </Pressable>
          </View>
          {options.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[styles.sheetRow, item.selected && styles.methodSelected]}
            >
              <AppText variant="bodyLg" color="#000000" style={styles.flex}>
                {item.label}
              </AppText>
              {item.selected ? (
                <Ionicons name="checkmark-circle" size={20} color={ICON_BLUE} />
              ) : null}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: scaleFont(22),
    lineHeight: scaleFont(30),
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
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  amount: {
    fontSize: scaleFont(32),
    lineHeight: scaleFont(40),
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
    backgroundColor: HAIRLINE,
  },
  breakdownLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
    marginTop: 8,
  },
  group: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
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
    backgroundColor: '#F0F0F0',
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
    borderColor: HAIRLINE,
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
    backgroundColor: '#FFFFFF',
  },
  cardMark: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  circleMark: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    marginHorizontal: 4,
    marginBottom: 4,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    backgroundColor: '#FFFFFF',
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: HAIRLINE,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
  },
  payButton: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#D6D6D6',
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
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
});
