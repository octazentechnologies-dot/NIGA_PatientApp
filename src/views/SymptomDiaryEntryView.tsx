import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { images } from '../config/images';
import {
  DIARY_SYMPTOMS,
  type DiaryAppetite,
  type DiarySeverity,
  type DiarySleep,
  type SymptomDiaryViewModel,
} from '../controllers/useSymptomDiaryController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const CHIP_FILL = '#E6F5FE';
const PLACEHOLDER = '#8A8A8A';
const INFO_FILL = '#E6F5FE';

const SEVERITIES: {
  id: DiarySeverity;
  labelKey:
    | 'diarySeverityNone'
    | 'diarySeverityMild'
    | 'diarySeverityModerate'
    | 'diarySeveritySevere'
    | 'diarySeverityVerySevere';
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'none', labelKey: 'diarySeverityNone', icon: 'happy-outline' },
  { id: 'mild', labelKey: 'diarySeverityMild', icon: 'happy' },
  { id: 'moderate', labelKey: 'diarySeverityModerate', icon: 'sad-outline' },
  { id: 'severe', labelKey: 'diarySeveritySevere', icon: 'sad' },
  { id: 'verySevere', labelKey: 'diarySeverityVerySevere', icon: 'alert-circle-outline' },
];

const SLEEP: { id: DiarySleep; labelKey: 'diarySleepGood' | 'diarySleepDisturbed' | 'diarySleepPoor' | 'diarySleepNone' }[] = [
  { id: 'good', labelKey: 'diarySleepGood' },
  { id: 'disturbed', labelKey: 'diarySleepDisturbed' },
  { id: 'poor', labelKey: 'diarySleepPoor' },
  { id: 'none', labelKey: 'diarySleepNone' },
];

const APPETITE: { id: DiaryAppetite; labelKey: 'diaryAppetiteNormal' | 'diaryAppetiteReduced' | 'diaryAppetiteIncreased' }[] = [
  { id: 'normal', labelKey: 'diaryAppetiteNormal' },
  { id: 'reduced', labelKey: 'diaryAppetiteReduced' },
  { id: 'increased', labelKey: 'diaryAppetiteIncreased' },
];

export function SymptomDiaryEntryView(vm: SymptomDiaryViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('close')}
            onPress={vm.onCloseEntry}
            style={styles.iconHit}
          >
            <Ionicons name="close" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle} numberOfLines={1}>
            {vm.t('diaryEntryTitle')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              layout.buttonHeight +
              spacing.xl +
              sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <Pressable style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={20} color={MUTED} />
          <AppText variant="bodyLg" color={INK} style={styles.flex}>
            {vm.entryDateLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={20} color={MUTED} />
        </Pressable>

        <AppText variant="titleMd" color={INK}>
          {vm.t('diarySymptomsToday')}
        </AppText>
        <View style={styles.severityRow}>
          {SEVERITIES.map((item) => {
            const selected = vm.severity === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => vm.onSelectSeverity(item.id)}
                style={styles.severityItem}
              >
                <View
                  style={[
                    styles.severityCircle,
                    selected && styles.severityCircleOn,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={selected ? ACTION : MUTED}
                  />
                </View>
                <AppText
                  variant="labelSm"
                  color={selected ? ACTION : MUTED}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.center}
                >
                  {vm.t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText variant="titleMd" color={INK}>
          {vm.t('diaryWhichSymptoms')}
        </AppText>
        <View style={styles.chipWrap}>
          {DIARY_SYMPTOMS.map((item) => {
            const selected = vm.symptoms.includes(item.id);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => vm.onToggleSymptom(item.id)}
                style={[styles.chip, selected && styles.chipOn]}
              >
                <AppText variant="bodyMd" color={INK}>
                  {vm.t(item.labelKey)}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={16} color={ACTION} />
                ) : null}
              </Pressable>
            );
          })}
          <Pressable style={styles.chipAdd}>
            <AppText variant="bodyMd" color={ACTION}>
              {vm.t('diaryAddOwn')}
            </AppText>
          </Pressable>
        </View>

        <AppText variant="titleMd" color={INK}>
          {vm.t('diarySleep')}
        </AppText>
        <View style={styles.optionRow}>
          {SLEEP.map((item) => {
            const selected = vm.sleep === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => vm.onSelectSleep(item.id)}
                style={[styles.optionBtn, selected && styles.optionBtnOn]}
              >
                <AppText
                  variant="labelSm"
                  color={selected ? ACTION : INK}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.center}
                >
                  {vm.t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText variant="titleMd" color={INK}>
          {vm.t('diaryAppetite')}
        </AppText>
        <View style={styles.optionRow}>
          {APPETITE.map((item) => {
            const selected = vm.appetite === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => vm.onSelectAppetite(item.id)}
                style={[styles.optionBtn, selected && styles.optionBtnOn]}
              >
                <AppText
                  variant="labelSm"
                  color={selected ? ACTION : INK}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.center}
                >
                  {vm.t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.notesHead}>
          <AppText variant="titleMd" color={INK} style={styles.flex}>
            {vm.t('diaryNotes')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onToggleNotesLanguage}
            style={styles.langChip}
          >
            <AppText variant="labelSm" color={ACTION} weightOverride="600">
              {vm.notesMr ? 'EN' : 'मराठी'}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.notesBox}>
          <TextInput
            value={vm.notes}
            onChangeText={vm.onChangeNotes}
            placeholder={vm.t('diaryNotesPlaceholder')}
            placeholderTextColor={PLACEHOLDER}
            multiline
            textAlignVertical="top"
            style={[
              styles.notesInput,
              {
                fontFamily: fontFamilyFor(
                  '400',
                  vm.notesMr ? 'mr' : vm.language,
                  'sans',
                ),
              },
            ]}
          />
          <Ionicons
            name="mic-outline"
            size={22}
            color={MUTED}
            style={styles.mic}
          />
        </View>

        <AppText variant="titleMd" color={INK}>
          {vm.t('diaryAddPhotos')}
        </AppText>
        <View style={styles.photoRow}>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onAddPhoto}
            style={styles.photoAdd}
          >
            <Ionicons name="camera-outline" size={24} color={ACTION} />
            <AppText variant="labelSm" color={ACTION}>
              {vm.t('diaryPhotoAdd')}
            </AppText>
          </Pressable>
          {vm.photoAdded ? (
            <View>
              <Image
                source={images.categoryAllergy}
                style={styles.photoThumb}
                resizeMode="cover"
              />
              <Pressable
                accessibilityRole="button"
                onPress={vm.onRemovePhoto}
                style={styles.photoRemove}
              >
                <Ionicons name="close" size={14} color={INK} />
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={ACTION} />
          <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
            {vm.t('diaryDoctorSees')}
          </AppText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton label={vm.t('diarySaveEntry')} onPress={vm.onSaveEntry} />
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
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  dateRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  severityItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  severityCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityCircleOn: {
    borderWidth: 2,
    borderColor: ACTION,
    backgroundColor: CHIP_FILL,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  chipOn: {
    borderColor: ACTION,
    backgroundColor: CHIP_FILL,
  },
  chipAdd: {
    minHeight: 48,
    borderRadius: radii.full,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ACTION,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  optionBtnOn: {
    backgroundColor: CHIP_FILL,
    borderColor: ACTION,
  },
  notesHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langChip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesBox: {
    minHeight: 120,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  notesInput: {
    flex: 1,
    minHeight: 88,
    fontSize: 16,
    color: INK,
    paddingRight: 28,
  },
  mic: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoAdd: {
    width: 88,
    height: 88,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.card,
  },
  photoThumb: {
    width: 88,
    height: 88,
    borderRadius: radii.sm,
    backgroundColor: HAIRLINE,
  },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: INFO_FILL,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
});
