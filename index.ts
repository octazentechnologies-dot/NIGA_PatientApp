import { registerRootComponent } from 'expo';
import * as SystemUI from 'expo-system-ui';

import App from './src/App';

SystemUI.setBackgroundColorAsync('#ffffff').catch(() => undefined);

registerRootComponent(App);
