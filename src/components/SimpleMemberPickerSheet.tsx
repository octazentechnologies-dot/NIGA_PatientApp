import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import type { AppLanguage, TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { AppText } from './AppText';
import { KeyboardAwareSheet } from './KeyboardAwareSheet';
import { SafeAreaModal } from './SafeAreaModal';

export type SimpleMemberOption = {
  id: string;
  label: string;
};

type Props = {
  visible: boolean;
  title: string;
  members: SimpleMemberOption[];
  selectedMemberId: string;
  t: (key: TranslationKey) => string;
  language?: AppLanguage;
  onClose: () => void;
  onSelectMember: (memberId: string) => void;
};

/** Half-screen searchable member picker for simpler { id, label } lists. */
export function SimpleMemberPickerSheet({
  visible,
  title,
  members,
  selectedMemberId,
  t,
  language = 'en',
  onClose,
  onSelectMember,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
    }
  }, [visible]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.label.toLowerCase().includes(q));
  }, [members, searchQuery]);

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAwareSheet
        onDismiss={onClose}
        maxHeightFraction={0.5}
        header={
          <>
            <AppText variant="titleMd" color={colors.ink} style={styles.title} raw>
              {title}
            </AppText>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('whoForSearchPlaceholder')}
                placeholderTextColor={colors.onSurfaceVariant}
                accessibilityLabel={t('whoForSearchPlaceholder')}
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
          {filtered.map((member) => {
            const selected = member.id === selectedMemberId;
            return (
              <Pressable
                key={member.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelectMember(member.id)}
                style={styles.row}
              >
                <AppText
                  variant="bodyLg"
                  color={colors.ink}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.flex}
                  raw
                >
                  {member.label}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
          {filtered.length === 0 ? (
            <AppText
              variant="bodyMd"
              color={colors.onSurfaceVariant}
              style={styles.empty}
            >
              {t('whoForNoMatches')}
            </AppText>
          ) : null}
        </ScrollView>
      </KeyboardAwareSheet>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  title: {
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
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  flex: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
