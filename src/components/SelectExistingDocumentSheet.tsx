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

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';

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
            <AppText variant="headlineMd" color={INK} style={styles.flex}>
              {t('uploadDocSelectTitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.iconHit}
            >
              <Ionicons name="close" size={22} color={MUTED} />
            </Pressable>
          </View>
          <AppText variant="bodyMd" color={MUTED} style={styles.hint}>
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
                    color={MUTED}
                  />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyMd" color={INK} weightOverride="600" numberOfLines={1}>
                    {doc.name}
                  </AppText>
                  <AppText variant="labelSm" color={MUTED}>
                    {doc.sizeLabel}
                  </AppText>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={ACTION} />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={HAIRLINE} />
                )}
              </Pressable>
            );
          })}

          <AppButton
            label={t('uploadDocUploadNew')}
            variant="secondary"
            onPress={onUploadNew}
            icon={<Ionicons name="cloud-upload-outline" size={20} color={ACTION} />}
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
    backgroundColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  rowSelected: {
    borderColor: ACTION,
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
