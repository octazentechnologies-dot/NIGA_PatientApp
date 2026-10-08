import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FamilyMembersViewModel } from '../controllers/useFamilyMembersController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';
import {
  getGenderDisplayName,
  getRelationDisplayName,
} from '../utilities/familyHelpers';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { DatePickerSheet } from './DatePickerSheet';
import { FormField } from './FormField';

type AddFamilyMemberSheetProps = Pick<
  FamilyMembersViewModel,
  | 'language'
  | 't'
  | 'sheetMode'
  | 'addSheetOpen'
  | 'genderPickerOpen'
  | 'onOpenGenderPicker'
  | 'onCloseGenderPicker'
  | 'relationshipPickerOpen'
  | 'fullName'
  | 'dateOfBirth'
  | 'datePickerOpen'
  | 'datePickerValue'
  | 'gender'
  | 'relationship'
  | 'mobileNumber'
  | 'authorizedToManage'
  | 'canSubmit'
  | 'relationships'
  | 'relationshipLabel'
  | 'onCloseAddSheet'
  | 'onChangeFullName'
  | 'onChangeDateOfBirth'
  | 'onOpenDatePicker'
  | 'onCloseDatePicker'
  | 'onConfirmDateOfBirth'
  | 'onSelectGender'
  | 'onOpenRelationshipPicker'
  | 'onCloseRelationshipPicker'
  | 'onSelectRelationship'
  | 'apiRelations'
  | 'selectedRelationId'
  | 'selectedRelationName'
  | 'onSelectRelation'
  | 'apiGenders'
  | 'selectedGenderId'
  | 'isRelationsLoading'
  | 'isGendersLoading'
  | 'isCreatingMember'
  | 'onChangeMobileNumber'
  | 'onToggleAuthorizedToManage'
  | 'onSubmitMember'
>;

export function AddFamilyMemberSheet({
  language,
  t,
  sheetMode,
  addSheetOpen,
  genderPickerOpen,
  onOpenGenderPicker,
  onCloseGenderPicker,
  relationshipPickerOpen,
  fullName,
  dateOfBirth,
  datePickerOpen,
  datePickerValue,
  gender,
  relationship,
  mobileNumber,
  authorizedToManage,
  canSubmit,
  relationships,
  relationshipLabel,
  onCloseAddSheet,
  onChangeFullName,
  onChangeDateOfBirth,
  onOpenDatePicker,
  onCloseDatePicker,
  onConfirmDateOfBirth,
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
  onChangeMobileNumber,
  onToggleAuthorizedToManage,
  onSubmitMember,
}: AddFamilyMemberSheetProps) {
  const insets = useSafeAreaInsets();
  const selectedGenderObj = apiGenders.find(
    (g) => g.genderId === selectedGenderId,
  );

  return (
    <>
      <SafeAreaModal
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
            { paddingBottom: sheetBottomPadding(insets, spacing.md) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <AppText
              variant="headlineMd"
              color={colors.primary}
              style={styles.sheetTitle}
            >
              {t(
                sheetMode === 'edit'
                  ? 'familyEditMemberTitle'
                  : 'addFamilyMemberTitle',
              )}
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
              required
              value={fullName}
              placeholder={t('fullNamePlaceholder')}
              language={language}
              onChangeText={onChangeFullName}
            />
            <FormField
              label={t('dateOfBirth')}
              required
              value={dateOfBirth}
              placeholder={t('dateOfBirthPlaceholder')}
              language={language}
              keyboardType="number-pad"
              maxLength={10}
              onChangeText={onChangeDateOfBirth}
              onPress={onOpenDatePicker}
              rightIcon={
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
              }
              onIconPress={onOpenDatePicker}
            />

            <View style={styles.fieldGroup}>
              <FormField
                label={t('gender')}
                value={
                  selectedGenderObj
                    ? getGenderDisplayName(selectedGenderObj.genderName, language)
                    : gender
                      ? getGenderDisplayName(gender, language)
                      : ''
                }
                placeholder={t('genderPlaceholder')}
                language={language}
                rightIcon={
                  <Ionicons
                    name={genderPickerOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={
                      genderPickerOpen
                        ? colors.primary
                        : colors.onSurfaceVariant
                    }
                  />
                }
                onPress={
                  genderPickerOpen
                    ? onCloseGenderPicker
                    : onOpenGenderPicker
                }
              />
              {genderPickerOpen ? (
                <View style={styles.dropdownContainer}>
                  {isGendersLoading && apiGenders.length === 0 ? (
                    <View style={styles.dropdownLoading}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : apiGenders && apiGenders.length > 0 ? (
                    <ScrollView
                      style={styles.dropdownScrollView}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                      keyboardShouldPersistTaps="handled"
                    >
                      {apiGenders.map((item) => {
                        const isSelected =
                          selectedGenderId === item.genderId ||
                          (selectedGenderId === null &&
                            gender !== null &&
                            item.genderName.toLowerCase() === gender);
                        return (
                          <Pressable
                            key={item.genderId}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            onPress={() => onSelectGender(item.genderId)}
                            style={[
                              styles.dropdownOption,
                              isSelected && styles.dropdownOptionSelected,
                            ]}
                          >
                            <AppText
                              variant="bodyMd"
                              color={
                                isSelected ? colors.primary : colors.onSurface
                              }
                            >
                              {getGenderDisplayName(item.genderName, language)}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  ) : (
                    <View style={styles.dropdownList}>
                      {(['male', 'female', 'other'] as const).map((item) => {
                        const isSelected = gender === item;
                        return (
                          <Pressable
                            key={item}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            onPress={() => onSelectGender(item)}
                            style={[
                              styles.dropdownOption,
                              isSelected && styles.dropdownOptionSelected,
                            ]}
                          >
                            <AppText
                              variant="bodyMd"
                              color={
                                isSelected ? colors.primary : colors.onSurface
                              }
                            >
                              {getGenderDisplayName(item, language)}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <FormField
                label={t('relationship')}
                value={
                  selectedRelationName
                    ? getRelationDisplayName(selectedRelationName, language)
                    : relationship
                      ? relationshipLabel(relationship)
                      : ''
                }
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
                <View style={styles.dropdownContainer}>
                  {isRelationsLoading && apiRelations.length === 0 ? (
                    <View style={styles.dropdownLoading}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : apiRelations.length > 0 ? (
                    <ScrollView
                      style={styles.dropdownScrollView}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                      keyboardShouldPersistTaps="handled"
                    >
                      {apiRelations.map((item) => {
                        const selected =
                          selectedRelationId === item.relationId ||
                          selectedRelationName.toLowerCase() ===
                          item.relationName.toLowerCase();
                        return (
                          <Pressable
                            key={item.relationId}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            onPress={() => onSelectRelation(item)}
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
                              {getRelationDisplayName(
                                item.relationName,
                                language,
                              )}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  ) : (
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
                  )}
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
                <AppText variant="bodyMd" color={colors.error} raw>
                  {' *'}
                </AppText>
              </AppText>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              label={t(
                sheetMode === 'edit'
                  ? 'familyEditMemberTitle'
                  : 'familyAddMember',
              )}
              textVariant="titleMd"
              disabled={!canSubmit || isCreatingMember}
              loading={isCreatingMember}
              onPress={onSubmitMember}
              style={styles.submit}
            />
          </View>
        </View>
      </View>
    </SafeAreaModal>

      <DatePickerSheet
        visible={datePickerOpen}
        value={datePickerValue}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        locale={language === 'mr' ? 'mr-IN' : 'en-IN'}
        cancelLabel={t('cancel')}
        doneLabel={t('done')}
        onCancel={onCloseDatePicker}
        onConfirm={onConfirmDateOfBirth}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
  },
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.card,
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
  phoneWrap: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
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
    backgroundColor: colors.card,
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
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainerHighest,
  },
  submit: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.button,
  },
  genderLoading: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  dropdownScrollView: {
    maxHeight: 220,
    padding: spacing.xs,
  },
  dropdownLoading: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownList: {
    gap: spacing.xs,
    padding: spacing.xs,
  },
  dropdownOption: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    marginBottom: spacing.xs,
  },
  dropdownOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.buttonFill,
  },
});
