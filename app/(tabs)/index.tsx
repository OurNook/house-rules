import { ScrollView, Text, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { SettingsMenu } from '@/components/settings-menu';

export default function GamesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        <Text style={{ fontSize: 34, fontWeight: '700', color: colors.text }}>Games</Text>
        <SettingsMenu />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: Palette.periwinkle,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 20,
            opacity: pressed ? 0.85 : 1,
            boxShadow: '0 2px 8px rgba(169, 184, 232, 0.4)',
          })}
          onPress={() => router.push('/(tabs)/phase-10')}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#3D3530' }}>Phase 10</Text>
          <Text style={{ fontSize: 13, color: '#3D3530', opacity: 0.65, marginTop: 4 }}>
            Card Game
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: Palette.mint,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 20,
            opacity: pressed ? 0.85 : 1,
            boxShadow: '0 2px 8px rgba(168, 221, 212, 0.4)',
          })}
          onPress={() => router.push('/(tabs)/skyjo')}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#3D3530' }}>Skyjo</Text>
          <Text style={{ fontSize: 13, color: '#3D3530', opacity: 0.65, marginTop: 4 }}>
            Card Game
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: Palette.butter,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 20,
            opacity: pressed ? 0.85 : 1,
            boxShadow: '0 2px 8px rgba(240, 220, 140, 0.4)',
          })}
          onPress={() => router.push('/(tabs)/diminishing-whist')}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#3D3530' }}>Diminishing Whist</Text>
          <Text style={{ fontSize: 13, color: '#3D3530', opacity: 0.65, marginTop: 4 }}>
            Card Game
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
