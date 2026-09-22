import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import type { ConsultNowViewModel } from '../controllers/useConsultNowController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const SUCCESS_BORDER = '#CDE8DA';
const CHIP_FILL = '#E6F5FE';
const ICON_BLUE = '#2A7BA3';
const ACTION = '#2A7BA3';
const AMBER = '#8A5109';
const AMBER_FILL = '#FCF3E4';
const AMBER_BORDER = '#F2C14E';
const ERROR = '#A3231A';
const ERROR_FILL = '#FBEBE9';

export function ConsultNowView(vm: ConsultNowViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('back')}
          onPress={vm.onBack}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <AppText variant="headlineMd" color="#000000" style={styles.title}>
          {vm.t('consultNowTitle')}
        </AppText>
        <View style={styles.instantBadge}>
          <AppText variant="labelSm" color={AMBER} weightOverride="600">
            {vm.t('consultNowInstant')}
          </AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 108 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.availableCard}>
          <Ionicons name="time-outline" size={22} color={SUCCESS} />
          <View style={styles.flex}>
            <AppText variant="titleMd" color={SUCCESS}>
              {vm.availableLabel}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.waitLabel}
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenMemberPicker}
          style={styles.consultingChip}
        >
          <AppText variant="bodyMd" color="#000000">
            {`${vm.t('bookConsultingFor')} `}
            <AppText variant="bodyMd" color="#000000" weightOverride="600">
              {vm.selectedMemberLabel}
            </AppText>
          </AppText>
          <Ionicons name="chevron-down" size={18} color={MUTED} />
        </Pressable>

        <View style={styles.section}>
          <AppText variant="titleMd" color="#000000">
            {vm.t('consultNowCareNeed')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.t('consultNowCareNeedHint')}
          </AppText>
          <View style={styles.needGrid}>
            {vm.needs.map((need) => {
              const selected = need.id === vm.selectedNeedId;
              return (
                <Pressable
                  key={need.id}
                  onPress={() => vm.onSelectNeed(need.id)}
                  style={[
                    styles.needCard,
                    need.wide && styles.needWide,
                    selected && styles.needSelected,
                  ]}
                >
                  <Image
                    source={need.image}
                    resizeMode="contain"
                    style={styles.needImage}
                  />
                  <AppText variant="titleMd" color="#000000">
                    {vm.t(need.titleKey)}
                  </AppText>
                  <AppText variant="bodyMd" color={MUTED}>
                    {vm.t(need.hintKey)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="titleMd" color="#000000">
            {vm.t('filterConsultMode')}
          </AppText>
          <View style={styles.chipRow}>
            {vm.modes.map((item) => (
              <PreferenceChip
                key={item.id}
                label={vm.t(item.labelKey)}
                selected={vm.mode === item.id}
                icon={item.icon}
                onPress={() => vm.onSelectMode(item.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="titleMd" color="#000000">
            {vm.t('languageLabel')}
          </AppText>
          <View style={styles.chipRow}>
            {vm.languages.map((item) => (
              <PreferenceChip
                key={item.id}
                label={vm.t(item.labelKey)}
                selected={vm.selectedLanguages.includes(item.id)}
                languageOverride={item.languageOverride}
                onPress={() => vm.onToggleLanguage(item.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <AppText variant="titleMd" color="#000000">
            {vm.t('filterDoctorSection')}
          </AppText>
          <View style={styles.chipRow}>
            <PreferenceChip
              label={vm.t('genderMale')}
              selected={vm.genders.includes('male')}
              onPress={() => vm.onToggleGender('male')}
            />
            <PreferenceChip
              label={vm.t('genderFemale')}
              selected={vm.genders.includes('female')}
              onPress={() => vm.onToggleGender('female')}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <AppText variant="titleMd" color="#000000">
            {vm.t('filterQualifications')}
          </AppText>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: vm.recognizedQualification }}
            onPress={vm.onToggleRecognized}
            style={styles.checkRow}
          >
            <CheckBox checked={vm.recognizedQualification} />
            <AppText variant="bodyMd" color="#000000" style={styles.flex}>
              {vm.t('filterRecognizedQual')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: vm.focusCertified }}
            onPress={vm.onToggleFocusCert}
            style={styles.checkRow}
          >
            <CheckBox checked={vm.focusCertified} />
            <AppText variant="bodyMd" color="#000000" style={styles.flex}>
              {vm.t('filterFocusCert')}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <AppText variant="titleMd" color="#000000">
            {vm.t('filterLocation')}
          </AppText>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#707976" />
            <TextInput
              value={vm.locationQuery}
              onChangeText={vm.onChangeLocationQuery}
              placeholder={vm.t('filterLocationPlaceholder')}
              placeholderTextColor="#707976"
              style={[
                styles.searchInput,
                { fontFamily: fontFamilyFor('400', vm.language, 'sans') },
              ]}
            />
          </View>
          <View style={styles.chipRow}>
            {vm.visibleCities.map((city) => (
              <PreferenceChip
                key={city.id}
                label={vm.t(city.nameKey)}
                selected={vm.selectedCityIds.includes(city.id)}
                onPress={() => vm.onToggleCity(city.id)}
              />
            ))}
            <PreferenceChip
              label={vm.t('filterCurrentLocation')}
              selected={vm.useCurrentLocation}
              icon="navigate-outline"
              keepIcon
              onPress={vm.onToggleCurrentLocation}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.noteHead}>
            <AppText variant="titleMd" color="#000000">
              {vm.t('consultNowNote')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('consultNowNoteOptional')}
            </AppText>
          </View>
          <TextInput
            value={vm.note}
            onChangeText={vm.onChangeNote}
            placeholder={vm.t('consultNowNotePlaceholder')}
            placeholderTextColor={MUTED}
            multiline
            style={[
              styles.note,
              { fontFamily: fontFamilyFor('400', vm.language, 'sans') },
            ]}
          />
        </View>

        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <AppText variant="bodyLg" color="#000000">
              {vm.t('consultNowFeeLabel')}
            </AppText>
            <AppText variant="titleMd" color="#000000">
              {vm.feeLabel}
            </AppText>
          </View>
          <AppText variant="bodyMd" color={AMBER} weightOverride="600">
            {vm.t('consultNowPaidExtra')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.t('consultNowFeeHint')}
          </AppText>
        </View>

        <View style={styles.emergency}>
          <Ionicons name="warning" size={22} color={ERROR} />
          <AppText variant="bodyMd" color="#000000" style={styles.flex}>
            <AppText variant="bodyMd" color={ERROR} weightOverride="600">
              {vm.t('consultNowEmergency')}
            </AppText>
            {` ${vm.t('consultNowEmergencyBody')}`}
          </AppText>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: sheetBottomPadding(insets, spacing.md) }]}>
        <Pressable
          accessibilityRole="button"
          disabled={!vm.canFindDoctor}
          onPress={vm.onFindDoctor}
          style={({ pressed }) => [
            styles.findBtn,
            !vm.canFindDoctor && styles.disabled,
            pressed && vm.canFindDoctor && styles.pressed,
          ]}
        >
          <AppText variant="titleMd" color="#FFFFFF">
            {vm.t('consultNowFindDoctor')}
          </AppText>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <SafeAreaModal
        transparent
        animationType="slide"
        visible={vm.memberPickerOpen}
        onRequestClose={vm.onCloseMemberPicker}
      >
        <Pressable style={styles.sheetBackdrop} onPress={vm.onCloseMemberPicker}>
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: sheetBottomPadding(insets, spacing.xl) },
            ]}
            onPress={() => undefined}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <AppText variant="headlineMd" color="#000000">
                {vm.t('bookWhoFor')}
              </AppText>
              <Pressable onPress={vm.onCloseMemberPicker} style={styles.iconButton}>
                <Ionicons name="close" size={22} color="#000000" />
              </Pressable>
            </View>
            {vm.members.map((item) => {
              const selected = item.id === vm.member.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => vm.onSelectMember(item.id)}
                  style={[styles.memberRow, selected && styles.memberRowSelected]}
                >
                  <View
                    style={[
                      styles.memberAvatar,
                      selected && styles.memberAvatarSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon === 'child' ? 'happy-outline' : 'person-outline'}
                      size={22}
                      color="#000000"
                    />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="titleMd" color="#000000" style={styles.memberName}>
                      {item.self ? vm.t('bookMyself') : item.name.split(' ')[0]}
                    </AppText>
                    <AppText variant="bodyMd" color={selected ? '#000000' : MUTED}>
                      {item.self ? item.name : item.metaKey ? vm.t(item.metaKey) : ''}
                    </AppText>
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color={ICON_BLUE} />
                  ) : null}
                </Pressable>
              );
            })}
            <Pressable onPress={vm.onAddMember} style={styles.addMember}>
              <View style={styles.addAvatar}>
                <Ionicons name="add" size={22} color="#000000" />
              </View>
              <AppText variant="titleMd" color="#000000" style={styles.memberName}>
                {vm.t('bookAddMember')}
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </SafeAreaModal>
    </View>
  );
}

function PreferenceChip({
  label,
  selected,
  onPress,
  icon,
  keepIcon,
  languageOverride,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  keepIcon?: boolean;
  languageOverride?: 'en' | 'mr';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {selected && !keepIcon ? (
        <Ionicons name="checkmark" size={16} color={ICON_BLUE} />
      ) : icon ? (
        <Ionicons name={icon} size={16} color="#000000" />
      ) : null}
      <AppText variant="labelMd" color="#000000" languageOverride={languageOverride}>
        {label}
      </AppText>
    </Pressable>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxOn]}>
      {checked ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  topBar: {
    backgroundColor: colors.card,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'left',
  },
  instantBadge: {
    backgroundColor: AMBER_FILL,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: spacing.sm,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  availableCard: {
    backgroundColor: SUCCESS_FILL,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  consultingChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
  },
  section: {
    gap: 12,
  },
  needGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  needCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.card,
  },
  needWide: {
    width: '100%',
  },
  needSelected: {
    backgroundColor: CHIP_FILL,
    borderColor: ICON_BLUE,
    borderWidth: 1.5,
  },
  needImage: {
    width: 36,
    height: 36,
    tintColor: colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
  },
  chipSelected: {
    backgroundColor: CHIP_FILL,
    borderColor: ICON_BLUE,
    borderWidth: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: HAIRLINE,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: ICON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOn: {
    backgroundColor: ICON_BLUE,
  },
  searchWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
  },
  searchInput: {
    flex: 1,
    color: '#000000',
    paddingVertical: 10,
    fontSize: scaleFont(15),
  },
  noteHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  note: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#8A8A8A',
    borderRadius: radii.sm,
    padding: spacing.md,
    color: '#000000',
    textAlignVertical: 'top',
  },
  feeCard: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergency: {
    backgroundColor: ERROR_FILL,
    borderWidth: 1,
    borderColor: ERROR,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  findBtn: {
    minHeight: 52,
    borderRadius: radii.button,
    backgroundColor: ACTION,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: '#D6D6D6',
    marginBottom: 4,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
  },
  memberRowSelected: {
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSelected: {
    backgroundColor: '#5CCEF7',
  },
  memberName: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  addMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#8A8A8A',
    borderRadius: radii.sm,
    marginTop: 8,
  },
  addAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
});
