const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFF7F0',
    headerBackground: '#EC6425',
    tint: tintColorLight,
    icon: '#201C18',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    headerBackground: '#EC6425',
    tint: tintColorDark,
    icon: '#ffffff',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export type ThemeColors = typeof Colors.light;

export default Colors;
