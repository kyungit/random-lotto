const fs = require('fs');
const path = require('path');

const GOOGLE_MOBILE_ADS_ANDROID_TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const GOOGLE_MOBILE_ADS_IOS_TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

function loadEnvFile(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex < 0) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

module.exports = ({ config }) => {
  loadEnvFile('.env');
  loadEnvFile('.env.admob.backup');

  const isDevelopmentBuild = process.env.EAS_BUILD_PROFILE === 'development';
  const androidAppId = isDevelopmentBuild
    ? GOOGLE_MOBILE_ADS_ANDROID_TEST_APP_ID
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || GOOGLE_MOBILE_ADS_ANDROID_TEST_APP_ID;
  const iosAppId = isDevelopmentBuild
    ? GOOGLE_MOBILE_ADS_IOS_TEST_APP_ID
    : process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || GOOGLE_MOBILE_ADS_IOS_TEST_APP_ID;
  const plugins = [...(config.plugins || [])];

  const hasGoogleMobileAdsPlugin = plugins.some((plugin) =>
    Array.isArray(plugin)
      ? plugin[0] === 'react-native-google-mobile-ads'
      : plugin === 'react-native-google-mobile-ads'
  );

  if (!hasGoogleMobileAdsPlugin) {
    plugins.push([
      'react-native-google-mobile-ads',
      {
        androidAppId,
        ...(iosAppId ? { iosAppId } : {}),
      },
    ]);
  }

  return {
    ...config,
    plugins,
  };
};
