import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import type {
  HelpCentreViewModel,
  HelpTopic,
} from '../controllers/useHelpCentreController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ICON_CYAN = '#5CCEF7';
const OUTLINE = '#8A8A8A';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';

export function HelpCentreView(vm: HelpCentreViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
            {vm.t('helpCentreTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onToggleLanguage}
            style={styles.langHit}
          >
            <AppText variant="labelMd" color={ACTION} weightOverride="600">
              {vm.languageToggleLabel}
            </AppText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={MUTED} />
          <TextInput
            value={vm.query}
            onChangeText={vm.onChangeQuery}
            placeholder={vm.t('helpSearchPlaceholder')}
            placeholderTextColor={MUTED}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('helpGetHelpFast')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onChatSupport}
            style={styles.fastAction}
          >
            <View style={styles.fastTitleRow}>
              <Ionicons name="chatbubble" size={18} color={ICON_CYAN} />
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.t('helpChatSupport')}
              </AppText>
            </View>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('helpChatSupportMeta')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onCallHelpline}
            style={styles.fastAction}
          >
            <View style={styles.fastTitleRow}>
              <Ionicons name="call" size={18} color={ICON_CYAN} />
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.t('helpCallHelpline')}
              </AppText>
            </View>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('helpCallHelplineMeta')}
            </AppText>
          </Pressable>
        </View>

        <AppText
          variant="labelSm"
          color={MUTED}
          weightOverride="600"
          style={styles.sectionLabel}
        >
          {vm.t('helpNeedHelpWith')}
        </AppText>

        {vm.filteredTopics.map((topic) => (
          <TopicRow key={topic.id} topic={topic} vm={vm} />
        ))}
      </ScrollView>
    </View>
  );
}

function TopicRow({
  topic,
  vm,
}: {
  topic: HelpTopic;
  vm: HelpCentreViewModel;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => vm.onOpenTopic(topic.id)}
      style={styles.topicRow}
    >
      <View
        style={[
          styles.topicIcon,
          topic.danger && styles.topicIconDanger,
        ]}
      >
        <Ionicons
          name={topic.icon}
          size={20}
          color={topic.danger ? DANGER : INK}
        />
      </View>
      <AppText variant="bodyLg" color={INK} style={styles.flex}>
        {vm.t(topic.labelKey)}
      </AppText>
      <Ionicons name="chevron-forward" size={20} color={MUTED} />
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
  langHit: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: OUTLINE,
    borderTopLeftRadius: radii.default,
    borderTopRightRadius: radii.default,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: INK,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fastAction: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 72,
  },
  fastTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: 64,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ICON_CYAN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconDanger: {
    backgroundColor: DANGER_FILL,
  },
  flex: {
    flex: 1,
  },
});
