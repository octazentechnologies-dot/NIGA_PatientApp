import { Ionicons } from '@expo/vector-icons';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CANCEL_REASONS,
  type AppointmentDetailViewModel,
} from '../controllers/useAppointmentDetailController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { useKeyboardHeight } from '../utilities/useKeyboardHeight';
import { AppText } from './AppText';

const SUCCESS_BORDER = colors.successContainer;
const CANCEL = colors.error;

type Props = Pick<
  AppointmentDetailViewModel,
  | 'language'
  | 't'
  | 'cancelSheetOpen'
  | 'cancelReason'
  | 'cancelNote'
  | 'canConfirmCancel'
  | 'refundTitle'
  | 'refundBody'
  | 'onCloseCancelSheet'
  | 'onSelectCancelReason'
  | 'onChangeCancelNote'
  | 'onConfirmCancel'
>;

export function CancelAppointmentSheet({
  language,
  t,
  cancelSheetOpen,
  cancelReason,
  cancelNote,
  canConfirmCancel,
  refundTitle,
  refundBody,
  onCloseCancelSheet,
  onSelectCancelReason,
  onChangeCancelNote,
  onConfirmCancel,
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const windowHeight = Dimensions.get('window').height;
  const sheetMaxHeight =
    keyboardHeight > 0
      ? Math.max(
          280,
          windowHeight - keyboardHeight - Math.max(insets.top, spacing.md),
        )
      : Math.round(windowHeight * 0.85);

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={cancelSheetOpen}
      onRequestClose={onCloseCancelSheet}
    >
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onCloseCancelSheet} />
        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              marginBottom: keyboardHeight > 0 ? keyboardHeight : 0,
              paddingBottom: sheetBottomPadding(insets, spacing.md),
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="titleMd" color={colors.ink} style={styles.flex}>
              {t('cancelSheetTitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('cancel')}
              onPress={onCloseCancelSheet}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <View style={styles.refundCard}>
              <View style={styles.refundIcon}>
                <AppText variant="titleMd" color={colors.card}>
                  ₹
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyLg" color={colors.success} weightOverride="600">
                  {refundTitle}
                </AppText>
                <AppText variant="bodyMd" color={colors.muted}>
                  {refundBody}
                </AppText>
              </View>
            </View>

            <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
              {t('cancelWhyTitle')}
            </AppText>
            <View style={styles.reasons}>
              {CANCEL_REASONS.map((item) => {
                const selected = item.id === cancelReason;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => onSelectCancelReason(item.id)}
                    style={[styles.reasonRow, selected && styles.reasonRowSelected]}
                  >
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <AppText variant="bodyLg" color={colors.ink} style={styles.flex}>
                      {t(item.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={cancelNote}
              onChangeText={onChangeCancelNote}
              placeholder={t('cancelMoreOptional')}
              placeholderTextColor={colors.muted}
              multiline
              style={[
                styles.note,
                { fontFamily: fontFamilyFor('400', language, 'sans') },
              ]}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              disabled={!canConfirmCancel}
              onPress={onConfirmCancel}
              style={({ pressed }) => [
                styles.confirmBtn,
                !canConfirmCancel && styles.disabled,
                pressed && canConfirmCancel && styles.pressed,
              ]}
            >
              <AppText variant="bodyLg" color={colors.card} weightOverride="600">
                {t('cancelConfirm')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onCloseCancelSheet}
              style={({ pressed }) => [styles.keepBtn, pressed && styles.pressed]}
            >
              <AppText variant="bodyLg" color={colors.card} weightOverride="600">
                {t('cancelKeep')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 15, 15, 0.4)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  refundCard: {
    backgroundColor: colors.successContainer,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  refundIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasons: {
    gap: 8,
  },
  reasonRow: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
  },
  reasonRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLow,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  note: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: 12,
  },
  confirmBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: CANCEL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
});
