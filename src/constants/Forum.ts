export type ForumComment = {
  id: string;
  author: string;
  body: string;
  timestamp: string;
};

type ForumPostBase = {
  id: string;
  userId: string;
  title: string;
  body: string;
  author: string;
  timestamp: string;
  comments: ForumComment[];
};

export type ForumPost =
  | (ForumPostBase & { type: 'text' })
  | (ForumPostBase & { type: 'image'; imageUri: string | number });

export const POSTS: ForumPost[] = [
  {
    type: 'text',
    id: 'welcome',
    title: 'Welcome to the forum',
    body: 'Share updates, ask questions, and connect with your neighbors.',
    author: 'Urban Invaders',
    timestamp: 'MM/DD/YY',
    comments: [],
  },
  {
    type: 'text',
    id: 'post-1',
    title: 'Title here',
    body: 'Body of forum post here',
    author: 'Guest',
    timestamp: 'MM/DD/YY',
    comments: [],
  },
  {
  type: 'image',
  id: 'placeholder-image',
  title: 'Photo Post',
  body: 'Image Post',
  author: 'Urban Invaders',
  timestamp: 'MM/DD/YY',
  comments: [],
  imageUri: require('../app/assets/images/bg.png'),
}
];