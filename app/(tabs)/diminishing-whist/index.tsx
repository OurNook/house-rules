import { SettingsMenu } from '@/components/settings-menu';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStorage } from '@/hooks/use-storage';
import type { Player } from '@/types/player';
import { diminishingWhistPlayers } from '@/utils/diminishing-whist-players';
import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring, type SharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const gradient = {
  light: 'linear-gradient(160deg, #F0DC8C 0%, #F5C4A0 55%, #F2A7A7 100%)',
  dark:  'linear-gradient(160deg, #2A2410 0%, #2A1A10 55%, #2A1018 100%)',
};

const PLAYER_COLORS = [
  Palette.butterDeep,
  Palette.peach,
  Palette.blush,
  Palette.sage,
  Palette.periwinkle,
  Palette.mint,
  Palette.lavender,
  Palette.sageDeep,
];

const ITEM_HEIGHT = 58;
const ITEM_GAP = 10;
const STEP = ITEM_HEIGHT + ITEM_GAP;

function DraggableItem({
  name,
  index,
  total,
  activeIndexSV,
  activeDYSV,
  onReorder,
  isDark,
  textColor,
}: {
  name: string;
  index: number;
  total: number;
  activeIndexSV: SharedValue<number>;
  activeDYSV: SharedValue<number>;
  onReorder: (from: number, to: number) => void;
  isDark: boolean;
  textColor: string;
}) {
  const animStyle = useAnimatedStyle(() => {
    const ai = activeIndexSV.value;
    const dy = activeDYSV.value;

    if (ai === index) {
      return { transform: [{ translateY: dy }], zIndex: 100, opacity: 0.92 };
    }
    if (ai === -1) {
      return { transform: [{ translateY: withSpring(0) }], zIndex: 1, opacity: 1 };
    }

    const targetIndex = Math.max(0, Math.min(total - 1, ai + Math.round(dy / STEP)));
    if (ai < index && index <= targetIndex) {
      return { transform: [{ translateY: withSpring(-STEP) }], zIndex: 1, opacity: 1 };
    }
    if (ai > index && index >= targetIndex) {
      return { transform: [{ translateY: withSpring(STEP) }], zIndex: 1, opacity: 1 };
    }
    return { transform: [{ translateY: withSpring(0) }], zIndex: 1, opacity: 1 };
  });

  const gesture = Gesture.Pan()
    .onBegin(() => { activeIndexSV.value = index; })
    .onChange((e) => { activeDYSV.value = e.translationY; })
    .onFinalize(() => {
      const targetIndex = Math.max(0, Math.min(total - 1,
        index + Math.round(activeDYSV.value / STEP)
      ));
      if (targetIndex !== index) runOnJS(onReorder)(index, targetIndex);
      activeIndexSV.value = -1;
      activeDYSV.value = 0;
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: ITEM_HEIGHT,
      }, animStyle]}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Palette.butterDeep, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>{index + 1}</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '600', color: textColor }}>{name}</Text>
        <SymbolView name="line.3.horizontal" size={18} tintColor={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'} resizeMode="scaleAspectFit" />
      </Animated.View>
    </GestureDetector>
  );
}

export default function DimWhScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [playerList] = useStorage<Player[]>('diminishing-whist-players', []);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderedPlayers, setOrderedPlayers] = useState<string[]>([]);

  const activeIndexSV = useSharedValue(-1);
  const activeDYSV = useSharedValue(0);

  const handleReorder = (from: number, to: number) => {
    setOrderedPlayers(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

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
    selectedIds.forEach((id) => diminishingWhistPlayers.remove(id));
    setSelectedIds(new Set());
    setEditMode(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={{ flex: 1, experimental_backgroundImage: gradient[colorScheme ?? 'light'] } as any}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
              hitSlop={8}
            >
              <SymbolView name="chevron.left" size={28} tintColor="rgba(255,255,255,0.8)" resizeMode="scaleAspectFit" weight="semibold" />
            </Pressable>
            <Text style={{ flex: 1, fontSize: 28, fontWeight: '700', color: 'white', textAlign: 'center' }}>
              Diminishing Whist
            </Text>
            <SettingsMenu />
          </View>

          {/* Body */}
          <View style={{ flex: 1 }}>
            {/* Top 2/3 — content */}
            <View style={{
              flex: 2,
              justifyContent: playerList.length === 0 ? 'center' : 'flex-start',
              paddingHorizontal: 24,
              paddingTop: playerList.length === 0 ? 0 : 16,
              gap: 16,
            }}>
              {playerList.length === 0 ? (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, borderCurve: 'continuous', padding: 36, alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                    <SymbolView name="person.badge.plus" size={36} tintColor={Palette.butterDeep} resizeMode="scaleAspectFit" />
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', textAlign: 'center', marginTop: 4 }}>
                    No Players Yet
                  </Text>
                  <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
                    Add players to get started with your game
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 24 }}>
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
                      <Text style={{ fontSize: 14, fontWeight: '500', color: 'white' }}>
                        {editMode ? 'Done' : 'Edit'}
                      </Text>
                    </Pressable>
                  </View>
                  {Array.from(
                    { length: Math.ceil(playerList.length / 2) },
                    (_, i) => playerList.slice(i * 2, i * 2 + 2),
                  ).map((pair, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: 'row', gap: 10 }}>
                      {pair.map((player) => {
                        const index = playerList.findIndex((p) => p.id === player.id);
                        const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
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
                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <SymbolView
                                name={isSelected ? 'checkmark' : 'person.fill'}
                                size={16}
                                tintColor="white"
                                resizeMode="scaleAspectFit"
                                weight="semibold"
                              />
                            </View>
                            <Text
                              style={{ fontSize: 15, fontWeight: '600', color: colorScheme === 'dark' ? 'white' : '#1C1C1E', flexShrink: 1 }}
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
            <View style={{ flex: 1, justifyContent: 'flex-start', paddingHorizontal: 24, paddingTop: 8 }}>
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
                  <SymbolView name="trash" size={22} tintColor={Palette.blushDeep} resizeMode="scaleAspectFit" />
                  <Text style={{ fontSize: 17, fontWeight: '600', color: Palette.blushDeep }}>Delete Players</Text>
                </Pressable>
              ) : selectedIds.size >= 2 ? (
                <Pressable
                  onPress={() => {
                    const allPlayers = diminishingWhistPlayers.getAll();
                    const names = [...selectedIds]
                      .map(id => allPlayers.find(p => p.id === id)?.name)
                      .filter(Boolean) as string[];
                    setOrderedPlayers(names);
                    setShowOrderModal(true);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    backgroundColor: Palette.butterDeep,
                    borderRadius: 999,
                    paddingVertical: 18,
                    opacity: pressed ? 0.85 : 1,
                    boxShadow: '0 4px 16px rgba(212,188,90,0.4)',
                  })}
                >
                  <SymbolView name="play.fill" size={20} tintColor="white" resizeMode="scaleAspectFit" />
                  <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }}>Begin Game</Text>
                </Pressable>
              ) : (
                <View style={{ gap: 12 }}>
                  <Pressable
                    onPress={() => router.push('/(tabs)/diminishing-whist/add-player')}
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
                    <SymbolView name="plus.circle" size={22} tintColor={Palette.butterDeep} resizeMode="scaleAspectFit" />
                    <Text style={{ fontSize: 17, fontWeight: '600', color: Palette.butterDeep }}>Add Players</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push('/(tabs)/diminishing-whist/statistics')}
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

      {/* Player order modal */}
      <Modal visible={showOrderModal} transparent animationType="slide" onRequestClose={() => setShowOrderModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={() => setShowOrderModal(false)} />
        <View style={{
          backgroundColor: isDark ? '#1C1C1E' : 'white',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 40,
          gap: 16,
        }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(120,120,128,0.3)', alignSelf: 'center', marginBottom: 4 }} />

          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' }}>Player Order</Text>
          <Text style={{ fontSize: 14, color: colors.subtext, textAlign: 'center', marginTop: -8 }}>
            Drag to set order — dealer first, then clockwise
          </Text>

          <View style={{ gap: ITEM_GAP }}>
            {orderedPlayers.map((name, i) => (
              <DraggableItem
                key={name}
                name={name}
                index={i}
                total={orderedPlayers.length}
                activeIndexSV={activeIndexSV}
                activeDYSV={activeDYSV}
                onReorder={handleReorder}
                isDark={isDark}
                textColor={colors.text}
              />
            ))}
          </View>

          <Pressable
            onPress={() => {
              setShowOrderModal(false);
              router.push({
                pathname: '/(tabs)/diminishing-whist/game',
                params: { playerNames: JSON.stringify(orderedPlayers) },
              });
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: Palette.butterDeep,
              borderRadius: 999,
              paddingVertical: 18,
              marginTop: 4,
              opacity: pressed ? 0.85 : 1,
              boxShadow: '0 4px 16px rgba(212,188,90,0.4)',
            })}
          >
            <SymbolView name="play.fill" size={20} tintColor="white" resizeMode="scaleAspectFit" />
            <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }}>Start Game</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
