import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/Colors';
import type { ForumPost } from '../constants/Forum';
import { useAppData } from '../components/AppDataContext';
import { useLanguage } from '../components/LanguageContext';

export default function Home() {
  const { posts, createPost, createComment, deletePost, userId, dataError, dataReady } = useAppData();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image'>('text');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [imagePickerError, setImagePickerError] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme === 'dark');
  const { t } = useLanguage();
  const canPost =
    title.trim().length > 0 &&
    (postType === 'text'
      ? body.trim().length > 0
      : selectedImageUri !== null);

  const submitPost = async () => {
    if (!canPost || isSubmitting) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      await createPost(title.trim(), body.trim(), postType === 'image' ? selectedImageUri : null);
      setTitle('');
      setBody('');
      setSelectedImageUri(null);
      setImagePickerError(null);
      setPostType('text');
      setIsComposerOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to create post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    setImagePickerError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      setImagePickerError(
        error instanceof Error ? error.message : 'Unable to open the photo library.',
      );
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedPostId((currentPostId) =>
      currentPostId === postId ? null : postId,
    );
    setOpenMenuPostId(null);
    setCommentDraft('');
  };

  const submitComment = async (postId: string) => {
    const commentBody = commentDraft.trim();
    if (!commentBody || isSubmitting) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      await createComment(postId, commentBody);
      setCommentDraft('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to add comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      await deletePost(postId);
      setPostToDelete(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsComposerOpen((open) => !open)}
          style={({ pressed }) => [
            styles.newPostButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.newPostButtonText}>
            {isComposerOpen ? t('button.cancel').toUpperCase() : (t('common.new_post').toUpperCase() + " " + " " + " " + "+")}
          </Text>
        </Pressable>
      </View>
      {!!(actionError || dataError) && <Text accessibilityRole="alert" style={styles.errorText}>{actionError || dataError}</Text>}

      {isComposerOpen && (
        <View style={styles.composer}>
          <View style={styles.postTypeSelector}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPostType('text')}
              style={[
                styles.postTypeButton,
                postType === 'text' && styles.selectedPostTypeButton,
              ]}
            >
              <Text
                style={[
                  styles.postTypeButtonText,
                  postType === 'text' && styles.selectedPostTypeButtonText,
                ]}
              >
                {t('common.text_post').toUpperCase()}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPostType('image')}
              style={[
                styles.postTypeButton,
                postType === 'image' && styles.selectedPostTypeButton,
              ]}
            >
              <Text
                style={[
                  styles.postTypeButtonText,
                  postType === 'image' && styles.selectedPostTypeButtonText,
                ]}
              >
                {t('common.image_post').toUpperCase()}
              </Text>
            </Pressable>
          </View>
          <TextInput
            accessibilityLabel="Post title"
            onChangeText={setTitle}
            placeholder="Post title"
            placeholderTextColor={styles.placeholder.color}
            style={styles.titleInput}
            value={title}
          />
          {postType === 'text' ? (
            <TextInput
              accessibilityLabel="Post text"
              multiline
              onChangeText={setBody}
              placeholder="What would you like to share?"
              placeholderTextColor={styles.placeholder.color}
              style={styles.bodyInput}
              textAlignVertical="top"
              value={body}
            />
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={pickImage}
                style={styles.pickImageButton}
              >
                <Text style={styles.pickImageButtonText}>
                  {selectedImageUri ? t('common.change_image').toUpperCase() : t('common.choose_image').toUpperCase()}
                </Text>
              </Pressable>
              {selectedImageUri && (
                <Image
                  source={{ uri: selectedImageUri }}
                  contentFit="cover"
                  style={styles.imagePreview}
                />
              )}
              <TextInput
                accessibilityLabel="Image post caption"
                multiline
                onChangeText={setBody}
                placeholder="Caption (optional)"
                placeholderTextColor={styles.placeholder.color}
                style={styles.bodyInput}
                textAlignVertical="top"
                value={body}
              />
              {imagePickerError && (
                <Text style={styles.errorText}>{imagePickerError}</Text>
              )}
            </>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={!dataReady || !canPost || isSubmitting}
            onPress={submitPost}
            style={({ pressed }) => [
              styles.submitButton,
              !canPost && styles.disabledButton,
              pressed && canPost && styles.buttonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>{t('button.submit').toUpperCase()}</Text>
          </Pressable>
        </View>
      )}

      <FlatList<ForumPost>
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.postList}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            {item.type === 'image' && (
              <Image
                source={
                  typeof item.imageUri === 'string'
                    ? { uri: item.imageUri }
                    : item.imageUri
                }
                contentFit="cover"
                style={styles.postImage}
              />
            )}
            <View style={styles.postContent}>
              {item.type === 'image' ? (
                <>
                  <Text style={styles.postTitle}>{item.title}</Text>
                  <View style={styles.postDetails}>
                    <View style={styles.authorInfo}>
                      <View style={styles.authorIcon} />
                      <Text style={styles.authorName}>{item.author}</Text>
                    </View>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.postDetails}>
                    <View style={styles.authorInfo}>
                      <View style={styles.authorIcon} />
                      <Text style={styles.authorName}>{item.author}</Text>
                    </View>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                  </View>
                  <Text style={styles.postTitle}>{item.title}</Text>
                </>
              )}
              {item.body.length > 0 && (
                <Text style={styles.postBody}>{item.body}</Text>
              )}
              <View style={styles.postActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleComments(item.id)}
                  style={styles.commentToggle}
                >
                  <Text style={styles.commentToggleText}>
                    {expandedPostId === item.id
                      ? t('common.hide_comments').toUpperCase()
                      : `${t('common.comments').toUpperCase()} (${item.comments.length})`}
                  </Text>
                </Pressable>
                {userId === item.userId && (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    onPress={() => setOpenMenuPostId(openMenuPostId === item.id ? null : item.id)}
                    style={({ pressed }) => [
                      styles.menuButton,
                      pressed && styles.menuButtonPressed,
                    ]}
                  >
                    <Text style={styles.menuButtonText}>⋮</Text>
                  </Pressable>
                )}
              </View>

              {openMenuPostId === item.id && userId === item.userId && (
                <View style={styles.postMenu}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    onPress={() => {
                      setPostToDelete(item.id);
                      setOpenMenuPostId(null);
                    }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    <View style={styles.menuItemIconContainer}>
                      <SymbolView
                        name={{ android: 'delete', web: 'delete' }}
                        size={18}
                        tintColor="#ff3c3c"
                        style={{ width: 18, height: 18 }}
                      />
                    </View>
                    <Text style={styles.menuItemText}>{t('forum.delete_post')}</Text>
                  </Pressable>
                </View>
              )}

              {expandedPostId === item.id && (
                <View style={styles.commentsSection}>
                  {item.comments.length === 0 ? (
                    <Text style={styles.noComments}>{t('common.no_comments')}</Text>
                  ) : (
                    item.comments.map((comment) => (
                      <View key={comment.id} style={styles.comment}>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <Text style={styles.commentBody}>{comment.body}</Text>
                        <Text style={styles.commentTimestamp}>
                          {comment.timestamp}
                        </Text>
                      </View>
                    ))
                  )}
                  <View style={styles.commentComposer}>
                    <TextInput
                      accessibilityLabel="Write a comment"
                      onChangeText={setCommentDraft}
                      placeholder="Write a comment..."
                      placeholderTextColor={styles.placeholder.color}
                      style={styles.commentInput}
                      value={commentDraft}
                    />
                    <Pressable
                      accessibilityRole="button"
                      disabled={!dataReady || !commentDraft.trim() || isSubmitting}
                      onPress={() => submitComment(item.id)}
                      style={({ pressed }) => [
                        styles.sendCommentButton,
                        !commentDraft.trim() && styles.disabledButton,
                        pressed && commentDraft.trim() && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.sendCommentText}>{t('button.submit').toUpperCase()}</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      />
      <Modal
        visible={postToDelete !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPostToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('forum.delete_post')}</Text>
            <Text style={styles.modalMessage}>{t('forum.delete_confirmation')}</Text>
            <View style={styles.modalButtons}>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => setPostToDelete(null)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>{t('button.cancel').toUpperCase()}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => postToDelete && handleDeletePost(postToDelete)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.confirmButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.confirmButtonText}>{t('button.confirm_delete').toUpperCase()}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(theme: typeof Colors.light, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    heading: {
      color: theme.text,
      fontFamily: 'PPMoriBold',
      fontSize: 20,
    },
    newPostButton: {
      minHeight: 40,
      width: 390,
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: '#006A63',
    },
    newPostButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 15,
    },
    composer: {
      gap: 10,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 14,
      borderRadius: 12,
      backgroundColor: isDark ? '#242424' : '#fff',
      borderWidth: 1,
      borderColor: '#EC6425',
    },
    postTypeSelector: {
      flexDirection: 'row',
      gap: 8,
    },
    postTypeButton: {
      flex: 1,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#006A63',
    },
    selectedPostTypeButton: {
      backgroundColor: '#006A63',
    },
    postTypeButtonText: {
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    selectedPostTypeButtonText: {
      color: '#fff',
    },
    titleInput: {
      minHeight: 44,
      paddingHorizontal: 10,
      borderRadius: 6,
      color: theme.text,
      backgroundColor: theme.background,
    },
    bodyInput: {
      minHeight: 90,
      padding: 10,
      borderRadius: 6,
      color: theme.text,
      backgroundColor: theme.background,
    },
    placeholder: {
      color: isDark ? '#aaa' : '#777',
    },
    submitButton: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end',
      paddingHorizontal: 18,
      borderRadius: 8,
      backgroundColor: '#006A63',
    },
    submitButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
    },
    disabledButton: {
      opacity: 0.45,
    },
    pickImageButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      backgroundColor: '#201C18',
    },
    pickImageButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    imagePreview: {
      width: '100%',
      height: 190,
      borderRadius: 8,
    },
    errorText: {
      color: '#b00020',
      fontSize: 13,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    postList: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      gap: 12,
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
    postTitle: {
      color: 'white',
      fontFamily: 'PPMoriBold',
      fontSize: 17,
    },
    postBody: {
      marginTop: 10,
      color: 'white',
      fontSize: 15,
      lineHeight: 21,
    },
    postDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 10,
      paddingTop: 10,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    authorIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: '#EC6425',
    },
    authorName: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    timestamp: {
      color: isDark ? '#bbb' : '#777',
      fontSize: 12,
      textAlign: 'right',
    },
    commentToggle: {
      alignSelf: 'flex-start',
      marginTop: 12,
      paddingVertical: 4,
    },
    commentToggleText: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    commentsSection: {
      gap: 12,
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? '#555' : '#ddd',
    },
    noComments: {
      color: isDark ? '#bbb' : '#777',
      fontSize: 13,
    },
    comment: {
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: '#EC6425',
    },
    commentAuthor: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    commentBody: {
      marginTop: 4,
      color: 'white',
      fontSize: 14,
      lineHeight: 20,
    },
    commentTimestamp: {
      marginTop: 4,
      color: isDark ? '#aaa' : '#777',
      fontSize: 11,
    },
    commentComposer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    commentInput: {
      flex: 1,
      minHeight: 40,
      paddingHorizontal: 10,
      borderRadius: 6,
      color: theme.text,
      backgroundColor: theme.background,
    },
    sendCommentButton: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#006A63',
    },
    sendCommentText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    postActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuButton: {
      padding: 8,
      marginRight: -8,
    },
    menuButtonPressed: {
      opacity: 0.6,
    },
    menuButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#EC6425',
      lineHeight: 24,
    },
    menuButtonIconContainer: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    postMenu: {
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: isDark ? '#333' : '#f5f5f5',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#444' : '#e0e0e0',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      gap: 12,
    },
    menuItemPressed: {
      opacity: 0.7,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 6,
    },
    menuItemIconContainer: {
      width: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuItemIcon: {
      width: 18,
      height: 18,
    },
    menuItemText: {
      color: '#ff3c3c',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    deleteButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: 'rgba(255, 60, 60, 0.1)',
    },
    deleteButtonPressed: {
      opacity: 0.7,
    },
    deleteButtonText: {
      color: '#ff3c3c',
      fontFamily: 'PPMoriBold',
      fontSize: 11,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 24,
      marginHorizontal: 20,
      minWidth: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'PPMoriBold',
      color: theme.text,
      marginBottom: 12,
    },
    modalMessage: {
      fontSize: 14,
      color: isDark ? '#bbb' : '#666',
      lineHeight: 20,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: isDark ? '#444' : 'white',
    },
    cancelButtonText: {
      fontFamily: 'PPMoriBold',
      fontSize: 12,
      color: isDark ? 'white' : '#333',
    },
    confirmButton: {
      backgroundColor: '#ff3c3c',
    },
    confirmButtonText: {
      fontFamily: 'PPMoriBold',
      fontSize: 12,
      color: '#fff',
    },
  });
}
