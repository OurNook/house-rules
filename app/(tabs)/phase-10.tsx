import { ScrollView, Text, Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { SettingsMenu } from '@/components/settings-menu';

const gradient = {
  light: 'linear-gradient(160deg, #C9B8E8 0%, #A9B8E8 55%, #A8DDD4 100%)',
  dark:  'linear-gradient(160deg, #2A1F3D 0%, #1F2A3D 55%, #1A2D2A 100%)',
};

export default function Phase10Screen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View
        style={{
          flex: 1,
          experimental_backgroundImage: gradient[colorScheme ?? 'light'],
        } as any}
      >
        <SafeAreaView style={{ flex: 1 }}>
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
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
              hitSlop={8}
            >
              <SymbolView
                name="chevron.left"
                size={28}
                tintColor={colors.subtext}
                resizeMode="scaleAspectFit"
                weight="semibold"
              />
            </Pressable>
            <Text
              style={{
                flex: 1,
                fontSize: 34,
                fontWeight: '700',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Phase 10
            </Text>
            <SettingsMenu />
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }} />
        </SafeAreaView>
      </View>
    </>
  );
}
