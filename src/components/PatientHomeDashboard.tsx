import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import type {
  DashboardCardId,
  PatientDashboardModel,
  VisitStatusKey,
} from '../utilities/patientDashboard';
import { AppText } from './AppText';

const CARD_LABEL: Record<DashboardCardId, TranslationKey> = {
  today: 'dashToday',
  upcoming: 'dashUpcoming',
  payments: 'dashPendingPayments',
  prescriptions: 'dashPrescriptions',
  medicines: 'dashMedicineOrders',
};

const CARD_ICON: Record<
  DashboardCardId,
  keyof typeof Ionicons.glyphMap
> = {
  today: 'calendar-outline',
  upcoming: 'calendar-number-outline',
  payments: 'cash-outline',
  prescriptions: 'document-text-outline',
  medicines: 'medkit-outline',
};

const STATUS_LABEL: Record<VisitStatusKey, TranslationKey> = {
  waiting: 'dashStatusWaiting',
  walkIn: 'dashStatusWalkIn',
  notArrived: 'dashStatusNotArrived',
  tele: 'dashStatusTele',
  remaining: 'dashStatusRemaining',
  completed: 'dashStatusCompleted',
  cancelled: 'dashStatusCancelled',
  other: 'dashStatusOther',
};

const CHART_FILLS = [
  colors.primary,
  colors.success,
  colors.tertiary,
  colors.error,
  colors.secondary,
  colors.muted,
] as const;

type DashboardProps = {
  model: PatientDashboardModel | null;
  isLoading: boolean;
  t: (key: TranslationKey) => string;
  onOpenCard: (id: DashboardCardId) => void;
};

export function PatientHomeDashboard({
  model,
  isLoading,
  t,
  onOpenCard,
}: DashboardProps) {
  const cards = model?.cards ?? PLACEHOLDER_CARDS;
  const showVisitError = Boolean(model?.visitsFailed);
  const showPayError = Boolean(model?.paymentsFailed);
  const reveal = useChartReveal(
    model
      ? `${model.visitTotal}:${model.visitMonths.map((month) => month.visits).join(',')}:${model.paymentMonths.map((month) => month.paid + month.pending).join(',')}`
      : '',
  );

  return (
    <View style={styles.section}>
      <View style={styles.cardGrid}>
        {cards.map((card) => (
          <View key={card.id} style={styles.metricSlot}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenCard(card.id)}
            style={styles.metricCard}
          >
            <AppText variant="labelSm" color={colors.muted} weightOverride="600">
              {t(CARD_LABEL[card.id])}
            </AppText>
            <View style={styles.metricBottom}>
              <View style={styles.flex}>
                <AppText variant="headlineMd" color={colors.ink} raw>
                  {card.value == null ? '—' : String(card.value)}
                </AppText>
                <View style={styles.viewAll}>
                  <AppText variant="labelSm" color={colors.primaryOutline} weightOverride="600">
                    {t('dashViewAll')}
                  </AppText>
                  <Ionicons name="chevron-forward" size={14} color={colors.primaryOutline} />
                </View>
              </View>
              <View style={styles.metricIcon}>
                <Ionicons name={CARD_ICON[card.id]} size={20} color={colors.primary} />
              </View>
            </View>
          </Pressable>
          </View>
        ))}
      </View>

      {isLoading && !model ? (
        <AppText variant="bodyMd" color={colors.muted}>
          {t('dashLoading')}
        </AppText>
      ) : null}

      <View style={styles.chartPair}>
        <View style={[styles.chartCard, styles.chartHalf]}>
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {t('dashVisitStatus')}
          </AppText>
          {showVisitError ? (
            <AppText variant="bodyMd" color={colors.error}>
              {t('dashLoadFailed')}
            </AppText>
          ) : model && model.visitTotal > 0 ? (
            <VisitStatusChart model={model} t={t} progress={reveal} />
          ) : model ? (
            <AppText variant="bodyMd" color={colors.muted}>
              {t('dashNoVisits')}
            </AppText>
          ) : null}
        </View>

        <View style={[styles.chartCard, styles.chartHalf]}>
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {t('dashVisitsTrend')}
          </AppText>
          <View style={styles.legend}>
            <LegendSwatch color={colors.primary} label={t('dashAllVisits')} />
            <LegendSwatch color={colors.success} label={t('dashTele')} />
          </View>
          {showVisitError ? (
            <AppText variant="bodyMd" color={colors.error}>
              {t('dashLoadFailed')}
            </AppText>
          ) : model && model.visitMonths.some((month) => month.visits > 0) ? (
            <VisitBars months={model.visitMonths} progress={reveal} />
          ) : model ? (
            <AppText variant="bodyMd" color={colors.muted}>
              {t('dashNoVisitHistory')}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.chartCard}>
        <AppText variant="titleMd" color={colors.ink}>
          {t('dashPaymentsTrend')}
        </AppText>
        <View style={styles.legend}>
          <LegendSwatch color={colors.success} label={t('dashPaid')} />
          <LegendSwatch color={colors.tertiary} label={t('dashPending')} />
        </View>
        {showPayError ? (
          <AppText variant="bodyMd" color={colors.error}>
            {t('dashLoadFailed')}
          </AppText>
        ) : model &&
          model.paymentMonths.some((month) => month.paid > 0 || month.pending > 0) ? (
          <PaymentLines months={model.paymentMonths} progress={reveal} />
        ) : model ? (
          <AppText variant="bodyMd" color={colors.muted}>
            {t('dashNoPayments')}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const PLACEHOLDER_CARDS: PatientDashboardModel['cards'] = [
  { id: 'today', value: null },
  { id: 'upcoming', value: null },
  { id: 'payments', value: null },
  { id: 'prescriptions', value: null },
  { id: 'medicines', value: null },
];

function VisitStatusChart({
  model,
  t,
  progress,
}: {
  model: PatientDashboardModel;
  t: (key: TranslationKey) => string;
  progress: number;
}) {
  const size = 108;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.statusColumn}>
      <View style={styles.donutWrap}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.outlineVariant}
            strokeWidth={stroke}
            fill="none"
          />
          {model.visitStatus.map((slice, index) => {
            const length = (slice.count / model.visitTotal) * circumference * progress;
            const dashOffset = -offset;
            offset += (slice.count / model.visitTotal) * circumference * progress;
            return (
              <Circle
                key={slice.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={CHART_FILLS[index % CHART_FILLS.length]}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={dashOffset}
                rotation={-90}
                originX={size / 2}
                originY={size / 2}
              />
            );
          })}
        </Svg>
        <View style={styles.donutCenter} pointerEvents="none">
          <AppText variant="titleMd" color={colors.ink} raw>
            {String(model.visitTotal)}
          </AppText>
          <AppText variant="labelSm" color={colors.muted}>
            {t('dashTotal')}
          </AppText>
        </View>
      </View>
      <View style={styles.statusLegend}>
        {model.visitStatus.map((slice, index) => (
          <LegendSwatch
            key={slice.key}
            color={CHART_FILLS[index % CHART_FILLS.length] ?? colors.primary}
            label={`${t(STATUS_LABEL[slice.key])} ${slice.count}`}
          />
        ))}
      </View>
    </View>
  );
}

function VisitBars({
  months,
  progress,
}: {
  months: PatientDashboardModel['visitMonths'];
  progress: number;
}) {
  const max = Math.max(...months.map((month) => month.visits), 1);
  return (
    <View style={styles.barRow}>
      {months.map((month) => (
        <View key={month.label} style={styles.barCol}>
          <View style={styles.barPair}>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight(month.visits, max, progress),
                  backgroundColor: colors.primary,
                },
              ]}
            />
            <View
              style={[
                styles.bar,
                {
                  height: barHeight(month.tele, max, progress),
                  backgroundColor: colors.success,
                },
              ]}
            />
          </View>
          <AppText
            variant="labelSm"
            color={colors.muted}
            style={styles.barLabel}
            numberOfLines={2}
            raw
          >
            {month.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function PaymentLines({
  months,
  progress,
}: {
  months: PatientDashboardModel['paymentMonths'];
  progress: number;
}) {
  const [width, setWidth] = useState(0);
  const height = 120;
  const max = Math.max(
    ...months.flatMap((month) => [month.paid, month.pending]),
    1,
  );
  const ticks = yAxisTicks(max);
  const paidPoints = chartPoints(
    months.map((month) => month.paid * progress),
    width,
    height,
    max,
  );
  const pendingPoints = chartPoints(
    months.map((month) => month.pending * progress),
    width,
    height,
    max,
  );

  return (
    <View>
      <View style={styles.linePlotRow}>
        <View style={[styles.yAxis, { height }]}>
          {ticks.map((tick) => (
            <AppText key={`y-${tick}`} variant="labelSm" color={colors.muted} raw>
              {formatAxis(tick)}
            </AppText>
          ))}
        </View>
        <View
          style={styles.lineBox}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
          {width > 0 ? (
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.success} stopOpacity={0.35} />
                  <Stop offset="100%" stopColor={colors.success} stopOpacity={0.05} />
                </LinearGradient>
                <LinearGradient id="pendingFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.tertiary} stopOpacity={0.35} />
                  <Stop offset="100%" stopColor={colors.tertiary} stopOpacity={0.05} />
                </LinearGradient>
              </Defs>
              {ticks.map((tick) => {
                const y = height - (tick / max) * (height - 12) - 6;
                return (
                  <Line
                    key={`grid-${tick}`}
                    x1={0}
                    y1={y}
                    x2={width}
                    y2={y}
                    stroke={colors.outlineVariant}
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                );
              })}
              <Path d={areaPath(paidPoints, height)} fill="url(#paidFill)" />
              <Path d={areaPath(pendingPoints, height)} fill="url(#pendingFill)" />
              <Path
                d={smoothLinePath(paidPoints)}
                fill="none"
                stroke={colors.success}
                strokeWidth={2}
              />
              <Path
                d={smoothLinePath(pendingPoints)}
                fill="none"
                stroke={colors.tertiary}
                strokeWidth={2}
              />
            </Svg>
          ) : null}
        </View>
      </View>
      <View style={styles.monthRow}>
        <View style={styles.yAxisSpacer} />
        <View style={styles.monthLabels}>
          {months.map((month) => (
            <View key={month.label} style={styles.monthCol}>
              <AppText
                variant="labelSm"
                color={colors.muted}
                style={styles.barLabel}
                numberOfLines={1}
                raw
              >
                {month.label}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <AppText variant="labelSm" color={colors.ink} raw>
        {label}
      </AppText>
    </View>
  );
}

function useChartReveal(token: string): number {
  const [progress, setProgress] = useState(token ? 0 : 1);

  useEffect(() => {
    if (!token) return;
    let frame = 0;
    const start = Date.now();
    const duration = 800;
    const step = () => {
      const elapsed = Math.min(1, (Date.now() - start) / duration);
      setProgress(1 - (1 - elapsed) ** 3);
      if (elapsed < 1) frame = requestAnimationFrame(step);
    };
    setProgress(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [token]);

  return progress;
}

function barHeight(value: number, max: number, progress: number): number {
  if (value <= 0) return 2;
  return Math.max(2, Math.round((value / max) * 72 * progress));
}

type ChartPoint = { x: number; y: number };

function chartPoints(
  values: number[],
  width: number,
  height: number,
  max: number,
): ChartPoint[] {
  if (values.length === 0 || width <= 0) return [];
  const slot = width / values.length;
  return values.map((value, index) => ({
    // Centre of each month column so labels sit under the points.
    x: slot * index + slot / 2,
    y: height - (value / max) * (height - 12) - 6,
  }));
}

/** Cubic-bezier path through the points (same smooth feel as the web area chart). */
function smoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const only = points[0];
    return only ? `M ${only.x} ${only.y}` : '';
  }
  const first = points[0];
  if (!first) return '';
  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    if (!p0 || !p1 || !p2 || !p3) continue;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function areaPath(points: ChartPoint[], height: number): string {
  const line = smoothLinePath(points);
  if (!line || points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return '';
  return `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;
}

function yAxisTicks(max: number): number[] {
  const top = Math.max(1, Math.ceil(max));
  if (top <= 2) return [top, 1, 0].filter((value, index, all) => all.indexOf(value) === index);
  const mid = Math.round(top / 2);
  return [top, mid, 0];
}

function formatAxis(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    const digits = thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
    return `₹${digits}k`;
  }
  return `₹${Math.round(value)}`;
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  metricSlot: {
    width: '50%',
    padding: 4,
  },
  metricCard: {
    flex: 1,
    minHeight: 112,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  metricBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chartPair: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  chartHalf: {
    flex: 1,
    minWidth: 0,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  statusColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  donutWrap: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  statusLegend: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 24,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barPair: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 6,
    borderRadius: radii.sm,
  },
  barLabel: {
    textAlign: 'center',
  },
  linePlotRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs,
  },
  yAxis: {
    width: 36,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yAxisSpacer: {
    width: 36,
    marginRight: spacing.xs,
  },
  lineBox: {
    flex: 1,
    height: 120,
  },
  monthRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  monthLabels: {
    flex: 1,
    flexDirection: 'row',
  },
  monthCol: {
    flex: 1,
    alignItems: 'center',
  },
});
