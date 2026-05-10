import { View, Text } from 'react-native';
import { PHASE_SEGMENTS, getSegmentTiles } from '@/constants/phases';

const DEFAULT_TILE_SIZE = 18;
const TILE_RADIUS = 3;

export function PhaseDisplay({ phase, tileSize = DEFAULT_TILE_SIZE, colorScheme }: { phase: number; tileSize?: number; colorScheme?: 'light' | 'dark' | null }) {
  const segments = PHASE_SEGMENTS[phase];
  if (!segments) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      {segments.map((seg, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {i > 0 && (
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>+</Text>
          )}
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {getSegmentTiles(seg).map((letter, j) =>
              seg.type === 'color' ? (
                <View
                  key={j}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    backgroundColor: '#B44FBF',
                    borderRadius: TILE_RADIUS,
                  }}
                />
              ) : (
                <View
                  key={j}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    backgroundColor: colorScheme === 'light' ? '#E0D8F0' : 'white',
                    borderRadius: TILE_RADIUS,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: tileSize * 0.55, fontWeight: '800', color: '#3D3530' }}>{letter}</Text>
                </View>
              )
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
