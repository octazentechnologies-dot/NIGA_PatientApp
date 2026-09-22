import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

/**
 * Android status-bar canvas color for the active screen.
 * ColorOS / many OEMs still honor setBackgroundColor even under edge-to-edge;
 * without it the bar often stays opaque black. translucent=true lets header
 * paint (#FFFFFF / #F5F6F7) show through consistently.
 */
export function useAndroidStatusBarBackground(backgroundColor: string) {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => undefined);

    if (Platform.OS !== 'android') {
      return;
    }

    StatusBar.setBarStyle('dark-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor(backgroundColor, true);
    NavigationBar.setStyle('dark');
  }, [backgroundColor]);
}
