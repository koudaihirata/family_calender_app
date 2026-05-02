/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#F07828';
const tintColorDark = '#F07828';

export const Colors = {
  light: {
    text: '#3D2B1F',
    background: '#FFF8F2',
    tint: tintColorLight,
    icon: '#A07858',
    tabIconDefault: '#C4A898',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#3D2B1F',
    background: '#FFF8F2',
    tint: tintColorDark,
    icon: '#A07858',
    tabIconDefault: '#C4A898',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  // Backgrounds
  background: '#FFF8F2',    // 薄橙ベース（画面背景）
  cardBackground: '#FFFFFF', // カード背景

  headerLight: '#FFE8CC',   // 薄橙（ヘッダー明）
  headerDark: '#C4956A',    // 明るい茶色（ヘッダー暗）

  // Text
  textPrimary: '#3D2B1F',   // 濃い茶色（主要テキスト）
  textSecondary: '#A07858', // 中間茶色（補助テキスト）
  textLight: '#5C3D2E',     // 茶色（カード内テキスト）
  textMuted: '#C4A898',     // 薄い茶色（ミュートテキスト）

  // Brand
  primary: '#F07828',                       // アクセント橙
  primaryMuted: 'rgba(240, 120, 40, 0.12)', // 選択日の背景
  subColor: '#C4956A',                      // サブカラー（明るい茶色）

  fallbackEventColor: '#C4A898',
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
