/**
 * Expo config plugin: UPI app query schemes for Razorpay Checkout.
 * Key Secret / Webhook Secret must never appear here.
 */
const {
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
} = require('expo/config-plugins');

const UPI_SCHEMES = [
  'tez',
  'phonepe',
  'paytmmp',
  'gpay',
  'bhim',
  'upi',
  'ppemerchantupi',
];

function withRazorpayIos(config) {
  return withInfoPlist(config, (cfg) => {
    const existing = cfg.modResults.LSApplicationQueriesSchemes ?? [];
    const merged = Array.from(new Set([...existing, ...UPI_SCHEMES]));
    cfg.modResults.LSApplicationQueriesSchemes = merged;
    return cfg;
  });
}

function withRazorpayAndroid(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (!manifest.queries) {
      manifest.queries = [];
    }
    const packages = [
      'com.google.android.apps.nbu.paisa.user',
      'com.phonepe.app',
      'net.one97.paytm',
      'in.org.npci.upiapp',
    ];
    for (const name of packages) {
      const already = manifest.queries.some(
        (q) => q.package?.some((p) => p.$?.['android:name'] === name),
      );
      if (!already) {
        manifest.queries.push({
          package: [{ $: { 'android:name': name } }],
        });
      }
    }
    AndroidConfig.Manifest.ensureToolsAvailable(cfg.modResults);
    return cfg;
  });
}

function withRazorpay(config) {
  config = withRazorpayIos(config);
  config = withRazorpayAndroid(config);
  return config;
}

module.exports = withRazorpay;
