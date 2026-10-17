import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
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
import type {
  MedicineCheckoutViewModel,
} from '../controllers/useMedicineCheckoutController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

const WARN = colors.warning;
const WARN_FILL = colors.warningContainer;
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
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={colors.ink}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('checkoutTitle')}
          </AppText>
          <View style={styles.iconHit} />
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
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.t('checkoutDeliveryAddress')}
            </AppText>
            <Pressable accessibilityRole="button" onPress={vm.onEditAddress}>
              <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
                {vm.t('checkoutEdit')}
              </AppText>
            </Pressable>
          </View>
          <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
            {vm.recipientName}
          </AppText>
          {vm.addressesLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : vm.addressLines.length === 0 ? (
            <AppText variant="bodyMd" color={colors.muted} raw>
              Add an address for delivery.
            </AppText>
          ) : (
            vm.addressLines.map((line) => (
              <AppText key={line} variant="bodyMd" color={colors.muted} raw>
                {line}
              </AppText>
            ))
          )}
          {vm.phoneLabel ? (
            <AppText variant="bodyMd" color={colors.muted} raw>
              {vm.phoneLabel}
            </AppText>
          ) : null}
          {vm.addressPickerOpen ? (
            <View style={styles.picker}>
              {vm.addresses.length === 0 ? (
                <AppText variant="bodyMd" color={colors.muted} raw>
                  No saved addresses yet.
                </AppText>
              ) : (
                vm.addresses.map((addr) => {
                  const selected = addr.addressId === vm.addressId;
                  return (
                    <Pressable
                      key={addr.addressId}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => vm.onSelectAddress(addr.addressId)}
                      style={[styles.addrRow, selected && styles.addrRowOn]}
                    >
                      <AppText variant="bodyMd" color={colors.ink} raw>
                        {addr.line1}
                        {addr.city ? `, ${addr.city}` : ''}
                      </AppText>
                      {addr.isDefault ? (
                        <AppText variant="labelSm" color={colors.primaryOutline} weightOverride="600">
                          Default
                        </AppText>
                      ) : null}
                    </Pressable>
                  );
                })
              )}
              <AppButton
                variant="secondary"
                label="Add an address"
                onPress={vm.onOpenAddressForm}
              />
            </View>
          ) : null}
          {vm.addressFormOpen ? (
            <View style={styles.form}>
              <AddressField
                label="Line 1"
                value={vm.addressForm.line1}
                onChangeText={(line1) => vm.onAddressFormChange({ line1 })}
              />
              <AddressField
                label="Line 2"
                value={vm.addressForm.line2}
                onChangeText={(line2) => vm.onAddressFormChange({ line2 })}
              />
              <AddressField
                label="City"
                value={vm.addressForm.city}
                onChangeText={(city) => vm.onAddressFormChange({ city })}
              />
              <AddressField
                label="State"
                value={vm.addressForm.state}
                onChangeText={(state) => vm.onAddressFormChange({ state })}
              />
              <AddressField
                label="Pincode"
                value={vm.addressForm.pincode}
                onChangeText={(pincode) => vm.onAddressFormChange({ pincode })}
                keyboardType="number-pad"
              />
              {vm.addressFormError ? (
                <AppText variant="bodyMd" color={colors.error} raw>
                  {vm.addressFormError}
                </AppText>
              ) : null}
              <View style={styles.formActions}>
                <AppButton
                  variant="secondary"
                  label="Cancel"
                  onPress={vm.onCloseAddressForm}
                />
                <AppButton
                  label={vm.addressSaveBusy ? 'Saving…' : 'Save address'}
                  onPress={vm.onSaveAddress}
                  disabled={vm.addressSaveBusy}
                />
              </View>
            </View>
          ) : null}
          {vm.shippingLabel ? (
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
          ) : null}
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink}>
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
                  color={colors.iconFill}
                />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
                  {vm.t(item.nameKey)}
                </AppText>
                <AppText variant="bodyMd" color={colors.muted}>
                  {vm.t(item.metaKey)}
                </AppText>
              </View>
              <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
                {item.priceLabel}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink}>
            {vm.t('checkoutPaymentDetails')}
          </AppText>
          <PayRow label={vm.t('checkoutSubtotal')} value={vm.subtotalLabel} muted />
          <PayRow label={vm.t('checkoutTaxesFees')} value={vm.taxesLabel} muted />
          <PayRow
            label={vm.t('checkoutShipping')}
            value={vm.shippingLabel}
            muted
            valueColor={vm.shippingFree ? colors.primaryOutline : colors.muted}
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
            color={colors.muted}
            style={styles.payWithLabel}
            weightOverride="500"
          >
            {vm.t('checkoutPayWith')}
          </AppText>
          <MethodRow
            selected={vm.method === 'online' || vm.method === 'card'}
            icon="card-outline"
            label="Pay online (Razorpay Checkout)"
            onPress={() => vm.onSelectMethod('online')}
          />

          {vm.placeOrderNote ? (
            <AppText variant="bodyMd" color={colors.error} raw>
              {vm.placeOrderNote}
            </AppText>
          ) : null}
          <AppButton
            label={
              vm.payBusy
                ? 'Confirming…'
                : vm.totalLabel
                  ? vm.t('checkoutPlaceOrder').replace('{total}', vm.totalLabel)
                  : vm.t('checkoutPlaceOrder').replace('{total}', '').trim()
            }
            onPress={vm.onPlaceOrder}
            disabled={vm.payBusy || !vm.medicineOrderId}
            icon={<Ionicons name="lock-closed" size={18} color={colors.onButton} />}
            style={styles.placeBtn}
          />
          <AppText variant="labelSm" color={colors.muted} style={styles.terms}>
            {vm.t('checkoutTerms')}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function AddressField({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <AppText variant="labelSm" color={colors.muted} weightOverride="600">
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.fieldInput}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
      />
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
  if (!value) {
    return null;
  }
  return (
    <View style={styles.payRow}>
      <AppText
        variant={large ? 'bodyLg' : 'bodyMd'}
        color={muted && !large ? colors.muted : colors.ink}
        weightOverride={large ? '600' : '400'}
      >
        {label}
      </AppText>
      <AppText
        variant={large ? 'bodyLg' : 'bodyMd'}
        color={valueColor ?? (muted && !large ? colors.muted : colors.ink)}
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
      <Ionicons name={icon} size={22} color={colors.ink} />
      <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
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
    borderBottomColor: colors.outlineVariant,
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
    borderColor: colors.outlineVariant,
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
    borderColor: colors.outlineVariant,
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
    borderBottomColor: colors.outlineVariant,
  },
  itemIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    backgroundColor: colors.outlineVariant,
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
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  methodRowOn: {
    borderColor: colors.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
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
  picker: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  addrRow: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.page,
    gap: spacing.xs,
  },
  addrRowOn: {
    borderColor: colors.primary,
  },
  form: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  fieldInput: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    color: colors.ink,
    backgroundColor: colors.page,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
