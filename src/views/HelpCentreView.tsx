import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppScreenHeader } from '../components/AppScreenHeader';
import { AppText } from '../components/AppText';
import type {
  HelpCentreViewModel,
  HelpTopic,
} from '../controllers/useHelpCentreController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const OUTLINE = colors.outline;
export function HelpCentreView(vm: HelpCentreViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <AppScreenHeader
        title={vm.t('helpCentreTitle')}
        onBack={vm.onBack}
        backLabel={vm.t('back')}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={vm.onToggleLanguage}
            style={styles.langHit}
          >
            <AppText variant="labelMd" color={colors.primary} weightOverride="600">
              {vm.languageToggleLabel}
            </AppText>
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            value={vm.query}
            onChangeText={vm.onChangeQuery}
            placeholder={vm.t('helpSearchPlaceholder')}
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink}>
            {vm.t('helpGetHelpFast')}
          </AppText>
          {vm.supportUnavailable ? (
            <AppText variant="bodyMd" color={colors.muted} raw>
              Support contact not available yet
            </AppText>
          ) : null}
          {vm.showChatSupport ? (
            <Pressable
              accessibilityRole="button"
              onPress={vm.onChatSupport}
              style={styles.fastAction}
            >
              <View style={styles.fastTitleRow}>
                <Ionicons name="chatbubble" size={18} color={colors.iconFill} />
                <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                  {vm.t('helpChatSupport')}
                </AppText>
              </View>
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.t('helpChatSupportMeta')}
              </AppText>
            </Pressable>
          ) : null}
          {vm.showCallHelpline ? (
            <Pressable
              accessibilityRole="button"
              onPress={vm.onCallHelpline}
              style={styles.fastAction}
            >
              <View style={styles.fastTitleRow}>
                <Ionicons name="call" size={18} color={colors.iconFill} />
                <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                  {vm.t('helpCallHelpline')}
                </AppText>
              </View>
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.t('helpCallHelplineMeta')}
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {vm.selectedSlug ? (
          <View style={styles.card}>
            <Pressable accessibilityRole="button" onPress={vm.onCloseArticle}>
              <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                {vm.t('back')}
              </AppText>
            </Pressable>
            {vm.detailLoading ? (
              <AppText variant="bodyMd" color={colors.muted}>
                …
              </AppText>
            ) : vm.detailError ? (
              <AppText variant="bodyMd" color={colors.error} raw>
                Could not load this article.
              </AppText>
            ) : (
              <>
                {vm.selectedTitle ? (
                  <AppText variant="headlineMd" color={colors.ink} raw>
                    {vm.selectedTitle}
                  </AppText>
                ) : null}
                {vm.selectedBody ? (
                  <AppText variant="bodyMd" color={colors.muted} raw>
                    {vm.selectedBody}
                  </AppText>
                ) : null}
              </>
            )}
          </View>
        ) : (
          <>
            <AppText
              variant="labelSm"
              color={colors.muted}
              weightOverride="600"
              style={styles.sectionLabel}
            >
              {vm.t('helpNeedHelpWith')}
            </AppText>
            {vm.listLoading ? (
              <AppText variant="bodyMd" color={colors.muted}>
                …
              </AppText>
            ) : vm.listError ? (
              <Pressable accessibilityRole="button" onPress={vm.onRetry}>
                <AppText variant="bodyMd" color={colors.error} raw>
                  Could not load help. Tap to retry.
                </AppText>
              </Pressable>
            ) : vm.isEmpty ? (
              <AppText variant="bodyMd" color={colors.muted} raw>
                No help articles yet.
              </AppText>
            ) : (
              vm.grouped.map((group) => (
                <View key={group.category} style={{ gap: spacing.sm }}>
                  <AppText variant="labelSm" color={colors.muted} weightOverride="600" raw>
                    {group.category}
                  </AppText>
                  {group.topics.map((topic) => (
                    <TopicRow key={topic.id} topic={topic} vm={vm} />
                  ))}
                </View>
              ))
            )}
          </>
        )}
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
      <View style={styles.topicIcon}>
        <Ionicons name="document-text-outline" size={20} color={colors.ink} />
      </View>
      <AppText variant="bodyLg" color={colors.ink} style={styles.flex} raw>
        {topic.title}
      </AppText>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
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
    backgroundColor: colors.card,
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
    color: colors.ink,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fastAction: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: 64,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.iconFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconDanger: {
    backgroundColor: colors.errorContainer,
  },
  flex: {
    flex: 1,
  },
});
