import type { Href } from 'expo-router';

type MenuItem = {
  title: string;
  href: Href;
  image: number;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Forums',
    href: '/home',
    image: require('../app/assets/images/bg.png'),
  },
  {
    title: 'Report',
    href: '/form',
    image: require('../app/assets/images/report.png'),
  },
  {
    title: 'Heatmap',
    href: '/heatmap',
    image: require('../app/assets/images/heatmap.png'),
  },
  {
    title: 'Games',
    href: '/games',
    image: require('../app/assets/images/games.png'),
  },
  {
    title: 'Achievements',
    href: '/achievements' as Href,
    image: require('../app/assets/images/achievements.png'),
  },
  {
    title: 'Settings',
    href: '/settings',
    image: require('../app/assets/images/settings.png'),
  },
];
