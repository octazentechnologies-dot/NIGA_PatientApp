import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { AppealReviewViewModel } from '../controllers/useAppealReviewController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const OUTLINE = colors.outline;

export function AppealReviewView(vm: AppealReviewViewModel) {
  const insets = useSafeAreaInsets();

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
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
          <AppText variant="headlineMd" color={colors.ink} style={styles.headerTitle}>
            {vm.t('appealTitle')}
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
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.gavelCircle}>
              <MaterialCommunityIcons name="gavel" size={22} color={colors.error} />
            </View>
            <View style={styles.flex}>
              <AppText variant="headlineMd" color={colors.ink}>
                {vm.removedOnLabel}
              </AppText>
              <AppText variant="bodyMd" color={colors.muted}>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                  {vm.t('appealReasonLabel')}{' '}
                </AppText>
                {vm.reasonLabel}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.decisionId}
              </AppText>
            </View>
          </View>
        </View>

        <AppText
          variant="labelSm"
          color={colors.muted}
          weightOverride="600"
          style={styles.sectionLabel}
        >
          {vm.t('appealExtractLabel')}
        </AppText>
        <View style={styles.extractCard}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={18}
            color={colors.muted}
            style={styles.quoteIcon}
          />
          <AppText variant="bodyLg" color={colors.ink}>
            {vm.extractBefore}{' '}
            <AppText
              variant="bodyLg"
              color={colors.error}
              weightOverride="600"
              style={styles.highlight}
            >
              {vm.extractHighlight}
            </AppText>
            {vm.extractAfter}
          </AppText>
        </View>
        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
          <AppText variant="labelSm" color={colors.muted} style={styles.flex}>
            {vm.t('appealHighlightNote')}
          </AppText>
        </View>

        <View style={styles.divider} />

        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('appealChooseAction')}
        </AppText>

        <ActionOption
          selected={vm.action === 'edit'}
          title={vm.t('appealActionEdit')}
          body={vm.t('appealActionEditBody')}
          onPress={() => vm.onSelectAction('edit')}
        />
        <ActionOption
          selected={vm.action === 'appeal'}
          title={vm.t('appealActionAppeal')}
          body={vm.t('appealActionAppealBody')}
          onPress={() => vm.onSelectAction('appeal')}
        />

        {vm.action === 'appeal' ? (
          <View style={styles.reasonBlock}>
            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.t('appealReasonPrompt')}
            </AppText>
            <TextInput
              value={vm.reason}
              onChangeText={vm.onChangeReason}
              placeholder={vm.t('appealReasonPlaceholder')}
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              style={styles.textarea}
            />
          </View>
        ) : null}

        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.muted} />
          <AppText variant="labelSm" color={colors.muted} style={styles.flex}>
            {vm.t('appealDisclaimer')}
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
          label={
            vm.action === 'edit'
              ? vm.t('appealContinueEdit')
              : vm.t('appealSubmit')
          }
          onPress={vm.onSubmit}
          disabled={!vm.canSubmit}
        />
      </View>
    </View>
  );
}

function ActionOption({
  selected,
  title,
  body,
  onPress,
}: {
  selected: boolean;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionOn]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.flex}>
        <AppText variant="labelMd" color={colors.ink} weightOverride="600">
          {title}
        </AppText>
        <AppText variant="bodyMd" color={colors.muted}>
          {body}
        </AppText>
      </View>
    </Pressable>
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
    borderBottomColor: colors.outlineVariant,
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
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  gavelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  extractCard: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    padding: spacing.md,
  },
  quoteIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    opacity: 0.5,
  },
  highlight: {
    backgroundColor: colors.errorContainer,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: 72,
  },
  optionOn: {
    borderColor: colors.primary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOn: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  reasonBlock: {
    gap: spacing.sm,
  },
  textarea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: radii.default,
    backgroundColor: colors.card,
    padding: spacing.md,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
