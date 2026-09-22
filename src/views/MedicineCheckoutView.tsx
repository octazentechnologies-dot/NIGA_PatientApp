import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  MedicineCheckoutViewModel,
} from '../controllers/useMedicineCheckoutController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';
const ICON_CYAN = '#5CCEF7';

export function MedicineCheckoutView(vm: MedicineCheckoutViewModel) {
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
            {vm.t('checkoutTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('languageLabel')}
            onPress={vm.onToggleLanguage}
            style={styles.iconHit}
          >
            <Ionicons name="language-outline" size={22} color={INK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <AppText variant="headlineMd" color={INK}>
              {vm.t('checkoutDeliveryAddress')}
            </AppText>
            <Pressable accessibilityRole="button" onPress={vm.onEditAddress}>
              <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
                {vm.t('checkoutEdit')}
              </AppText>
            </Pressable>
          </View>
          <AppText variant="bodyLg" color={INK} weightOverride="600">
            {vm.recipientName}
          </AppText>
          {vm.addressLines.map((line) => (
            <AppText key={line} variant="bodyMd" color={MUTED}>
              {line}
            </AppText>
          ))}
          <AppText variant="bodyMd" color={MUTED}>
            {vm.phoneLabel}
          </AppText>
          <View style={styles.delayBox}>
            <Ionicons name="car-outline" size={20} color={WARN} />
            <View style={styles.flex}>
              <AppText variant="labelMd" color={WARN} weightOverride="600">
                {vm.t('checkoutDelayTitle')}
              </AppText>
              <AppText variant="bodyMd" color={WARN}>
                {vm.t('checkoutDelayBody')}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('checkoutOrderItems')}
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
                  name={
                    item.icon === 'vial'
                      ? 'needle'
                      : 'bottle-tonic-plus-outline'
                  }
                  size={28}
                  color={ICON_CYAN}
                />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyLg" color={INK} weightOverride="600">
                  {vm.t(item.nameKey)}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t(item.metaKey)}
                </AppText>
              </View>
              <AppText variant="bodyLg" color={INK} weightOverride="600">
                {item.priceLabel}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('checkoutPaymentDetails')}
          </AppText>
          <PayRow label={vm.t('checkoutSubtotal')} value={vm.subtotalLabel} muted />
          <PayRow label={vm.t('checkoutTaxesFees')} value={vm.taxesLabel} muted />
          <PayRow
            label={vm.t('checkoutShipping')}
            value={vm.shippingLabel}
            muted
            valueColor={vm.shippingFree ? ACTION_OUTLINE : MUTED}
            valueWeight={vm.shippingFree ? '600' : '400'}
          />
          <View style={styles.totalDivider} />
          <PayRow
            label={vm.t('checkoutTotal')}
            value={vm.totalLabel}
            large
          />

          <AppText
            variant="labelSm"
            color={MUTED}
            style={styles.payWithLabel}
            weightOverride="500"
          >
            {vm.t('checkoutPayWith')}
          </AppText>
          <MethodRow
            selected={vm.method === 'card'}
            icon="card-outline"
            label={vm.t('checkoutPayCard')}
            onPress={() => vm.onSelectMethod('card')}
          />
          <MethodRow
            selected={vm.method === 'wallet'}
            icon="wallet-outline"
            label={vm.t('checkoutPayWallet')}
            onPress={() => vm.onSelectMethod('wallet')}
          />

          <AppButton
            label={vm
              .t('checkoutPlaceOrder')
              .replace('{total}', vm.totalLabel)}
            onPress={vm.onPlaceOrder}
            icon={<Ionicons name="lock-closed" size={18} color={colors.onButton} />}
            style={styles.placeBtn}
          />
          <AppText variant="labelSm" color={MUTED} style={styles.terms}>
            {vm.t('checkoutTerms')}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function PayRow({
  label,
  value,
  muted,
  large,
  valueColor,
  valueWeight,
}: {
  label: string;
  value: string;
  muted?: boolean;
  large?: boolean;
  valueColor?: string;
  valueWeight?: '400' | '500' | '600';
}) {
  return (
    <View style={styles.payRow}>
      <AppText
        variant={large ? 'bodyLg' : 'bodyMd'}
        color={muted && !large ? MUTED : INK}
        weightOverride={large ? '600' : '400'}
      >
        {label}
      </AppText>
      <AppText
        variant={large ? 'bodyLg' : 'bodyMd'}
        color={valueColor ?? (muted && !large ? MUTED : INK)}
        weightOverride={valueWeight ?? (large ? '600' : '400')}
      >
        {value}
      </AppText>
    </View>
  );
}

function MethodRow({
  selected,
  icon,
  label,
  onPress,
}: {
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.methodRow, selected && styles.methodRowOn]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Ionicons name={icon} size={22} color={INK} />
      <AppText variant="bodyMd" color={INK} style={styles.flex}>
        {label}
      </AppText>
    </Pressable>
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
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  delayBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: WARN_FILL,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  itemIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HAIRLINE,
    marginVertical: spacing.sm,
  },
  payWithLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  methodRow: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  methodRowOn: {
    borderColor: ACTION,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: ACTION,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: ACTION,
  },
  placeBtn: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  terms: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  flex: {
    flex: 1,
  },
});
