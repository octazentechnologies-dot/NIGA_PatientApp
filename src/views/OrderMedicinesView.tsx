import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import type { OrderMedicinesViewModel } from '../controllers/useOrderMedicinesController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { ChoosePharmacyView } from './ChoosePharmacyView';

export function OrderMedicinesView(vm: OrderMedicinesViewModel) {
  const insets = useSafeAreaInsets();

  if (vm.pharmacyOpen) {
    return <ChoosePharmacyView {...vm.pharmacy} />;
  }

  if (vm.quotePlaced) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('back')}
              onPress={vm.onViewOrders}
              style={styles.iconHit}
            >
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
            <AppText variant="headlineMd" color={colors.ink} style={styles.flex}>
              {vm.t('orderMedsTitle')}
            </AppText>
          </View>
        </View>
        <View style={[styles.body, styles.quoteBody]}>
          <View style={styles.card}>
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.t('orderMedsQuoteTitle')}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t('orderMedsQuoteBody')}
            </AppText>
            <AppButton label={vm.t('orderMedsViewOrders')} onPress={vm.onViewOrders} />
          </View>
        </View>
      </View>
    );
  }

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
          <View style={styles.brandRow}>
            <AppText variant="headlineMd" color={colors.ink} numberOfLines={1}>
              {vm.t('brandName')}
            </AppText>
            <View style={styles.homeoBadge}>
              <AppText variant="labelSm" color={colors.success} weightOverride="600">
                {vm.t('medsSubtitle')}
              </AppText>
            </View>
          </View>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              layout.buttonHeight + 40 + sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <AppText variant="headlineLg" color={colors.ink}>
          {vm.t('orderMedsTitle')}
        </AppText>

        {vm.signed && vm.rxId ? (
          <View style={styles.card}>
            <View style={styles.rxTop}>
              <View style={styles.signedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <AppText variant="labelSm" color={colors.success} weightOverride="600">
                  {vm.t('orderMedsSigned')}
                </AppText>
              </View>
              <AppText variant="headlineMd" color={colors.ink} raw>
                {vm.rxId}
              </AppText>
            </View>
            {vm.doctorLine ? (
              <AppText variant="bodyMd" color={colors.muted} raw>
                {vm.doctorLine}
              </AppText>
            ) : null}
            {vm.patientLine ? (
              <AppText variant="bodyMd" color={colors.muted} raw>
                {vm.patientLine}
              </AppText>
            ) : null}
          </View>
        ) : null}

        {vm.unsignedMessage ? (
          <AppText variant="bodyMd" color={colors.error}>
            {vm.unsignedMessage}
          </AppText>
        ) : null}
        {vm.orderError && !vm.pharmacyOpen ? (
          <AppText variant="bodyMd" color={colors.error}>
            {vm.orderError}
          </AppText>
        ) : null}

        {vm.choices.length > 0 ? (
          <View style={styles.card}>
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.t('orderMedsPickRx')}
            </AppText>
            {vm.choices.map((choice) => (
              <Pressable
                key={choice.erxSnapshotId}
                accessibilityRole="button"
                onPress={() => vm.onSelectRx(choice.erxSnapshotId)}
                style={styles.addrPick}
              >
                <AppText variant="labelMd" color={colors.ink} weightOverride="600" raw>
                  {choice.title}
                </AppText>
                {choice.doctorLine ? (
                  <AppText variant="bodyMd" color={colors.muted} raw>
                    {choice.doctorLine}
                  </AppText>
                ) : null}
                <AppText
                  variant="labelSm"
                  color={choice.signed ? colors.success : colors.error}
                  weightOverride="600"
                >
                  {choice.signed ? vm.t('medsSignedRx') : vm.t('rxMustSign')}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <AppText variant="bodyMd" color={colors.muted}>
            {vm.t('orderMedsNoPaymentYet')}
          </AppText>
        </View>

        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('orderMedsListTitle')}
        </AppText>
        {vm.isLoading ? <LoadingState /> : null}
        {vm.isError ? (
          <ErrorState message={vm.t('orderMedsLoadFailed')} onRetry={vm.onRetry} />
        ) : null}
        {!vm.isLoading && !vm.isError && vm.medicines.length === 0 ? (
          <EmptyState title="No medicines on this prescription" />
        ) : null}
        {vm.medicines.map((med) => (
          <View key={med.id} style={styles.medRow}>
            <View style={styles.medLeft}>
              <View style={styles.medIcon}>
                <MaterialCommunityIcons
                  name="bottle-tonic-plus-outline"
                  size={22}
                  color={colors.primaryOutline}
                />
              </View>
              <View style={styles.flex}>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600" raw>
                  {med.name}
                </AppText>
                {med.detail ? (
                  <AppText variant="labelSm" color={colors.muted} raw>
                    {med.detail}
                  </AppText>
                ) : null}
              </View>
            </View>
          </View>
        ))}
        <AppText variant="bodyMd" color={colors.muted} style={styles.italic}>
          {vm.t('orderMedsPharmacistNote')}
        </AppText>

        <View style={styles.card}>
          <View style={styles.addressHead}>
            <View style={styles.addressLeft}>
              <Ionicons name="location-outline" size={22} color={colors.primary} />
              <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                {vm.t('orderMedsDeliveryTitle')}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onChangeAddress}
              style={styles.changeHit}
            >
              <AppText variant="labelMd" color={colors.primary} weightOverride="600">
                {vm.addressPickerOpen ? vm.t('done') : vm.t('orderMedsChange')}
              </AppText>
            </Pressable>
          </View>
          <AppText variant="bodyMd" color={colors.ink} raw>
            {vm.addressLine || vm.t('orderMedsAddAddressHint')}
          </AppText>
          {vm.addressPickerOpen ? (
            <View style={styles.picker}>
              {vm.addresses.map((addr) => {
                const selected = addr.addressId === vm.selectedAddressId;
                return (
                  <Pressable
                    key={addr.addressId}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => vm.onSelectAddress(addr.addressId)}
                    style={[styles.addrPick, selected && styles.addrPickOn]}
                  >
                    <AppText variant="bodyMd" color={colors.ink} raw>
                      {addr.line1}
                      {addr.city ? `, ${addr.city}` : ''}
                      {addr.pincode ? ` ${addr.pincode}` : ''}
                    </AppText>
                  </Pressable>
                );
              })}
              <AddressField
                label={vm.t('address')}
                value={vm.addressForm.line1}
                onChangeText={(line1) => vm.onAddressFormChange({ line1 })}
              />
              <AddressField
                label={vm.t('city')}
                value={vm.addressForm.city}
                onChangeText={(city) => vm.onAddressFormChange({ city })}
              />
              <AddressField
                label={vm.t('state')}
                value={vm.addressForm.state}
                onChangeText={(state) => vm.onAddressFormChange({ state })}
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
              <AppButton
                label={vm.addressSaveBusy ? vm.t('orderMedsSavingAddress') : vm.t('orderMedsSaveAddress')}
                onPress={vm.onSaveAddress}
                disabled={vm.addressSaveBusy}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton
          label={vm.t('orderMedsSeePharmacies')}
          onPress={vm.onSeePharmacies}
          disabled={!vm.signed}
        />
      </View>
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
  keyboardType?: KeyboardTypeOptions;
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
    gap: spacing.xs,
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  homeoBadge: {
    backgroundColor: colors.successContainer,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  quoteBody: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rxTop: {
    gap: spacing.sm,
  },
  signedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successContainer,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rxFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  viewRx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  choiceHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  shield: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.md,
  },
  medLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  medIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  italic: {
    fontStyle: 'italic',
  },
  addressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  changeHit: {
    minHeight: layout.buttonHeight,
    minWidth: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    gap: spacing.sm,
  },
  field: {
    gap: 4,
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  flex: {
    flex: 1,
  },
  addrPick: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.page,
  },
  addrPickOn: {
    borderColor: colors.primary,
  },
});
