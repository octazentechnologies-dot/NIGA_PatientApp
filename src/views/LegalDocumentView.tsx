import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import type { LegalDocumentViewModel } from '../controllers/useLegalDocumentController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const CHIP_FILL = '#E6F5FE';

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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
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
              color={ACTION}
            />
          </View>
          <AppText variant="headlineMd" color={INK}>
            {vm.t(vm.titleKey)}
          </AppText>
          {vm.versionKey ? (
            <AppText variant="labelSm" color={MUTED}>
              {vm.t(vm.versionKey)}
            </AppText>
          ) : null}
          <AppText variant="bodyMd" color={MUTED}>
            {vm.t(vm.introKey)}
          </AppText>
        </View>

        {vm.sections.map((section) => (
          <View key={section.headingKey} style={styles.sectionCard}>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.t(section.headingKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t(section.bodyKey)}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE },
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
  heroCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  sectionCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
