import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';

export default function LandingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 52 }}>
        <Image
          source={require('@/assets/house-rules-logo.svg')}
          style={{ width: 280, height: 280 }}
          contentFit="contain"
        />
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: Palette.lavender,
            paddingVertical: 18,
            paddingHorizontal: 56,
            borderRadius: 999,
            opacity: pressed ? 0.8 : 1,
            boxShadow: '0 4px 16px rgba(201, 184, 232, 0.5)',
          })}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={{ color: '#3D3530', fontSize: 20, fontWeight: '600', letterSpacing: 0.3 }}>
            Let's Play!
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
