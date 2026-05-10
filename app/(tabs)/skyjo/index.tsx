import { SettingsMenu } from '@/components/settings-menu';
import { Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStorage } from '@/hooks/use-storage';
import type { Player } from '@/types/player';
import { skyjoGame } from '@/utils/skyjo-game';
import { skyjoPlayers } from '@/utils/skyjo-players';
import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const gradient = {
  light: 'linear-gradient(160deg, #A8DDD4 0%, #A8C5A0 55%, #F5C4A0 100%)',
  dark: 'linear-gradient(160deg, #1A2D2A 0%, #1E2A1E 55%, #2D2018 100%)',
};

const PLAYER_COLORS = [
  Palette.mint,
  Palette.sage,
  Palette.peach,
  Palette.butter,
  Palette.periwinkle,
  Palette.blush,
  Palette.lavender,
  Palette.sageDeep,
];

export default function SkyjoScreen() {
  const colorScheme = useColorScheme();
  const [playerList] = useStorage<Player[]>('skyjo-players', []);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEditToggle = () => {
    if (editMode) setSelectedIds(new Set());
    setEditMode((prev) => !prev);
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => skyjoPlayers.remove(id));
    setSelectedIds(new Set());
    setEditMode(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View
        style={
          {
            flex: 1,
            experimental_backgroundImage: gradient[colorScheme ?? 'light'],
          } as any
        }
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 4,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                padding: 4,
              })}
              hitSlop={8}
            >
              <SymbolView
                name="chevron.left"
                size={28}
                tintColor="rgba(255,255,255,0.8)"
                resizeMode="scaleAspectFit"
                weight="semibold"
              />
            </Pressable>
            <Text
              style={{
                flex: 1,
                fontSize: 34,
                fontWeight: '700',
                color: 'white',
                textAlign: 'center',
              }}
            >
              Skyjo
            </Text>
            <SettingsMenu />
          </View>

          {/* Body */}
          <View style={{ flex: 1 }}>
            {/* Top 2/3 — content */}
            <View
              style={{
                flex: 2,
                justifyContent:
                  playerList.length === 0 ? 'center' : 'flex-start',
                paddingHorizontal: 24,
                paddingTop: playerList.length === 0 ? 0 : 16,
                gap: 16,
              }}
            >
              {playerList.length === 0 ? (
                /* Empty state card */
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 24,
                    borderCurve: 'continuous',
                    padding: 36,
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: 'white',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SymbolView
                      name="person.badge.plus"
                      size={36}
                      tintColor={Palette.mint}
                      resizeMode="scaleAspectFit"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '700',
                      color: 'white',
                      textAlign: 'center',
                      marginTop: 4,
                    }}
                  >
                    No Players Yet
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'rgba(255,255,255,0.75)',
                      textAlign: 'center',
                    }}
                  >
                    Add players to get started with your game
                  </Text>
                </View>
              ) : (
                /* Player grid — 2 per row */
                <View style={{ gap: 10 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      paddingBottom: 24,
                    }}
                  >
                    <Pressable
                      onPress={handleEditToggle}
                      style={({ pressed }) => ({
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 999,
                        paddingVertical: 6,
                        paddingHorizontal: 16,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: 'white',
                        }}
                      >
                        {editMode ? 'Done' : 'Edit'}
                      </Text>
                    </Pressable>
                  </View>
                  {Array.from(
                    { length: Math.ceil(playerList.length / 2) },
                    (_, i) => playerList.slice(i * 2, i * 2 + 2),
                  ).map((pair, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={{ flexDirection: 'row', gap: 10 }}
                    >
                      {pair.map((player) => {
                        const index = playerList.findIndex(
                          (p) => p.id === player.id,
                        );
                        const color =
                          PLAYER_COLORS[index % PLAYER_COLORS.length];
                        const isSelected = selectedIds.has(player.id);
                        return (
                          <Pressable
                            key={player.id}
                            onPress={() => togglePlayer(player.id)}
                            style={({ pressed }) => ({
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 10,
                              backgroundColor: colorScheme === 'dark'
                                ? (isSelected ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)')
                                : (isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)'),
                              borderRadius: 999,
                              borderCurve: 'continuous',
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              opacity: pressed ? 0.8 : 1,
                            })}
                          >
                            <View
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: color,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <SymbolView
                                name={isSelected ? 'checkmark' : 'person.fill'}
                                size={16}
                                tintColor="white"
                                resizeMode="scaleAspectFit"
                                weight="semibold"
                              />
                            </View>
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: '600',
                                color: colorScheme === 'dark' ? 'white' : '#1C1C1E',
                                flexShrink: 1,
                              }}
                              numberOfLines={1}
                            >
                              {player.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                      {pair.length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Bottom 1/3 — action buttons */}
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-start',
                paddingHorizontal: 24,
                paddingTop: 8,
              }}
            >
              {editMode ? (
                <Pressable
                  onPress={handleDeleteSelected}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    backgroundColor: 'white',
                    borderRadius: 999,
                    paddingVertical: 18,
                    opacity: pressed ? 0.85 : 1,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  })}
                >
                  <SymbolView
                    name="trash"
                    size={22}
                    tintColor={Palette.blushDeep}
                    resizeMode="scaleAspectFit"
                  />
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '600',
                      color: Palette.blushDeep,
                    }}
                  >
                    Delete Players
                  </Text>
                </Pressable>
              ) : selectedIds.size >= 2 ? (
                <Pressable
                  onPress={() => {
                    const allPlayers = skyjoPlayers.getAll();
                    const selected = [...selectedIds]
                      .map(id => allPlayers.find(p => p.id === id))
                      .filter(Boolean) as { id: string; name: string }[];
                    skyjoGame.start(selected);
                    router.push('/(tabs)/skyjo/game');
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    backgroundColor: Palette.mint,
                    borderRadius: 999,
                    paddingVertical: 18,
                    opacity: pressed ? 0.85 : 1,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  })}
                >
                  <SymbolView name="play.fill" size={20} tintColor="white" resizeMode="scaleAspectFit" />
                  <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }}>Begin Game</Text>
                </Pressable>
              ) : (
                <View style={{ gap: 12 }}>
                  <Pressable
                    onPress={() => router.push('/(tabs)/skyjo/add-player')}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      backgroundColor: 'white',
                      borderRadius: 999,
                      paddingVertical: 18,
                      opacity: pressed ? 0.85 : 1,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    })}
                  >
                    <SymbolView name="plus.circle" size={22} tintColor={Palette.mint} resizeMode="scaleAspectFit" />
                    <Text style={{ fontSize: 17, fontWeight: '600', color: Palette.mint }}>Add Players</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push('/(tabs)/skyjo/statistics')}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 999,
                      paddingVertical: 18,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <SymbolView name="chart.bar.fill" size={20} tintColor="white" resizeMode="scaleAspectFit" />
                    <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>Statistics</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}
