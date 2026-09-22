import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BookingMember } from '../config/appointmentSlots';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { AppText } from './AppText';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const CHIP_FILL = '#E6F5FE';
const ICON_FILL = '#5CCEF7';
const ACTION = '#2A7BA3';

type WhoForMemberSheetProps = {
  visible: boolean;
  members: BookingMember[];
  selectedMemberId: string;
  t: (key: TranslationKey) => string;
  onClose: () => void;
  onSelectMember: (memberId: string) => void;
  onAddMember: () => void;
};

/**
 * Bottom sheet: “Who is this for?” — member cards + dashed Add Family Member.
 */
export function WhoForMemberSheet({
  visible,
  members,
  selectedMemberId,
  t,
  onClose,
  onSelectMember,
  onAddMember,
}: WhoForMemberSheetProps) {
  const insets = useSafeAreaInsets();

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
            <AppText variant="headlineMd" color={INK} style={styles.title}>
              {t('bookWhoFor')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={INK} />
            </Pressable>
          </View>

          {members.map((item) => {
            const selected = item.id === selectedMemberId;
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
                  ]}
                >
                  <Ionicons
                    name={
                      item.icon === 'child' ? 'happy-outline' : 'person-outline'
                    }
                    size={22}
                    color={INK}
                  />
                </View>
                <View style={styles.copy}>
                  <AppText
                    variant="titleMd"
                    color={INK}
                    weightOverride="600"
                    style={styles.memberName}
                    languageOverride="en"
                  >
                    {item.self ? t('bookMyself') : item.name.split(' ')[0]}
                  </AppText>
                  <AppText
                    variant="bodyMd"
                    color={selected ? INK : MUTED}
                    languageOverride="en"
                  >
                    {item.self
                      ? item.name
                      : item.metaKey
                        ? t(item.metaKey)
                        : ''}
                  </AppText>
                </View>
                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={ACTION}
                  />
                ) : null}
              </Pressable>
            );
          })}

          <Pressable
            accessibilityRole="button"
            onPress={onAddMember}
            style={styles.addMember}
          >
            <View style={styles.addAvatar}>
              <Ionicons name="add" size={22} color={INK} />
            </View>
            <AppText
              variant="titleMd"
              color={INK}
              weightOverride="600"
              style={styles.memberName}
            >
              {t('bookAddMember')}
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: '#D6D6D6',
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
  },
  memberRowSelected: {
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: ACTION,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: ICON_FILL,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  addMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#8A8A8A',
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  addAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
