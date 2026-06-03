const ANDROID_TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const IOS_TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

module.exports = {
  expo: {
    name: '로또 번호 추첨기',
    slug: 'random-lotto',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: '로또 QR코드를 스캔하기 위해 카메라 사용이 필요합니다.',
          recordAudioAndroid: false,
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || ANDROID_TEST_APP_ID,
          iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || IOS_TEST_APP_ID,
        },
      ],
    ],
    ios: {
      bundleIdentifier: 'com.randomlotto.app',
      supportsTablet: true,
    },
    android: {
      package: 'com.randomlotto.app',
    },
    web: {
      bundler: 'metro',
    },
  },
};
