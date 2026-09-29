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
import type { OrderMedicinesViewModel } from '../controllers/useOrderMedicinesController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { ChoosePharmacyView } from './ChoosePharmacyView';
import { MedicineCheckoutView } from './MedicineCheckoutView';
import { ReviewOrderView } from './ReviewOrderView';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';

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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <View style={styles.brandRow}>
            <AppText variant="headlineMd" color={INK} numberOfLines={1}>
              {vm.t('brandName')}
            </AppText>
            <View style={styles.homeoBadge}>
              <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
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
        <AppText variant="headlineLg" color={INK}>
          {vm.t('orderMedsTitle')}
        </AppText>

        <View style={styles.card}>
          <View style={styles.rxTop}>
            <View style={styles.signedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={SUCCESS} />
              <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
                {vm.t('orderMedsSigned')}
              </AppText>
            </View>
            <AppText variant="headlineMd" color={INK}>
              {vm.rxId}
            </AppText>
          </View>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.doctorLine}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.patientLine}
          </AppText>
          <View style={styles.rxFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onViewPrescription}
              style={styles.viewRx}
            >
              <Ionicons name="eye-outline" size={18} color={ACTION_OUTLINE} />
              <AppText
                variant="labelMd"
                color={ACTION_OUTLINE}
                weightOverride="600"
              >
                {vm.t('orderMedsViewRx')}
              </AppText>
            </Pressable>
            <AppText variant="labelSm" color={MUTED}>
              {vm.validTill}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.choiceHead}>
            <View style={styles.shield}>
              <Ionicons name="shield-checkmark" size={22} color={ACTION} />
            </View>
            <View style={styles.flex}>
              <AppText variant="headlineMd" color={INK}>
                {vm.t('orderMedsChoiceTitle')}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
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
              color={ACTION_OUTLINE}
              weightOverride="600"
            >
              {vm.t('orderMedsDownloadInstead')}
            </AppText>
          </Pressable>
        </View>

        <AppText variant="headlineMd" color={INK}>
          {vm.t('orderMedsListTitle')}
        </AppText>
        {vm.medicines.map((med) => (
          <View key={med.id} style={styles.medRow}>
            <View style={styles.medLeft}>
              <View style={styles.medIcon}>
                <MaterialCommunityIcons
                  name="bottle-tonic-plus-outline"
                  size={22}
                  color={ACTION_OUTLINE}
                />
              </View>
              <View>
                <AppText variant="labelMd" color={INK} weightOverride="600">
                  {vm.t(med.nameKey)}
                </AppText>
                <AppText variant="labelSm" color={MUTED}>
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
        <AppText variant="bodyMd" color={MUTED} style={styles.italic}>
          {vm.t('orderMedsPharmacistNote')}
        </AppText>

        <View style={styles.card}>
          <View style={styles.addressHead}>
            <View style={styles.addressLeft}>
              <Ionicons name="location-outline" size={22} color={ACTION} />
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.t('orderMedsDeliveryTitle')}
              </AppText>
            </View>
            <Pressable accessibilityRole="button" onPress={vm.onChangeAddress}>
              <AppText variant="labelMd" color={ACTION} weightOverride="600">
                {vm.t('orderMedsChange')}
              </AppText>
            </Pressable>
          </View>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.addressLine}
          </AppText>
          <AppText variant="labelSm" color={ACTION_OUTLINE} weightOverride="600">
            {vm.t('orderMedsDeliveryToday')}
          </AppText>
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
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  homeoBadge: {
    backgroundColor: SUCCESS_FILL,
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
    borderColor: HAIRLINE,
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
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rxFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
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
    backgroundColor: SUCCESS_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION,
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
    borderColor: HAIRLINE,
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
    borderTopColor: HAIRLINE,
  },
  flex: {
    flex: 1,
  },
});
