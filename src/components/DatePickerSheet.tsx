import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

type DatePickerSheetProps = {
  visible: boolean;
  value: Date;
  maximumDate: Date;
  minimumDate: Date;
  locale: string;
  cancelLabel: string;
  doneLabel: string;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

export function DatePickerSheet({
  visible,
  value,
  maximumDate,
  minimumDate,
  locale,
  cancelLabel,
  doneLabel,
  onCancel,
  onConfirm,
}: DatePickerSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  if (!visible) {
    return null;
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="calendar"
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        onValueChange={(_event, next) => onConfirm(next)}
        onDismiss={onCancel}
      />
    );
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.toolbar}>
            <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8}>
              <AppText variant="labelMd" color={colors.onSurfaceVariant}>
                {cancelLabel}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onConfirm(draft)}
              hitSlop={8}
            >
              <AppText variant="labelMd" color={colors.primary}>
                {doneLabel}
              </AppText>
            </Pressable>
          </View>
          <DateTimePicker
            value={draft}
            mode="date"
            display="spinner"
            locale={locale}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onValueChange={(_event, next) => setDraft(next)}
            themeVariant="light"
            style={styles.iosPicker}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: spacing.lg,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iosPicker: {
    height: 216,
    alignSelf: 'stretch',
  },
});
