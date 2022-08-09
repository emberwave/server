import { User } from '@prisma/client';
import { prisma } from '../../index.js';

export const user = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return await prisma.post.findUnique({ where: { id } });
    }
  },
  Mutation: {
    registerUser: async (_: any, { alias, email, password }: User) => {
      if (await prisma.user.findUnique({ where: { email } })) throw new Error('email already in use');

      function generateRandomNum(min: number, max: number, exclude: number[]) {
        let random;
        while (!random) {
          const x = Math.floor(Math.random() * (max - min + 1)) + min;
          if (exclude.indexOf(x) === -1) random = x;
        }
        return random;
      }

      const findIfTagExists = async () => {
        const tags = await prisma.usedTagNumbers.findUnique({
          where: {
            tag: alias
          }
        });
        if (tags?.tagNumber.length === 10) {
          return true;
        } else return false;
      };

      const createUser = async () => {
        if (await findIfTagExists()) {
          throw new Error('tag and tag number already in use');
        } else {
          let tags = await prisma.usedTagNumbers.findUnique({
            where: {
              tag: alias
            }
          });

          let randomTag: number;
          if (!tags) randomTag = generateRandomNum(1, 10, []);
          else randomTag = generateRandomNum(1, 10, tags!.tagNumber.map(Number));

          if (!tags) {
            await prisma.usedTagNumbers.create({
              data: {
                tag: alias,
                tagNumber: [randomTag.toString()]
              }
            });
          }

          const tagNumbersArray = tags?.tagNumber;
          tagNumbersArray?.push(randomTag.toString());
          const updatedUsedTagNumbers: string[] = tagNumbersArray!;

          await prisma.usedTagNumbers.update({
            where: {
              tag: alias
            },
            data: {
              tagNumber: updatedUsedTagNumbers
            }
          });

          await prisma.user.create({
            data: {
              tag: alias,
              tagNumber: randomTag.toString(),
              email,
              password, // TODO: add bcrypt later
              alias,
              bio: '',
              createdAt: new Date()
            }
          });

          return 'success';
        }
      };

      return await createUser();
    }
  }
};
