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

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { AppealReviewViewModel } from '../controllers/useAppealReviewController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';
const OUTLINE = '#8A8A8A';

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
            <Ionicons name="close" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
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
              <MaterialCommunityIcons name="gavel" size={22} color={DANGER} />
            </View>
            <View style={styles.flex}>
              <AppText variant="headlineMd" color={INK}>
                {vm.removedOnLabel}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                <AppText variant="labelMd" color={INK} weightOverride="600">
                  {vm.t('appealReasonLabel')}{' '}
                </AppText>
                {vm.reasonLabel}
              </AppText>
              <AppText variant="labelSm" color={MUTED}>
                {vm.decisionId}
              </AppText>
            </View>
          </View>
        </View>

        <AppText
          variant="labelSm"
          color={MUTED}
          weightOverride="600"
          style={styles.sectionLabel}
        >
          {vm.t('appealExtractLabel')}
        </AppText>
        <View style={styles.extractCard}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={18}
            color={MUTED}
            style={styles.quoteIcon}
          />
          <AppText variant="bodyLg" color={INK}>
            {vm.extractBefore}{' '}
            <AppText
              variant="bodyLg"
              color={DANGER}
              weightOverride="600"
              style={styles.highlight}
            >
              {vm.extractHighlight}
            </AppText>
            {vm.extractAfter}
          </AppText>
        </View>
        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={16} color={MUTED} />
          <AppText variant="labelSm" color={MUTED} style={styles.flex}>
            {vm.t('appealHighlightNote')}
          </AppText>
        </View>

        <View style={styles.divider} />

        <AppText variant="headlineMd" color={INK}>
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
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.t('appealReasonPrompt')}
            </AppText>
            <TextInput
              value={vm.reason}
              onChangeText={vm.onChangeReason}
              placeholder={vm.t('appealReasonPlaceholder')}
              placeholderTextColor={MUTED}
              multiline
              textAlignVertical="top"
              style={styles.textarea}
            />
          </View>
        ) : null}

        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={MUTED} />
          <AppText variant="labelSm" color={MUTED} style={styles.flex}>
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
        <AppText variant="labelMd" color={INK} weightOverride="600">
          {title}
        </AppText>
        <AppText variant="bodyMd" color={MUTED}>
          {body}
        </AppText>
      </View>
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
    gap: spacing.md,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: DANGER_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  extractCard: {
    backgroundColor: CARD,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderLeftWidth: 4,
    borderLeftColor: DANGER,
    padding: spacing.md,
  },
  quoteIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    opacity: 0.5,
  },
  highlight: {
    backgroundColor: DANGER_FILL,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HAIRLINE,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: 72,
  },
  optionOn: {
    borderColor: ACTION,
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
    borderColor: ACTION,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACTION,
  },
  reasonBlock: {
    gap: spacing.sm,
  },
  textarea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: radii.default,
    backgroundColor: CARD,
    padding: spacing.md,
    color: INK,
    fontSize: 16,
    lineHeight: 24,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#F2F2F2',
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
  flex: {
    flex: 1,
  },
});
