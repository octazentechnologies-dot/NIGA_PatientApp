import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppText } from '../components/AppText';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import type { LegalDocumentViewModel } from '../controllers/useLegalDocumentController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

export function LegalDocumentView(vm: LegalDocumentViewModel) {
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
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText variant="headlineMd" color={colors.ink} style={styles.headerTitle}>
            {vm.t(vm.titleKey)}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name={
                vm.docId === 'about'
                  ? 'heart-outline'
                  : vm.docId === 'privacy'
                    ? 'shield-checkmark-outline'
                    : 'document-text-outline'
              }
              size={24}
              color={colors.primary}
            />
          </View>
          <AppText variant="headlineMd" color={colors.ink} raw={Boolean(vm.apiTitle)}>
            {vm.apiTitle || vm.t(vm.titleKey)}
          </AppText>
          {vm.apiVersion ? (
            <AppText variant="labelSm" color={colors.muted} raw>
              {vm.apiVersion}
            </AppText>
          ) : vm.versionKey ? (
            <AppText variant="labelSm" color={colors.muted}>
              {vm.t(vm.versionKey)}
            </AppText>
          ) : null}
          {vm.apiBody ? null : (
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t(vm.introKey)}
            </AppText>
          )}
        </View>

        {vm.isLoading ? <LoadingState /> : null}
        {vm.isError ? (
          <ErrorState message="Could not load the terms." onRetry={vm.onRetry} />
        ) : null}
        {vm.apiBody ? (
          <View style={styles.sectionCard}>
            <AppText variant="bodyMd" color={colors.muted} raw>
              {vm.apiBody}
            </AppText>
          </View>
        ) : null}

        {vm.sections.map((section) => (
          <View key={section.headingKey} style={styles.sectionCard}>
            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.t(section.headingKey)}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t(section.bodyKey)}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
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
  heroCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
