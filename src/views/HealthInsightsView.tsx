import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { HealthInsightsViewModel } from '../controllers/useHealthInsightsController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const CHIP_FILL = '#E6F5FE';
const CHART = '#3AA9E0';
const ACTION = '#2A7BA3';
const OUTLINE_ACTION = '#276F93';
const RX = '#F2C14E';
const RX_LABEL = '#8A6508';
const RX_LEGEND = '#B2821E';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const SUCCESS_BORDER = '#D1EBE0';
const PAIN = '#E05252';
const GRID = '#F0F2F4';
const SAME_FILL = '#F2F2F2';

const ADHERENCE_COLORS = [
  HAIRLINE,
  CHIP_FILL,
  '#79C5EC',
  CHART,
  ACTION,
] as const;

const WEEKDAYS: Parameters<HealthInsightsViewModel['t']>[0][] = [
  'insightsDayM',
  'insightsDayT',
  'insightsDayW',
  'insightsDayT2',
  'insightsDayF',
  'insightsDayS',
  'insightsDayS2',
];

export function HealthInsightsView(vm: HealthInsightsViewModel) {
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
            <Ionicons name="arrow-back" size={22} color={INK} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={INK}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('insightsTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenMemberPicker}
            style={styles.memberChip}
          >
            <AppText variant="labelSm" color={INK} weightOverride="600">
              {vm.memberLabel}
            </AppText>
            <Ionicons name="chevron-down" size={16} color={MUTED} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('insightsShare')}
            onPress={vm.onShareHeader}
            style={styles.iconHit}
          >
            <Ionicons name="share-outline" size={22} color={INK} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('insightsDownloadPdf')}
            onPress={vm.onDownloadHeader}
            style={styles.iconHit}
          >
            <Ionicons name="download-outline" size={22} color={INK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 32 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rangeRow}
        >
          {vm.ranges.map((range) => {
            const on = range.id === vm.range;
            return (
              <Pressable
                key={range.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => vm.onSelectRange(range.id)}
                style={[styles.rangeChip, on && styles.rangeChipOn]}
              >
                <AppText
                  variant="labelSm"
                  color={on ? INK : MUTED}
                  weightOverride={on ? '600' : '500'}
                >
                  {vm.t(range.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          <AppText variant="bodyLg" color={INK} style={styles.summaryLine}>
            {vm
              .t('insightsSummaryLead')
              .replace('{name}', vm.memberLabel)}
            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm.t('insightsSeverityModerate')}
              {vm.t('insightsSummaryTo')}
              {vm.t('insightsSeverityMild')}
            </AppText>
            {vm.t('insightsSummaryLogged')}
            <AppText variant="bodyLg" color={INK} weightOverride="600">
              {vm
                .t('insightsSummaryDays')
                .replace('{logged}', String(vm.daysLogged))
                .replace('{total}', String(vm.daysTotal))}
            </AppText>
            {vm.t('insightsSummaryEnd')}
          </AppText>
          <AppText variant="labelSm" color={MUTED} style={styles.italic}>
            {vm.t('insightsSummaryDisclaimer')}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.chartHead}>
            <AppText variant="titleMd" color={INK} style={styles.flex}>
              {vm.t('insightsSymptomSeverity')}
            </AppText>
            <View style={styles.legendInline}>
              <View style={styles.legendItem}>
                <Ionicons name="medkit" size={14} color={RX} />
                <AppText variant="labelSm" color={RX_LEGEND}>
                  {vm.t('insightsLegendRx')}
                </AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: ACTION }]} />
                <AppText variant="labelSm" color={ACTION}>
                  {vm.t('insightsLegendConsults')}
                </AppText>
              </View>
            </View>
          </View>

          <SeverityChart t={vm.t} />
          <AppText variant="labelSm" color={MUTED} style={styles.right}>
            {vm
              .t('insightsChartCaption')
              .replace('{count}', String(vm.daysLogged))}
          </AppText>
        </View>

        <View style={styles.statsGrid}>
          <MetricTile
            label={vm.t('insightsAvgSeverity')}
            value={vm.avgSeverity}
            trend="down"
            spark="down"
          />
          <MetricTile
            label={vm.t('insightsSleepQuality')}
            value={vm.sleepQuality}
            trend="up"
            spark="up"
          />
          <View style={styles.statCard}>
            <AppText variant="labelSm" color={MUTED}>
              {vm.t('insightsDaysLogged')}
            </AppText>
            <View style={styles.statValueRow}>
              <AppText variant="titleMd" color={INK}>
                {vm.daysLogged}
                <AppText variant="bodyMd" color={MUTED}>
                  /{vm.daysTotal}
                </AppText>
              </AppText>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round(
                        (vm.daysLogged / vm.daysTotal) * 100,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <MetricTile
            label={vm.t('insightsPainActive')}
            value={`${vm.painFrom} → ${vm.painTo}`}
            trend="down"
            spark="step"
          />
        </View>

        <View style={styles.card}>
          <AppText variant="titleMd" color={INK}>
            {vm.t('insightsCorrelation')}
          </AppText>
          <View style={styles.corrRow}>
            <MiniChart
              label={vm.t('insightsCorrSeverity')}
              path="M 0,30 Q 50,40 100,70"
              stroke={ACTION}
              borderRight
            />
            <MiniChart
              label={vm.t('insightsCorrSleep')}
              path="M 0,70 Q 50,60 100,20"
              stroke={CHART}
              borderRight
            />
            <MiniChart
              label={vm.t('insightsCorrAppetite')}
              path="M 0,60 Q 50,55 100,30"
              stroke={RX}
            />
          </View>
          <AppText variant="labelSm" color={MUTED} style={styles.italic}>
            {vm.t('insightsCorrelationNote')}
          </AppText>
        </View>

        <View style={styles.pairRow}>
          <View style={[styles.card, styles.pairCard]}>
            <AppText variant="titleMd" color={INK}>
              {vm.t('insightsActivePain')}
            </AppText>
            <View style={styles.bodyMap}>
              <Ionicons name="body-outline" size={64} color={HAIRLINE} />
              <View style={[styles.painDot, styles.painDotTop]} />
              <View style={[styles.painDot, styles.painDotBottom]} />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onViewPainPoints}
              style={styles.linkBtn}
            >
              <AppText variant="labelSm" color={ACTION} weightOverride="600">
                {vm.t('insightsViewPain')}
              </AppText>
              <Ionicons name="chevron-forward" size={18} color={ACTION} />
            </Pressable>
          </View>

          <View style={[styles.card, styles.pairCard]}>
            <AppText variant="titleMd" color={INK}>
              {vm.t('insightsAdherence')}
            </AppText>
            <View style={styles.heatGrid}>
              {WEEKDAYS.map((key) => (
                <AppText
                  key={key}
                  variant="labelSm"
                  color={MUTED}
                  style={styles.heatLabel}
                >
                  {vm.t(key)}
                </AppText>
              ))}
              {vm.adherence.map((level, index) => (
                <View
                  key={`cell-${index}`}
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor:
                        ADHERENCE_COLORS[
                          Math.min(
                            Math.max(level, 0),
                            ADHERENCE_COLORS.length - 1,
                          )
                        ],
                    },
                  ]}
                />
              ))}
            </View>
            <AppText variant="labelSm" color={MUTED} style={styles.center}>
              {vm.t('insightsLoggedByYou')}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="titleMd" color={INK}>
            {vm.t('insightsFollowUpStatus')}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.followRow}
          >
            {vm.followUps.map((item, index) => (
              <View key={`${item.dateKey}-${index}`} style={styles.followItemWrap}>
                {index > 0 ? <View style={styles.followConnector} /> : null}
                <View style={styles.followItem}>
                  <View
                    style={[
                      styles.followChip,
                      item.tone === 'improved'
                        ? styles.followImproved
                        : styles.followSame,
                    ]}
                  >
                    <AppText
                      variant="labelSm"
                      color={item.tone === 'improved' ? SUCCESS : MUTED}
                      weightOverride="600"
                    >
                      {vm.t(item.labelKey)}
                    </AppText>
                  </View>
                  <AppText variant="labelSm" color={MUTED}>
                    {vm.t(item.dateKey)}
                  </AppText>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <View style={styles.disclaimerHead}>
            <Ionicons name="information-circle-outline" size={20} color={MUTED} />
            <View style={styles.flex}>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.t('insightsDisclaimerTitle')}
              </AppText>
              <AppText variant="bodyMd" color={MUTED} style={styles.disclaimerBody}>
                {vm.t('insightsDisclaimerBody')}
              </AppText>
            </View>
          </View>
        </View>

        <AppButton
          label={vm
            .t('insightsShareDoctor')
            .replace('{name}', vm.doctorShareName)}
          onPress={vm.onShareWithDoctor}
          icon={
            <Ionicons name="send-outline" size={18} color={colors.onButton} />
          }
        />
        <Pressable
          accessibilityRole="button"
          onPress={vm.onDownloadPdf}
          style={styles.outlineBtn}
        >
          <Ionicons name="document-text-outline" size={18} color={OUTLINE_ACTION} />
          <AppText variant="labelLg" color={OUTLINE_ACTION} weightOverride="600">
            {vm.t('insightsDownloadPdf')}
          </AppText>
        </Pressable>
        <AppText variant="labelSm" color={MUTED} style={styles.center}>
          {vm.t('insightsShareCaption')}
        </AppText>
      </ScrollView>

      <MemberPickerSheet vm={vm} />
    </View>
  );
}

function MetricTile({
  label,
  value,
  trend,
  spark,
}: {
  label: string;
  value: string;
  trend: 'up' | 'down';
  spark: 'up' | 'down' | 'step';
}) {
  const path =
    spark === 'up'
      ? 'M0,20 L10,18 L20,10 L30,8 L40,4'
      : spark === 'down'
        ? 'M0,4 L10,8 L20,12 L30,18 L40,20'
        : 'M0,10 L20,10 L20,20 L40,20';

  return (
    <View style={styles.statCard}>
      <AppText variant="labelSm" color={MUTED}>
        {label}
      </AppText>
      <View style={styles.statValueRow}>
        <View style={styles.statValueGroup}>
          <AppText variant="titleMd" color={INK}>
            {value}
          </AppText>
          <AppText variant="labelSm" color={ACTION}>
            {trend === 'down' ? '↓' : '↑'}
          </AppText>
        </View>
        <Svg width={40} height={24} viewBox="0 0 40 24">
          <Path d={path} fill="none" stroke={CHART} strokeWidth={1.75} />
        </Svg>
      </View>
    </View>
  );
}

function MiniChart({
  label,
  path,
  stroke,
  borderRight,
}: {
  label: string;
  path: string;
  stroke: string;
  borderRight?: boolean;
}) {
  return (
    <View style={[styles.miniCol, borderRight && styles.miniBorder]}>
      <AppText variant="labelSm" color={MUTED} style={styles.center} numberOfLines={1}>
        {label}
      </AppText>
      <View style={styles.miniPlot}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </Svg>
      </View>
    </View>
  );
}

function SeverityChart({ t }: { t: HealthInsightsViewModel['t'] }) {
  const labels: Parameters<HealthInsightsViewModel['t']>[0][] = [
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
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.gridLine} />
          ))}
          <View />
        </View>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={styles.svg}
        >
          <Path
            d="M 0,50 Q 20,40 40,60 T 80,75 L 100,80"
            fill="none"
            stroke={CHART}
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
          />
          <Circle cx={0} cy={50} r={2} fill={ACTION} />
          <Circle cx={20} cy={40} r={2} fill={ACTION} />
          <Circle cx={40} cy={60} r={2} fill={ACTION} />
          <Circle cx={60} cy={65} r={2} fill={ACTION} />
          <Circle cx={80} cy={75} r={2} fill={ACTION} />
          <Circle
            cx={100}
            cy={80}
            r={3.5}
            fill={colors.card}
            stroke={ACTION}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </Svg>
        <View style={[styles.rxLine, { left: '30%' }]}>
          <View style={styles.rxTag}>
            <Ionicons name="medkit" size={10} color={RX} />
            <AppText variant="labelSm" color={RX_LABEL} weightOverride="600">
              Rx v1
            </AppText>
          </View>
        </View>
        <View style={[styles.rxLine, { left: '70%' }]}>
          <View style={styles.rxTag}>
            <Ionicons name="medkit" size={10} color={RX} />
            <AppText variant="labelSm" color={RX_LABEL} weightOverride="600">
              Rx v2
            </AppText>
          </View>
        </View>
        <View style={[styles.consultDot, { left: '10%' }]} />
        <View style={[styles.consultDot, { left: '45%' }]} />
        <View style={[styles.consultDot, { left: '85%' }]} />
        <View style={styles.xAxis}>
          <AppText variant="labelSm" color={MUTED} style={styles.xLabel}>
            {t('insightsAxisOct')}
          </AppText>
          <AppText variant="labelSm" color={MUTED} style={styles.xLabel}>
            {t('insightsAxisNov')}
          </AppText>
          <AppText variant="labelSm" color={MUTED} style={styles.xLabel}>
            {t('insightsAxisDec')}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function MemberPickerSheet({ vm }: { vm: HealthInsightsViewModel }) {
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
            {vm.t('insightsShowingFor')}
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
                  {member.label}
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
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  headerTitle: {
    flexShrink: 1,
    marginRight: spacing.xs,
      textAlign: 'left',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberChip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    marginRight: 2,
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
    borderWidth: 1.5,
    borderColor: CHART,
  },
  card: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryLine: {
    lineHeight: 24,
  },
  italic: {
    fontStyle: 'italic',
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  legendInline: {
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  flex: {
    flex: 1,
  },
  right: {
    textAlign: 'right',
  },
  center: {
    textAlign: 'center',
  },
  chartWrap: {
    height: 280,
    flexDirection: 'row',
  },
  yAxis: {
    width: 72,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingVertical: spacing.sm,
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
    marginBottom: 24,
  },
  gridCol: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  gridLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GRID,
  },
  svg: {
    ...StyleSheet.absoluteFill,
    marginBottom: 0,
  },
  rxLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: RX,
  },
  rxTag: {
    position: 'absolute',
    top: -2,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: RX,
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
    backgroundColor: ACTION,
    marginLeft: -4,
  },
  xAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    fontSize: 10,
    lineHeight: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
    minHeight: 88,
    justifyContent: 'space-between',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  statValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  progressTrack: {
    width: 40,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: ACTION,
  },
  corrRow: {
    flexDirection: 'row',
    height: 128,
    gap: 0,
  },
  miniCol: {
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: 4,
  },
  miniBorder: {
    borderRightWidth: 1,
    borderRightColor: HAIRLINE,
  },
  miniPlot: {
    flex: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: HAIRLINE,
    position: 'relative',
  },
  pairRow: {
    gap: spacing.sm,
  },
  pairCard: {
    minHeight: 180,
  },
  bodyMap: {
    height: 96,
    borderRadius: radii.sm,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  painDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: PAIN,
  },
  painDotTop: {
    top: 16,
    right: '33%',
  },
  painDotBottom: {
    bottom: 24,
    left: '33%',
  },
  linkBtn: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  heatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 196,
    alignSelf: 'center',
    gap: 4,
  },
  heatLabel: {
    width: 24,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 14,
  },
  heatCell: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  followRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  followItemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followConnector: {
    width: 28,
    height: 2,
    backgroundColor: HAIRLINE,
    marginHorizontal: 2,
  },
  followItem: {
    alignItems: 'center',
    minWidth: 72,
    gap: spacing.xs,
  },
  followChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  followImproved: {
    backgroundColor: SUCCESS_FILL,
    borderColor: SUCCESS_BORDER,
  },
  followSame: {
    backgroundColor: SAME_FILL,
    borderColor: HAIRLINE,
  },
  disclaimerHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  disclaimerBody: {
    marginTop: spacing.xs,
  },
  outlineBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: OUTLINE_ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 31, 31, 0.4)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    marginBottom: spacing.sm,
  },
  sheetRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
