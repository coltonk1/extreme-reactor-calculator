import { describe, it, expect } from 'vitest';
import { Block, BlockNames, NotPlaceableBlocks } from './blocks';
import { moderators } from './moderators';
import path from 'path';
import fs from 'node:fs';

describe('BlockNames', () => {
  it('every block has a name', () => {
    const blocksWithoutNames = Object.values(Block).filter(block => !BlockNames.has(block));

    expect(blocksWithoutNames).toEqual([]);
  });
});

describe('Moderators', () => {
  it('every placeable block except reactor control rod has moderator data', () => {
    const blocksWithoutModeratorData = Object.values(Block).filter(block => !NotPlaceableBlocks.has(block) && block !== Block.ReactorControlRod && !moderators.has(block));

    expect(blocksWithoutModeratorData, `Placeable blocks missing moderator data:\n${blocksWithoutModeratorData.join('\n')}`).toEqual([]);
  });
});

describe('BlockImages', () => {
  it('every placeable block has an image', () => {
    const blocksWithoutImages = Object.values(Block).filter(block => {
      if (NotPlaceableBlocks.has(block)) return false;

      const imagePath = path.join(process.cwd(), 'public', 'assets', 'blocks', `${block}.png`);

      return !fs.existsSync(imagePath);
    });

    expect(blocksWithoutImages, `Placeable blocks missing images:\n${blocksWithoutImages.join('\n')}`).toEqual([]);
  });
});
