import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  NotificationItem,
  NotificationsViewModel,
} from '../controllers/useNotificationsController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const CHIP_FILL = '#E6F5FE';
const CHIP_BORDER = '#3AA9E0';
const ICON_CYAN = '#5CCEF7';
const WARN_FILL = '#FCF3E4';
const WARN = '#8A5109';
const ASTRO = '#6B3FA0';
const ASTRO_FILL = '#F3EEFA';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';
const NEUTRAL_FILL = '#F2F2F2';

export function NotificationsView(vm: NotificationsViewModel) {
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
            {vm.t('notifTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onMarkAllRead}
            style={styles.markAllHit}
          >
            <AppText variant="labelMd" color={MUTED} weightOverride="600">
              {vm.t('notifMarkAllRead')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.filtersBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {vm.filters.map((item) => {
            const on = item.id === vm.filter;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => vm.onSelectFilter(item.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <AppText
                  variant="labelSm"
                  color={on ? INK : MUTED}
                  weightOverride="600"
                  numberOfLines={1}
                >
                  {vm.t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.listScroll}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        {vm.groups.map((group) => (
          <View key={group.id} style={styles.group}>
            <AppText
              variant="labelSm"
              color={MUTED}
              weightOverride="600"
              style={styles.groupLabel}
            >
              {vm.t(group.labelKey)}
            </AppText>
            {group.items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                vm={vm}
                revealed={vm.revealedId === item.id}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function NotificationRow({
  item,
  vm,
  revealed,
}: {
  item: NotificationItem;
  vm: NotificationsViewModel;
  revealed: boolean;
}) {
  return (
    <View style={styles.rowWrap}>
      {revealed ? (
        <View style={styles.actionsBehind}>
          <Pressable
            accessibilityRole="button"
            onPress={() => vm.onMarkRead(item.id)}
            style={styles.actionRead}
          >
            <Ionicons name="mail-open-outline" size={20} color={INK} />
            <AppText variant="labelSm" color={INK} weightOverride="600">
              {vm.t('notifActionRead')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => vm.onDelete(item.id)}
            style={styles.actionDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <AppText variant="labelSm" color="#FFFFFF" weightOverride="600">
              {vm.t('notifActionDelete')}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (revealed) {
            vm.onReveal(null);
            return;
          }
          vm.onOpenItem(item.id);
        }}
        onLongPress={() => vm.onReveal(revealed ? null : item.id)}
        style={[styles.row, revealed && styles.rowRevealed]}
      >
        {item.unread ? <View style={styles.unreadBar} /> : <View style={styles.unreadSpacer} />}
        <View style={[styles.iconCircle, toneStyle(item.tone)]}>
          <NotifIcon item={item} />
        </View>
        <View style={styles.flex}>
          <View style={styles.titleRow}>
            <AppText
              variant="labelMd"
              color={INK}
              weightOverride="600"
              style={styles.flex}
              numberOfLines={1}
            >
              {vm.t(item.titleKey)}
            </AppText>
            <AppText variant="labelSm" color={MUTED}>
              {vm.t(item.timeKey)}
            </AppText>
          </View>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.t(item.bodyKey)}
          </AppText>
          {item.joinAction ? (
            <AppButton
              label={vm.t('notifJoinCta')}
              onPress={() => vm.onJoin(item.id)}
              icon={<Ionicons name="videocam-outline" size={18} color="#FFFFFF" />}
              style={styles.joinBtn}
            />
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

function NotifIcon({ item }: { item: NotificationItem }) {
  if (item.id === 'rx') {
    return <Ionicons name="document-text-outline" size={20} color={INK} />;
  }
  if (item.id === 'delivery') {
    return <MaterialCommunityIcons name="truck-delivery-outline" size={20} color={INK} />;
  }
  if (item.id === 'followup') {
    return <Ionicons name="create-outline" size={20} color={INK} />;
  }
  if (item.id === 'refund') {
    return <Ionicons name="wallet-outline" size={20} color={WARN} />;
  }
  if (item.id === 'carelink') {
    return <Ionicons name="shield-checkmark-outline" size={20} color={ASTRO} />;
  }
  return <MaterialCommunityIcons name="medical-bag" size={20} color={INK} />;
}

function toneStyle(tone: NotificationItem['tone']) {
  if (tone === 'money') {
    return { backgroundColor: WARN_FILL };
  }
  if (tone === 'carelink') {
    return { backgroundColor: ASTRO_FILL };
  }
  return { backgroundColor: CHIP_FILL };
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
  markAllHit: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipScroll: {
    flexGrow: 0,
  },
  filtersBar: {
    height: 52,
    justifyContent: 'center',
    backgroundColor: PAGE,
  },
  chipRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHIP_BORDER,
  },
  listScroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowWrap: {
    position: 'relative',
    borderRadius: radii.default,
    overflow: 'hidden',
  },
  actionsBehind: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionRead: {
    width: 72,
    backgroundColor: NEUTRAL_FILL,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionDelete: {
    width: 72,
    backgroundColor: DANGER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    minHeight: 72,
  },
  rowRevealed: {
    transform: [{ translateX: -144 }],
  },
  unreadBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: ACTION,
    borderTopLeftRadius: radii.default,
    borderBottomLeftRadius: radii.default,
    marginRight: 4,
  },
  unreadSpacer: {
    width: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  joinBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    minWidth: 120,
    paddingHorizontal: spacing.md,
  },
});
