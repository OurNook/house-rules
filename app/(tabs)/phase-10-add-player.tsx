import { useState } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { players as playerStore } from '@/utils/players';

const gradient = {
  light: 'linear-gradient(160deg, #C9B8E8 0%, #A9B8E8 55%, #A8DDD4 100%)',
  dark:  'linear-gradient(160deg, #2A1F3D 0%, #1F2A3D 55%, #1A2D2A 100%)',
};

const MAX_LENGTH = 10;

export default function Phase10AddPlayerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      playerStore.add(name.trim());
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, experimental_backgroundImage: gradient[colorScheme ?? 'light'] } as any}>
        <SafeAreaView style={{ flex: 1 }}>

          {/* Header */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 16,
              paddingVertical: 12,
              opacity: pressed ? 0.5 : 1,
              alignSelf: 'flex-start',
            })}
          >
            <SymbolView name="chevron.left" size={20} tintColor="rgba(255,255,255,0.85)" resizeMode="scaleAspectFit" weight="semibold" />
            <Text style={{ fontSize: 17, fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>Add Player</Text>
          </Pressable>

          {/* Body */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 16 }}
          >

            {/* Card */}
            <View style={{
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.88)',
              borderRadius: 24,
              borderCurve: 'continuous',
              padding: 28,
              alignItems: 'center',
              gap: 16,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: Palette.blush,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SymbolView name="person.badge.plus" size={36} tintColor="white" resizeMode="scaleAspectFit" />
              </View>

              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>New Player</Text>
                <Text style={{ fontSize: 14, color: colors.subtext }}>Enter player name to continue</Text>
              </View>

              <View style={{ width: '100%', gap: 6 }}>
                <TextInput
                  value={name}
                  onChangeText={(t) => setName(t.slice(0, MAX_LENGTH))}
                  placeholder="Enter Player Name"
                  placeholderTextColor={colors.subtext}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                  style={{
                    width: '100%',
                    backgroundColor: colors.bg,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
                <Text style={{ alignSelf: 'flex-end', fontSize: 13, color: colors.subtext }}>
                  {name.length} / {MAX_LENGTH} characters
                </Text>
              </View>

              <Pressable
                onPress={handleSave}
                style={({ pressed }) => ({
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: Palette.blush,
                  borderRadius: 999,
                  paddingVertical: 16,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <SymbolView name="checkmark.circle" size={20} tintColor="white" resizeMode="scaleAspectFit" />
                <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Save Player</Text>
              </Pressable>
            </View>

            <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
              Add players to your game roster
            </Text>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}
