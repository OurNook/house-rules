import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStorage } from '@/hooks/use-storage';
import { Palette } from '@/constants/theme';
import type { Player } from '@/types/player';

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

export default function SkyjoStatisticsScreen() {
  const colorScheme = useColorScheme();
  const [playerList] = useStorage<Player[]>('skyjo-players', []);

  const sorted = [...playerList].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, experimental_backgroundImage: gradient[colorScheme ?? 'light'] } as any}>
        <SafeAreaView style={{ flex: 1 }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })} hitSlop={8}>
              <SymbolView name="chevron.left" size={28} tintColor="rgba(255,255,255,0.8)" resizeMode="scaleAspectFit" weight="semibold" />
            </Pressable>
            <Text style={{ flex: 1, fontSize: 34, fontWeight: '700', color: 'white', textAlign: 'center' }}>Statistics</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Player list */}
          <View style={{ paddingHorizontal: 24, paddingTop: 32, gap: 12 }}>
            {sorted.length === 0 ? (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, borderCurve: 'continuous', padding: 36, alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', textAlign: 'center' }}>No players yet</Text>
                <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Add players and play some games to see stats here</Text>
              </View>
            ) : (
              sorted.map((player, index) => {
                const originalIndex = playerList.findIndex(p => p.id === player.id);
                const color = PLAYER_COLORS[originalIndex % PLAYER_COLORS.length];
                return (
                  <View
                    key={player.id}
                    style={{
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
                      borderRadius: 20,
                      borderCurve: 'continuous',
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }}>{index + 1}</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', color: colorScheme === 'dark' ? 'white' : '#1C1C1E' }}>{player.name}</Text>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={{ fontSize: 22, fontWeight: '700', color: colorScheme === 'dark' ? 'white' : '#1C1C1E', fontVariant: ['tabular-nums'] }}>{player.wins ?? 0}</Text>
                      <Text style={{ fontSize: 12, color: colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : '#8E8E93', fontWeight: '500' }}>{(player.wins ?? 0) === 1 ? 'win' : 'wins'}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

        </SafeAreaView>
      </View>
    </>
  );
}
