import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { AppText } from './AppText';

type DatePickerSheetProps = {
  visible: boolean;
  value: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  locale?: string;
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
  locale = 'en-IN',
  cancelLabel,
  doneLabel,
  onCancel,
  onConfirm,
}: DatePickerSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        display: 'default',
        maximumDate,
        minimumDate,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            onConfirm(selectedDate);
          } else {
            onCancel();
          }
        },
      });
    }
    return () => {
      if (Platform.OS === 'android') {
        try {
          DateTimePickerAndroid.dismiss('date');
        } catch {
          // ignore
        }
      }
    };
  }, [visible]);

  if (!visible || Platform.OS === 'android') {
    return null;
  }

  return (
    <SafeAreaModal transparent animationType="fade" visible onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { paddingBottom: sheetBottomPadding(insets, spacing.lg) }]}
          onPress={() => undefined}
        >
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
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
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
