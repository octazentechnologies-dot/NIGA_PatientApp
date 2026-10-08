import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type BookingMember,
  resolveBookingMembers,
} from '../config/appointmentSlots';
import type { TranslationKey } from '../localization/types';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useAppSelector } from '../store/hooks';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { AppText } from './AppText';

type WhoForMemberSheetProps = {
  visible: boolean;
  members?: BookingMember[];
  selectedMemberId: string;
  t: (key: TranslationKey) => string;
  onClose: () => void;
  onSelectMember: (memberId: string) => void;
  onAddMember: () => void;
};

/**
 * Bottom sheet: “Who is this for?” — displays real family members + Self using app's theme.
 */
export function WhoForMemberSheet({
  visible,
  members: propMembers,
  selectedMemberId,
  t,
  onClose,
  onSelectMember,
  onAddMember,
}: WhoForMemberSheetProps) {
  const insets = useSafeAreaInsets();
  const authUser = useAppSelector((state) => state.auth.user);
  const patientFullName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    '';

  const { data: familyResponse, isLoading: isFamilyLoading } = useGetFamilyQuery(
    undefined,
    { skip: !visible },
  );

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

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.md) },
          ]}
          onPress={() => undefined}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="headlineMd" color={colors.onSurface} style={styles.title}>
              {t('bookWhoFor')}
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

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
          >
            {displayMembers.map((item) => {
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
                      name={
                        isChild
                          ? 'happy-outline'
                          : item.icon === 'woman'
                            ? 'person-outline'
                            : 'person-outline'
                      }
                      size={22}
                      color={isChild ? '#D97706' : colors.primary}
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
        </Pressable>
      </Pressable>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: '#E5E7EB',
    marginBottom: spacing.xs,
  },
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
  listScroll: {
    maxHeight: 440,
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
    backgroundColor: '#FEF3C7',
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
