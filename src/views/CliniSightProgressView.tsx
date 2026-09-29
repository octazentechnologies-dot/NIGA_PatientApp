import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  CliniSightProgressViewModel,
  EmptyRangeId,
  ReadyRangeId,
} from '../controllers/useCliniSightProgressController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const CHIP_FILL = '#E6F5FE';
const CHART = '#3AA9E0';
const RX = '#F2C14E';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const ACTION = '#2A7BA3';

export function CliniSightProgressView(vm: CliniSightProgressViewModel) {
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
          <AppText
            variant="headlineMd"
            color={INK}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('cliniSightTitle')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 32 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        {vm.hasEnoughData ? <ReadyContent vm={vm} /> : <EmptyContent vm={vm} />}
      </ScrollView>
    </View>
  );
}

function EmptyContent({ vm }: { vm: CliniSightProgressViewModel }) {
  return (
    <>
      <RangeRow
        ranges={vm.emptyRanges}
        selected={vm.emptyRange}
        onSelect={(id) => vm.onSelectEmptyRange(id as EmptyRangeId)}
        t={vm.t}
      />

      <View style={styles.emptyCard}>
        <View style={styles.infoBubble}>
          <Ionicons name="information-circle-outline" size={32} color={MUTED} />
        </View>
        <AppText variant="titleMd" color={INK} style={styles.center}>
          {vm.t('cliniSightEmptyTitle')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED} style={styles.center}>
          {vm.t('cliniSightEmptyBody')}
        </AppText>
        <AppButton
          label={vm.t('cliniSightAddToday')}
          onPress={vm.onAddTodayEntry}
          icon={
            <Ionicons name="create-outline" size={18} color={colors.onButton} />
          }
          style={styles.emptyCta}
        />
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricHead}>
            <Ionicons name="pulse-outline" size={16} color={MUTED} />
            <AppText variant="labelSm" color={INK} weightOverride="500">
              {vm.t('cliniSightAvgPain')}
            </AppText>
          </View>
          <AppText variant="displayLg" color={MUTED}>
            {vm.t('cliniSightDash')}
          </AppText>
        </View>
        <View style={styles.metricCard}>
          <View style={styles.metricHead}>
            <Ionicons name="moon-outline" size={16} color={MUTED} />
            <AppText variant="labelSm" color={INK} weightOverride="500">
              {vm.t('cliniSightSleep')}
            </AppText>
          </View>
          <AppText variant="displayLg" color={MUTED}>
            {vm.t('cliniSightNa')}
          </AppText>
        </View>
      </View>

      <AppText variant="titleMd" color={INK}>
        {vm.t('cliniSightRecentActivity')}
      </AppText>
      <View style={styles.timeline}>
        <ActivityNode
          label={vm.t('cliniSightToday')}
          body={vm.t('cliniSightNoEntry')}
        />
        <ActivityNode
          label={vm.t('cliniSightYesterday')}
          body={vm.t('cliniSightNoEntry')}
          last
        />
      </View>
    </>
  );
}

function ReadyContent({ vm }: { vm: CliniSightProgressViewModel }) {
  return (
    <>
      <View style={styles.memberRow}>
        <Pressable
          accessibilityRole="button"
          onPress={vm.onSelectMember}
          style={styles.memberChip}
        >
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {vm.memberLabel}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={MUTED} />
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.iconHit}>
          <Ionicons name="information-circle-outline" size={22} color={MUTED} />
        </Pressable>
      </View>

      <RangeRow
        ranges={vm.readyRanges}
        selected={vm.readyRange}
        onSelect={(id) => vm.onSelectReadyRange(id as ReadyRangeId)}
        t={vm.t}
      />

      <View style={styles.chartCard}>
        <SeverityChart t={vm.t} />
        <View style={styles.legendRow}>
          <LegendDot color={CHART} label={vm.t('cliniSightLegendSeverity')} />
          <LegendDash label={vm.t('cliniSightLegendRx')} />
          <LegendDot
            color={CHART}
            small
            label={vm.t('cliniSightLegendConsult')}
          />
        </View>
        <AppText variant="labelSm" color={MUTED} style={styles.center}>
          {vm.chartCaption}
        </AppText>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('cliniSightAvgSeverity')}
          </AppText>
          <View style={styles.statValueRow}>
            <AppText variant="titleMd" color={INK}>
              {vm.t('diarySeverityMild')}
            </AppText>
            <Ionicons name="arrow-down" size={18} color={CHART} />
          </View>
        </View>
        <View style={styles.statCard}>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('cliniSightDaysLogged')}
          </AppText>
          <AppText variant="titleMd" color={INK}>
            {vm.daysLoggedLine}
          </AppText>
        </View>
        <View style={styles.statCard}>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('cliniSightConsultations')}
          </AppText>
          <AppText variant="titleMd" color={INK}>
            4
          </AppText>
        </View>
        <View style={styles.statCard}>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('cliniSightFollowUpResponses')}
          </AppText>
          <AppText variant="bodyMd" color={INK}>
            {vm.followUpResponsesLine}
          </AppText>
        </View>
      </View>

      <View style={styles.card}>
        <AppText variant="titleMd" color={INK}>
          {vm.t('cliniSightRecentFollowUps')}
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.followRow}
        >
          {vm.followUps.map((item, index) => (
            <View key={item.id} style={styles.followItemWrap}>
              {index > 0 ? <View style={styles.followConnector} /> : null}
              <View style={styles.followItem}>
                <View
                  style={[
                    styles.followChip,
                    item.status === 'improved'
                      ? styles.followImproved
                      : styles.followSame,
                  ]}
                >
                  <AppText
                    variant="labelSm"
                    color={item.status === 'improved' ? SUCCESS : MUTED}
                    weightOverride="600"
                  >
                    {vm.t(
                      item.status === 'improved'
                        ? 'cliniSightImproved'
                        : 'cliniSightSame',
                    )}
                  </AppText>
                </View>
                <AppText variant="labelSm" color={MUTED}>
                  {item.dateLabel}
                </AppText>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <View style={styles.disclaimerHead}>
          <Ionicons name="information-circle" size={18} color={CHART} />
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {vm.t('cliniSightDisclaimerTitle')}
          </AppText>
        </View>
        <AppText variant="bodyMd" color={MUTED}>
          {vm.t('cliniSightDisclaimerBody')}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={vm.onSeeAllInsights}
        style={styles.linkRow}
      >
        <AppText variant="titleMd" color={INK}>
          {vm.t('cliniSightSeeAll')}
        </AppText>
        <Ionicons name="chevron-forward" size={22} color={MUTED} />
      </Pressable>

      <AppButton
        label={vm.t('cliniSightShare')}
        onPress={vm.onShareWithDoctor}
      />
      <Pressable
        accessibilityRole="button"
        onPress={vm.onDownloadPdf}
        style={styles.outlineBtn}
      >
          <AppText
            variant="titleMd"
            color={ACTION}
            weightOverride="600"
          >
          {vm.t('cliniSightDownloadPdf')}
        </AppText>
      </Pressable>
    </>
  );
}

function RangeRow({
  ranges,
  selected,
  onSelect,
  t,
}: {
  ranges: { id: string; labelKey: Parameters<CliniSightProgressViewModel['t']>[0] }[];
  selected: string;
  onSelect: (id: string) => void;
  t: CliniSightProgressViewModel['t'];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rangeRow}
    >
      {ranges.map((range) => {
        const on = range.id === selected;
        return (
          <Pressable
            key={range.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(range.id)}
            style={[styles.rangeChip, on && styles.rangeChipOn]}
          >
            <AppText
              variant="labelSm"
              color={on ? INK : MUTED}
              weightOverride={on ? '600' : '500'}
            >
              {t(range.labelKey)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ActivityNode({
  label,
  body,
  last,
}: {
  label: string;
  body: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.node, !last && styles.nodeGap]}>
      <View style={styles.nodeDot} />
      <AppText variant="labelSm" color={MUTED}>
        {label}
      </AppText>
      <View style={styles.nodeCard}>
        <AppText variant="bodyMd" color={MUTED} style={styles.italic}>
          {body}
        </AppText>
      </View>
    </View>
  );
}

function LegendDot({
  color,
  label,
  small,
}: {
  color: string;
  label: string;
  small?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          small ? styles.legendDotSm : styles.legendDot,
          { backgroundColor: color },
        ]}
      />
      <AppText variant="labelSm" color={MUTED}>
        {label}
      </AppText>
    </View>
  );
}

function LegendDash({ label }: { label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={styles.legendDash} />
      <AppText variant="labelSm" color={MUTED}>
        {label}
      </AppText>
    </View>
  );
}

function SeverityChart({
  t,
}: {
  t: CliniSightProgressViewModel['t'];
}) {
  const labels: Parameters<CliniSightProgressViewModel['t']>[0][] = [
    'diarySeverityVerySevere',
    'diarySeveritySevere',
    'diarySeverityModerate',
    'diarySeverityMild',
    'diarySeverityNone',
  ];

  return (
    <View style={styles.chartWrap}>
      <View style={styles.yAxis}>
        {labels.map((key) => (
          <AppText key={key} variant="labelSm" color={MUTED} style={styles.yLabel}>
            {t(key)}
          </AppText>
        ))}
      </View>
      <View style={styles.plot}>
        <View style={styles.gridCol}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={styles.svg}
        >
          <Defs>
            <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={CHART} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={CHART} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path
            d="M0,20 Q20,30 40,50 T80,70 L100,80 L100,100 L0,100 Z"
            fill="url(#chartFill)"
          />
          <Path
            d="M0,20 Q20,30 40,50 T80,70 L100,80"
            fill="none"
            stroke={CHART}
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
          />
          <Circle cx={20} cy={27} r={3.5} fill={CHART} />
          <Circle cx={40} cy={50} r={3.5} fill={CHART} />
          <Circle cx={80} cy={70} r={3.5} fill={CHART} />
        </Svg>
        <View style={[styles.rxLine, { left: '30%' }]}>
          <View style={styles.rxTag}>
            <Ionicons name="medkit" size={10} color={INK} />
            <AppText variant="labelSm" color={INK} weightOverride="600">
              Rx v1
            </AppText>
          </View>
        </View>
        <View style={[styles.rxLine, { left: '70%' }]}>
          <View style={styles.rxTag}>
            <Ionicons name="medkit" size={10} color={INK} />
            <AppText variant="labelSm" color={INK} weightOverride="600">
              Rx v2
            </AppText>
          </View>
        </View>
        <View style={[styles.consultDot, { left: '20%' }]} />
        <View style={[styles.consultDot, { left: '60%' }]} />
      </View>
    </View>
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
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  rangeRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rangeChip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeChipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHART,
  },
  emptyCard: {
    minHeight: 340,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  infoBubble: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyCta: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  metricHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeline: {
    marginLeft: spacing.md,
    paddingLeft: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: HAIRLINE,
    gap: 0,
  },
  node: {
    position: 'relative',
  },
  nodeGap: {
    paddingBottom: spacing.lg,
  },
  nodeDot: {
    position: 'absolute',
    left: -spacing.lg - 7,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    borderWidth: 2,
    borderColor: colors.card,
  },
  nodeCard: {
    marginTop: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    padding: spacing.md,
  },
  italic: {
    fontStyle: 'italic',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberChip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
  },
  chartCard: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  chartWrap: {
    height: 260,
    flexDirection: 'row',
  },
  yAxis: {
    width: 72,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  yLabel: {
    fontSize: 10,
    lineHeight: 14,
  },
  plot: {
    flex: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: HAIRLINE,
    position: 'relative',
    overflow: 'hidden',
  },
  gridCol: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  gridLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    opacity: 0.7,
  },
  svg: {
    ...StyleSheet.absoluteFill,
    paddingVertical: spacing.md,
  },
  rxLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: RX,
    alignItems: 'center',
  },
  rxTag: {
    marginTop: 4,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: RX,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  consultDot: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: CHART,
    marginLeft: -4,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
  },
  legendDotSm: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  legendDash: {
    width: 16,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: RX,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: layout.buttonHeight + 24,
    justifyContent: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  card: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  followRow: {
    alignItems: 'center',
    gap: 0,
  },
  followItemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followConnector: {
    width: 32,
    height: 1,
    backgroundColor: HAIRLINE,
    marginHorizontal: spacing.xs,
  },
  followItem: {
    alignItems: 'center',
    minWidth: 80,
    gap: spacing.xs,
  },
  followChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  followImproved: {
    backgroundColor: SUCCESS_FILL,
  },
  followSame: {
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  disclaimerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkRow: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  outlineBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
});
