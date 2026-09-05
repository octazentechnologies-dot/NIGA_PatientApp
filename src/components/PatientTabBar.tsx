import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeTab } from '../controllers/useHomeController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

const TABS: {
  id: HomeTab;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  labelKey: TranslationKey;
}[] = [
  {
    id: 'home',
    icon: 'home-outline',
    iconActive: 'home',
    labelKey: 'homeTabHome',
  },
  {
    id: 'doctors',
    icon: 'medkit-outline',
    iconActive: 'medkit',
    labelKey: 'homeTabDoctors',
  },
  {
    id: 'records',
    icon: 'document-text-outline',
    iconActive: 'document-text',
    labelKey: 'homeTabRecords',
  },
  {
    id: 'medicines',
    icon: 'flask-outline',
    iconActive: 'flask',
    labelKey: 'homeTabMedicines',
  },
  {
    id: 'account',
    icon: 'person-outline',
    iconActive: 'person',
    labelKey: 'homeTabAccount',
  },
];

type PatientTabBarProps = {
  selectedTab: HomeTab;
  t: (key: TranslationKey) => string;
  onSelectTab: (tab: HomeTab) => void;
};

export function PatientTabBar({
  selectedTab,
  t,
  onSelectTab,
}: PatientTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {TABS.map((tab) => {
        const active = tab.id === selectedTab;
        const tint = active ? colors.primary : colors.onSurfaceVariant;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelectTab(tab.id)}
            style={styles.tab}
          >
            <View style={[styles.activeLine, active && styles.activeLineOn]} />
            <Ionicons
              name={active ? tab.iconActive : tab.icon}
              size={22}
              color={tint}
            />
            <AppText variant="labelSm" color={tint}>
              {t(tab.labelKey)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    paddingTop: 0,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    paddingTop: spacing.sm,
  },
  activeLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  activeLineOn: {
    backgroundColor: colors.primary,
  },
});
