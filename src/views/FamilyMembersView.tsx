import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddFamilyMemberSheet } from '../components/AddFamilyMemberSheet';
import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { ConfirmationModal } from '../components/ConfirmationModal';
import type { FamilyMembersViewModel } from '../controllers/useFamilyMembersController';
import type { FamilyMember } from '../models/family';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { getRelationDisplayName } from '../utilities/familyHelpers';

export function FamilyMembersView({
  language,
  t,
  variant,
  sheetMode,
  self,
  selfMeta,
  members,
  addSheetOpen,
  helpOpen,
  datePickerOpen,
  datePickerValue,
  relationshipPickerOpen,
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
  genderPickerOpen,
  onOpenGenderPicker,
  onCloseGenderPicker,
  onSelectGender,
  onOpenRelationshipPicker,
  onCloseRelationshipPicker,
  onSelectRelationship,
  apiRelations = [],
  selectedRelationId = null,
  selectedRelationName = '',
  onSelectRelation,
  apiGenders = [],
  selectedGenderId = null,
  isRelationsLoading = false,
  isGendersLoading = false,
  isCreatingMember = false,
  isDeletingMember = false,
  onChangeMobileNumber,
  onToggleAuthorizedToManage,
  onSubmitMember,
  onEditMember,
  onRemoveMember,
  onContinue,
  onSkip,
  onBack,
  isFamilyLoading = false,
  isFamilyError = false,
  refetchFamily,
}: FamilyMembersViewModel) {
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
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
        refreshControl={
          <RefreshControl
            refreshing={isFamilyLoading}
            onRefresh={refetchFamily}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.content,
          variant === 'account' && {
            paddingBottom: sheetBottomPadding(insets, spacing.lg),
          },
        ]}
      >
        {/* Primary Account ("You") Card - SaaS Style */}
        <View style={styles.selfCard}>
          <View style={styles.selfAvatar}>
            <AppText
              variant="titleMd"
              color={colors.primary}
              weightOverride="600"
              languageOverride="en"
            >
              {self.initials}
            </AppText>
          </View>
          <View style={styles.selfInfo}>
            <View style={styles.selfNameRow}>
              <AppText
                variant="titleMd"
                color={colors.onSurface}
                weightOverride="600"
                languageOverride="en"
                style={styles.selfName}
                numberOfLines={1}
              >
                {self.name}
              </AppText>
              <View style={styles.primaryBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                  {t('familyYouBadge')}
                </AppText>
              </View>
            </View>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              {selfMeta}
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <AppText variant="titleMd" color={colors.onSurface} weightOverride="600">
              {t('familyMembersYouManage')}
            </AppText>
            {members.length > 0 ? (
              <View style={styles.countBadge}>
                <AppText variant="labelSm" color={colors.primary} weightOverride="700">
                  {String(members.length)}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle"
            size={20}
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

        {/* Family Member Cards Listing */}
        <View style={styles.memberList}>
          {isFamilyLoading && members.length === 0 ? (
            <View style={styles.emptyMembersBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                {t('loading')}
              </AppText>
            </View>
          ) : isFamilyError && members.length === 0 ? (
            <View style={styles.emptyMembersBox}>
              <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
              <AppText
                variant="bodyMd"
                color="#1F1F1F"
                style={styles.emptyMembersText}
              >
                {t('genericError')}
              </AppText>
              <AppButton
                label={t('retry')}
                variant="secondary"
                onPress={refetchFamily}
              />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyMembersBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="people-outline"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <AppText
                variant="titleMd"
                color={colors.onSurface}
                weightOverride="600"
                style={styles.emptyMembersText}
              >
                {t('familyNoMembers')}
              </AppText>
              <AppText
                variant="bodyMd"
                color={colors.onSurfaceVariant}
                style={styles.emptyMembersText}
              >
                {language === 'mr'
                  ? 'तुमच्या कुटुंबातील सदस्यांची आरोग्यविषयक माहिती व्यवस्थापित करण्यासाठी सदस्य जोडा.'
                  : 'Add family members to manage consultations, prescriptions, and health records.'}
              </AppText>
            </View>
          ) : (
            members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                language={language}
                t={t}
                onEdit={() => onEditMember(member.id)}
                onDelete={() => setMemberToDelete(member)}
              />
            ))
          )}
        </View>

        {/* Add Family Member Action */}
        <AppButton
          variant="secondary"
          label={t('familyAddMember')}
          textVariant="titleMd"
          onPress={onOpenAddSheet}
          style={styles.addButton}
          icon={<Ionicons name="person-add-outline" size={20} color={colors.primary} />}
        />
      </ScrollView>

      {/* Onboarding Footer */}
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

      {/* Add / Edit Family Member Bottom Sheet */}
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
        genderPickerOpen={genderPickerOpen}
        onOpenGenderPicker={onOpenGenderPicker}
        onCloseGenderPicker={onCloseGenderPicker}
        onSelectGender={onSelectGender}
        onOpenRelationshipPicker={onOpenRelationshipPicker}
        onCloseRelationshipPicker={onCloseRelationshipPicker}
        onSelectRelationship={onSelectRelationship}
        apiRelations={apiRelations}
        selectedRelationId={selectedRelationId}
        selectedRelationName={selectedRelationName}
        onSelectRelation={onSelectRelation}
        apiGenders={apiGenders}
        selectedGenderId={selectedGenderId}
        isRelationsLoading={isRelationsLoading}
        isGendersLoading={isGendersLoading}
        isCreatingMember={isCreatingMember}
        onChangeMobileNumber={onChangeMobileNumber}
        onToggleAuthorizedToManage={onToggleAuthorizedToManage}
        onSubmitMember={onSubmitMember}
      />

      {/* Help Modal */}
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
            <AppText variant="titleMd" color={colors.primary} weightOverride="600">
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

      {/* Reusable Themed Confirmation Modal */}
      <ConfirmationModal
        visible={Boolean(memberToDelete)}
        variant="danger"
        title={language === 'mr' ? 'सदस्य काढून टाका?' : 'Remove Member?'}
        message={
          language === 'mr'
            ? `तुम्हाला खात्री आहे की तुम्ही "${memberToDelete?.name || ''}" या सदस्याला काढून टाकू इच्छिता?`
            : `Are you sure you want to remove "${memberToDelete?.name || ''}" from your family members?`
        }
        confirmLabel={language === 'mr' ? 'काढून टाका' : 'Remove'}
        cancelLabel={t('cancel')}
        loading={isDeletingMember}
        onCancel={() => setMemberToDelete(null)}
        onConfirm={async () => {
          if (memberToDelete) {
            const id = memberToDelete.id;
            setMemberToDelete(null);
            await onRemoveMember(id);
          }
        }}
      />
    </View>
  );
}

function MemberCard({
  member,
  language,
  t,
  onEdit,
  onDelete,
}: {
  member: FamilyMember;
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const relationText = member.relationName
    ? getRelationDisplayName(member.relationName, language)
    : member.relationship
      ? getRelationDisplayName(member.relationship, language)
      : '';

  return (
    <View style={styles.memberCard}>
      {/* Avatar */}
      <View style={styles.memberAvatar}>
        <AppText
          variant="titleMd"
          color={colors.primary}
          weightOverride="600"
          languageOverride="en"
        >
          {member.initials}
        </AppText>
      </View>

      {/* Member Info */}
      <View style={styles.memberInfo}>
        <View style={styles.nameRelationRow}>
          <AppText
            variant="titleMd"
            color={colors.onSurface}
            weightOverride="600"
            languageOverride="en"
            style={styles.memberName}
            numberOfLines={1}
          >
            {member.name}
          </AppText>
          {relationText ? (
            <View style={styles.relationPill}>
              <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                {relationText}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          {member.age > 0 ? (
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {`${member.age} ${t('yearsShort')}`}
            </AppText>
          ) : null}
          {member.age > 0 && member.mobileNo ? (
            <AppText variant="labelSm" color={colors.outlineVariant}>
              {' · '}
            </AppText>
          ) : null}
          {member.mobileNo ? (
            <View style={styles.phoneSnippet}>
              <Ionicons name="call-outline" size={12} color={colors.onSurfaceVariant} />
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {member.mobileNo}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      {/* Action Buttons: Direct Edit and Delete */}
      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('familyEditMember')}
          hitSlop={8}
          onPress={onEdit}
          style={styles.actionBtnEdit}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('familyRemoveMember')}
          hitSlop={8}
          onPress={onDelete}
          style={styles.actionBtnDelete}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </Pressable>
      </View>
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

  /* Self Card - SaaS Style */
  selfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.md,
  },
  selfAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  selfInfo: {
    flex: 1,
    gap: 2,
  },
  selfNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  selfName: {
    flexShrink: 1,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.buttonFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    opacity: 0.5,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    backgroundColor: colors.buttonFill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },

  /* Info Banner */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },

  /* Listing */
  memberList: {
    gap: spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  nameRelationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  memberName: {
    flexShrink: 1,
  },
  relationPill: {
    backgroundColor: colors.buttonFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  phoneSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  /* Direct Action Buttons */
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtnEdit: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  actionBtnDelete: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: '#FDECEA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F8D7DA',
  },

  /* Empty State */
  emptyMembersBox: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyMembersText: {
    textAlign: 'center',
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

  /* Modal Styles */
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
});
