import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import {
  geocodePlaceQuery,
  parseCoordsFromMapLink,
  type MapCoords,
} from '../utilities/clinicMapCoords';
import { AppText } from './AppText';

type Props = {
  clinicName: string;
  clinicAddress: string;
  clinicMapLink: string | null;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const DELTA = 0.012;

/**
 * Non-interactive map preview for clinic appointment cards.
 * Resolves pin from map link coordinates, else geocodes name+address.
 */
export function ClinicMapPreview({
  clinicName,
  clinicAddress,
  clinicMapLink,
  onPress,
  style,
}: Props) {
  const fromLink = useMemo(
    () => parseCoordsFromMapLink(clinicMapLink),
    [clinicMapLink],
  );
  const [coords, setCoords] = useState<MapCoords | null>(fromLink);
  const [loading, setLoading] = useState(!fromLink);

  useEffect(() => {
    setCoords(fromLink);
    if (fromLink) {
      setLoading(false);
      return;
    }
    const query = [clinicName, clinicAddress].filter(Boolean).join(', ');
    if (!query) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void geocodePlaceQuery(query).then((resolved) => {
      if (cancelled) {
        return;
      }
      setCoords(resolved);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clinicAddress, clinicName, fromLink]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={clinicName || clinicAddress || 'Map'}
      onPress={onPress}
      style={[styles.box, style]}
    >
      {coords ? (
        <MapView
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          region={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: DELTA,
            longitudeDelta: DELTA,
          }}
        >
          <Marker
            coordinate={coords}
            title={clinicName || undefined}
            description={clinicAddress || undefined}
          />
        </MapView>
      ) : loading ? (
        <View style={styles.fallback}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.fallback}>
          <View style={styles.pin}>
            <Ionicons name="location" size={28} color={colors.primaryOutline} />
          </View>
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {clinicAddress || clinicName}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 160,
    borderRadius: radii.default,
    backgroundColor: colors.primaryContainer,
    overflow: 'hidden',
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryContainer,
  },
  pin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});
