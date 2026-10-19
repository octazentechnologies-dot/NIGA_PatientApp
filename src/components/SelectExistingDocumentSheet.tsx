import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { KeyboardAwareSheet } from './KeyboardAwareSheet';
import type { PatientDocument } from '../config/patientDocuments';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';

type Props = {
  open: boolean;
  documents: PatientDocument[];
  selectedId: string | null;
  t: (key: TranslationKey) => string;
  language?: AppLanguage;
  onClose: () => void;
  onSelect: (id: string) => void;
  onUploadNew: () => void;
};

/**
 * Half-screen, searchable document picker — same shell pattern as WhoForMemberSheet.
 */
export function SelectExistingDocumentSheet({
  open,
  documents,
  selectedId,
  t,
  language = 'en',
  onClose,
  onSelect,
  onUploadNew,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.sizeLabel.toLowerCase().includes(q) ||
        doc.kind.toLowerCase().includes(q),
    );
  }, [documents, searchQuery]);

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={open}
      onRequestClose={onClose}
    >
      <KeyboardAwareSheet
        onDismiss={onClose}
        maxHeightFraction={0.5}
        header={
          <>
            <View style={styles.header}>
              <AppText
                variant="headlineMd"
                color={colors.ink}
                style={styles.flex}
              >
                {t('uploadDocSelectTitle')}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('close')}
                onPress={onClose}
                style={styles.iconHit}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <AppText variant="bodyMd" color={colors.muted} style={styles.hint}>
              {t('uploadDocSelectHint')}
            </AppText>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('uploadDocSearchPlaceholder')}
                placeholderTextColor={colors.onSurfaceVariant}
                accessibilityLabel={t('uploadDocSearchPlaceholder')}
                returnKeyType="search"
                autoCorrect={false}
                style={[
                  styles.searchInput,
                  {
                    fontFamily: fontFamilyFor('400', language, 'sans'),
                    fontSize: scaleFont(15),
                  },
                ]}
              />
              {searchQuery.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('close')}
                  onPress={() => setSearchQuery('')}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              ) : null}
            </View>
          </>
        }
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {filtered.map((doc) => {
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
                  <AppText
                    variant="bodyMd"
                    color={colors.ink}
                    weightOverride="600"
                    numberOfLines={1}
                    raw
                  >
                    {doc.name}
                  </AppText>
                  <AppText variant="labelSm" color={colors.muted} raw>
                    {doc.sizeLabel}
                  </AppText>
                </View>
                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={22}
                    color={colors.outlineVariant}
                  />
                )}
              </Pressable>
            );
          })}

          {filtered.length === 0 ? (
            <AppText
              variant="bodyMd"
              color={colors.onSurfaceVariant}
              style={styles.empty}
            >
              {t('uploadDocNoMatches')}
            </AppText>
          ) : null}
        </ScrollView>

        <AppButton
          label={t('uploadDocUploadNew')}
          variant="secondary"
          onPress={onUploadNew}
          icon={
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={colors.primary}
            />
          }
          style={styles.uploadNew}
        />
      </KeyboardAwareSheet>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    backgroundColor: colors.page,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.sm,
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
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
