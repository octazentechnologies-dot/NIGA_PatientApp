import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FamilyMembersViewModel } from '../controllers/useFamilyMembersController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { FormField } from './FormField';

type AddFamilyMemberSheetProps = Pick<
  FamilyMembersViewModel,
  | 'language'
  | 't'
  | 'addSheetOpen'
  | 'relationshipPickerOpen'
  | 'fullName'
  | 'dateOfBirth'
  | 'gender'
  | 'relationship'
  | 'mobileNumber'
  | 'authorizedToManage'
  | 'canSubmit'
  | 'relationships'
  | 'relationshipLabel'
  | 'onCloseAddSheet'
  | 'onChangeFullName'
  | 'onOpenDatePicker'
  | 'onSelectGender'
  | 'onOpenRelationshipPicker'
  | 'onCloseRelationshipPicker'
  | 'onSelectRelationship'
  | 'onChangeMobileNumber'
  | 'onToggleAuthorizedToManage'
  | 'onSubmitMember'
>;

export function AddFamilyMemberSheet({
  language,
  t,
  addSheetOpen,
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
  onCloseAddSheet,
  onChangeFullName,
  onOpenDatePicker,
  onSelectGender,
  onOpenRelationshipPicker,
  onCloseRelationshipPicker,
  onSelectRelationship,
  onChangeMobileNumber,
  onToggleAuthorizedToManage,
  onSubmitMember,
}: AddFamilyMemberSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      animationType="slide"
      visible={addSheetOpen}
      onRequestClose={onCloseAddSheet}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCloseAddSheet} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <AppText
              variant="headlineMd"
              color={colors.primary}
              style={styles.sheetTitle}
            >
              {t('addFamilyMemberTitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              hitSlop={8}
              onPress={onCloseAddSheet}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.form}
          >
            <FormField
              label={t('fullName')}
              value={fullName}
              placeholder={t('fullNamePlaceholder')}
              language={language}
              onChangeText={onChangeFullName}
            />
            <FormField
              label={t('dateOfBirth')}
              value={dateOfBirth}
              placeholder={t('dateOfBirthPlaceholder')}
              language={language}
              rightIcon={
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
              }
              onPress={onOpenDatePicker}
            />

            <View style={styles.fieldGroup}>
              <AppText variant="labelSm" color={colors.onSurface}>
                {t('gender')}
              </AppText>
              <View style={styles.genderTrack}>
                <GenderSegment
                  label={t('genderMale')}
                  selected={gender === 'male'}
                  onPress={() => onSelectGender('male')}
                />
                <GenderSegment
                  label={t('genderFemale')}
                  selected={gender === 'female'}
                  onPress={() => onSelectGender('female')}
                />
                <GenderSegment
                  label={t('genderOther')}
                  selected={gender === 'other'}
                  onPress={() => onSelectGender('other')}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <FormField
                label={t('relationship')}
                value={relationship ? relationshipLabel(relationship) : ''}
                placeholder={t('relationshipPlaceholder')}
                language={language}
                rightIcon={
                  <Ionicons
                    name={relationshipPickerOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={
                      relationshipPickerOpen
                        ? colors.primary
                        : colors.onSurfaceVariant
                    }
                  />
                }
                onPress={
                  relationshipPickerOpen
                    ? onCloseRelationshipPicker
                    : onOpenRelationshipPicker
                }
              />
              {relationshipPickerOpen ? (
                <View style={styles.dropdownList}>
                  {relationships.map((item) => {
                    const selected = item === relationship;
                    return (
                      <Pressable
                        key={item}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => onSelectRelationship(item)}
                        style={[
                          styles.dropdownOption,
                          selected && styles.dropdownOptionSelected,
                        ]}
                      >
                        <AppText
                          variant="bodyMd"
                          color={
                            selected ? colors.primary : colors.onSurface
                          }
                        >
                          {relationshipLabel(item)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <AppText variant="labelSm" color={colors.onSurface}>
                {t('mobileNumberPlaceholder')}
              </AppText>
              <View style={styles.phoneWrap}>
                <AppText variant="bodyLg" color={colors.onSurfaceVariant}>
                  {t('countryCode')}
                </AppText>
                <View style={styles.phoneDivider} />
                <TextInput
                  value={mobileNumber}
                  onChangeText={onChangeMobileNumber}
                  placeholder={t('mobileNumberPlaceholder')}
                  placeholderTextColor={colors.outline}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoComplete="tel"
                  accessibilityLabel={t('mobileNumberPlaceholder')}
                  style={[
                    styles.phoneInput,
                    {
                      fontFamily: fontFamilyFor('400', language, 'sans'),
                      fontSize: scaleFont(15),
                    },
                  ]}
                />
              </View>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {t('familyMobileHint')}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: authorizedToManage }}
              onPress={onToggleAuthorizedToManage}
              style={styles.consentBox}
            >
              <View
                style={[
                  styles.checkbox,
                  authorizedToManage && styles.checkboxChecked,
                ]}
              >
                {authorizedToManage ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.onPrimary}
                  />
                ) : null}
              </View>
              <AppText
                variant="bodyMd"
                color={colors.onSurface}
                style={styles.flex}
              >
                {t('familyManageConsent')}
              </AppText>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              label={t('familySendAuthRequest')}
              textVariant="titleMd"
              disabled={!canSubmit}
              onPress={onSubmitMember}
              style={styles.submit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GenderSegment({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.genderSegment, selected && styles.genderSegmentSelected]}
    >
      <AppText
        variant="bodyMd"
        color={selected ? colors.onSurface : colors.onSurfaceVariant}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
  },
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  sheetTitle: {
    flex: 1,
  },
  closeButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  form: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  genderTrack: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radii.sm,
    padding: 4,
    minHeight: layout.buttonHeight,
  },
  genderSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  genderSegmentSelected: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  phoneWrap: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radii.sm,
    gap: spacing.sm,
  },
  phoneDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: colors.outlineVariant,
  },
  phoneInput: {
    flex: 1,
    minHeight: layout.buttonHeight,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  consentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerHighest,
  },
  submit: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.sm,
  },
  dropdownList: {
    gap: spacing.sm,
  },
  dropdownOption: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  dropdownOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.buttonFill,
  },
});
