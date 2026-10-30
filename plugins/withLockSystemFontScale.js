/**
 * Force Android configuration fontScale to 1 so system Settings → Font size
 * does not enlarge/shrink app text. Applied on create + configuration changes.
 *
 * Expo SDK 49+ generates MainActivity.kt — this plugin emits Kotlin or Java
 * based on `modResults.language`.
 *
 * iOS Dynamic Type is blocked in JS via allowFontScaling={false} on Text/TextInput.
 */
const { withMainActivity, createRunOncePlugin } = require('@expo/config-plugins');

const KT_IMPORT_CONFIGURATION = 'import android.content.res.Configuration';
const KT_IMPORT_RESOURCES = 'import android.content.res.Resources';
const JAVA_IMPORT_CONFIGURATION = 'import android.content.res.Configuration;';
const JAVA_IMPORT_RESOURCES = 'import android.content.res.Resources;';

const KT_HELPER_METHODS = `
  private fun applyLockedFontScale(config: Configuration) {
    if (config.fontScale != 1f) {
      config.fontScale = 1f
    }
  }

  override fun getResources(): Resources {
    val res = super.getResources()
    val config = Configuration(res.configuration)
    if (config.fontScale != 1f) {
      applyLockedFontScale(config)
      @Suppress("DEPRECATION")
      res.updateConfiguration(config, res.displayMetrics)
    }
    return res
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    applyLockedFontScale(newConfig)
    super.onConfigurationChanged(newConfig)
  }
`;

const JAVA_HELPER_METHODS = `
  private void applyLockedFontScale(Configuration config) {
    if (config.fontScale != 1f) {
      config.fontScale = 1f;
    }
  }

  @Override
  public Resources getResources() {
    Resources res = super.getResources();
    Configuration config = new Configuration(res.getConfiguration());
    if (config.fontScale != 1f) {
      applyLockedFontScale(config);
      res.updateConfiguration(config, res.getDisplayMetrics());
    }
    return res;
  }

  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    applyLockedFontScale(newConfig);
    super.onConfigurationChanged(newConfig);
  }
`;

function isKotlin(modResults) {
  const lang = modResults.language;
  if (lang === 'kt' || lang === 'kotlin') return true;
  if (lang === 'java') return false;
  // Fallback: path / contents heuristics for older config-plugins.
  const pathHint = String(modResults.path || modResults.filePath || '');
  if (pathHint.endsWith('.kt')) return true;
  if (pathHint.endsWith('.java')) return false;
  return /\bclass\s+MainActivity\s*:/.test(modResults.contents);
}

function ensureImports(src, isKt) {
  const configuration = isKt ? KT_IMPORT_CONFIGURATION : JAVA_IMPORT_CONFIGURATION;
  const resources = isKt ? KT_IMPORT_RESOURCES : JAVA_IMPORT_RESOURCES;

  if (!src.includes('android.content.res.Configuration')) {
    src = src.replace(
      /^(package .+)(\r?\n)/m,
      `$1$2${configuration}$2${resources}$2`,
    );
  } else if (!src.includes('android.content.res.Resources')) {
    src = src.replace(
      /(import android\.content\.res\.Configuration;?\r?\n)/,
      `$1${resources}\n`,
    );
  }
  return src;
}

function insertBeforeClassClose(src, block) {
  const lastBrace = src.lastIndexOf('}');
  if (lastBrace === -1) return src;
  return src.slice(0, lastBrace) + block + '\n' + src.slice(lastBrace);
}

function withLockSystemFontScale(config) {
  return withMainActivity(config, (cfg) => {
    const kt = isKotlin(cfg.modResults);
    let src = cfg.modResults.contents;

    src = ensureImports(src, kt);

    if (!src.includes('applyLockedFontScale')) {
      src = insertBeforeClassClose(src, kt ? KT_HELPER_METHODS : JAVA_HELPER_METHODS);
    }

    cfg.modResults.contents = src;
    return cfg;
  });
}

module.exports = createRunOncePlugin(
  withLockSystemFontScale,
  'withLockSystemFontScale',
  '1.1.0',
);
