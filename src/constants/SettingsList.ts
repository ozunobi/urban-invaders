export const SETTINGS_ITEMS = [
  {
    title: 'Account',
    items: [
    { id: 1, title: 'Profile Details', icon: { android: 'person', web: 'person' }, href: '/profile' },
    { id: 2, title: 'Change Password', icon: { android: 'lock', web: 'lock' }, href: '/change-password' }
    ],
  },
  {
    title: 'Achievements',
    items: [
      { id: 3, title: 'View Achievements', icon: { android: 'emoji_events', web: 'emoji_events' }, href: '/achievements' }
    ],
  },
  {
    title: 'Language',
    items: [
      { id: 4, title: 'Language Settings', icon: { android: 'language', web: 'language' }, href: '/language-settings' }
    ],
  },
  {
    title: 'Privacy',
    items: [
      { id: 5, title: 'Privacy Settings', icon: { android: 'location_on', web: 'location_on' }, href: '/privacy-settings' }
    ],
  }
  
];
