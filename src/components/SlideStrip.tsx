import {
  Children,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

const DURATION_MS = 340;
const EASING = Easing.bezier(0.22, 1, 0.36, 1);

type SlideStripProps = {
  index: number;
  children: ReactNode;
};

export function SlideStrip({ index, children }: SlideStripProps) {
  const { width } = useWindowDimensions();
  const pages = Children.toArray(children);
  const translateX = useRef(new Animated.Value(-index * width)).current;
  const indexRef = useRef(index);
  const widthRef = useRef(width);

  useLayoutEffect(() => {
    const indexChanged = indexRef.current !== index;
    const widthChanged = widthRef.current !== width;
    indexRef.current = index;
    widthRef.current = width;

    const toValue = -index * width;

    if (!indexChanged) {
      translateX.setValue(toValue);
      return;
    }

    if (widthChanged) {
      translateX.setValue(toValue);
      return;
    }

    const animation = Animated.timing(translateX, {
      toValue,
      duration: DURATION_MS,
      easing: EASING,
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [index, width, translateX]);

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.track,
          {
            width: width * pages.length,
            transform: [{ translateX }],
          },
        ]}
      >
        {pages.map((page, pageIndex) => (
          <View
            key={pageIndex}
            pointerEvents={pageIndex === index ? 'auto' : 'none'}
            style={[styles.page, { width }]}
          >
            {page}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  track: {
    flex: 1,
    flexDirection: 'row',
  },
  page: {
    flex: 1,
  },
});
