import { prisma } from '../../index.js';

export const hello = {
  Query: {
    hello: async () => 'hello from graphql'
  },
  Mutation: {
    addHello: async () => {
      await prisma.hello.create({ data: { content: 'hello' } });

      return true;
    }
  }
};
