import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppSwitch } from '../components/AppSwitch';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import type { OrderMedicinesViewModel } from '../controllers/useOrderMedicinesController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { ChoosePharmacyView } from './ChoosePharmacyView';
import { MedicineCheckoutView } from './MedicineCheckoutView';
import { ReviewOrderView } from './ReviewOrderView';

export function OrderMedicinesView(vm: OrderMedicinesViewModel) {
  const insets = useSafeAreaInsets();

  if (vm.checkoutOpen) {
    return <MedicineCheckoutView {...vm.checkout} />;
  }

  if (vm.reviewOpen) {
    return <ReviewOrderView {...vm.review} />;
  }

  if (vm.pharmacyOpen) {
    return <ChoosePharmacyView {...vm.pharmacy} />;
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

        <View style={styles.card}>
          <View style={styles.rxTop}>
            <View style={styles.signedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <AppText variant="labelSm" color={colors.success} weightOverride="600">
                {vm.t('orderMedsSigned')}
              </AppText>
            </View>
            {vm.rxId ? (
              <AppText variant="headlineMd" color={colors.ink} raw>
                {vm.rxId}
              </AppText>
            ) : null}
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
          <View style={styles.rxFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onViewPrescription}
              style={styles.viewRx}
            >
              <Ionicons name="eye-outline" size={18} color={colors.primaryOutline} />
              <AppText
                variant="labelMd"
                color={colors.primaryOutline}
                weightOverride="600"
              >
                {vm.t('orderMedsViewRx')}
              </AppText>
            </Pressable>
            {vm.validTill ? (
              <AppText variant="labelSm" color={colors.muted} raw>
                {vm.validTill}
              </AppText>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.choiceHead}>
            <View style={styles.shield}>
              <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <AppText variant="headlineMd" color={colors.ink}>
                {vm.t('orderMedsChoiceTitle')}
              </AppText>
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.t('orderMedsChoiceBody')}
              </AppText>
            </View>
          </View>
          <AppButton
            label={vm.t('orderMedsOrderHomeo')}
            onPress={vm.onOrderHomeoMeds}
          />
          <Pressable
            accessibilityRole="button"
            onPress={vm.onDownloadInstead}
            style={styles.outlineBtn}
          >
            <AppText
              variant="labelMd"
              color={colors.primaryOutline}
              weightOverride="600"
            >
              {vm.t('orderMedsDownloadInstead')}
            </AppText>
          </Pressable>
        </View>

        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('orderMedsListTitle')}
        </AppText>
        {vm.isLoading ? <LoadingState /> : null}
        {vm.isError ? (
          <ErrorState message="Could not load the prescription." onRetry={vm.onRetry} />
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
              <View>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                  {vm.t(med.nameKey)}
                </AppText>
                <AppText variant="labelSm" color={colors.muted}>
                  {vm.t(med.qtyKey)}
                </AppText>
              </View>
            </View>
            <AppSwitch
              value={med.selected}
              onValueChange={() => vm.onToggleMedicine(med.id)}
            />
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
            <Pressable accessibilityRole="button" onPress={vm.onChangeAddress}>
              <AppText variant="labelMd" color={colors.primary} weightOverride="600">
                {vm.t('orderMedsChange')}
              </AppText>
            </Pressable>
          </View>
          <AppText variant="bodyMd" color={colors.muted} raw>
            {vm.addressLine || 'Add an address for delivery.'}
          </AppText>
          {vm.addressLine ? (
            <AppText variant="labelSm" color={colors.primaryOutline} weightOverride="600">
              {vm.t('orderMedsDeliveryToday')}
            </AppText>
          ) : null}
        </View>
      </ScrollView>

      {vm.addressPickerOpen ? (
        <View style={styles.pickerSheet}>
          <AppText variant="titleMd" color={colors.ink} weightOverride="600">
            Delivery address
          </AppText>
          {vm.addresses.length === 0 ? (
            <AppText variant="bodyMd" color={colors.muted} raw>
              No saved addresses. Add one at checkout.
            </AppText>
          ) : (
            vm.addresses.map((addr) => {
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
                  </AppText>
                </Pressable>
              );
            })
          )}
          <AppButton
            variant="secondary"
            label="Done"
            onPress={vm.onCloseAddressPicker}
          />
        </View>
      ) : null}

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton
          label={vm.t('orderMedsSeePharmacies')}
          onPress={vm.onSeePharmacies}
        />
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
  pickerSheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 100,
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    gap: spacing.sm,
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
