# 로또 번호 추첨기

Android와 iOS에서 사용할 수 있는 Expo 기반 React Native 로또 앱입니다. 랜덤 번호 추첨, 역대 당첨번호 조회, 누적 최다 당첨번호 TOP 6, 로또 QR 당첨 확인 기능을 제공합니다.

## 주요 기능

- 1부터 45까지 중복 없는 로또 번호 6개 랜덤 추첨
- 회차별 역대 당첨번호와 보너스 번호 조회
- 전체 회차 기준 누적 최다 당첨번호 TOP 6 표시
- 로또 QR코드 스캔 후 회차와 A~E 게임 자동 인식
- 스캔한 번호와 실제 당첨번호 비교 후 등수 표시
- 실제 로또 번호 색상 규칙을 반영한 번호 UI
- Android/iOS 대응

## 기술 스택

- Expo
- React Native
- JavaScript
- Expo Camera
- React Native Safe Area Context

## 실행 방법

```bash
npm install
npx expo start -c
```

터미널에 표시되는 QR코드를 Expo Go 앱으로 스캔하면 실행할 수 있습니다.

## Android 빌드

테스트 설치용 APK:

```bash
npm run build:android:apk
```

Google Play 등록용 AAB:

```bash
npm run build:android:aab
```

빌드가 끝나면 Expo/EAS가 다운로드 링크를 터미널에 표시합니다.

## 프로젝트 구조

```text
.
├── App.js
├── app.json
├── babel.config.js
├── eas.json
├── package.json
├── package-lock.json
└── README.md
```

## 참고

본 프로젝트는 학습 및 포트폴리오 목적의 앱입니다. 추첨 결과는 무작위이며 당첨을 보장하지 않습니다.
