import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeTab } from '../controllers/useHomeController';
import { useLocalization } from '../localization/i18n';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { systemBottomInset } from '../utilities/sheetInset';
import { AppText } from './AppText';

/** Approx height of the floating pill (icon + label + inner padding). */
const TAB_PILL_HEIGHT = 68;
/** Visible air between scroll content and the floating pill. */
const TAB_CONTENT_GAP = spacing.section;

const TABS: {
  id: HomeTab;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: TranslationKey;
}[] = [
  { id: 'home', icon: 'home-outline', labelKey: 'homeTabHome' },
  { id: 'doctors', icon: 'medkit-outline', labelKey: 'homeTabDoctors' },
  { id: 'records', icon: 'document-text-outline', labelKey: 'homeTabRecords' },
  { id: 'medicines', icon: 'flask-outline', labelKey: 'homeTabMedicines' },
  { id: 'account', icon: 'person-outline', labelKey: 'homeTabAccount' },
];

type PatientTabBarProps = {
  selectedTab: HomeTab;
  t: (key: TranslationKey) => string;
  onSelectTab: (tab: HomeTab) => void;
};

/** Bottom padding under the pill: system nav inset + tight float. */
export function patientTabDockBottom(safeBottom: number): number {
  return Math.max(safeBottom, 0) + spacing.xs;
}

/**
 * Scroll / list padding so content clears the floating pill with a visible
 * gap — last rows are not tucked under the tab.
 */
export function patientTabScrollInset(safeBottom: number): number {
  return patientTabDockBottom(safeBottom) + TAB_PILL_HEIGHT + TAB_CONTENT_GAP;
}

export function usePatientTabScrollInset(): number {
  const insets = useSafeAreaInsets();
  return patientTabScrollInset(systemBottomInset(insets));
}

/** @deprecated Prefer usePatientTabScrollInset() — safe-area aware. */
export const PATIENT_TAB_SCROLL_INSET = 128;

/**
 * Floating pill over the page — dock is transparent so the rounded shell
 * and page colour show in the gutters (matches Doctor app tab bar).
 */
export function PatientTabBar({
  selectedTab,
  t,
  onSelectTab,
}: PatientTabBarProps) {
  const insets = useSafeAreaInsets();
  const { language } = useLocalization();
  const labelFont = fontFamilyFor('600', language, 'sans');
  const bottomInset = systemBottomInset(insets);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.dock,
        {
          paddingBottom: patientTabDockBottom(bottomInset),
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.card,
            borderRadius: radii.full,
            borderColor: colors.outlineVariant,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.xs,
            shadowColor: colors.onSurface,
            ...Platform.select({
              ios: {
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              },
              android: {
                elevation: 4,
              },
              default: {},
            }),
          },
        ]}
      >
        {TABS.map((tab) => {
          const active = tab.id === selectedTab;
          const tint = active ? colors.onButton : colors.onSurface;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onSelectTab(tab.id)}
              style={[
                styles.tab,
                {
                  borderRadius: radii.full,
                  backgroundColor: active ? colors.button : 'transparent',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.xs,
                  minHeight: 48,
                },
              ]}
            >
              <Ionicons name={tab.icon} size={22} color={tint} />
              <AppText
                variant="labelSm"
                color={tint}
                weightOverride="600"
                numberOfLines={1}
                style={{ fontFamily: labelFont, textAlign: 'center' }}
              >
                {t(tab.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
