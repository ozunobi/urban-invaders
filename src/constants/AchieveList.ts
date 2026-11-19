import type { SymbolViewProps } from 'expo-symbols';

export function getAchievements(reportCount: number, postCount: number, gameCount: number) {
  return [
    { title: 'First Sighting', description: 'Share your first wildlife sighting.', icon: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' } satisfies SymbolViewProps['name'], count: reportCount, target: 1, unit: 'sightings reported' },
    { title: 'Conversation Starter', description: 'Create your first forum post.', icon: { ios: 'bubble.left.and.bubble.right.fill', android: 'forum', web: 'forum' } satisfies SymbolViewProps['name'], count: postCount, target: 1, unit: 'forum posts' },
    { title: 'Game on', description: 'Complete a game.', icon: { ios: 'gamecontroller.fill', android: 'sports_esports', web: 'sports_esports' } satisfies SymbolViewProps['name'], count: gameCount, target: 1, unit: 'games completed' },
    { title: 'Local Spotter', description: 'Share 10 wildlife sightings.', icon: { ios: 'mappin.circle.fill', android: 'location_on', web: 'location_on' } satisfies SymbolViewProps['name'], count: reportCount, target: 10, unit: 'sightings reported' },
    { title: 'Weekly Explorer', description: 'Complete both games.', icon: { ios: 'safari.fill', android: 'explore', web: 'explore' } satisfies SymbolViewProps['name'], count: gameCount, target: 2, unit: 'games completed' },
  ].map((achievement) => ({
    ...achievement,
    earned: achievement.count >= achievement.target,
    progress: Math.min(achievement.count / achievement.target, 1),
    progressLabel: `${Math.min(achievement.count, achievement.target)} / ${achievement.target} ${achievement.unit}`,
  }));
}