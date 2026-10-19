import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import {
  type BookingMember,
  resolveBookingMembers,
} from '../config/appointmentSlots';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import { useAppSelector } from '../store/hooks';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { AppText } from './AppText';
import { KeyboardAwareSheet } from './KeyboardAwareSheet';

type WhoForMemberSheetProps = {
  visible: boolean;
  members?: BookingMember[];
  selectedMemberId: string;
  t: (key: TranslationKey) => string;
  language?: AppLanguage;
  /** Optional title override (defaults to bookWhoFor). */
  titleKey?: TranslationKey;
  onClose: () => void;
  onSelectMember: (memberId: string) => void;
  onAddMember: () => void;
};

/**
 * Bottom sheet: “Who is this for?” — half-screen, searchable, keyboard-aware.
 */
export function WhoForMemberSheet({
  visible,
  members: propMembers,
  selectedMemberId,
  t,
  language = 'en',
  titleKey = 'bookWhoFor',
  onClose,
  onSelectMember,
  onAddMember,
}: WhoForMemberSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: homeDashboardResponse } = useGetHomeDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });
  const patientFullName =
    homeDashboardResponse?.data?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    '';

  const { data: familyResponse, isLoading: isFamilyLoading } = useGetFamilyQuery(
    undefined,
    { skip: !visible },
  );

  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
    }
  }, [visible]);

  const displayMembers: BookingMember[] = useMemo(() => {
    const apiFamily = familyResponse?.data;
    if (apiFamily && apiFamily.length > 0) {
      return resolveBookingMembers(patientFullName, undefined, apiFamily);
    }
    if (propMembers && propMembers.length > 0) {
      return propMembers;
    }
    return resolveBookingMembers(patientFullName);
  }, [propMembers, familyResponse, patientFullName]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayMembers;
    return displayMembers.filter((item) => {
      const name = (item.self ? t('bookMyself') : item.name || '').toLowerCase();
      const selfName = (item.name || '').toLowerCase();
      const relation = (item.relationshipName || '').toLowerCase();
      const meta = item.metaKey ? t(item.metaKey).toLowerCase() : '';
      return (
        name.includes(q) ||
        selfName.includes(q) ||
        relation.includes(q) ||
        meta.includes(q)
      );
    });
  }, [displayMembers, searchQuery, t]);

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
            <View style={styles.header}>
              <AppText
                variant="headlineMd"
                color={colors.onSurface}
                style={styles.title}
              >
                {t(titleKey)}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('close')}
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={colors.onSurface} />
              </Pressable>
            </View>

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
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
        >
          {filteredMembers.map((item) => {
            const selected = item.id === selectedMemberId;
            const isChild = item.icon === 'child';
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelectMember(item.id)}
                style={[styles.memberRow, selected && styles.memberRowSelected]}
              >
                <View
                  style={[
                    styles.avatar,
                    selected && styles.avatarSelected,
                    isChild && styles.avatarChild,
                  ]}
                >
                  <Ionicons
                    name={isChild ? 'happy-outline' : 'person-outline'}
                    size={22}
                    color={isChild ? colors.warning : colors.primary}
                  />
                </View>

                <View style={styles.copy}>
                  <View style={styles.nameRow}>
                    <AppText
                      variant="titleMd"
                      color={colors.onSurface}
                      weightOverride="600"
                      style={styles.memberName}
                      languageOverride="en"
                      numberOfLines={1}
                    >
                      {item.self ? t('bookMyself') : item.name}
                    </AppText>
                    {item.self ? (
                      <View style={styles.youBadge}>
                        <Ionicons
                          name="shield-checkmark"
                          size={11}
                          color={colors.primary}
                        />
                        <AppText
                          variant="labelSm"
                          color={colors.primary}
                          weightOverride="600"
                        >
                          {t('familyYouBadge')}
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  <AppText
                    variant="bodyMd"
                    color={colors.onSurfaceVariant}
                    languageOverride="en"
                    numberOfLines={1}
                  >
                    {item.self
                      ? item.name || t('familyYouBadge')
                      : item.relationshipName
                        ? `${item.relationshipName}${item.age ? ` • ${item.age} yrs` : ''}`
                        : item.metaKey
                          ? t(item.metaKey)
                          : ''}
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

          {isFamilyLoading && displayMembers.length <= 1 ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}

          {!isFamilyLoading &&
          filteredMembers.length === 0 &&
          searchQuery.trim() ? (
            <AppText
              variant="bodyMd"
              color={colors.onSurfaceVariant}
              style={styles.emptySearch}
            >
              {t('whoForNoMatches')}
            </AppText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={onAddMember}
            style={styles.addMember}
          >
            <View style={styles.addAvatar}>
              <Ionicons name="add" size={22} color={colors.primary} />
            </View>
            <AppText
              variant="titleMd"
              color={colors.primary}
              weightOverride="600"
              style={styles.memberName}
            >
              {t('bookAddMember')}
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAwareSheet>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.page,
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
  listScroll: {
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
  },
  memberRowSelected: {
    backgroundColor: 'rgba(15, 118, 110, 0.06)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: 'rgba(15, 118, 110, 0.16)',
  },
  avatarChild: {
    backgroundColor: colors.warningContainer,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  youBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
  },
  memberName: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  loaderWrap: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearch: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  addMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(15, 118, 110, 0.02)',
    marginTop: spacing.xs,
  },
  addAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
