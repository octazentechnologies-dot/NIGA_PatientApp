const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const CRASH_METHOD = `  public void crash() {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      new Handler()
          .postDelayed(
              new Runnable() {
                @Override
                public void run() {
                  throw new RuntimeException("Crash Test");
                }
              },
              50);
    } else {
      Log.i(TAG, "crashlytics collection is not enabled, not crashing.");
    }
  }`;

const CRASH_METHOD_FIXED = `  public void crash() {
    FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
    new Handler(android.os.Looper.getMainLooper())
        .postDelayed(
            new Runnable() {
              @Override
              public void run() {
                throw new RuntimeException("Crash Test");
              }
            },
            50);
  }`;

const ENABLE_METHOD = `  public void setCrashlyticsCollectionEnabled(boolean enabled, Promise promise) {
    ReactNativeFirebasePreferences.getSharedInstance()
        .setBooleanValue(Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, enabled);
    promise.resolve(null);
  }`;

const ENABLE_METHOD_FIXED = `  public void setCrashlyticsCollectionEnabled(boolean enabled, Promise promise) {
    ReactNativeFirebasePreferences.getSharedInstance()
        .setBooleanValue(Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, enabled);
    FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(enabled);
    promise.resolve(null);
  }`;

/**
 * The stock Android Crashlytics module ignores crash() while collection is
 * off, and posts the test exception on a thread with no Looper. Force
 * collection on and throw on the main thread so a test crash is recorded.
 */
function withCrashlyticsMainThread(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const file = path.join(
        modConfig.modRequest.projectRoot,
        'node_modules/@react-native-firebase/crashlytics/android/src/main/java/io/invertase/firebase/crashlytics/NativeRNFBTurboCrashlytics.java',
      );
      if (!fs.existsSync(file)) {
        return modConfig;
      }
      let source = fs.readFileSync(file, 'utf8');
      if (source.includes(CRASH_METHOD)) {
        source = source.replace(CRASH_METHOD, CRASH_METHOD_FIXED);
      }
      if (source.includes(ENABLE_METHOD)) {
        source = source.replace(ENABLE_METHOD, ENABLE_METHOD_FIXED);
      }
      fs.writeFileSync(file, source);
      return modConfig;
    },
  ]);
}

module.exports = withCrashlyticsMainThread;
