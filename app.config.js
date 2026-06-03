const fs = require('fs');
const path = require('path');

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

  const enableAds = process.env.EXPO_PUBLIC_ENABLE_ADS === 'true';
  const androidAppId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || '';
  const iosAppId = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || GOOGLE_MOBILE_ADS_IOS_TEST_APP_ID;
  const plugins = [...(config.plugins || [])];

  if (enableAds && androidAppId) {
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
