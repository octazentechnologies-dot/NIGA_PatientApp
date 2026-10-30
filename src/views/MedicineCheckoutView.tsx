import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { SafeAreaModal } from '../components/SafeAreaModal';
import type {
  LocationOption,
  MedicineCheckoutViewModel,
} from '../controllers/useMedicineCheckoutController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

const WARN = colors.warning;
const WARN_FILL = colors.warningContainer;
export function MedicineCheckoutView(vm: MedicineCheckoutViewModel) {
  const insets = useSafeAreaInsets();
  const [locationPicker, setLocationPicker] = useState<'state' | 'city' | null>(null);

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
                label={vm.t('checkoutAddrLabel')}
                value={vm.addressForm.label}
                placeholder={vm.t('checkoutAddrLabelHint')}
                onChangeText={(label) => vm.onAddressFormChange({ label })}
              />
              <AddressField
                label={vm.t('checkoutAddrPhone')}
                value={vm.addressForm.phone}
                onChangeText={(phone) => vm.onAddressFormChange({ phone })}
                keyboardType="phone-pad"
              />
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
              <SelectField
                label={vm.t('state')}
                value={vm.addressForm.state}
                placeholder={vm.t('statePlaceholder')}
                onPress={() => setLocationPicker('state')}
              />
              <SelectField
                label={vm.t('city')}
                value={vm.addressForm.city}
                placeholder={
                  vm.selectedStateId ? vm.t('cityPlaceholder') : vm.t('checkoutPickStateFirst')
                }
                onPress={() => {
                  if (vm.selectedStateId) setLocationPicker('city');
                }}
              />
              <AddressField
                label={vm.t('pincode')}
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
                <AppText variant="bodyLg" color={colors.ink} weightOverride="600" raw>
                  {vm.t(item.nameKey)}
                </AppText>
                {item.metaKey ? (
                  <AppText variant="bodyMd" color={colors.muted} raw>
                    {vm.t(item.metaKey)}
                  </AppText>
                ) : null}
              </View>
              {item.priceLabel ? (
                <AppText variant="bodyLg" color={colors.ink} weightOverride="600" raw>
                  {item.priceLabel}
                </AppText>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink}>
            {vm.t('checkoutPaymentDetails')}
          </AppText>
          {vm.subtotalLabel ? (
            <PayRow label={vm.t('checkoutSubtotal')} value={vm.subtotalLabel} muted />
          ) : null}
          {vm.taxesLabel ? (
            <PayRow label={vm.t('checkoutTaxesFees')} value={vm.taxesLabel} muted />
          ) : null}
          {vm.shippingLabel ? (
            <PayRow
              label={vm.t('checkoutShipping')}
              value={vm.shippingLabel}
              muted
              valueColor={vm.shippingFree ? colors.primaryOutline : colors.muted}
              valueWeight={vm.shippingFree ? '600' : '400'}
            />
          ) : null}
          {vm.totalLabel ? <View style={styles.totalDivider} /> : null}
          {vm.totalLabel ? (
            <PayRow label={vm.t('checkoutTotal')} value={vm.totalLabel} large />
          ) : (
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t('checkoutWaitingQuote')}
            </AppText>
          )}

          <AppText
            variant="labelSm"
            color={colors.muted}
            style={styles.payWithLabel}
            weightOverride="500"
          >
            {vm.t('checkoutPayWith')}
          </AppText>
          <MethodRow
            selected={vm.method === 'online'}
            icon="card-outline"
            label={vm.t('checkoutPayOnline')}
            onPress={() => vm.onSelectMethod('online')}
          />
          <MethodRow
            selected={vm.method === 'cod'}
            icon="cash-outline"
            label={vm.t('checkoutPayCod')}
            onPress={() => vm.onSelectMethod('cod')}
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
            disabled={vm.payBusy || !vm.medicineOrderId || !vm.totalLabel}
            icon={<Ionicons name="lock-closed" size={18} color={colors.onButton} />}
            style={styles.placeBtn}
          />
          <AppText variant="labelSm" color={colors.muted} style={styles.terms}>
            {vm.t('checkoutTerms')}
          </AppText>
        </View>
      </ScrollView>
      <SearchablePicker
        visible={locationPicker === 'state'}
        title={vm.t('state')}
        searchLabel={vm.t('checkoutLocationSearch')}
        emptyLabel={vm.t('checkoutNoLocationMatches')}
        loading={vm.statesLoading}
        options={vm.stateOptions}
        selectedId={vm.selectedStateId}
        onClose={() => setLocationPicker(null)}
        onSelect={(id) => {
          vm.onSelectState(id);
          setLocationPicker(null);
        }}
      />
      <SearchablePicker
        visible={locationPicker === 'city'}
        title={vm.t('city')}
        searchLabel={vm.t('checkoutLocationSearch')}
        emptyLabel={vm.t('checkoutNoLocationMatches')}
        loading={vm.citiesLoading}
        options={vm.cityOptions}
        selectedId={vm.selectedCityId}
        onClose={() => setLocationPicker(null)}
        onSelect={(id) => {
          vm.onSelectCity(id);
          setLocationPicker(null);
        }}
      />
    </View>
  );
}

function AddressField({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  placeholder?: string;
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
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="labelSm" color={colors.muted} weightOverride="600">
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.selectField}
      >
        <AppText
          variant="bodyMd"
          color={value ? colors.ink : colors.muted}
          style={styles.flex}
          raw
          numberOfLines={1}
        >
          {value || placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}

function SearchablePicker({
  visible,
  title,
  searchLabel,
  emptyLabel,
  loading,
  options,
  selectedId,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  searchLabel: string;
  emptyLabel: string;
  loading: boolean;
  options: LocationOption[];
  selectedId: number | null;
  onClose: () => void;
  onSelect: (id: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter((row) => row.name.toLowerCase().includes(needle))
    : options;

  return (
    <SafeAreaModal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={onClose}
          style={styles.modalScrim}
        />
        <View
          style={[
            styles.modalCard,
            { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
          ]}
        >
          <AppText variant="titleMd" color={colors.ink} weightOverride="600">
            {title}
          </AppText>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchLabel}
            placeholderTextColor={colors.muted}
            style={styles.fieldInput}
            autoCorrect={false}
          />
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.modalStatus} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              style={styles.modalList}
              ListEmptyComponent={
                <AppText variant="bodyMd" color={colors.muted} style={styles.modalStatus}>
                  {emptyLabel}
                </AppText>
              }
              renderItem={({ item }) => {
                const selected = item.id === selectedId;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onSelect(item.id)}
                    style={[styles.modalRow, selected && styles.modalRowOn]}
                  >
                    <AppText
                      variant="bodyMd"
                      color={selected ? colors.primary : colors.ink}
                      raw
                    >
                      {item.name}
                    </AppText>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </View>
    </SafeAreaModal>
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
  selectField: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.page,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.inverseSurface,
    opacity: 0.4,
  },
  modalCard: {
    height: '72%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalList: {
    flex: 1,
  },
  modalRow: {
    minHeight: layout.buttonHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  modalRowOn: {
    backgroundColor: colors.primaryContainer,
  },
  modalStatus: {
    marginVertical: spacing.lg,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
