import { Post } from '@prisma/client';
import { prisma } from '../../index.js';

export const post = {
  Query: {
    post: async (_: any, { id }: { id: string }) => {
      return await prisma.post.findUnique({ where: { id } });
    },
    posts: async (_: any, { newest }: { newest: boolean }) => {
      if (newest)
        return await prisma.post.findMany({
          orderBy: { id: 'desc' }
        });
      else return await prisma.post.findMany({});
    }
  },
  Mutation: {
    createPost: async (_: any, { title, content = '', tags = [] }: Post) => {
      if (title.length === 0) throw new Error('title must be over 0 characters');

      tags.length = 5; // limit to 5 tags

      await prisma.post.create({
        data: {
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
