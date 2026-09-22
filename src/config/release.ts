import Constants from 'expo-constants';

type Extra = {
  releaseNotes?: string;
};

function extra(): Extra {
  return (Constants.expoConfig?.extra ?? {}) as Extra;
}

/** User-facing milestone, e.g. 1.0.0. Bump this when the shared build covers new work. */
export function appVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

/** Native build that increments on each preview APK/IPA. */
export function appBuildNumber(): string {
  const native = Constants.nativeBuildVersion;
  if (native) {
    return String(native);
  }

  const iosBuild = Constants.expoConfig?.ios?.buildNumber;
  if (iosBuild) {
    return iosBuild;
  }

  const androidCode = Constants.expoConfig?.android?.versionCode;
  if (androidCode != null) {
    return String(androidCode);
  }

  return '1';
}

/** Short list of what this shared build includes. Update with version in app.json. */
export function appReleaseNotes(): string {
  return extra().releaseNotes ?? '';
}

export function appVersionLabel(brandName: string, byline: string): string {
  return `${brandName} v${appVersion()} (${appBuildNumber()}) • ${byline}`;
}
