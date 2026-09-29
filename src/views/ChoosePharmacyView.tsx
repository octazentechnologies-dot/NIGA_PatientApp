import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  ChoosePharmacyViewModel,
  PharmacyFulfilTone,
  PharmacyOption,
} from '../controllers/useChoosePharmacyController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const CHIP_FILL = '#E6F5FE';
const CHART = '#3AA9E0';
const SUCCESS = '#0F7A4E';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';

export function ChoosePharmacyView(vm: ChoosePharmacyViewModel) {
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
            {vm.t(vm.hasDelivery ? 'pharmacyTitleOrder' : 'pharmacyTitleChoose')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      {vm.hasDelivery ? <DeliveryList vm={vm} insets={insets} /> : null}
      {!vm.hasDelivery ? <EmptyDelivery vm={vm} insets={insets} /> : null}
    </View>
  );
}

function DeliveryList({
  vm,
  insets,
}: {
  vm: ChoosePharmacyViewModel;
  insets: { top: number; bottom: number; left: number; right: number };
}) {
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom: 120 + sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <View style={styles.banner}>
          <Ionicons name="location-outline" size={18} color={ACTION} />
          <AppText variant="bodyMd" color={INK} style={styles.flex}>
            {vm
              .t('pharmacyBanner')
              .replace('{count}', String(vm.pharmacyCount))
              .replace('{pin}', vm.pincode)}
          </AppText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {vm.sorts.map((sort) => {
            const on = sort.id === vm.sortId;
            return (
              <Pressable
                key={sort.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => vm.onSelectSort(sort.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <AppText
                  variant="labelSm"
                  color={on ? ACTION : INK}
                  weightOverride={on ? '600' : '500'}
                >
                  {vm.t(sort.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {vm.pharmacies.map((pharmacy) => (
          <PharmacyCard
            key={pharmacy.id}
            pharmacy={pharmacy}
            selected={pharmacy.id === vm.selectedPharmacyId}
            t={vm.t}
            onSelect={() => vm.onSelectPharmacy(pharmacy.id)}
            onBreakdown={() => vm.onViewBreakdown(pharmacy.id)}
          />
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.footerLeft}>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('pharmacySelectedLabel')}
          </AppText>
          <AppText variant="labelMd" color={INK} weightOverride="600" numberOfLines={1}>
            {vm.selectedPharmacy
              ? vm.t(vm.selectedPharmacy.nameKey)
              : vm.t('pharmacyNoneSelected')}
          </AppText>
          {vm.selectedPharmacy ? (
            <AppText variant="titleMd" color={INK}>
              {vm.selectedPharmacy.priceLabel}
            </AppText>
          ) : null}
        </View>
        <AppButton
          label={vm.t('pharmacyContinue')}
          onPress={vm.onContinue}
          disabled={!vm.canContinue}
          style={styles.continueBtn}
        />
      </View>
    </>
  );
}

function EmptyDelivery({
  vm,
  insets,
}: {
  vm: ChoosePharmacyViewModel;
  insets: { top: number; bottom: number; left: number; right: number };
}) {
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.emptyBody,
          { paddingBottom: 100 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.emptyHero}>
          <View style={styles.emptyGlow}>
            <Ionicons name="location-outline" size={40} color={MUTED} />
            <View style={styles.strike} />
          </View>
          <AppText variant="headlineMd" color={INK} style={styles.center}>
            {vm.t('pharmacyEmptyTitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.center}>
            {vm.t('pharmacyEmptyBody').replace('{pin}', vm.pincode)}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onNotifyDelivery}
            style={styles.notifyBtn}
          >
            <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
              {vm.t('pharmacyNotify')}
            </AppText>
          </Pressable>
        </View>

        <AltCard
          selected={vm.emptyAltId === 'pickup'}
          icon="storefront-outline"
          title={vm.t('pharmacyAltPickup')}
          meta={vm.t('pharmacyAltPickupMeta')}
          onPress={() => vm.onSelectEmptyAlt('pickup')}
        />
        <AltCard
          selected={vm.emptyAltId === 'download'}
          icon="download-outline"
          title={vm.t('pharmacyAltDownload')}
          meta={vm.t('pharmacyAltDownloadMeta')}
          onPress={() => vm.onSelectEmptyAlt('download')}
        />
      </ScrollView>

      <View
        style={[
          styles.emptyFooter,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton
          label={vm.t('pharmacyContinue')}
          onPress={vm.onContinue}
          disabled={!vm.canContinue}
        />
      </View>
    </>
  );
}

function PharmacyCard({
  pharmacy,
  selected,
  t,
  onSelect,
  onBreakdown,
}: {
  pharmacy: PharmacyOption;
  selected: boolean;
  t: ChoosePharmacyViewModel['t'];
  onSelect: () => void;
  onBreakdown: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {selected ? (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={16} color={colors.onButton} />
        </View>
      ) : null}

      <View style={styles.cardHead}>
        <AppText variant="headlineMd" color={INK} style={styles.flex}>
          {t(pharmacy.nameKey)}
        </AppText>
        <View style={styles.licensed}>
          <Ionicons name="checkmark-circle" size={12} color={MUTED} />
          <AppText variant="labelSm" color={MUTED} weightOverride="500">
            {t('pharmacyLicensed')}
          </AppText>
        </View>
      </View>

      <AppText variant="labelSm" color={MUTED}>
        {t(pharmacy.licenceKey)}
      </AppText>
      <View style={styles.metaRow}>
        <Ionicons
          name={pharmacy.tone === 'pickup' ? 'storefront-outline' : 'walk-outline'}
          size={16}
          color={MUTED}
        />
        <AppText variant="labelSm" color={MUTED}>
          {t(pharmacy.metaKey)}
        </AppText>
      </View>

      <View style={[styles.fulfilBox, fulfilStyle(pharmacy.tone)]}>
        <View style={styles.fulfilRow}>
          <Ionicons
            name={fulfilIcon(pharmacy.tone)}
            size={18}
            color={fulfilColor(pharmacy.tone)}
          />
          <AppText
            variant="labelMd"
            color={fulfilColor(pharmacy.tone)}
            weightOverride="600"
            style={styles.flex}
          >
            {t(pharmacy.fulfilKey)}
          </AppText>
        </View>
        {pharmacy.fulfilDetailKey ? (
          <AppText variant="bodyMd" color={MUTED}>
            {t(pharmacy.fulfilDetailKey)}
          </AppText>
        ) : null}
        {pharmacy.tone === 'full' ? (
          <View style={styles.fulfilRow}>
            <Ionicons name="time-outline" size={16} color={ACTION} />
            <AppText variant="labelSm" color={MUTED}>
              {t(pharmacy.etaKey)}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.cardFoot}>
        <View style={styles.flex}>
          {pharmacy.ratingKey ? (
            <AppText variant="labelSm" color={MUTED}>
              {t(pharmacy.ratingKey)}
            </AppText>
          ) : (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={MUTED} />
              <AppText variant="labelSm" color={MUTED}>
                {t(pharmacy.etaKey)}
              </AppText>
            </View>
          )}
          {pharmacy.freeDelivery ? (
            <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
              {`${t('pharmacyFree')} · ${
                pharmacy.priceNoteKey ? t(pharmacy.priceNoteKey) : ''
              }`}
            </AppText>
          ) : null}
        </View>
        <View style={styles.priceBlock}>
          <AppText variant="titleMd" color={INK}>
            {pharmacy.priceLabel}
          </AppText>
          {pharmacy.priceNoteKey && !pharmacy.freeDelivery ? (
            <AppText variant="labelSm" color={MUTED}>
              {t(pharmacy.priceNoteKey)}
            </AppText>
          ) : null}
          {pharmacy.tone === 'full' ? (
            <Pressable
              accessibilityRole="button"
              onPress={onBreakdown}
              style={styles.breakdown}
            >
              <AppText variant="labelSm" color={ACTION} weightOverride="600">
                {t('pharmacyViewBreakdown')}
              </AppText>
              <Ionicons name="chevron-down" size={14} color={ACTION} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function AltCard({
  selected,
  icon,
  title,
  meta,
  onPress,
}: {
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.altCard, selected && styles.cardSelected]}
    >
      <View style={styles.altIcon}>
        <Ionicons name={icon} size={20} color={ACTION} />
      </View>
      <View style={styles.flex}>
        <AppText variant="labelMd" color={INK} weightOverride="600">
          {title}
        </AppText>
        <AppText variant="labelSm" color={MUTED}>
          {meta}
        </AppText>
      </View>
    </Pressable>
  );
}

function fulfilStyle(tone: PharmacyFulfilTone) {
  if (tone === 'partial') {
    return { backgroundColor: WARN_FILL };
  }
  if (tone === 'pickup') {
    return { backgroundColor: colors.page };
  }
  return { backgroundColor: CHIP_FILL };
}

function fulfilIcon(tone: PharmacyFulfilTone): keyof typeof Ionicons.glyphMap {
  if (tone === 'partial') {
    return 'warning-outline';
  }
  if (tone === 'pickup') {
    return 'storefront-outline';
  }
  return 'checkmark-circle';
}

function fulfilColor(tone: PharmacyFulfilTone) {
  if (tone === 'partial') {
    return WARN;
  }
  if (tone === 'pickup') {
    return INK;
  }
  return ACTION;
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
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: CHIP_FILL,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: CHART,
    padding: spacing.md,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHART,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: ACTION_OUTLINE,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingRight: 36,
  },
  licensed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.page,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fulfilBox: {
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  fulfilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 32,
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
  footerLeft: {
    flex: 1,
    gap: 2,
  },
  continueBtn: {
    minWidth: 120,
    paddingHorizontal: spacing.lg,
  },
  emptyBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyHero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyGlow: {
    width: 120,
    height: 120,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  strike: {
    position: 'absolute',
    width: 56,
    height: 2,
    backgroundColor: MUTED,
    transform: [{ rotate: '-35deg' }],
  },
  notifyBtn: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION_OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    marginTop: spacing.sm,
  },
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    padding: spacing.md,
    minHeight: layout.buttonHeight + 16,
  },
  altIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  center: {
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
});
