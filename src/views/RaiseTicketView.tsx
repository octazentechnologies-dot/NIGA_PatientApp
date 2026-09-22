import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { RaiseTicketViewModel } from '../controllers/useRaiseTicketController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ICON_CYAN = '#5CCEF7';
const OUTLINE = '#8A8A8A';
const CHIP_FILL = '#E6F5FE';

export function RaiseTicketView(vm: RaiseTicketViewModel) {
  const insets = useSafeAreaInsets();
  const topicLabel = vm.t(
    vm.topicOptions.find((item) => item.id === vm.topicId)?.labelKey ??
      'helpTopicMedicines',
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('close')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="close" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
            {vm.t('ticketTitle')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 100 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppText variant="labelMd" color={MUTED} weightOverride="600">
          {vm.t('ticketAboutLabel')}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenTopicPicker}
          style={styles.selectField}
        >
          <AppText variant="bodyMd" color={INK} style={styles.flex}>
            {topicLabel}
          </AppText>
          <Ionicons name="chevron-down" size={20} color={MUTED} />
        </Pressable>

        {vm.relatedVisible ? (
          <View style={styles.block}>
            <AppText variant="labelMd" color={MUTED} weightOverride="600">
              {vm.t('ticketRelatedLabel')}
            </AppText>
            <View style={styles.relatedCard}>
              <View style={styles.relatedThumb}>
                <MaterialCommunityIcons name="pill" size={22} color={ACTION} />
              </View>
              <View style={styles.flex}>
                <AppText variant="labelMd" color={INK} weightOverride="600">
                  {vm.t('ticketRelatedOrder').replace('{id}', vm.relatedOrderId)}
                </AppText>
                <AppText variant="labelSm" color={MUTED}>
                  {vm.relatedOrderMeta}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={vm.t('close')}
                onPress={vm.onClearRelated}
                style={styles.clearHit}
              >
                <Ionicons name="close" size={20} color={MUTED} />
              </Pressable>
            </View>
          </View>
        ) : null}

        <AppText variant="labelMd" color={MUTED} weightOverride="600">
          {vm.t('ticketIssueLabel')}
        </AppText>
        <View style={styles.issueList}>
          {vm.issues.map((issue, index) => {
            const on = issue.id === vm.issueId;
            return (
              <Pressable
                key={issue.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => vm.onSelectIssue(issue.id)}
                style={[
                  styles.issueRow,
                  index < vm.issues.length - 1 && styles.issueBorder,
                ]}
              >
                <AppText variant="bodyMd" color={INK} style={styles.flex}>
                  {vm.t(issue.labelKey)}
                </AppText>
                <View style={[styles.radio, on && styles.radioOn]}>
                  {on ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.descHeader}>
          <AppText variant="labelMd" color={MUTED} weightOverride="600">
            {vm.t('ticketDescriptionLabel')}
          </AppText>
          <View style={styles.langChip}>
            <AppText variant="labelSm" color={INK} weightOverride="600">
              {vm.descriptionLangLabel}
            </AppText>
          </View>
        </View>
        <View style={styles.textareaWrap}>
          <TextInput
            value={vm.description}
            onChangeText={vm.onChangeDescription}
            placeholder={vm.t('ticketDescriptionPlaceholder')}
            placeholderTextColor={MUTED}
            multiline
            textAlignVertical="top"
            style={styles.textarea}
          />
          <Pressable accessibilityRole="button" style={styles.micBtn}>
            <Ionicons name="mic-outline" size={20} color={ACTION} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onAddPhoto}
          style={styles.photoTile}
        >
          <View style={styles.photoCircle}>
            <Ionicons name="image-outline" size={20} color={ACTION} />
          </View>
          <AppText variant="labelMd" color={ACTION} weightOverride="600">
            {vm.t('ticketAddPhoto')}
          </AppText>
        </Pressable>

        <AppText variant="labelMd" color={MUTED} weightOverride="600">
          {vm.t('ticketContactLabel')}
        </AppText>
        <View style={styles.contactRow}>
          <ContactOption
            label={vm.t('ticketContactInApp')}
            selected={vm.contactPref === 'inApp'}
            onPress={() => vm.onSelectContact('inApp')}
          />
          <ContactOption
            label={vm.t('ticketContactCall')}
            selected={vm.contactPref === 'call'}
            onPress={() => vm.onSelectContact('call')}
          />
        </View>

        <View style={styles.privacyCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={MUTED} />
          <AppText variant="labelSm" color={MUTED} style={styles.flex}>
            {vm.t('ticketPrivacyNote')}
          </AppText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton
          label={vm.t('ticketSubmit')}
          onPress={vm.onSubmit}
          disabled={!vm.canSubmit}
        />
      </View>

      <SafeAreaModal
        visible={vm.topicPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={vm.onCloseTopicPicker}
      >
        <Pressable style={styles.modalBackdrop} onPress={vm.onCloseTopicPicker}>
          <View
            style={[
              styles.sheet,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
          >
            <AppText variant="headlineMd" color={INK}>
              {vm.t('ticketAboutLabel')}
            </AppText>
            {vm.topicOptions.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                onPress={() => vm.onSelectTopic(option.id)}
                style={styles.sheetRow}
              >
                <AppText variant="bodyMd" color={INK} style={styles.flex}>
                  {vm.t(option.labelKey)}
                </AppText>
                {option.id === vm.topicId ? (
                  <Ionicons name="checkmark" size={20} color={ACTION} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </SafeAreaModal>
    </View>
  );
}

function ContactOption({
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
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.contactOption, selected && styles.contactOptionOn]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <AppText variant="labelMd" color={INK} weightOverride="600">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE,
  },
  header: {
    backgroundColor: CARD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: OUTLINE,
    borderTopLeftRadius: radii.default,
    borderTopRightRadius: radii.default,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  block: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  relatedThumb: {
    width: 48,
    height: 48,
    borderRadius: radii.default,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueList: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  issueBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: ACTION,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACTION,
  },
  descHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langChip: {
    borderWidth: 1,
    borderColor: ICON_CYAN,
    backgroundColor: CHIP_FILL,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  textareaWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 120,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: OUTLINE,
    borderTopLeftRadius: radii.default,
    borderTopRightRadius: radii.default,
    padding: spacing.md,
    paddingRight: 48,
    color: INK,
    fontSize: 16,
    lineHeight: 24,
  },
  micBtn: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: OUTLINE,
    borderRadius: radii.default,
    backgroundColor: CARD,
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  photoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  contactOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    backgroundColor: CARD,
    paddingHorizontal: spacing.md,
  },
  contactOptionOn: {
    borderWidth: 2,
    borderColor: ACTION,
    backgroundColor: CHIP_FILL,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    backgroundColor: CARD,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,31,31,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
