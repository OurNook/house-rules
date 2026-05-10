import { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, Switch, TextInput } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Palette } from '@/constants/theme';
import { PhaseDisplay } from '@/components/phase-display';
import { SettingsMenu } from '@/components/settings-menu';
import { useStorage } from '@/hooks/use-storage';
import { phase10Game } from '@/utils/phase10-game';
import { players as playerStore } from '@/utils/players';
import type { Phase10Game, GamePlayer } from '@/types/game';

const gradient = {
  light: 'linear-gradient(160deg, #C9B8E8 0%, #A9B8E8 55%, #A8DDD4 100%)',
  dark:  'linear-gradient(160deg, #2A1F3D 0%, #1F2A3D 55%, #1A2D2A 100%)',
};

export default function Phase10GameScreen() {
  const colorScheme = useColorScheme();
  const { playerIds } = useLocalSearchParams<{ playerIds: string }>();
  const [game] = useStorage<Phase10Game | null>('phase10-game', null);
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer | null>(null);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [roundScore, setRoundScore] = useState('');
  const [submissions, setSubmissions] = useState<Map<string, { roundScore: string; phaseCompleted: boolean }>>(new Map());
  const [gameOverRanking, setGameOverRanking] = useState<GamePlayer[] | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const openPlayer = (player: GamePlayer) => {
    const prior = submissions.get(player.id);
    setRoundScore(prior?.roundScore ?? '');
    setPhaseCompleted(prior?.phaseCompleted ?? false);
    setSelectedPlayer(player);
  };

  useEffect(() => {
    const selectedIds: string[] = playerIds ? JSON.parse(playerIds) : [];
    const allPlayers = playerStore.getAll();
    const selected = selectedIds
      .map(id => allPlayers.find(p => p.id === id))
      .filter(Boolean) as { id: string; name: string }[];
    phase10Game.start(selected);
  }, [playerIds]);

  if (!game) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={{ flex: 1, experimental_backgroundImage: gradient[colorScheme ?? 'light'] } as any}>
        <SafeAreaView style={{ flex: 1 }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })} hitSlop={8}>
              <SymbolView name="chevron.left" size={28} tintColor="rgba(255,255,255,0.8)" resizeMode="scaleAspectFit" weight="semibold" />
            </Pressable>
            <Text style={{ flex: 1, fontSize: 34, fontWeight: '700', color: 'white', textAlign: 'center' }}>Phase 10</Text>
            <SettingsMenu />
          </View>

          {/* Player rows */}
          <View style={{ paddingHorizontal: 24, paddingTop: 50, gap: 8 }}>
            {game.players.map(player => (
              <Pressable
                key={player.id}
                onPress={() => openPlayer(player)}
                style={({ pressed }) => ({
                  backgroundColor: colorScheme === 'dark'
                    ? (submissions.has(player.id) ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)')
                    : (submissions.has(player.id) ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)'),
                  borderRadius: 24,
                  borderCurve: 'continuous',
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ flex: 1, fontSize: 20, fontWeight: '600', color: colorScheme === 'dark' ? 'white' : '#1C1C1E' }}>{player.name}</Text>
                <View style={{ flex: 2, alignItems: 'center' }}>
                  <PhaseDisplay phase={player.phase} tileSize={17} colorScheme={colorScheme} />
                </View>
                <Text style={{ flex: 1, fontSize: 20, fontWeight: '700', color: colorScheme === 'dark' ? 'white' : '#1C1C1E', fontVariant: ['tabular-nums'], textAlign: 'right' }}>
                  {player.score}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* End Round / Replay button */}
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 70 }}>
            <Pressable
              disabled={!gameEnded && !game.players.every(p => submissions.has(p.id))}
              onPress={() => {
                if (gameEnded) {
                  const players = game.players.map(p => ({ id: p.id, name: p.name }));
                  phase10Game.start(players);
                  setSubmissions(new Map());
                  setRoundScore('');
                  setPhaseCompleted(false);
                  setGameEnded(false);
                  return;
                }
                const updated = game.players.map(player => {
                  const sub = submissions.get(player.id);
                  if (!sub) return player;
                  const newScore = player.score + (parseInt(sub.roundScore) || 0);
                  const newPhase = sub.phaseCompleted ? Math.min(player.phase + 1, 11) : player.phase;
                  phase10Game.updatePlayer(player.id, { score: newScore, phase: newPhase });
                  return { ...player, score: newScore, phase: newPhase };
                });
                setSubmissions(new Map());
                setRoundScore('');
                setPhaseCompleted(false);
                if (updated.some(p => p.phase > 10)) {
                  const ranked = [...updated].sort((a, b) => {
                    const aFinished = a.phase > 10;
                    const bFinished = b.phase > 10;
                    if (aFinished && bFinished) return a.score - b.score;
                    if (aFinished) return -1;
                    if (bFinished) return 1;
                    if (b.phase !== a.phase) return b.phase - a.phase;
                    return a.score - b.score;
                  });
                  setGameOverRanking(ranked);
                  setGameEnded(true);
                  playerStore.recordWin(ranked[0].id);
                }
              }}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 999,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: (gameEnded || game.players.every(p => submissions.has(p.id))) ? (pressed ? 0.7 : 1) : 0.35,
              })}
            >
              <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>{gameEnded ? 'Replay' : 'End Round'}</Text>
            </Pressable>
          </View>

          {/* Player detail card */}
          <Modal
            visible={!!selectedPlayer}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedPlayer(null)}
          >
            <Pressable
              style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)', paddingHorizontal: 32, paddingTop: 80 }}
              onPress={() => setSelectedPlayer(null)}
            >
              <Pressable onPress={e => e.stopPropagation()} style={{ width: '100%' }}>
                <View style={{
                  backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : 'white',
                  borderRadius: 32,
                  borderCurve: 'continuous',
                  padding: 24,
                  gap: 20,
                }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colorScheme === 'dark' ? 'white' : '#1C1C1E', textAlign: 'center' }}>
                    {selectedPlayer?.name}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7', borderRadius: 20, borderCurve: 'continuous', padding: 16, gap: 4 }}>
                      <Text style={{ fontSize: 13, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#8E8E93', fontWeight: '500' }}>Phase</Text>
                      <Text style={{ fontSize: 28, fontWeight: '700', color: colorScheme === 'dark' ? 'white' : '#1C1C1E' }}>{selectedPlayer?.phase}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7', borderRadius: 20, borderCurve: 'continuous', padding: 16, gap: 4 }}>
                      <Text style={{ fontSize: 13, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#8E8E93', fontWeight: '500' }}>Score</Text>
                      <Text style={{ fontSize: 28, fontWeight: '700', color: colorScheme === 'dark' ? 'white' : '#1C1C1E', fontVariant: ['tabular-nums'] }}>{selectedPlayer?.score}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 17, fontWeight: '500', color: colorScheme === 'dark' ? 'white' : '#1C1C1E' }}>Phase Completed</Text>
                    <Switch value={phaseCompleted} onValueChange={setPhaseCompleted} />
                  </View>
                  <View style={{ backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7', borderRadius: 20, borderCurve: 'continuous', padding: 16, gap: 4 }}>
                    <Text style={{ fontSize: 13, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#8E8E93', fontWeight: '500' }}>Round Score</Text>
                    <TextInput
                      value={roundScore}
                      onChangeText={setRoundScore}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colorScheme === 'dark' ? 'rgba(255,255,255,0.3)' : '#C7C7CC'}
                      style={{ fontSize: 28, fontWeight: '700', color: colorScheme === 'dark' ? 'white' : '#1C1C1E', fontVariant: ['tabular-nums'], padding: 0 }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {([5, 10, 15, 25] as const).map(pts => (
                      <View key={pts} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                        <Pressable
                          onPress={() => setRoundScore(s => String((parseInt(s) || 0) + pts))}
                          style={({ pressed }) => ({
                            width: '100%',
                            backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                            borderRadius: 14,
                            borderCurve: 'continuous',
                            paddingVertical: 12,
                            alignItems: 'center',
                            opacity: pressed ? 0.6 : 1,
                          })}
                        >
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colorScheme === 'dark' ? 'white' : '#1C1C1E' }}>+{pts}</Text>
                        </Pressable>
                        {pts === 5 && (
                          <Text style={{ fontSize: 10, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#8E8E93' }}>1 to 9</Text>
                        )}
                        {pts === 10 && (
                          <Text style={{ fontSize: 10, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#8E8E93' }}>10 to 12</Text>
                        )}
                        {pts === 15 && (
                          <Text style={{ fontSize: 10, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#8E8E93' }}>Skip</Text>
                        )}
                        {pts === 25 && (
                          <Text style={{ fontSize: 10, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : '#8E8E93' }}>Wild</Text>
                        )}
                      </View>
                    ))}
                  </View>
                  <Pressable
                    onPress={() => {
                      if (selectedPlayer) {
                        setSubmissions(prev => new Map(prev).set(selectedPlayer.id, { roundScore, phaseCompleted }));
                      }
                      setSelectedPlayer(null);
                      setRoundScore('');
                      setPhaseCompleted(false);
                    }}
                    style={({ pressed }) => ({
                      backgroundColor: Palette.periwinkle,
                      borderRadius: 999,
                      paddingVertical: 16,
                      alignItems: 'center',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>Submit</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          {/* Game over modal */}
          <Modal visible={!!gameOverRanking} transparent animationType="fade">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.92)', paddingHorizontal: 32 }}>
              <View style={{
                width: '100%',
                backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : 'white',
                borderRadius: 32,
                borderCurve: 'continuous',
                padding: 32,
                gap: 24,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 48, fontWeight: '800', color: colorScheme === 'dark' ? 'white' : '#1C1C1E' }}>Winner</Text>
                {gameOverRanking && (
                  <>
                    <Text style={{ fontSize: 32, fontWeight: '700', color: Palette.periwinkle }}>{gameOverRanking[0].name}</Text>
                    <View style={{ width: '100%', gap: 12 }}>
                      {gameOverRanking.slice(1).map((player, i) => (
                        <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ fontSize: 17, fontWeight: '600', color: colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#8E8E93', minWidth: 24 }}>{i + 2}.</Text>
                          <Text style={{ flex: 1, fontSize: 17, fontWeight: '500', color: colorScheme === 'dark' ? 'white' : '#1C1C1E' }}>{player.name}</Text>
                          <Text style={{ fontSize: 15, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : '#8E8E93', fontVariant: ['tabular-nums'] }}>
                            {player.phase > 10 ? `${player.score} pts` : `Phase ${player.phase}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
                <Pressable
                  onPress={() => setGameOverRanking(null)}
                  style={({ pressed }) => ({
                    width: '100%',
                    backgroundColor: Palette.periwinkle,
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
          </Modal>

        </SafeAreaView>
      </View>
    </>
  );
}
