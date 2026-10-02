import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import {
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { KeyboardStableInsets } from './components/KeyboardStableInsets';
import { OfflineModeGate } from './components/OfflineModeGate';
import { LocalizationProvider } from './localization/i18n';
import { AppNavigator } from './navigation/AppNavigator';
import { configureForegroundNotificationHandler } from './services/notifications';
import {
  CrashErrorBoundary,
  initializeCrashReporting,
} from './services/crashReporting/crashReporting';
import { store } from './store';
import { colors } from './theme/colors';

configureForegroundNotificationHandler();
initializeCrashReporting();

const BOOT_COLOR = colors.page;

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_600SemiBold,
    NotoSansDevanagari_700Bold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(BOOT_COLOR).catch(() => undefined);
    if (Platform.OS === 'android') {
      RNStatusBar.setBarStyle('dark-content', true);
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor(BOOT_COLOR, true);
      NavigationBar.setStyle('dark');
    }
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider style={styles.root} initialMetrics={initialWindowMetrics}>
      <View style={styles.boot}>
        <RNStatusBar
          barStyle="dark-content"
          backgroundColor={BOOT_COLOR}
          translucent
        />
        <StatusBar style="dark" />
        {Platform.OS === 'android' ? <NavigationBar style="dark" /> : null}
        <KeyboardStableInsets>
          <LocalizationProvider>
            <OfflineModeGate>
              <CrashErrorBoundary>
                {fontsLoaded || fontError ? <AppNavigator /> : null}
              </CrashErrorBoundary>
            </OfflineModeGate>
          </LocalizationProvider>
        </KeyboardStableInsets>
      </View>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BOOT_COLOR,
  },
  boot: {
    flex: 1,
    backgroundColor: BOOT_COLOR,
  },
});
