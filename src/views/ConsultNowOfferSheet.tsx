import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import type { ConsultNowViewModel } from '../controllers/useConsultNowController';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const AMBER = '#8A5109';
const AMBER_FILL = '#FCF3E4';
const AMBER_BORDER = '#F2C14E';
const CHIP_FILL = '#E6F5FE';
const FILL = '#F2F2F2';
const GOLD = '#F2C14E';
const FEE_ICON = '#F0F7FA';

export function ConsultNowOfferSheet(vm: ConsultNowViewModel) {
  const insets = useSafeAreaInsets();
  const offer = vm.offer;
  if (!offer) {
    return null;
  }

  return (
    <SafeAreaModal
      visible
      transparent
      animationType="slide"
      onRequestClose={vm.onCancelSearch}
    >
      <View style={styles.backdrop}>
        <View style={styles.dismiss} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.md) },
          ]}
        >
          <View style={styles.timerBar}>
            <Ionicons name="timer-outline" size={20} color={AMBER} />
            <AppText variant="titleMd" color={AMBER}>
              {offer.acceptInLabel}
            </AppText>
          </View>

          <View style={styles.body}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <AppText variant="titleMd" color={ACTION} languageOverride="en">
                  {offer.initials}
                </AppText>
              </View>
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <AppText variant="headlineMd" color="#000000" style={styles.flex}>
                    {offer.doctorName}
                  </AppText>
                  <View style={styles.verified}>
                    <Ionicons name="checkmark-circle" size={18} color={GOLD} />
                  </View>
                </View>
                <AppText variant="bodyMd" color={MUTED}>
                  {offer.credentialsLine}
                </AppText>
                <View style={styles.chips}>
                  <MetaChip icon="star" iconColor={GOLD} label={offer.ratingLabel} />
                  <MetaChip icon="chatbubble-outline" label={offer.languageLabel} />
                  <MetaChip
                    icon={
                      vm.mode === 'audio'
                        ? 'call-outline'
                        : vm.mode === 'chat'
                          ? 'chatbubble-ellipses-outline'
                          : 'videocam-outline'
                    }
                    label={offer.modeLabel}
                  />
                </View>
              </View>
            </View>

            <View style={styles.feeCard}>
              <View style={styles.feeIcon}>
                <Ionicons name="cash-outline" size={22} color={ACTION} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t('offerFee')}
                </AppText>
                <AppText variant="titleMd" color="#000000">
                  {offer.feeLabel}
                </AppText>
              </View>
              <Pressable onPress={vm.onOpenFeeDetails} hitSlop={8}>
                <AppText variant="labelSm" color={ACTION} style={styles.link}>
                  {vm.t('offerSeeDetails')}
                </AppText>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={vm.onAcceptOffer}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <AppText variant="titleMd" color="#FFFFFF">
                {offer.acceptLabel}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onDeclineOffer}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
              <AppText variant="titleMd" color={ACTION}>
                {vm.t('offerAnother')}
              </AppText>
            </Pressable>
            <AppText variant="labelSm" color={MUTED} style={styles.center}>
              {vm.t('offerRejectHint')}
            </AppText>
          </View>
        </View>
      </View>

      <SafeAreaModal
        visible={vm.feeDetailsOpen}
        transparent
        animationType="fade"
        onRequestClose={vm.onCloseFeeDetails}
      >
        <Pressable style={styles.detailsBackdrop} onPress={vm.onCloseFeeDetails}>
          <Pressable style={styles.detailsCard} onPress={() => undefined}>
            <AppText variant="titleMd" color="#000000">
              {vm.t('offerFee')}
            </AppText>
            <FeeRow label={vm.t('reviewDoctorFee')} value={vm.doctorFeeLabel} />
            <FeeRow label={vm.t('reviewPlatformFee')} value={vm.platformFeeLabel} />
            <FeeRow label={vm.t('reviewTaxes')} value={vm.taxesLabel} />
            <View style={styles.detailsTotal}>
              <FeeRow label={vm.t('reviewTotalPayable')} value={vm.totalLabel} bold />
            </View>
            <Pressable
              onPress={vm.onCloseFeeDetails}
              style={({ pressed }) => [styles.detailsClose, pressed && styles.pressed]}
            >
              <AppText variant="titleMd" color={ACTION}>
                {vm.t('continue')}
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </SafeAreaModal>
    </SafeAreaModal>
  );
}

function MetaChip({
  icon,
  label,
  iconColor = MUTED,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={12} color={iconColor} />
      <AppText variant="labelSm" color="#000000">
        {label}
      </AppText>
    </View>
  );
}

function FeeRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.feeRow}>
      <AppText variant="bodyMd" color={bold ? '#000000' : MUTED}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color="#000000" weightOverride={bold ? '600' : '400'}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 28, 26, 0.48)',
    justifyContent: 'flex-end',
  },
  dismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  timerBar: {
    minHeight: 48,
    backgroundColor: AMBER_FILL,
    borderBottomWidth: 1,
    borderBottomColor: AMBER_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  verified: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  feeCard: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feeIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: FEE_ICON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
  primaryBtn: {
    minHeight: 52,
    borderRadius: radii.button,
    backgroundColor: ACTION,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  detailsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 28, 26, 0.48)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 10,
  },
  detailsTotal: {
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingTop: 10,
  },
  detailsClose: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: ACTION,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
