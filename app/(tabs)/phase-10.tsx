import { View, Text, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Palette } from '@/constants/theme';
import { SettingsMenu } from '@/components/settings-menu';
import { useStorage } from '@/hooks/use-storage';
import type { Player } from '@/types/player';

const gradient = {
  light: 'linear-gradient(160deg, #C9B8E8 0%, #A9B8E8 55%, #A8DDD4 100%)',
  dark:  'linear-gradient(160deg, #2A1F3D 0%, #1F2A3D 55%, #1A2D2A 100%)',
};

export default function Phase10Screen() {
  const colorScheme = useColorScheme();
  const [playerList] = useStorage<Player[]>('players', []);

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

          {/* Body */}
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 16 }}>

            {/* Empty state card */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 24,
              borderCurve: 'continuous',
              padding: 36,
              alignItems: 'center',
              gap: 12,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SymbolView name="person.badge.plus" size={36} tintColor={Palette.periwinkle} resizeMode="scaleAspectFit" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', textAlign: 'center', marginTop: 4 }}>
                {playerList.length === 0 ? 'No Players Yet' : `${playerList.length} Player${playerList.length !== 1 ? 's' : ''}`}
              </Text>
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
                {playerList.length === 0
                  ? 'Add players to get started with your game'
                  : playerList.map((p) => p.name).join(', ')}
              </Text>
            </View>

            {/* Add Players button */}
            <Pressable
              onPress={() => router.push('/(tabs)/phase-10-add-player')}
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
              <SymbolView name="plus.circle" size={22} tintColor={Palette.periwinkle} resizeMode="scaleAspectFit" />
              <Text style={{ fontSize: 17, fontWeight: '600', color: Palette.periwinkle }}>Add Players</Text>
            </Pressable>

          </View>
        </SafeAreaView>
      </View>
    </>
  );
}
