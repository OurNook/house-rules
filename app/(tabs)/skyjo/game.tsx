import { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Palette } from '@/constants/theme';
import { SettingsMenu } from '@/components/settings-menu';
import { useStorage } from '@/hooks/use-storage';
import { skyjoGame } from '@/utils/skyjo-game';
import { skyjoPlayers } from '@/utils/skyjo-players';
import type { SkyjoGame } from '@/types/skyjo-game';

const gradient = {
  light: 'linear-gradient(160deg, #A8DDD4 0%, #A8C5A0 55%, #F5C4A0 100%)',
  dark:  'linear-gradient(160deg, #1A2D2A 0%, #1E2A1E 55%, #2D2018 100%)',
};

const GAME_OVER_SCORE = 100;

const ROUND_WORDS = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'];

type RoundEntry = { value: string; sign: 1 | -1 };

export default function SkyjoGameScreen() {
  const colorScheme = useColorScheme();
  const [game] = useStorage<SkyjoGame | null>('skyjo-game', null);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [roundEntries, setRoundEntries] = useState<Map<string, RoundEntry>>(new Map());
  const [gameOverRanking, setGameOverRanking] = useState<{ id: string; name: string; score: number }[] | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const openScoreModal = () => {
    const entries = new Map<string, RoundEntry>();
    game!.players.forEach(p => entries.set(p.id, { value: '', sign: 1 }));
    setRoundEntries(entries);
    setScoreModalVisible(true);
  };

  const toggleSign = (id: string) => {
    setRoundEntries(prev => {
      const next = new Map(prev);
      const e = next.get(id)!;
      next.set(id, { ...e, sign: e.sign === 1 ? -1 : 1 });
      return next;
    });
  };

  const updateValue = (id: string, text: string) => {
    setRoundEntries(prev => {
      const next = new Map(prev);
      next.set(id, { ...next.get(id)!, value: text.replace(/[^0-9]/g, '') });
      return next;
    });
  };

  const handleSubmitRound = () => {
    setScoreModalVisible(false);
    skyjoGame.incrementRound();
    const updated = game!.players.map(player => {
      const entry = roundEntries.get(player.id);
      const num = parseInt(entry?.value ?? '0') || 0;
      const delta = (entry?.sign ?? 1) * num;
      const newScore = player.score + delta;
      skyjoGame.updatePlayer(player.id, newScore);
      return { ...player, score: newScore };
    });
    if (updated.some(p => p.score >= GAME_OVER_SCORE)) {
      const ranked = [...updated].sort((a, b) => a.score - b.score);
      setGameOverRanking(ranked);
      setGameEnded(true);
      skyjoPlayers.recordWin(ranked[0].id);
    }
  };

  const handleNewGame = () => {
    const players = game!.players.map(p => ({ id: p.id, name: p.name }));
    skyjoGame.start(players);
    setGameEnded(false);
  };

  if (!game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <View style={{ flex: 1, experimental_backgroundImage: gradient[colorScheme ?? 'light'] } as any} />
      </>
    );
  }

  const isDark = colorScheme === 'dark';

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
            <Text style={{ flex: 1, fontSize: 34, fontWeight: '700', color: 'white', textAlign: 'center' }}>Skyjo</Text>
            <SettingsMenu />
          </View>

          {/* Player rows */}
          <View style={{ paddingHorizontal: 24, paddingTop: 50, gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textAlign: 'center', letterSpacing: 0.5, marginBottom: 4 }}>
              {`Round ${ROUND_WORDS[(game.round ?? 1) - 1] ?? game.round}`}
            </Text>
            {[...game.players].sort((a, b) => a.score - b.score).map(player => (
              <View
                key={player.id}
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
                  borderRadius: 24,
                  borderCurve: 'continuous',
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ flex: 1, fontSize: 20, fontWeight: '600', color: isDark ? 'white' : '#1C1C1E' }}>
                  {player.name}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? 'white' : '#1C1C1E', fontVariant: ['tabular-nums'] }}>
                  {player.score}
                </Text>
              </View>
            ))}
          </View>

          {/* Score Round / New Game button */}
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 70 }}>
            <Pressable
              onPress={gameEnded ? handleNewGame : openScoreModal}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 999,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>
                {gameEnded ? 'New Game' : 'Score Round'}
              </Text>
            </Pressable>
          </View>

        </SafeAreaView>
      </View>

      {/* Score entry modal */}
      <Modal visible={scoreModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setScoreModalVisible(false)} />
          <View style={{
            backgroundColor: isDark ? '#1C1C1E' : 'white',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderCurve: 'continuous',
            paddingTop: 24,
            paddingHorizontal: 24,
            paddingBottom: 8,
            gap: 12,
          }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: isDark ? 'white' : '#1C1C1E', textAlign: 'center', marginBottom: 4 }}>
              Score Round
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }}>
              <View style={{ gap: 10 }}>
                {game.players.map(player => {
                  const entry = roundEntries.get(player.id) ?? { value: '', sign: 1 as const };
                  return (
                    <View
                      key={player.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                        borderRadius: 20,
                        borderCurve: 'continuous',
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text style={{ flex: 1, fontSize: 17, fontWeight: '600', color: isDark ? 'white' : '#1C1C1E' }}>
                        {player.name}
                      </Text>
                      <Pressable
                        onPress={() => toggleSign(player.id)}
                        style={({ pressed }) => ({
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          borderCurve: 'continuous',
                          backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text style={{ fontSize: 18, fontWeight: '700', color: entry.sign === -1 ? Palette.sageDeep : isDark ? 'white' : '#1C1C1E' }}>
                          {entry.sign === 1 ? '+' : '−'}
                        </Text>
                      </Pressable>
                      <TextInput
                        value={entry.value}
                        onChangeText={text => updateValue(player.id, text)}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#C7C7CC'}
                        style={{
                          fontSize: 20,
                          fontWeight: '700',
                          color: isDark ? 'white' : '#1C1C1E',
                          fontVariant: ['tabular-nums'],
                          minWidth: 48,
                          textAlign: 'right',
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <Pressable
              onPress={handleSubmitRound}
              style={({ pressed }) => ({
                backgroundColor: Palette.mint,
                borderRadius: 999,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
                marginTop: 4,
              })}
            >
              <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>Submit</Text>
            </Pressable>

            <SafeAreaView edges={['bottom']} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Game over modal */}
      <Modal visible={!!gameOverRanking} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.92)', paddingHorizontal: 32 }}>
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
            {gameOverRanking && (
              <>
                <Text style={{ fontSize: 32, fontWeight: '700', color: Palette.mint }}>{gameOverRanking[0].name}</Text>
                <View style={{ width: '100%', gap: 12 }}>
                  {gameOverRanking.slice(1).map((player, i) => (
                    <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 17, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93', minWidth: 24 }}>{i + 2}.</Text>
                      <Text style={{ flex: 1, fontSize: 17, fontWeight: '500', color: isDark ? 'white' : '#1C1C1E' }}>{player.name}</Text>
                      <Text style={{ fontSize: 15, color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93', fontVariant: ['tabular-nums'] }}>
                        {player.score} pts
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
                backgroundColor: Palette.mint,
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
    </>
  );
}
