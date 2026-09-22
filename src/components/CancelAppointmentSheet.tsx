import { Ionicons } from '@expo/vector-icons';
import {
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
import { AppText } from './AppText';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const SUCCESS_BORDER = '#CDE8DA';
const ACTION = '#2A7BA3';
const CANCEL = '#A3231A';

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

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={cancelSheetOpen}
      onRequestClose={onCloseCancelSheet}
    >
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onCloseCancelSheet} />
        <View style={[styles.sheet, { paddingBottom: sheetBottomPadding(insets, spacing.md) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="titleMd" color="#000000" style={styles.flex}>
              {t('cancelSheetTitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('cancel')}
              onPress={onCloseCancelSheet}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={22} color="#000000" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <View style={styles.refundCard}>
              <View style={styles.refundIcon}>
                <AppText variant="titleMd" color="#FFFFFF">
                  ₹
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyLg" color={SUCCESS} weightOverride="600">
                  {refundTitle}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {refundBody}
                </AppText>
              </View>
            </View>

            <AppText variant="bodyLg" color="#000000" weightOverride="600">
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
                    <AppText variant="bodyLg" color="#000000" style={styles.flex}>
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
              placeholderTextColor={MUTED}
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
              <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
                {t('cancelConfirm')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onCloseCancelSheet}
              style={({ pressed }) => [styles.keepBtn, pressed && styles.pressed]}
            >
              <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
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
    borderColor: HAIRLINE,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: '#D6D6D6',
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
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
    backgroundColor: SUCCESS_FILL,
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
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasons: {
    gap: 8,
  },
  reasonRow: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
  },
  reasonRowSelected: {
    borderColor: ACTION,
    backgroundColor: '#F9F9F9',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#707976',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: ACTION,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: ACTION,
  },
  note: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    color: '#000000',
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
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
    backgroundColor: ACTION,
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
