import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const COPY = {
  heroTitle: '\uc624\ub298\uc758 \ud589\uc6b4 \ubc88\ud638',
  heroSubtitle: '\ubc84\ud2bc \ud55c \ubc88\uc73c\ub85c 1\ubd80\ud130 45\uae4c\uc9c0 \uc911\ubcf5 \uc5c6\uc774 6\uac1c\ub97c \ucd94\ucca8\ud574\uc694.',
  redraw: '\ubc88\ud638 \ub2e4\uc2dc \ubf51\uae30',
  tipTitle: '\uae54\ub054\ud558\uac8c, \ub85c\ub610\ub2f5\uac8c',
  tipText: '\ubc88\ud638 \uad6c\uac04\ubcc4 \uc2e4\uc81c \ub85c\ub610 \uacf5 \uc0c9\uac10\uc744 \uc801\uc6a9\ud574\uc11c \ud55c\ub208\uc5d0 \ubcf4\uae30 \uc88b\uac8c \ub9cc\ub4e4\uc5c8\uc5b4\uc694.',
  topTitle: '\ub204\uc801 \ucd5c\ub2e4 \ub2f9\ucca8 TOP 6',
  topSubtitle: '\ubcf4\ub108\uc2a4 \ubc88\ud638 \uc81c\uc678, 1\ub4f1 \ub2f9\ucca8\ubc88\ud638 \uae30\uc900',
  countSuffix: '\ud68c',
  empty: '\ub2f9\ucca8\ubc88\ud638\ub97c \ubd88\ub7ec\uc624\uba74 \ud45c\uc2dc\ub429\ub2c8\ub2e4.',
  loading: '\ub2f9\ucca8\ubc88\ud638\ub97c \ubd88\ub7ec\uc624\ub294 \uc911...',
  failTitle: '\uc870\ud68c\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694',
  retry: '\ub2e4\uc2dc \uc2dc\ub3c4',
  networkError: '\ub124\ud2b8\uc6cc\ud06c \uc5f0\uacb0\uc744 \ud655\uc778\ud55c \ub4a4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.',
  appTitle: '\ub85c\ub610 \ubc88\ud638 \ucd94\ucca8\uae30',
  appCaption: '\ud589\uc6b4\uc744 \uac00\ubccd\uace0 \uc608\uc058\uac8c \ubf51\uc544\ubd10\uc694',
  drawTab: '\ucd94\ucca8',
  historyTab: '\uc5ed\ub300 \ub2f9\ucca8\ubc88\ud638',
  qrTab: 'QR\ud655\uc778',
  qrTitle: 'QR \ub2f9\ucca8\ud655\uc778',
  qrSubtitle: '\ub85c\ub610 \uc6a9\uc9c0\uc758 QR\ucf54\ub4dc\ub97c \uc2a4\uce94\ud558\uba74 \ud68c\ucc28\ub97c \uc790\ub3d9\uc73c\ub85c \uc778\uc2dd\ud574 \ub2f9\ucca8 \uc5ec\ubd80\ub97c \ud655\uc778\ud569\ub2c8\ub2e4.',
  qrPermissionTitle: '\uce74\uba54\ub77c \uad8c\ud55c\uc774 \ud544\uc694\ud574\uc694',
  qrPermissionText: 'QR\ucf54\ub4dc\ub97c \uc77d\uc73c\ub824\uba74 \uce74\uba54\ub77c \uc0ac\uc6a9\uc744 \ud5c8\uc6a9\ud574 \uc8fc\uc138\uc694.',
  qrPermissionButton: '\uce74\uba54\ub77c \uad8c\ud55c \ud5c8\uc6a9',
  qrScanAgain: '\ub2e4\uc2dc \uc2a4\uce94',
  qrInvalid: '\ub85c\ub610 QR\ucf54\ub4dc\ub97c \uc778\uc2dd\ud558\uc9c0 \ubabb\ud588\uc5b4\uc694.',
  qrDrawMissing: '\ud574\ub2f9 \ud68c\ucc28 \ub2f9\ucca8\ubc88\ud638\ub97c \uc544\uc9c1 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc5b4\uc694.',
  qrWinningNumbers: '\ub2f9\ucca8\ubc88\ud638',
  qrMyNumbers: '\ub0b4 \ubcf5\uad8c \ubc88\ud638',
  qrLose: '\ub099\ucca8',
};

const LOTTO_YEAR_URL = 'https://lotto.gon.ai.kr/lotto/year/';
const FIRST_DRAW_DATE = new Date(2002, 11, 7);
const DRAW_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const FIRST_DRAW_YEAR = 2002;

function getNumberColor(number) {
  if (number <= 10) return '#F8C546';
  if (number <= 20) return '#4A90E2';
  if (number <= 30) return '#EF6262';
  if (number <= 40) return '#8A8F98';
  return '#35B779';
}

function getEstimatedLatestDraw() {
  const now = new Date();
  const days = now.getDay();
  const saturday = new Date(now);
  saturday.setHours(21, 0, 0, 0);
  saturday.setDate(now.getDate() - ((days + 1) % 7));

  if (now.getDay() === 6 && now.getHours() < 21) {
    saturday.setDate(saturday.getDate() - 7);
  }

  return Math.max(1, Math.floor((saturday - FIRST_DRAW_DATE) / DRAW_INTERVAL_MS) + 1);
}

function generateLottoNumbers() {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, 6).sort((a, b) => a - b);
}

function parseLottoQr(data) {
  const valueMatch = String(data).match(/[?&]v=([^&]+)/);
  const rawValue = valueMatch ? decodeURIComponent(valueMatch[1]) : String(data);
  const cleaned = rawValue.replace(/[^0-9mq]/gi, '');
  const roundMatch = cleaned.match(/^(\d{4})[mq]/i);

  if (!roundMatch) return null;

  const drawNo = Number(roundMatch[1]);
  const gameParts = cleaned.slice(roundMatch[0].length).split(/[mq]/i);
  const games = gameParts
    .map((part, index) => {
      const digits = part.replace(/\D/g, '').slice(0, 12);
      if (digits.length < 12) return null;

      const numbers = Array.from({ length: 6 }, (_, numberIndex) =>
        Number(digits.slice(numberIndex * 2, numberIndex * 2 + 2))
      );

      if (numbers.some((number) => number < 1 || number > 45)) return null;

      return {
        label: String.fromCharCode(65 + index),
        numbers,
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  if (games.length === 0) return null;

  return { drawNo, games, raw: data };
}

function getPrizeResult(gameNumbers, draw) {
  const matchCount = gameNumbers.filter((number) => draw.numbers.includes(number)).length;
  const hasBonus = gameNumbers.includes(draw.bonus);

  if (matchCount === 6) return { rank: '1\ub4f1', matchCount, hasBonus, highlight: true };
  if (matchCount === 5 && hasBonus) return { rank: '2\ub4f1', matchCount, hasBonus, highlight: true };
  if (matchCount === 5) return { rank: '3\ub4f1', matchCount, hasBonus, highlight: true };
  if (matchCount === 4) return { rank: '4\ub4f1', matchCount, hasBonus, highlight: true };
  if (matchCount === 3) return { rank: '5\ub4f1', matchCount, hasBonus, highlight: true };
  return { rank: COPY.qrLose, matchCount, hasBonus, highlight: false };
}

function extractJsonArray(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return '';

  const arrayStart = source.indexOf('[', markerIndex);
  if (arrayStart < 0) return '';

  let depth = 0;

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;

    if (depth === 0) {
      return source.slice(arrayStart, index + 1);
    }
  }

  return '';
}

function parseYearDraws(html) {
  const rawArray = extractJsonArray(html, '\\"yearData\\":');
  if (!rawArray) return [];

  try {
    const normalized = rawArray.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const rows = JSON.parse(normalized);

    return rows.map((item) => ({
      drawNo: item.round,
      date: item.drawDate,
      numbers: item.numbers,
      bonus: item.bonusNumber,
    }));
  } catch (event) {
    return [];
  }
}

async function fetchYearDraws(year) {
  const response = await fetch(`${LOTTO_YEAR_URL}${year}`);
  const html = await response.text();
  const draws = parseYearDraws(html);

  if (draws.length === 0) {
    throw new Error(`No lotto history for ${year}`);
  }

  return draws;
}

function Ball({ number, size = 44, muted = false }) {
  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: muted ? '#F3F5F8' : getNumberColor(number),
        },
      ]}
    >
      <Text style={[styles.ballText, { color: muted ? '#5C6675' : '#FFFFFF' }]}>{number}</Text>
    </View>
  );
}

function HomeScreen({ numbers, onDraw }) {
  const { width } = useWindowDimensions();
  const ballSize = Math.max(30, Math.min(48, Math.floor((width - 120) / 6)));

  return (
    <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={26} color="#111827" />
        </View>
        <Text style={styles.heroTitle}>{COPY.heroTitle}</Text>
        <Text style={styles.heroSubtitle}>{COPY.heroSubtitle}</Text>
      </View>

      <View style={styles.drawPanel}>
        <View style={styles.drawBalls}>
          {numbers.map((number) => (
            <Ball key={number} number={number} size={ballSize} />
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={onDraw}>
          <Ionicons name="reload" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>{COPY.redraw}</Text>
        </Pressable>
      </View>

      <View style={styles.tipPanel}>
        <Ionicons name="ticket-outline" size={22} color="#1F6FEB" />
        <View style={styles.tipTextWrap}>
          <Text style={styles.tipTitle}>{COPY.tipTitle}</Text>
          <Text style={styles.tipText}>{COPY.tipText}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function HistoryScreen({ draws, loading, error, topNumbers, onRefresh }) {
  const { width } = useWindowDimensions();
  const topBallSize = Math.max(30, Math.min(42, Math.floor((width - 118) / 6)));
  const historyBallSize = Math.max(24, Math.min(34, Math.floor((width - 128) / 7)));

  return (
    <View style={styles.history}>
      <View style={styles.rankingPanel}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>{COPY.topTitle}</Text>
            <Text style={styles.sectionSubtitle}>{COPY.topSubtitle}</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#111827" />
          </Pressable>
        </View>
        <View style={styles.topBalls}>
          {topNumbers.length > 0 ? (
            topNumbers.map((item) => (
              <View key={item.number} style={styles.topBallItem}>
                <Ball number={item.number} size={topBallSize} />
                <Text style={styles.countText}>
                  {item.count}
                  {COPY.countSuffix}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{COPY.empty}</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.stateText}>{COPY.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={34} color="#EF6262" />
          <Text style={styles.stateTitle}>{COPY.failTitle}</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={onRefresh}>
            <Text style={styles.secondaryButtonText}>{COPY.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={draws}
          keyExtractor={(item) => String(item.drawNo)}
          contentContainerStyle={styles.drawList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.drawItem}>
              <View style={styles.drawInfo}>
                <Text style={styles.drawTitle}>
                  {item.drawNo}
                  {COPY.countSuffix}
                </Text>
                <Text style={styles.drawDate}>{item.date}</Text>
              </View>
              <View style={styles.historyBalls}>
                {item.numbers.map((number) => (
                  <Ball key={`${item.drawNo}-${number}`} number={number} size={historyBallSize} />
                ))}
                <Text style={styles.plus}>+</Text>
                <Ball number={item.bonus} size={historyBallSize} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function QrScreen({ draws, loading }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const { width } = useWindowDimensions();
  const resultBallSize = Math.max(24, Math.min(34, Math.floor((width - 132) / 7)));

  function handleBarcodeScanned({ data }) {
    if (scanned) return;

    setScanned(true);
    const parsed = parseLottoQr(data);

    if (!parsed) {
      setScanResult(null);
      setScanError(COPY.qrInvalid);
      return;
    }

    const draw = draws.find((item) => item.drawNo === parsed.drawNo);

    if (!draw) {
      setScanResult({ parsed, draw: null, games: [] });
      setScanError(COPY.qrDrawMissing);
      return;
    }

    setScanError('');
    setScanResult({
      parsed,
      draw,
      games: parsed.games.map((game) => ({
        ...game,
        result: getPrizeResult(game.numbers, draw),
      })),
    });
  }

  function resetScan() {
    setScanned(false);
    setScanResult(null);
    setScanError('');
  }

  if (!permission) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.qrContent}>
        <View style={styles.qrIntroPanel}>
          <Ionicons name="qr-code-outline" size={34} color="#111827" />
          <Text style={styles.stateTitle}>{COPY.qrPermissionTitle}</Text>
          <Text style={styles.stateText}>{COPY.qrPermissionText}</Text>
          <Pressable style={({ pressed }) => [styles.primaryButton, styles.qrPermissionButton, pressed && styles.pressed]} onPress={requestPermission}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{COPY.qrPermissionButton}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.qrContent} showsVerticalScrollIndicator={false}>
      <View style={styles.qrIntroPanel}>
        <View style={styles.qrIntroHeader}>
          <View>
            <Text style={styles.sectionTitle}>{COPY.qrTitle}</Text>
            <Text style={styles.sectionSubtitle}>{COPY.qrSubtitle}</Text>
          </View>
          <View style={styles.qrIconBadge}>
            <Ionicons name="scan" size={24} color="#111827" />
          </View>
        </View>
      </View>

      <View style={styles.cameraPanel}>
        {!scanned ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.cameraView}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            <View style={styles.scanFrame} />
          </View>
        ) : (
          <View style={styles.scannedState}>
            <Ionicons name={scanError ? 'alert-circle-outline' : 'checkmark-circle-outline'} size={42} color={scanError ? '#EF6262' : '#35B779'} />
            <Text style={styles.stateTitle}>{scanError || `${scanResult?.parsed.drawNo}${COPY.countSuffix} ${COPY.qrMyNumbers}`}</Text>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={resetScan}>
              <Text style={styles.secondaryButtonText}>{COPY.qrScanAgain}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.qrResultPanel}>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.stateText}>{COPY.loading}</Text>
        </View>
      ) : scanResult?.draw ? (
        <View style={styles.qrResultPanel}>
          <View style={styles.drawInfo}>
            <Text style={styles.drawTitle}>
              {scanResult.parsed.drawNo}
              {COPY.countSuffix}
            </Text>
            <Text style={styles.drawDate}>{scanResult.draw.date}</Text>
          </View>
          <Text style={styles.resultLabel}>{COPY.qrWinningNumbers}</Text>
          <View style={styles.historyBalls}>
            {scanResult.draw.numbers.map((number) => (
              <Ball key={`win-${number}`} number={number} size={resultBallSize} />
            ))}
            <Text style={styles.plus}>+</Text>
            <Ball number={scanResult.draw.bonus} size={resultBallSize} />
          </View>

          <Text style={[styles.resultLabel, styles.resultLabelSpacing]}>{COPY.qrMyNumbers}</Text>
          {scanResult.games.map((game) => (
            <View key={game.label} style={[styles.ticketGameRow, game.result.highlight && styles.ticketGameRowHit]}>
              <Text style={styles.gameLabel}>{game.label}</Text>
              <View style={styles.ticketGameNumbers}>
                {game.numbers.map((number) => (
                  <Ball key={`${game.label}-${number}`} number={number} size={resultBallSize} muted={!scanResult.draw.numbers.includes(number) && number !== scanResult.draw.bonus} />
                ))}
              </View>
              <Text style={[styles.rankText, game.result.highlight && styles.rankTextHit]}>{game.result.rank}</Text>
            </View>
          ))}
        </View>
      ) : scanError ? (
        <View style={styles.qrResultPanel}>
          <Text style={styles.stateText}>{scanError}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [numbers, setNumbers] = useState(generateLottoNumbers);
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const topNumbers = useMemo(() => {
    if (draws.length === 0) return [];

    const counts = Array.from({ length: 45 }, (_, index) => ({ number: index + 1, count: 0 }));

    draws.forEach((draw) => {
      draw.numbers.forEach((number) => {
        counts[number - 1].count += 1;
      });
    });

    return counts
      .sort((a, b) => b.count - a.count || a.number - b.number)
      .slice(0, 6);
  }, [draws]);

  async function fetchDraws() {
    setLoading(true);
    setError('');

    try {
      const latestDraw = getEstimatedLatestDraw();
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: currentYear - FIRST_DRAW_YEAR + 1 }, (_, index) => FIRST_DRAW_YEAR + index);
      const yearResults = await Promise.all(years.map((year) => fetchYearDraws(year)));
      const parsed = yearResults
        .flat()
        .filter((item) => item.drawNo <= latestDraw)
        .sort((a, b) => b.drawNo - a.drawNo);

      if (parsed.length === 0) {
        throw new Error('No lotto history loaded');
      }

      setDraws(parsed);
    } catch (event) {
      setError(COPY.networkError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDraws();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="dark" />
        <View style={styles.app}>
          <View style={styles.header}>
            <View>
              <Text style={styles.appTitle}>{COPY.appTitle}</Text>
              <Text style={styles.appCaption}>{COPY.appCaption}</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tabButton, tab === 'home' && styles.activeTab]}
              onPress={() => setTab('home')}
            >
              <Ionicons name="dice-outline" size={20} color={tab === 'home' ? '#111827' : '#7B8494'} />
              <Text style={[styles.tabText, tab === 'home' && styles.activeTabText]}>{COPY.drawTab}</Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, tab === 'history' && styles.activeTab]}
              onPress={() => setTab('history')}
            >
              <Ionicons name="list-outline" size={20} color={tab === 'history' ? '#111827' : '#7B8494'} />
              <Text style={[styles.tabText, tab === 'history' && styles.activeTabText]}>{COPY.historyTab}</Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, tab === 'qr' && styles.activeTab]}
              onPress={() => setTab('qr')}
            >
              <Ionicons name="qr-code-outline" size={20} color={tab === 'qr' ? '#111827' : '#7B8494'} />
              <Text style={[styles.tabText, tab === 'qr' && styles.activeTabText]}>{COPY.qrTab}</Text>
            </Pressable>
          </View>

          {tab === 'home' ? (
            <HomeScreen numbers={numbers} onDraw={() => setNumbers(generateLottoNumbers())} />
          ) : tab === 'qr' ? (
            <QrScreen draws={draws} loading={loading} />
          ) : (
            <HistoryScreen
              draws={draws}
              loading={loading}
              error={error}
              topNumbers={topNumbers}
              onRefresh={fetchDraws}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  app: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },
  appTitle: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '900',
  },
  appCaption: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 22,
    padding: 5,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
  },
  tabButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#182033',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tabText: {
    color: '#7B8494',
    fontSize: 14,
    fontWeight: '800',
  },
  activeTabText: {
    color: '#111827',
  },
  homeContent: {
    padding: 22,
    paddingBottom: 34,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4C7',
    marginBottom: 18,
  },
  heroTitle: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 280,
    textAlign: 'center',
  },
  drawPanel: {
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 18,
    shadowColor: '#182033',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  drawBalls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.14,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ballText: {
    fontSize: 16,
    fontWeight: '900',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
  },
  tipPanel: {
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F7FAFF',
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E3EEFF',
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  tipText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  history: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  rankingPanel: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    padding: 16,
    shadowColor: '#182033',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#7B8494',
    fontSize: 12,
    marginTop: 5,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
  },
  topBalls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 16,
  },
  topBallItem: {
    alignItems: 'center',
    gap: 6,
  },
  countText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    color: '#7B8494',
    fontSize: 14,
    paddingVertical: 12,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 22,
  },
  stateTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  stateText: {
    color: '#7B8494',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  drawList: {
    paddingTop: 14,
    paddingBottom: 28,
    gap: 10,
  },
  drawItem: {
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  drawInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  drawTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  drawDate: {
    color: '#8A94A6',
    fontSize: 12,
    fontWeight: '700',
  },
  historyBalls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  plus: {
    color: '#98A2B3',
    fontSize: 14,
    fontWeight: '900',
    marginHorizontal: 0,
  },
  qrContent: {
    padding: 22,
    paddingBottom: 34,
    gap: 16,
  },
  qrIntroPanel: {
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#182033',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  qrIntroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  qrIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4C7',
  },
  cameraPanel: {
    height: 330,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  cameraWrap: {
    flex: 1,
  },
  cameraView: {
    flex: 1,
  },
  scanFrame: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  scannedState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 22,
    backgroundColor: '#FFFFFF',
  },
  qrPermissionButton: {
    alignSelf: 'stretch',
  },
  qrResultPanel: {
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  resultLabel: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '900',
  },
  resultLabelSpacing: {
    marginTop: 8,
  },
  ticketGameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 16,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  ticketGameRowHit: {
    borderColor: '#C7EBD5',
    backgroundColor: '#F4FBF7',
  },
  gameLabel: {
    width: 20,
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  ticketGameNumbers: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  rankText: {
    minWidth: 38,
    textAlign: 'right',
    color: '#98A2B3',
    fontSize: 13,
    fontWeight: '900',
  },
  rankTextHit: {
    color: '#138A48',
  },
});
