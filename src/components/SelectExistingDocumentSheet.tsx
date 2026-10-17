import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from './AppButton';
import { AppText } from './AppText';
import type { PatientDocument } from '../config/patientDocuments';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

type Props = {
  open: boolean;
  documents: PatientDocument[];
  selectedId: string | null;
  t: (key: TranslationKey) => string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onUploadNew: () => void;
};

export function SelectExistingDocumentSheet({
  open,
  documents,
  selectedId,
  t,
  onClose,
  onSelect,
  onUploadNew,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaModal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="headlineMd" color={colors.ink} style={styles.flex}>
              {t('uploadDocSelectTitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.iconHit}
            >
              <Ionicons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>
          <AppText variant="bodyMd" color={colors.muted} style={styles.hint}>
            {t('uploadDocSelectHint')}
          </AppText>

          {documents.map((doc) => {
            const selected = doc.id === selectedId;
            return (
              <Pressable
                key={doc.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelect(doc.id)}
                style={[styles.row, selected && styles.rowSelected]}
              >
                <View style={styles.thumb}>
                  <Ionicons
                    name={
                      doc.kind === 'pdf'
                        ? 'document-text-outline'
                        : 'image-outline'
                    }
                    size={22}
                    color={colors.muted}
                  />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyMd" color={colors.ink} weightOverride="600" numberOfLines={1}>
                    {doc.name}
                  </AppText>
                  <AppText variant="labelSm" color={colors.muted}>
                    {doc.sizeLabel}
                  </AppText>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={colors.outlineVariant} />
                )}
              </Pressable>
            );
          })}

          <AppButton
            label={t('uploadDocUploadNew')}
            variant="secondary"
            onPress={onUploadNew}
            icon={<Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />}
            style={styles.uploadNew}
          />
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
    backgroundColor: 'rgba(31, 31, 31, 0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginBottom: spacing.md,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipBackground,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadNew: {
    marginTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
