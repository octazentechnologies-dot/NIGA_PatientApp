import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-sans-devanagari';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import {
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { KeyboardStableInsets } from './components/KeyboardStableInsets';
import { LocalizationProvider } from './localization/i18n';
import { AppNavigator } from './navigation/AppNavigator';
import { colors } from './theme/colors';

const STATUS_BAR_COLOR = colors.surfaceContainerLowest;

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SystemUI.setBackgroundColorAsync(STATUS_BAR_COLOR).catch(() => undefined);

function applyAndroidStatusBar() {
  if (Platform.OS !== 'android') {
    return;
  }
  RNStatusBar.setBarStyle('dark-content', true);
  RNStatusBar.setBackgroundColor(STATUS_BAR_COLOR, true);
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_600SemiBold,
  });

  useEffect(() => {
    applyAndroidStatusBar();
    SystemUI.setBackgroundColorAsync(STATUS_BAR_COLOR).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  return (
    <SafeAreaProvider style={styles.root}>
      <View style={styles.root}>
        <RNStatusBar
          barStyle="dark-content"
          backgroundColor={STATUS_BAR_COLOR}
        />
        <StatusBar style="dark" />
        <KeyboardStableInsets>
          <LocalizationProvider>
            {fontsLoaded || fontError ? <AppNavigator /> : null}
          </LocalizationProvider>
        </KeyboardStableInsets>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: STATUS_BAR_COLOR,
  },
});
