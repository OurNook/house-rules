import { useState } from 'react';
import { View, Text, Pressable, TextInput, Keyboard, TouchableWithoutFeedback, Modal, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SettingsMenu } from '@/components/settings-menu';
import { diminishingWhistPlayers } from '@/utils/diminishing-whist-players';

const gradient = {
  light: 'linear-gradient(160deg, #F0DC8C 0%, #F5C4A0 55%, #F2A7A7 100%)',
  dark:  'linear-gradient(160deg, #2A2410 0%, #2A1A10 55%, #2A1018 100%)',
};

const ROUND_WORDS = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];

type RoundData = {
  round: number;
  playerNames: string[];
  predictions: number[];
  results: number[];
  pointsEarned: number[];
};

export default function DimWhGameScreen() {
  const colorScheme = useColorScheme();
  const { playerNames } = useLocalSearchParams<{ playerNames: string }>();
  const isDark = colorScheme === 'dark';
  const [round, setRound] = useState(1);
  const [players, setPlayers] = useState<string[]>(() => playerNames ? JSON.parse(playerNames) : []);
  const [phase, setPhase] = useState<'predictions' | 'results'>('predictions');
  const [predictions, setPredictions] = useState<string[]>(() => players.map(() => ''));
  const [results, setResults] = useState<string[]>(() => players.map(() => ''));
  const [cumulativeScores, setCumulativeScores] = useState<number[]>(() => players.map(() => 0));
  const [roundHistory, setRoundHistory] = useState<RoundData[]>([]);
  const [showScores, setShowScores] = useState(false);
  const [showDealerWarning, setShowDealerWarning] = useState(false);
  const [showResultsWarning, setShowResultsWarning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverRanking, setGameOverRanking] = useState<{ name: string; score: number }[] | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const sortedScores = players
    .map((name, i) => ({ name, score: cumulativeScores[i] }))
    .sort((a, b) => b.score - a.score);

  const cardCount = Math.max(1, 11 - round);
  const roundLabel = round <= 10 ? `Round ${ROUND_WORDS[round - 1]}` : 'Bonus Round';

  const currentInputs = phase === 'predictions' ? predictions : results;
  const allFilled = currentInputs.every(v => v.trim() !== '');

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (phase === 'predictions') {
      const predCardCount = cardCount;
      const predSum = predictions.reduce((sum, v) => sum + Number(v), 0);
      if (predSum === predCardCount) {
        setShowDealerWarning(true);
        return;
      }
      setPhase('results');
    } else {
      const preds = predictions.map(Number);
      const actuals = results.map(Number);
      if (actuals.reduce((sum, v) => sum + v, 0) !== cardCount) {
        setShowResultsWarning(true);
        return;
      }
      const pointsEarned = actuals.map((actual, i) =>
        actual === preds[i] ? actual + 10 : actual
      );
      setRoundHistory(prev => {
        if (prev.some(r => r.round === round)) return prev;
        return [...prev, { round, playerNames: [...players], predictions: preds, results: actuals, pointsEarned }];
      });
      const updatedScores = cumulativeScores.map((s, i) => s + pointsEarned[i]);
      if (round === 11) {
        const ranking = players
          .map((name, i) => ({ name, score: updatedScores[i] }))
          .sort((a, b) => b.score - a.score);
        setCumulativeScores(updatedScores);
        setGameOver(true);
        setGameOverRanking(ranking);
        diminishingWhistPlayers.recordWinByName(ranking[0].name);
        return;
      }
      const rotated = <T,>(arr: T[]): T[] => [arr[arr.length - 1], ...arr.slice(0, -1)];
      setCumulativeScores(rotated(updatedScores));
      setPlayers(prev => rotated(prev));
      setRound(r => r + 1);
      setPredictions(players.map(() => ''));
      setResults(players.map(() => ''));
      setPhase('predictions');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={{ flex: 1, experimental_backgroundImage: gradient[colorScheme ?? 'light'] } as any}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1 }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
            <Pressable onPress={() => { if (!gameOverRanking) router.back(); }} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })} hitSlop={8}>
              <SymbolView name="chevron.left" size={28} tintColor="rgba(255,255,255,0.8)" resizeMode="scaleAspectFit" weight="semibold" />
            </Pressable>
            <Text style={{ flex: 1, fontSize: 28, fontWeight: '700', color: 'white', textAlign: 'center' }}>Diminishing Whist</Text>
            <SettingsMenu />
          </View>

          {/* Player rows */}
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16, gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.75)', textAlign: 'center', letterSpacing: 0.5 }}>
              {phase === 'predictions' ? 'Predictions' : 'Results'}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textAlign: 'center', letterSpacing: 0.5 }}>
              {roundLabel}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textAlign: 'center', letterSpacing: 0.5, marginBottom: 4 }}>
              {`${cardCount} card${cardCount !== 1 ? 's' : ''}`}
            </Text>
            {players.map((name, i) => (
              <Pressable
                key={i}
                onPress={gameOver ? () => setSelectedPlayer(name) : undefined}
                style={({ pressed }) => ({
                  backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
                  borderRadius: 24,
                  borderCurve: 'continuous',
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  opacity: gameOver && pressed ? 0.7 : 1,
                })}
              >
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20, fontWeight: '600', color: isDark ? 'white' : '#1C1C1E' }}>
                    {name}
                  </Text>
                  {i === 0 && !gameOver && (
                    <View style={{ backgroundColor: '#D4BC5A', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: 'white', letterSpacing: 0.5 }}>DEALER</Text>
                    </View>
                  )}
                </View>
                <TextInput
                  value={phase === 'predictions' ? predictions[i] : results[i]}
                  editable={!gameOver}
                  onChangeText={(t) => {
                    const val = t.replace(/[^0-9]/g, '').slice(0, 2);
                    if (phase === 'predictions') {
                      const next = [...predictions];
                      next[i] = val;
                      setPredictions(next);
                    } else {
                      const next = [...results];
                      next[i] = val;
                      setResults(next);
                    }
                  }}
                  keyboardType="number-pad"
                  placeholder="—"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                  style={{
                    width: 56,
                    height: 44,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)',
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: '700',
                    color: isDark ? 'white' : '#1C1C1E',
                    opacity: gameOver ? 0.4 : 1,
                  }}
                />
              </Pressable>
            ))}

            <Pressable
              onPressIn={() => setShowScores(true)}
              onPressOut={() => setShowScores(false)}
              style={{ alignSelf: 'center', marginTop: 4, paddingVertical: 8, paddingHorizontal: 20 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3 }}>
                Peak Score
              </Text>
            </Pressable>
          </View>

          <Modal visible={showResultsWarning} transparent animationType="fade">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{
                backgroundColor: isDark ? '#1C1C1E' : 'white',
                borderRadius: 20,
                borderCurve: 'continuous',
                paddingHorizontal: 24,
                paddingVertical: 20,
                width: 280,
                gap: 12,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? 'white' : '#1C1C1E', textAlign: 'center' }}>
                  The math is not adding up
                </Text>
                <Pressable
                  onPress={() => setShowResultsWarning(false)}
                  style={({ pressed }) => ({
                    backgroundColor: '#D4BC5A',
                    borderRadius: 999,
                    paddingVertical: 10,
                    paddingHorizontal: 28,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal visible={showDealerWarning} transparent animationType="fade">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{
                backgroundColor: isDark ? '#1C1C1E' : 'white',
                borderRadius: 20,
                borderCurve: 'continuous',
                paddingHorizontal: 24,
                paddingVertical: 20,
                width: 280,
                gap: 12,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? 'white' : '#1C1C1E', textAlign: 'center' }}>
                  {players[0]} must change their prediction
                </Text>
                <Pressable
                  onPress={() => setShowDealerWarning(false)}
                  style={({ pressed }) => ({
                    backgroundColor: '#D4BC5A',
                    borderRadius: 999,
                    paddingVertical: 10,
                    paddingHorizontal: 28,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal visible={showScores} transparent animationType="fade">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{
                backgroundColor: isDark ? '#1C1C1E' : 'white',
                borderRadius: 24,
                borderCurve: 'continuous',
                paddingHorizontal: 28,
                paddingVertical: 24,
                width: 280,
                gap: 4,
              }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? 'white' : '#1C1C1E', textAlign: 'center', marginBottom: 12 }}>
                  Scores
                </Text>
                {sortedScores.map(({ name, score }, i) => (
                  <View key={name} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < sortedScores.length - 1 ? 1 : 0, borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ width: 24, fontSize: 14, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }}>{i + 1}</Text>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: isDark ? 'white' : '#1C1C1E' }}>{name}</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#D4BC5A' }}>{score}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Modal>

          {/* Submit button */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <Pressable
              onPress={allFilled ? handleSubmit : undefined}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                backgroundColor: '#D4BC5A',
                borderRadius: 999,
                paddingVertical: 18,
                opacity: !allFilled ? 0.4 : pressed ? 0.85 : 1,
                boxShadow: '0 4px 16px rgba(212,188,90,0.4)',
              })}
            >
              <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }}>Submit</Text>
            </Pressable>
          </View>

        </SafeAreaView>
        </TouchableWithoutFeedback>

        {!!selectedPlayer && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 32 }}>
            <View style={{
              width: '100%',
              backgroundColor: isDark ? '#1C1C1E' : 'white',
              borderRadius: 28,
              borderCurve: 'continuous',
              padding: 24,
              gap: 16,
              maxHeight: '80%',
            }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? 'white' : '#1C1C1E', textAlign: 'center' }}>
                {selectedPlayer}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ flex: 2, fontSize: 13, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93' }}>Round</Text>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93', textAlign: 'center' }}>Bid</Text>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93', textAlign: 'center' }}>Got</Text>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93', textAlign: 'right' }}>Pts</Text>
              </View>
              <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 10 }}>
                  {roundHistory.map((rd, histIdx) => {
                    const idx = rd.playerNames.indexOf(selectedPlayer ?? '');
                    if (idx === -1) return null;
                    const label = rd.round <= 10 ? `Round ${ROUND_WORDS[rd.round - 1]}` : 'Bonus';
                    const hit = rd.predictions[idx] === rd.results[idx];
                    return (
                      <View key={histIdx} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Text style={{ flex: 2, fontSize: 14, color: isDark ? 'rgba(255,255,255,0.75)' : '#3C3C43' }}>{label}</Text>
                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: isDark ? 'white' : '#1C1C1E', textAlign: 'center' }}>{rd.predictions[idx]}</Text>
                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: isDark ? 'white' : '#1C1C1E', textAlign: 'center' }}>{rd.results[idx]}</Text>
                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: hit ? '#D4BC5A' : (isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93'), textAlign: 'right' }}>
                          {rd.pointsEarned[idx]}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
              <Pressable
                onPress={() => setSelectedPlayer(null)}
                style={({ pressed }) => ({
                  backgroundColor: '#D4BC5A',
                  borderRadius: 999,
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>Close</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!!gameOverRanking && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.92)', paddingHorizontal: 32 }}>
            <View style={{
              width: '100%',
              backgroundColor: isDark ? '#1C1C1E' : 'white',
              borderRadius: 32,
              borderCurve: 'continuous',
              padding: 32,
              gap: 24,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 48, fontWeight: '800', color: isDark ? 'white' : '#1C1C1E' }}>Winner</Text>
              <Text style={{ fontSize: 32, fontWeight: '700', color: '#D4BC5A' }}>{gameOverRanking[0].name}</Text>
              <View style={{ width: '100%', gap: 12 }}>
                {gameOverRanking.slice(1).sort((a, b) => b.score - a.score).map((player, i) => (
                  <View key={player.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 17, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93', minWidth: 24 }}>{i + 2}.</Text>
                    <Text style={{ flex: 1, fontSize: 17, fontWeight: '500', color: isDark ? 'white' : '#1C1C1E' }}>{player.name}</Text>
                    <Text style={{ fontSize: 15, color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93', fontVariant: ['tabular-nums'] }}>
                      {player.score} pts
                    </Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => setGameOverRanking(null)}
                style={({ pressed }) => ({
                  width: '100%',
                  backgroundColor: '#D4BC5A',
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>Done</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
