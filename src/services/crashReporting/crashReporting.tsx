import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Platform, View } from 'react-native';

/**
 * Native Crashlytics only. The module is loaded lazily so Expo Go and
 * binaries built before this dependency still start normally.
 */
type CrashlyticsClient = {
  recordError: (error: Error, jsErrorName?: string) => void;
  log: (message: string) => void;
  crash: () => void;
  setAttribute: (name: string, value: string) => Promise<null>;
  setUserId: (userId: string) => Promise<null>;
  setCrashlyticsCollectionEnabled: (enabled: boolean) => Promise<null>;
};

const APP_TYPE = 'patient';

const SENSITIVE = /email|phone|name|address|dob|token|password|otp|jwt|aadhaar|pan|symptom|diagnos|prescription|payment|fcm/i;

let client: CrashlyticsClient | null | undefined;
let loadError: string | null = null;
let initialized = false;

function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function getClient(): CrashlyticsClient | null {
  if (client !== undefined) {
    return client;
  }
  if (isExpoGo()) {
    loadError = 'Running in Expo Go';
    client = null;
    return client;
  }
  try {
    const crashlytics =
      require('@react-native-firebase/crashlytics') as typeof import('@react-native-firebase/crashlytics');
    const instance = crashlytics.getCrashlytics();
    client = {
      recordError: (error, jsErrorName) =>
        crashlytics.recordError(instance, error, jsErrorName),
      log: (message) => crashlytics.log(instance, message),
      crash: () => crashlytics.crash(instance),
      setAttribute: (name, value) =>
        crashlytics.setAttribute(instance, name, value),
      setUserId: (userId) => crashlytics.setUserId(instance, userId),
      setCrashlyticsCollectionEnabled: (enabled) =>
        crashlytics.setCrashlyticsCollectionEnabled(instance, enabled),
    };
    loadError = null;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Crashlytics failed to load';
    client = null;
  }
  return client;
}

function safeValue(value: string): string {
  return value.replace(/\s+/g, ' ').slice(0, 80);
}

function safeKey(key: string): boolean {
  return /^[a-z0-9_]{1,32}$/.test(key) && !SENSITIVE.test(key);
}

export function crashlyticsTestEnabled(): boolean {
  return process.env.EXPO_PUBLIC_CRASHLYTICS_TEST === '1';
}

export function initializeCrashReporting(): void {
  if (initialized) {
    return;
  }
  initialized = true;
  const crashlytics = getClient();
  if (!crashlytics) {
    return;
  }

  const collect = !__DEV__ || crashlyticsTestEnabled();
  void crashlytics.setCrashlyticsCollectionEnabled(collect).catch(() => undefined);

  const attributes: Record<string, string> = {
    app_type: APP_TYPE,
    environment: __DEV__ ? 'development' : 'release',
    platform: Platform.OS,
    app_version: Constants.expoConfig?.version ?? 'unknown',
    build_version: String(Constants.nativeBuildVersion ?? 'unknown'),
  };
  Object.entries(attributes).forEach(([key, value]) => {
    void crashlytics.setAttribute(key, safeValue(value)).catch(() => undefined);
  });
  crashlytics.log('App initialized');

  const errorUtils = (
    globalThis as {
      ErrorUtils?: {
        getGlobalHandler: () => (error: unknown, isFatal?: boolean) => void;
        setGlobalHandler: (
          handler: (error: unknown, isFatal?: boolean) => void,
        ) => void;
      };
    }
  ).ErrorUtils;
  if (errorUtils?.getGlobalHandler && errorUtils.setGlobalHandler) {
    const previous = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      recordError(error, { source: isFatal ? 'js_fatal' : 'js_error' });
      previous?.(error, isFatal);
    });
  }
}

export function recordError(
  error: unknown,
  context?: Record<string, string>,
): void {
  const crashlytics = getClient();
  if (!crashlytics) {
    return;
  }
  const normalized =
    error instanceof Error ? error : new Error('Non-error exception');
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      if (!safeKey(key) || typeof value !== 'string' || SENSITIVE.test(value)) {
        return;
      }
      void crashlytics.setAttribute(key, safeValue(value)).catch(() => undefined);
    });
  }
  crashlytics.recordError(normalized);
}

export function logCrashBreadcrumb(message: string): void {
  const crashlytics = getClient();
  if (!crashlytics || SENSITIVE.test(message)) {
    return;
  }
  crashlytics.log(safeValue(message));
}

/** Opaque internal id only. Never pass email, phone, or a name. */
export function setCrashUserId(id: string): void {
  const crashlytics = getClient();
  if (!crashlytics || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    return;
  }
  void crashlytics.setUserId(id).catch(() => undefined);
}

export function clearCrashUser(): void {
  const crashlytics = getClient();
  if (!crashlytics) {
    return;
  }
  void crashlytics.setUserId('').catch(() => undefined);
}

async function enableCollection(): Promise<CrashlyticsClient | null> {
  const crashlytics = getClient();
  if (!crashlytics) {
    return null;
  }
  await crashlytics.setCrashlyticsCollectionEnabled(true);
  return crashlytics;
}

function toastCollectionResult(crashlytics: CrashlyticsClient | null): void {
  Alert.alert(
    'Crashlytics',
    crashlytics
      ? 'Collection enabled'
      : `Collection unavailable. ${loadError ?? 'Crashlytics is not loaded.'}`,
  );
}

export function recordTestNonFatal(): void {
  void enableCollection().then((crashlytics) => {
    toastCollectionResult(crashlytics);
    crashlytics?.recordError(new Error('Crashlytics non-fatal test'));
  });
}

export function triggerTestNativeCrash(): void {
  void enableCollection().then((crashlytics) => {
    toastCollectionResult(crashlytics);
    if (!crashlytics) {
      return;
    }
    setTimeout(() => crashlytics.crash(), 800);
  });
}

type BoundaryProps = { children: ReactNode };
type BoundaryState = { hasError: boolean };

/** Reports unexpected render failures. Successful renders are unchanged. */
export class CrashErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    recordError(error, { source: 'react_render' });
    if (info.componentStack) {
      logCrashBreadcrumb('react_render');
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <View style={{ flex: 1 }} />;
    }
    return this.props.children;
  }
}
