import { useState } from 'react';
import { Modal, Pressable, Switch, Text, View, Appearance } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export function SettingsMenu() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [keepAwake, setKeepAwake] = useState(false);

  const toggleKeepAwake = async (value: boolean) => {
    setKeepAwake(value);
    if (value) {
      await activateKeepAwakeAsync('settings');
    } else {
      deactivateKeepAwake('settings');
    }
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
        hitSlop={8}
      >
        <SymbolView
          name="gearshape.fill"
          size={32}
          tintColor={colors.subtext}
          resizeMode="scaleAspectFit"
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          <Pressable
            style={{
              position: 'absolute',
              top: insets.top + 56,
              right: 16,
              backgroundColor: colors.card,
              borderRadius: 14,
              borderCurve: 'continuous',
              padding: 16,
              width: 230,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: colors.text }}>Dark Mode</Text>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={(v) => Appearance.setColorScheme(v ? 'dark' : 'light')}
                trackColor={{ true: Palette.lavender }}
              />
            </View>
            <View style={{ height: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', marginVertical: 12 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: colors.text }}>Keep Screen On</Text>
              <Switch
                value={keepAwake}
                onValueChange={toggleKeepAwake}
                trackColor={{ true: Palette.lavender }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
