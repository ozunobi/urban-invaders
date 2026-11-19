import type { Href } from 'expo-router';
import { type SymbolViewProps } from 'expo-symbols';

export const PROFILE_ACHIEVEMENTS: {
  title: string;
  icon: SymbolViewProps['name'];
  href: Href;
}[] = [
  {
    title: 'Forums',
    icon: { android: 'forum', web: 'forum' },
    href: '/home',
  },
  {
    title: 'Report',
    icon: { android: 'add_a_photo', web: 'add_a_photo' },
    href: '/form',
  },
  {
    title: 'Notifications',
    icon: { android: 'notifications', web: 'notifications' },
    href: '/notification',
  },
  {
    title: 'Settings',
    icon: { android: 'settings', web: 'settings' },
    href: '/settings',
  },
];