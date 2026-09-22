import { registerRootComponent } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

import App from './src/App';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
// setOptions is unsupported in Expo Go — only apply in a native/dev build.
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  SplashScreen.setOptions({ duration: 280, fade: true });
}
SystemUI.setBackgroundColorAsync('#F5F6F7').catch(() => undefined);

registerRootComponent(App);
