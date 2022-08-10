import { Post } from '@prisma/client';
import { prisma } from '../../index.js';

export const post = {
  Query: {
    post: async (_: any, { id }: { id: string }) => {
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) throw new Error('post not found');
      const postAuthor = await prisma.user.findUnique({ where: { id: post.authorId } });
      const authorPosts = await prisma.post.findMany({ where: { authorId: post.authorId } });

      return {
        ...post,
        author: {
          id: postAuthor,
          tag: postAuthor!.tag,
          tagNumber: postAuthor!.tagNumber,
          alias: postAuthor!.alias,
          bio: postAuthor!.bio,
          posts: authorPosts,
          createdAt: postAuthor!.createdAt
        }
      };
    },
    posts: async (_: any, { newest }: { newest: boolean }) => {
      let posts: Post[];
      if (newest) {
        posts = await prisma.post.findMany({
          orderBy: { id: 'desc' }
        });
      } else posts = await prisma.post.findMany({});

      const postsWithAuthors = posts.map(async (post: Post) => {
        const author = await prisma.user.findUnique({ where: { id: post.authorId } });
        return {
          ...post,
          author: {
            id: post.authorId,
            tag: author!.tag,
            tagNumber: author!.tagNumber,
            alias: author!.alias,
            bio: author!.bio,
            createdAt: author!.createdAt
          }
        };
      });

      return postsWithAuthors;
    }
  },
  Mutation: {
    createPost: async (_: any, { authorId, title, content = '', tags = [] }: Post) => {
      if (title.length === 0) throw new Error('title must be over 0 characters');

      tags.length = 5; // limit to 5 tags

      await prisma.post.create({
        data: {
          authorId,
          title,
          content,
          tags,
          upvotes: 0,
          downvotes: 0,
          supervotes: 0,
          createdAt: new Date()
        }
      });

      return 'success';
    }
  }
};
