# 로또 번호 추첨기

Android와 iOS에서 실행할 수 있는 Expo 기반 React Native 앱입니다. 랜덤 로또 번호 추첨, 역대 당첨번호 조회, 누적 당첨 통계, QR 스캔 당첨 확인 기능을 제공합니다.

## 주요 기능

- 랜덤 로또 번호 6개 추첨
- 역대 회차별 당첨번호 조회
- 전체 회차 기준 누적 최다 당첨번호 TOP 6 표시
- 로또 용지 QR 코드 스캔 후 당첨 여부 확인
- 회차 자동 인식 및 A~E 게임별 등수 판정
- 실제 로또 공 색상 규칙을 반영한 번호 UI
- Android/iOS 대응 크로스플랫폼 앱

## 기술 스택

- Expo
- React Native
- JavaScript
- Expo Camera
- React Native Safe Area Context

## 화면 구성

### 추첨

1부터 45까지의 숫자 중 중복 없이 6개를 랜덤 추첨합니다. 번호는 실제 로또 공 색상 구간에 맞춰 표시됩니다.

### 역대 당첨번호

역대 회차별 당첨번호와 보너스 번호를 조회합니다. 상단에는 전체 회차 누적 기준으로 가장 많이 나온 번호 6개를 표시합니다.

### QR 확인

로또 용지의 QR 코드를 카메라로 스캔하면 회차와 구매 번호를 자동으로 인식하고, 해당 회차 당첨번호와 비교해 게임별 당첨 등수를 표시합니다.

## 실행 방법

```bash
npm install
npx expo start -c
```

Expo Go 앱으로 QR 코드를 스캔하거나 Android/iOS 시뮬레이터에서 실행할 수 있습니다.

## 개발 빌드

카메라 등 네이티브 기능을 안정적으로 확인하려면 Expo 개발 빌드 사용을 권장합니다.

```bash
npx expo prebuild
npx expo run:android
```

iOS는 macOS와 Xcode 환경에서 실행할 수 있습니다.

```bash
npx expo run:ios
```

## 프로젝트 구조

```text
.
├── App.js
├── app.json
├── babel.config.js
├── package.json
├── package-lock.json
└── README.md
```

## 데이터 처리

역대 당첨번호 데이터는 연도별 당첨번호 페이지를 조회해 앱 내부에서 파싱합니다. QR 스캔 결과는 로또 QR URL의 회차 및 게임 번호 정보를 분석한 뒤 앱이 보유한 당첨번호 데이터와 비교합니다.

## 참고

본 앱은 학습 및 포트폴리오 목적의 프로젝트입니다. 로또 번호 추첨 결과는 무작위이며 당첨을 보장하지 않습니다.
