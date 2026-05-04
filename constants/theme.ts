import { Platform } from 'react-native';

export const Palette = {
  sage: '#A8C5A0',
  sageDeep: '#7DAF73',
  blush: '#F2A7A7',
  blushDeep: '#E07C7C',
  periwinkle: '#A9B8E8',
  lavender: '#C9B8E8',
  butter: '#F0DC8C',
  butterDeep: '#D4BC5A',
  mint: '#A8DDD4',
  peach: '#F5C4A0',
};

export const Colors = {
  light: {
    bg: '#F7F4EF',
    card: '#FFFFFF',
    border: '#E4DDD3',
    text: '#3D3530',
    subtext: '#8C7E75',
    background: '#F7F4EF',
    tint: Palette.lavender,
    icon: '#8C7E75',
    tabIconDefault: '#8C7E75',
    tabIconSelected: Palette.lavender,
  },
  dark: {
    bg: '#1E1E2A',
    card: '#2A2A3A',
    border: '#383850',
    text: '#EDE8E3',
    subtext: '#8A8AA8',
    background: '#1E1E2A',
    tint: Palette.lavender,
    icon: '#8A8AA8',
    tabIconDefault: '#8A8AA8',
    tabIconSelected: Palette.lavender,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
