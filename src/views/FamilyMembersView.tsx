import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddFamilyMemberSheet } from '../components/AddFamilyMemberSheet';
import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { FamilyMembersViewModel } from '../controllers/useFamilyMembersController';
import type { FamilyMember, FamilyMemberStatus } from '../models/family';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const PENDING_FILL = '#ffdcc0';
const PENDING_TEXT = '#8d4f00';
const SUCCESS_FILL = '#E8F5E9';
const SUCCESS_TEXT = '#1B5E20';

export function FamilyMembersView({
  language,
  t,
  variant,
  sheetMode,
  self,
  selfMeta,
  members,
  memberMeta,
  statusLabel,
  addSheetOpen,
  helpOpen,
  datePickerOpen,
  datePickerValue,
  relationshipPickerOpen,
  memberMenuId,
  fullName,
  dateOfBirth,
  gender,
  relationship,
  mobileNumber,
  authorizedToManage,
  canSubmit,
  relationships,
  relationshipLabel,
  onOpenAddSheet,
  onCloseAddSheet,
  onOpenHelp,
  onCloseHelp,
  onChangeFullName,
  onChangeDateOfBirth,
  onOpenDatePicker,
  onCloseDatePicker,
  onConfirmDateOfBirth,
  onSelectGender,
  onOpenRelationshipPicker,
  onCloseRelationshipPicker,
  onSelectRelationship,
  onChangeMobileNumber,
  onToggleAuthorizedToManage,
  onSubmitMember,
  onOpenMemberMenu,
  onCloseMemberMenu,
  onEditMember,
  onRemoveMember,
  onContinue,
  onSkip,
  onBack,
}: FamilyMembersViewModel) {
  const selectedMember = members.find((member) => member.id === memberMenuId);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          hitSlop={8}
          onPress={onBack}
          style={styles.headerSide}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <AppText
          variant="headlineMd"
          color="#000000"
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {t('familyMembersTitle')}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('familyHelp')}
          hitSlop={8}
          onPress={onOpenHelp}
          style={styles.headerSide}
        >
          <View style={styles.helpCircle}>
            <Ionicons name="help" size={18} color={colors.onPrimary} />
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          variant === 'account' && {
            paddingBottom: sheetBottomPadding(insets, spacing.lg),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => undefined}
          style={styles.memberCard}
        >
          <View style={styles.memberMain}>
            <View style={styles.avatarYou}>
              <AppText
                variant="titleMd"
                color={colors.primary}
                languageOverride="en"
              >
                {self.initials}
              </AppText>
            </View>
            <View style={styles.memberCopy}>
              <View style={styles.nameRow}>
                <AppText
                  variant="titleMd"
                  color={colors.onSurface}
                  languageOverride="en"
                  style={styles.memberName}
                >
                  {self.name}
                </AppText>
                <StatusBadge status="you" label={t('familyYouBadge')} />
              </View>
              <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                {selfMeta}
              </AppText>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.outline}
          />
        </Pressable>

        <View style={styles.divider} />

        <AppText variant="titleMd" color={colors.onSurface}>
          {t('familyMembersYouManage')}
        </AppText>

        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle"
            size={22}
            color={colors.primary}
          />
          <AppText
            variant="bodyMd"
            color={colors.onSurfaceVariant}
            style={styles.flex}
          >
            {t('familyAdultConfirmNote')}
          </AppText>
        </View>

        <View style={styles.memberList}>
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              meta={memberMeta(member)}
              statusText={statusLabel(member)}
              moreLabel={t('familyMoreOptions')}
              onOpenMenu={() => onOpenMemberMenu(member.id)}
            />
          ))}
        </View>

        <AppButton
          variant="secondary"
          label={t('familyAddMember')}
          textVariant="titleMd"
          onPress={onOpenAddSheet}
          style={styles.addButton}
          icon={<Ionicons name="add" size={22} color={colors.button} />}
        />
      </ScrollView>

      {variant === 'onboarding' ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: sheetBottomPadding(insets, spacing.md) },
          ]}
        >
          <AppButton
            label={t('continue')}
            textVariant="titleMd"
            onPress={onContinue}
            style={styles.footerButton}
          />
          <AppButton
            variant="secondary"
            label={t('skipForNow')}
            textVariant="titleMd"
            onPress={onSkip}
            style={[styles.footerButton, styles.skipButton]}
          />
        </View>
      ) : null}

      <AddFamilyMemberSheet
        language={language}
        t={t}
        sheetMode={sheetMode}
        addSheetOpen={addSheetOpen}
        relationshipPickerOpen={relationshipPickerOpen}
        fullName={fullName}
        dateOfBirth={dateOfBirth}
        datePickerOpen={datePickerOpen}
        datePickerValue={datePickerValue}
        gender={gender}
        relationship={relationship}
        mobileNumber={mobileNumber}
        authorizedToManage={authorizedToManage}
        canSubmit={canSubmit}
        relationships={relationships}
        relationshipLabel={relationshipLabel}
        onCloseAddSheet={onCloseAddSheet}
        onChangeFullName={onChangeFullName}
        onChangeDateOfBirth={onChangeDateOfBirth}
        onOpenDatePicker={onOpenDatePicker}
        onCloseDatePicker={onCloseDatePicker}
        onConfirmDateOfBirth={onConfirmDateOfBirth}
        onSelectGender={onSelectGender}
        onOpenRelationshipPicker={onOpenRelationshipPicker}
        onCloseRelationshipPicker={onCloseRelationshipPicker}
        onSelectRelationship={onSelectRelationship}
        onChangeMobileNumber={onChangeMobileNumber}
        onToggleAuthorizedToManage={onToggleAuthorizedToManage}
        onSubmitMember={onSubmitMember}
      />

      <SafeAreaModal
        transparent
        animationType="fade"
        visible={helpOpen}
        onRequestClose={onCloseHelp}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseHelp}>
          <Pressable
            style={[
              styles.modalCard,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
            onPress={() => undefined}
          >
            <AppText variant="titleMd" color={colors.primary}>
              {t('familyHelp')}
            </AppText>
            <AppText variant="bodyMd" color={colors.onSurface}>
              {t('familyAdultConfirmNote')}
            </AppText>
            <AppButton
              label={t('close')}
              textVariant="titleMd"
              onPress={onCloseHelp}
            />
          </Pressable>
        </Pressable>
      </SafeAreaModal>

      <SafeAreaModal
        transparent
        animationType="fade"
        visible={Boolean(selectedMember)}
        onRequestClose={onCloseMemberMenu}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseMemberMenu}>
          <Pressable
            style={[
              styles.modalCard,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
            onPress={() => undefined}
          >
            <AppText
              variant="titleMd"
              color={colors.primary}
              languageOverride="en"
            >
              {selectedMember?.name ?? t('familyMoreOptions')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={onEditMember}
              style={styles.menuOption}
            >
              <AppText variant="bodyMd" color={colors.onSurface}>
                {t('familyEditMember')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onRemoveMember}
              style={styles.menuOption}
            >
              <AppText variant="bodyMd" color={colors.error}>
                {t('familyRemoveMember')}
              </AppText>
            </Pressable>
            <AppButton
              variant="secondary"
              label={t('close')}
              textVariant="titleMd"
              onPress={onCloseMemberMenu}
            />
          </Pressable>
        </Pressable>
      </SafeAreaModal>
    </View>
  );
}

function MemberCard({
  member,
  meta,
  statusText,
  moreLabel,
  onOpenMenu,
}: {
  member: FamilyMember;
  meta: string;
  statusText: string;
  moreLabel: string;
  onOpenMenu: () => void;
}) {
  const pending = member.status === 'pending';

  return (
    <View style={[styles.memberCard, pending && styles.memberCardPending]}>
      <View style={styles.memberMain}>
        <View style={styles.avatarMember}>
          <AppText
            variant="titleMd"
            color={colors.onSurfaceVariant}
            languageOverride="en"
          >
            {member.initials}
          </AppText>
        </View>
        <View style={styles.memberCopy}>
          <View style={styles.nameRow}>
            <AppText
              variant="titleMd"
              color={colors.onSurface}
              languageOverride="en"
              style={styles.memberName}
            >
              {member.name}
            </AppText>
            <StatusBadge status={member.status} label={statusText} />
          </View>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
            {meta}
          </AppText>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${moreLabel}: ${member.name}`}
        hitSlop={8}
        onPress={onOpenMenu}
        style={styles.moreButton}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={colors.onSurfaceVariant}
        />
      </Pressable>
    </View>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: FamilyMemberStatus | 'you';
  label: string;
}) {
  const warm = status === 'pending' || status === 'guardian';

  return (
    <View style={[styles.badge, warm ? styles.badgeWarm : styles.badgeSuccess]}>
      <AppText
        variant="labelSm"
        color={warm ? PENDING_TEXT : SUCCESS_TEXT}
        style={styles.badgeText}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.card,
  },
  headerSide: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  helpCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  memberCardPending: {
    opacity: 0.95,
  },
  memberMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarYou: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMember: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCopy: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberName: {
    flexShrink: 1,
  },
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeSuccess: {
    backgroundColor: SUCCESS_FILL,
  },
  badgeWarm: {
    backgroundColor: PENDING_FILL,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    opacity: 0.5,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  memberList: {
    gap: 12,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.button,
  },
  footer: {
    alignSelf: 'stretch',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  footerButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.button,
  },
  skipButton: {
    backgroundColor: colors.card,
  },
  flex: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuOption: {
    minHeight: layout.buttonHeight,
    justifyContent: 'center',
  },
});
