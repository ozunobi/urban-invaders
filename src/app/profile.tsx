import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View,} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useClerk } from '@clerk/expo';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import { useAppData } from '../components/AppDataContext';
import { useLanguage } from '../components/LanguageContext';
import type { ForumPost } from '../constants/Forum';
import { getAchievements } from '../constants/AchieveList';

export default function Profile() {
  const { profile, updateProfile, posts, userId, reports, games, deleteAccount } = useAppData();
  const { signOut } = useClerk();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(theme, isDark);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draftUsername, setDraftUsername] = useState(profile.username);
  const [draftAbout, setDraftAbout] = useState(profile.about);
  const [draftAvatarUri, setDraftAvatarUri] = useState(profile.avatarUri);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const userPosts = useMemo(
    () => posts.filter((post) => post.userId === userId),
    [posts, userId],
  );
  const achievements = getAchievements(reports.filter((report) => report.user_id === userId).length, userPosts.length, Object.values(games).filter((game) => game.completed).length);

  const openEditor = () => {
    setDraftUsername(profile.username);
    setDraftAbout(profile.about);
    setDraftAvatarUri(profile.avatarUri);
    setIsEditOpen(true);
  };

  const chooseProfilePhoto = async () => {
    setProfileError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        setDraftAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Unable to choose a profile photo.',
      );
    }
  };

  const saveProfile = async () => {
    const username = draftUsername.trim();
    if (!username) {
      setProfileError('A display name is required.');
      return;
    }

    setIsSaving(true);
    setProfileError('');

    try {
      await updateProfile({
        ...profile,
        username,
        about: draftAbout.trim(),
        avatarUri: draftAvatarUri,
      });

      setIsEditOpen(false);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Unable to save your profile.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setProfileError('');
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Unable to sign out. Please try again.',
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);
    setProfileError('');
    try {
      await deleteAccount();
      await signOut();
      router.replace('/');
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Unable to delete account. Please try again.',
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <FlatList<ForumPost>
        data={userPosts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                {profile.avatarUri ? (
                  <Image
                    source={{ uri: profile.avatarUri }}
                    contentFit="cover"
                    style={styles.avatarImage}
                  />
                ) : (
                  <SymbolView
                    name={{ android: 'person', web: 'person' }}
                    size={56}
                    tintColor="#fff"
                  />
                )}
              </View>
              <Text style={styles.username}>{profile.username}</Text>
              {profile.emailAddress ? (
                <Text style={styles.emailAddress}>{profile.emailAddress}</Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={openEditor}
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.editButtonText}>EDIT PROFILE</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleSignOut}
                style={styles.signOutButton}
              >
                <Text style={styles.signOutButtonText}>SIGN OUT</Text>
              </Pressable>
              {profileError ? (
                <Text style={styles.errorText}>{profileError}</Text>
              ) : null}
            </View>

            <View style={styles.achievementSection}>
              <View style={styles.achievementHeading}>
                <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
                <Text style={styles.achievementCount}>
                  {achievements.filter((achievement) => achievement.earned).length} /{' '}
                  {achievements.length} unlocked
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.achievementList}
              >
                {achievements.map((achievement) => (
                  <View
                    key={achievement.title}
                    style={styles.achievementCard}
                  >
                    <View style={styles.achievementIcon}>
                      <SymbolView
                        name={achievement.icon}
                        size={28}
                        tintColor={achievement.earned ? '#006A63' : isDark ? '#B9B2AD' : '#766F69'}
                      />
                      <View
                        style={[
                          styles.achievementStatus,
                          achievement.earned
                            ? styles.earnedStatus
                            : styles.lockedStatus,
                        ]}
                      >
                        <SymbolView
                          name={
                            achievement.earned
                              ? { android: 'check', web: 'check' }
                              : { android: 'lock', web: 'lock' }
                          }
                          size={12}
                          tintColor="#fff"
                        />
                      </View>
                    </View>
                    <Text numberOfLines={2} style={styles.achievementTitle}>
                      {achievement.title}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.achievementProgress}
                    >
                      {achievement.progressLabel}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.sectionTitle}>ABOUT</Text>
              <Text style={styles.aboutText}>
                {profile.about || 'No bio yet. Tap Edit Profile to add one.'}
              </Text>
            </View>
          </View>
        }

        ListEmptyComponent={
          <Text style={styles.emptyPosts}>You haven’t made any forum posts yet.</Text>
        }
        renderItem={({ item }) => <ProfilePost post={item} styles={styles} />}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setIsEditOpen(false)}
        transparent
        visible={isEditOpen}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close profile editor"
            onPress={() => setIsEditOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Pressable
              accessibilityRole="button"
              onPress={chooseProfilePhoto}
              style={styles.photoButton}
            >
              <Text style={styles.photoButtonText}>CHANGE PROFILE PHOTO</Text>
            </Pressable>
            <Text style={styles.emailAddress}>{profile.emailAddress}</Text>
            <TextInput
              accessibilityLabel="Display name"
              autoCapitalize="none"
              onChangeText={setDraftUsername}
              placeholder="Display name"
              placeholderTextColor={styles.placeholder.color}
              style={styles.input}
              value={draftUsername}
            />
            <TextInput
              accessibilityLabel="About you"
              multiline
              onChangeText={setDraftAbout}
              placeholder="Tell people about yourself"
              placeholderTextColor={styles.placeholder.color}
              style={styles.aboutInput}
              textAlignVertical="top"
              value={draftAbout}
            />
            {profileError ? (
              <Text style={styles.errorText}>{profileError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsEditOpen(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!draftUsername.trim() || isSaving}
                onPress={saveProfile}
                style={[
                  styles.saveButton,
                  (!draftUsername.trim() || isSaving) && styles.disabledButton,
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'SAVING...' : 'SAVE'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.deleteAccountSection}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeletingAccount}
                onPress={() => setShowDeleteConfirm(true)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>{t('settings.delete_account').toUpperCase()}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>{t('settings.delete_account_title')}</Text>
            <Text style={styles.deleteModalMessage}>{t('settings.delete_account_warning')}</Text>
            <View style={styles.deleteModalButtons}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeletingAccount}
                onPress={() => setShowDeleteConfirm(false)}
                style={[styles.deleteModalButton, styles.deleteCancelButton]}
              >
                <Text style={styles.deleteCancelButtonText}>{t('button.cancel').toUpperCase()}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isDeletingAccount}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteAccount();
                }}
                style={[styles.deleteModalButton, styles.deleteConfirmButton]}
              >
                <Text style={styles.deleteConfirmButtonText}>{isDeletingAccount ? t('settings.deleting_account') : t('settings.confirm_delete_account')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ProfilePost({
  post,
  styles,
}: {
  post: ForumPost;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.postCard}>
      {post.type === 'image' && (
        <Image
          source={
            typeof post.imageUri === 'string'
              ? { uri: post.imageUri }
              : post.imageUri
          }
          contentFit="cover"
          style={styles.postImage}
        />
      )}
      <View style={styles.postContent}>
        <View style={styles.postDetails}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
        <Text style={styles.postTitle}>{post.title}</Text>
        {post.body.length > 0 && (
          <Text style={styles.postBody}>{post.body}</Text>
        )}
        <Text style={styles.commentCount}>COMMENTS ({post.comments.length})</Text>
      </View>
    </View>
  );
}

function createStyles(theme: typeof Colors.light, isDark: boolean) {
  const secondaryText = isDark ? '#bbb' : '#666';

  return StyleSheet.create({
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 28,
      gap: 12,
      backgroundColor: theme.background,
    },
    profileHeader: {
      alignItems: 'center',
      paddingTop: 28,
      paddingBottom: 18,
      gap: 12,
    },
    avatar: {
      width: 116,
      height: 116,
      borderRadius: 58,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#006A63',
      borderWidth: 3,
      borderColor: '#EC6425',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    username: {
      color: theme.text,
      fontFamily: 'PPMoriBold',
      fontSize: 22,
    },
    emailAddress: {
      color: secondaryText,
      fontFamily: 'PPMori',
      fontSize: 14,
    },
    editButton: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 22,
      borderRadius: 20,
      backgroundColor: '#006A63',
    },
    editButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    signOutButton: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 22,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#006A63',
    },
    signOutButtonText: {
      color: theme.text,
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    achievementSection: {
      marginTop: 8,
    },
    achievementHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    achievementCount: {
      color: secondaryText,
      fontSize: 12,
    },
    achievementList: {
      gap: 12,
      paddingVertical: 10,
      paddingRight: 8,
    },
    achievementCard: {
      width: 132,
      minHeight: 168,
      alignItems: 'center',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#444' : '#E6E1DC',
      backgroundColor: isDark ? '#242424' : '#fff',
    },
    achievementIcon: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 32,
      backgroundColor: isDark ? '#504A46' : '#E8E1DB',
    },
    achievementStatus: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: isDark ? '#242424' : '#fff',
      borderRadius: 11,
    },
    earnedStatus: {
      backgroundColor: '#006A63',
    },
    lockedStatus: {
      backgroundColor: secondaryText,
    },
    achievementTitle: {
      marginTop: 10,
      color: theme.text,
      fontFamily: 'PPMoriBold',
      fontSize: 13,
      textAlign: 'center',
    },
    achievementProgress: {
      marginTop: 4,
      color: secondaryText,
      fontSize: 11,
      textAlign: 'center',
    },
    aboutSection: {
      gap: 8,
      marginTop: 12,
      padding: 5,
      borderRadius: 12,
    },
    sectionTitle: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 17,
    },
    aboutText: {
      color: '#000000',
      fontSize: 14,
      lineHeight: 21,
    },
    postsHeading: {
      marginTop: 10,
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 17,
    },
    emptyPosts: {
      paddingVertical: 20,
      color: secondaryText,
      textAlign: 'center',
    },
    postCard: {
      borderRadius: 12,
      backgroundColor: isDark ? '#242424' : '#201C18',
      borderWidth: 1,
      borderColor: isDark ? '#444' : '#e6e1dc',
      overflow: 'hidden',
    },
    postImage: {
      width: '100%',
      aspectRatio: 4 / 3,
    },
    postContent: {
      padding: 16,
    },
    postDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 10,
    },
    postAuthor: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    timestamp: {
      color: secondaryText,
      fontSize: 12,
    },
    postTitle: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 17,
    },
    postBody: {
      marginTop: 10,
      color: '#fff',
      fontSize: 15,
      lineHeight: 21,
    },
    commentCount: {
      marginTop: 14,
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    modalCard: {
      width: '100%',
      maxWidth: 480,
      padding: 18,
      gap: 12,
      borderRadius: 14,
      backgroundColor: isDark ? '#242424' : '#201C18',
    },
    modalTitle: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 19,
    },
    photoButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#006A63',
    },
    photoButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    input: {
      minHeight: 46,
      paddingHorizontal: 12,
      borderRadius: 8,
      color: '#000000',
      backgroundColor: theme.background,
      fontSize: 15,
    },
    aboutInput: {
      minHeight: 96,
      padding: 12,
      borderRadius: 8,
      color: '#000000',
      backgroundColor: theme.background,
      fontSize: 15,
    },
    placeholder: {
      color: secondaryText,
    },
    errorText: {
      color: '#ff8b79',
      fontSize: 13,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 4,
    },
    cancelButton: {
      minHeight: 42,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    cancelButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
    },
    saveButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#EC6425',
    },
    saveButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
    },
    disabledButton: {
      opacity: 0.45,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    deleteAccountSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#444' : '#E6E1DC',
      alignItems: 'center',
    },
    deleteButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#E74C3C',
    },
    deleteButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteModalContent: {
      backgroundColor: isDark ? '#242424' : '#201C18',
      borderRadius: 12,
      padding: 24,
      marginHorizontal: 24,
      minWidth: 280,
    },
    deleteModalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#fff',
      marginBottom: 12,
      fontFamily: 'PPMoriBold',
    },
    deleteModalMessage: {
      fontSize: 16,
      color: secondaryText,
      marginBottom: 20,
      lineHeight: 24,
    },
    deleteModalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    deleteModalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteCancelButton: {
      backgroundColor: '#888',
    },
    deleteCancelButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
      fontFamily: 'PPMoriBold',
    },
    deleteConfirmButton: {
      backgroundColor: '#E74C3C',
    },
    deleteConfirmButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
      fontFamily: 'PPMoriBold',
    },
  });
}

