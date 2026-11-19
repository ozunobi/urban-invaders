// Language translations for English and Filipino

export type Language = 'en' | 'fil';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Menu
    'menu.home': 'Forums',
    'menu.report': 'Report',
    'menu.heatmap': 'Heatmap',
    'menu.games': 'Games',
    'menu.achievements': 'Achievements',
    'menu.settings': 'Settings',
    'menu.hello': 'Hello',
    'menu.menu': 'MENU',

    // Settings
    'settings.account': 'Account',
    'settings.profile_details': 'Profile Details',
    'settings.change_password': 'Change Password',
    'settings.achievements': 'Achievements',
    'settings.view_achievements': 'View Achievements',
    'settings.language': 'Language',
    'settings.language_settings': 'Language Settings',
    'settings.privacy': 'Privacy',
    'settings.privacy_settings': 'Privacy Settings',
    'settings.location_permission': 'Location Permission',
    'settings.location_permission_title': 'Location Permission',
    'settings.location_on': 'ON',
    'settings.location_off': 'OFF',
    'settings.location_description': 'Allow the app to access your location for sighting reports and mapping.',
    'settings.location_enabled': 'Location permission is enabled',
    'settings.location_disabled': 'Location permission is disabled',
    'settings.log_out': 'LOG OUT',
    'settings.logging_out': 'LOGGING OUT...',
    'settings.language_changed': 'Language changed to English',
    'settings.delete_account': 'Delete Account',
    'settings.delete_account_title': 'Delete Account',
    'settings.delete_account_warning': 'This will permanently delete your account and all your data including posts, comments, sightings, games, and achievements. This action cannot be undone.',
    'settings.deleting_account': 'DELETING ACCOUNT...',
    'settings.confirm_delete_account': 'Yes, Delete My Account',

    // Language Selection
    'language.select': 'Select Language',
    'language.english': 'English',
    'language.filipino': 'Filipino',
    'language.current': 'Current: English',

    // Footer Navigation
    'footer.home': 'HOME',
    'footer.settings': 'SETTINGS',
    'footer.report': 'REPORT',
    'footer.map': 'MAP',
    'footer.notifications': 'NOTIFICATIONS',

    // Buttons
    'button.close': 'Close',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.submit': 'Submit',
    'button.delete': 'Delete',
    'button.confirm_delete': 'Confirm Delete',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.new_post': 'New Post',
    'common.text_post': 'Text Post',
    'common.image_post': 'Image Post',
    'common.choose_image': 'Choose Image',
    'common.change_image': 'Change Image',
    'common.comments': 'Comments',
    'common.hide_comments': 'Hide Comments',
    'common.no_comments': 'No comments yet.',
    'forum.delete_post': 'Delete Post',
    'forum.delete_confirmation': 'Are you sure you want to delete this post? This action cannot be undone.',
    'forum.post_deleted': 'Post deleted successfully',
    
    // Achievements
    'achievement.first_sighting': 'First Sighting',
    'achievement.conversation_starter': 'Conversation Starter',
    'achievement.game_on': 'Game on',
    'achievement.local_spotter': 'Local Spotter',
    'achievement.weekly_explorer': 'Weekly Explorer',
    'achievement.unlocked': 'Achievement Unlocked!',
  },
  fil: {
    // Navigation & Menu
    'menu.home': 'Forum',
    'menu.report': 'Ibalita',
    'menu.heatmap': 'Mapa',
    'menu.games': 'Laro',
    'menu.achievements': 'Achievements',
    'menu.settings': 'Mga Setting',
    'menu.hello': 'Magandang Araw',
    'menu.menu': 'MENU',

    // Settings
    'settings.account': 'Account',
    'settings.profile_details': 'Detalye ng Profile',
    'settings.change_password': 'Baguhin ang Password',
    'settings.achievements': 'Achievements',
    'settings.view_achievements': 'Tingnan ang Achievements',
    'settings.language': 'Wika',
    'settings.language_settings': 'Setting ng Wika',
    'settings.privacy': 'Privacy',
    'settings.privacy_settings': 'Setting ng Privacy',
    'settings.location_permission': 'Pahintulot sa Lokasyon',
    'settings.location_permission_title': 'Pahintulot sa Lokasyon',
    'settings.location_on': 'ON',
    'settings.location_off': 'OFF',
    'settings.location_description': 'Payagan ang app na i-access ang iyong lokasyon para sa mga ulat ng sighting at mapping.',
    'settings.location_enabled': 'Ang pahintulot sa lokasyon ay naka-enable',
    'settings.location_disabled': 'Ang pahintulot sa lokasyon ay naka-disable',
    'settings.log_out': 'MAGLOG OUT',
    'settings.logging_out': 'NAGLOG OUT...',
    'settings.language_changed': 'Binago ang wika sa Filipino',
    'settings.delete_account': 'Tanggalin ang Account',
    'settings.delete_account_title': 'Tanggalin ang Account',
    'settings.delete_account_warning': 'Ito ay permanent na tatanggalin ang iyong account at lahat ng iyong data kasama ang mga posts, comments, sightings, games, at achievements. Ang aksyon na ito ay hindi mababawi.',
    'settings.deleting_account': 'NAGTA-TANGGAL NG ACCOUNT...',
    'settings.confirm_delete_account': 'Oo, Tanggalin ang Aking Account',

    // Language Selection
    'language.select': 'Pumili ng Wika',
    'language.english': 'English',
    'language.filipino': 'Filipino',
    'language.current': 'Kasalukuyan: Filipino',

    // Footer Navigation
    'footer.home': 'HOME',
    'footer.settings': 'SETTINGS',
    'footer.report': 'IBALITA',
    'footer.map': 'MAPA',
    'footer.notifications': 'NOTIPIKASYON',

    // Buttons
    'button.close': 'Isara',
    'button.save': 'I-save',
    'button.cancel': 'Kanselahin',
    'button.submit': 'Ipadala',
    'button.delete': 'Tanggalin',
    'button.confirm_delete': 'I-confirm ang Pagtanggal',

    // Common
    'common.loading': 'Nag-loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.new_post': 'Bagong Post',
    'common.text_post': 'Text Post',
    'common.image_post': 'Image Post',
    'common.choose_image': 'Pumili ng Image',
    'common.change_image': 'Baguhin ang Image',
    'common.comments': 'Comments',
    'common.hide_comments': 'Itago ang Comments',
    'common.no_comments': 'Walang comments pa.',
    'forum.delete_post': 'Tanggalin ang Post',
    'forum.delete_confirmation': 'Sigurado ka ba na gusto mong i-delete ang post na ito? Ang aksyon na ito ay hindi mababawi.',
    'forum.post_deleted': 'Successfully deleted ang post',
    
    // Achievements
    'achievement.first_sighting': 'Unang Sighting',
    'achievement.conversation_starter': 'Conversation Starter',
    'achievement.game_on': 'Game on',
    'achievement.local_spotter': 'Local Spotter',
    'achievement.weekly_explorer': 'Weekly Explorer',
    'achievement.unlocked': 'Achievement Unlocked!',
  },
};

export function getTranslation(language: Language, key: string): string {
  return TRANSLATIONS[language][key] || key;
}
