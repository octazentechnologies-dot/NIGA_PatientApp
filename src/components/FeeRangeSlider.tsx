import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { FEE_RANGE_MAX, FEE_RANGE_MIN } from '../models/search';

const STEP = 50;
const THUMB = 20;

function clampFee(value: number) {
  const rounded = Math.round(value / STEP) * STEP;
  return Math.min(FEE_RANGE_MAX, Math.max(FEE_RANGE_MIN, rounded));
}

type FeeRangeSliderProps = {
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
};

export function FeeRangeSlider({ low, high, onChange }: FeeRangeSliderProps) {
  const [width, setWidth] = useState(0);
  const lowRef = useRef(low);
  const highRef = useRef(high);
  const startRef = useRef(0);

  useEffect(() => {
    lowRef.current = low;
    highRef.current = high;
  }, [low, high]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const toX = (value: number) =>
    width === 0
      ? 0
      : ((value - FEE_RANGE_MIN) / (FEE_RANGE_MAX - FEE_RANGE_MIN)) * width;

  const toValue = (x: number) =>
    clampFee(
      FEE_RANGE_MIN +
        (Math.min(width, Math.max(0, x)) / Math.max(width, 1)) *
          (FEE_RANGE_MAX - FEE_RANGE_MIN),
    );

  const lowPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = lowRef.current;
        },
        onPanResponderMove: (_, gesture) => {
          const next = toValue(toX(startRef.current) + gesture.dx);
          onChangeRef.current(
            Math.min(next, highRef.current - STEP),
            highRef.current,
          );
        },
      }),
    [width],
  );

  const highPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = highRef.current;
        },
        onPanResponderMove: (_, gesture) => {
          const next = toValue(toX(startRef.current) + gesture.dx);
          onChangeRef.current(
            lowRef.current,
            Math.max(next, lowRef.current + STEP),
          );
        },
      }),
    [width],
  );

  const lowX = toX(low);
  const highX = toX(high);

  return (
    <View
      style={styles.trackWrap}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.track} />
      {width > 0 ? (
        <View
          style={[
            styles.fill,
            { left: lowX, width: Math.max(highX - lowX, 0) },
          ]}
        />
      ) : null}
      <View
        {...lowPan.panHandlers}
        style={[styles.thumb, { left: Math.max(lowX - THUMB / 2, 0) }]}
      />
      <View
        {...highPan.panHandlers}
        style={[styles.thumb, { left: Math.max(highX - THUMB / 2, 0) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  trackWrap: {
    height: 28,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: radii.full,
    backgroundColor: '#E6E6E6',
  },
  fill: {
    position: 'absolute',
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    top: 4,
  },
});
