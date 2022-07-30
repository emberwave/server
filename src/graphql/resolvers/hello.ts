import { db } from '../../index.js';

export const hello = {
  Query: {
    hello: async () => 'hello from graphql'
  },
  Mutation: {
    addHello: async () => {
      await db.collection('test').insertOne({
        hello: 'hello'
      });

      return true;
    }
  }
};
