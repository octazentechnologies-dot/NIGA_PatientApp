import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSwitch } from '../components/AppSwitch';
import { AppText } from '../components/AppText';
import type { ConsentItem } from '../store/api/new/consentApi';
import type {
  ConsentCentreViewModel,
} from '../controllers/useConsentCentreController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';
const ASTRO = '#6B3FA0';
const ASTRO_FILL = '#F3EEFA';
const NEUTRAL_FILL = '#F2F2F2';

type DataRight = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: Parameters<ConsentCentreViewModel['t']>[0];
  bodyKey: Parameters<ConsentCentreViewModel['t']>[0];
  danger?: boolean;
};

const DATA_RIGHTS: DataRight[] = [
  {
    id: 'copy',
    icon: 'download-outline',
    titleKey: 'consentCentreRightCopy',
    bodyKey: 'consentCentreRightCopyBody',
  },
  {
    id: 'correct',
    icon: 'create-outline',
    titleKey: 'consentCentreRightCorrect',
    bodyKey: 'consentCentreRightCorrectBody',
  },
  {
    id: 'delete',
    icon: 'trash-outline',
    titleKey: 'consentCentreRightDelete',
    bodyKey: 'consentCentreRightDeleteBody',
    danger: true,
  },
  {
    id: 'grievance',
    icon: 'hammer-outline',
    titleKey: 'consentCentreRightGrievance',
    bodyKey: 'consentCentreRightGrievanceBody',
  },
];

export function ConsentCentreView(vm: ConsentCentreViewModel) {
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
            {vm.t('consentCentreTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsHelp')}
            onPress={vm.onHelp}
            style={styles.iconHit}
          >
            <Ionicons name="help-circle-outline" size={22} color={INK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.explainer}>
          <Ionicons name="shield-checkmark-outline" size={22} color={SUCCESS} />
          <AppText variant="bodyMd" color={INK} style={styles.flex}>
            {vm.t('consentCentreIntro')}
          </AppText>
        </View>

        <View style={styles.memberRow}>
          <AppText variant="labelMd" color={MUTED}>
            {vm.t('consentCentreShowingFor')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenMemberPicker}
            style={styles.memberBtn}
          >
            <AppText variant="labelMd" color={ACTION} weightOverride="600">
              {vm.memberLabel}
            </AppText>
            <Ionicons name="chevron-down" size={16} color={ACTION} />
          </Pressable>
        </View>

        <AppText
          variant="labelSm"
          color={MUTED}
          weightOverride="600"
          style={styles.sectionLabel}
        >
          {vm.t('consentCentreActive')}
        </AppText>

        {vm.isLoading && vm.consents.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={ACTION} />
          </View>
        ) : vm.isError && vm.consents.length === 0 ? (
          <View style={styles.errorWrap}>
            <AppText variant="bodyMd" color={DANGER}>
              Failed to load consents.
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onRetry}
              style={styles.retryBtn}
            >
              <AppText variant="labelMd" color={ACTION} weightOverride="600">
                Retry
              </AppText>
            </Pressable>
          </View>
        ) : (
          vm.consents.map((item) => (
            <ConsentCard
              key={item.consentTypeId}
              title={item.title}
              body={item.description}
              meta={formatGrantedMeta(item)}
              value={item.granted}
              isToggling={vm.togglingConsentId === item.consentTypeId}
              onToggle={() => vm.onToggleConsent(item.consentTypeId)}
            />
          ))
        )}

        <AppText
          variant="labelSm"
          color={MUTED}
          weightOverride="600"
          style={styles.sectionLabel}
        >
          {vm.t('consentCentreRights')}
        </AppText>

        <View style={styles.rightsCard}>
          {DATA_RIGHTS.map((right, index) => (
            <Pressable
              key={right.id}
              accessibilityRole="button"
              onPress={() => vm.onDataRight(right.id)}
              style={[
                styles.rightRow,
                index < DATA_RIGHTS.length - 1 && styles.rightRowBorder,
              ]}
            >
              <Ionicons
                name={right.icon}
                size={22}
                color={right.danger ? DANGER : ACTION}
              />
              <View style={styles.flex}>
                <AppText
                  variant="labelMd"
                  color={right.danger ? DANGER : INK}
                  weightOverride="600"
                >
                  {vm.t(right.titleKey)}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm.t(right.bodyKey)}
                </AppText>
                <AppText variant="labelSm" color={MUTED}>
                  {vm.t('consentCentreRespondDays')}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={MUTED} />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenRequest}
          style={styles.requestBanner}
        >
          <Ionicons name="time-outline" size={22} color={SUCCESS} />
          <AppText variant="labelMd" color={INK} style={styles.flex}>
            {vm.t('consentCentreOpenRequest')}
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenHistory}
          style={styles.historyCard}
        >
          <View style={styles.flex}>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.t('consentCentreHistory')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('consentCentreHistoryBody')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </Pressable>
      </ScrollView>

      <MemberPickerSheet vm={vm} />
    </View>
  );
}

function formatGrantedMeta(item: ConsentItem): string | undefined {
  if (item.granted && item.grantedAt) {
    try {
      const d = new Date(item.grantedAt);
      if (!isNaN(d.getTime())) {
        const formatted = d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        return `Granted ${formatted}`;
      }
    } catch {
      // ignore
    }
  }
  return undefined;
}

function ConsentCard({
  title,
  body,
  meta,
  badge,
  badgeTone = 'neutral',
  warning,
  note,
  linkLabel,
  onLink,
  value,
  isToggling = false,
  onToggle,
  muted,
  astro,
}: {
  title: string;
  body?: string;
  meta?: string;
  badge?: string;
  badgeTone?: 'neutral' | 'danger' | 'astro';
  warning?: string;
  note?: string;
  linkLabel?: string;
  onLink?: () => void;
  value?: boolean;
  isToggling?: boolean;
  onToggle?: () => void;
  muted?: boolean;
  astro?: boolean;
}) {
  return (
    <View style={[styles.card, muted && styles.cardMuted, astro && styles.cardAstro]}>
      <View style={styles.cardTop}>
        <View style={styles.flex}>
          <AppText
            variant="titleMd"
            color={muted ? MUTED : astro ? ASTRO : INK}
            weightOverride="600"
          >
            {title}
          </AppText>
          {body ? (
            <AppText variant="bodyMd" color={MUTED} style={styles.mtXs}>
              {body}
            </AppText>
          ) : null}
          {meta ? (
            <AppText variant="labelSm" color={MUTED} style={styles.mtXs}>
              {meta}
            </AppText>
          ) : null}
        </View>
        {isToggling ? (
          <View style={styles.switchLoader}>
            <ActivityIndicator size="small" color={ACTION} />
          </View>
        ) : onToggle ? (
          <AppSwitch value={Boolean(value)} onValueChange={onToggle} />
        ) : null}
      </View>

      {(badge || linkLabel) && (
        <View style={styles.badgeRow}>
          {badge ? (
            <View
              style={[
                styles.badge,
                badgeTone === 'danger' && styles.badgeDanger,
                badgeTone === 'astro' && styles.badgeAstro,
              ]}
            >
              <AppText
                variant="labelSm"
                color={
                  badgeTone === 'danger'
                    ? DANGER
                    : badgeTone === 'astro'
                      ? ASTRO
                      : MUTED
                }
                weightOverride="600"
              >
                {badge}
              </AppText>
            </View>
          ) : null}
          {linkLabel && onLink ? (
            <Pressable accessibilityRole="link" onPress={onLink}>
              <AppText
                variant="labelMd"
                color={ACTION_OUTLINE}
                weightOverride="600"
                style={styles.link}
              >
                {linkLabel}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      )}

      {warning ? (
        <View style={styles.warnRow}>
          <Ionicons name="alert-circle-outline" size={14} color={DANGER} />
          <AppText variant="labelSm" color={DANGER} style={styles.flex}>
            {warning}
          </AppText>
        </View>
      ) : null}
      {note ? (
        <AppText variant="labelSm" color={MUTED}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

function MemberPickerSheet({ vm }: { vm: ConsentCentreViewModel }) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={vm.memberPickerOpen}
      onRequestClose={vm.onCloseMemberPicker}
    >
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetScrim} onPress={vm.onCloseMemberPicker} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <AppText variant="titleMd" color={INK} style={styles.sheetTitle}>
            {vm.t('consentCentreShowingFor')}
          </AppText>
          {vm.members.map((member) => {
            const selected = member.id === vm.memberId;
            return (
              <Pressable
                key={member.id}
                accessibilityRole="button"
                onPress={() => vm.onSelectMember(member.id)}
                style={styles.sheetRow}
              >
                <AppText
                  variant="bodyLg"
                  color={INK}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.flex}
                >
                  {vm.t(member.labelKey)}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={20} color={ACTION} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaModal>
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
  explainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  memberBtn: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardMuted: {
    opacity: 0.75,
  },
  cardAstro: {
    backgroundColor: ASTRO_FILL,
    borderColor: '#D4C4E8',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mtXs: {
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: NEUTRAL_FILL,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeDanger: {
    backgroundColor: DANGER_FILL,
  },
  badgeAstro: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: ASTRO,
  },
  link: {
    textDecorationLine: 'underline',
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  rightsCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    overflow: 'hidden',
  },
  rightRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
  },
  rightRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: SUCCESS_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: 56,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    minHeight: 56,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 31, 31, 0.45)',
  },
  sheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    marginBottom: spacing.sm,
  },
  sheetRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  loaderWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  switchLoader: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
