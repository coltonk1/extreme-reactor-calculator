import { Block, BlockNames, NotPlaceableBlock } from '@/lib/blocks';
import React, { useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { moderators } from '@/lib/moderators';

export default function BlockPalette({ selectedBlock, setSelectedBlock }: { selectedBlock: Block; setSelectedBlock: React.Dispatch<React.SetStateAction<Block>> }) {
  const nextTitlePoints = [Block.ReactorControlRod, Block.Bronze, Block.RefinedObsidian];
  const sectionTitles = ['Vanilla', 'Extreme Reactors', 'General Metals', 'Other'];
  let titleIndex = 0;

  const [searchTerm, setSearchTerm] = useState('');
  const [recentlySelectedBlocks, setRecentlySelectedBlocks] = useState<Block[]>([Block.Air]);

  const titleClass = clsx('col-span-3 px-4 py-2 font-medium bg-neutral-800 text-neutral-400 rounded shadow-md h-fit');

  const allBlocks: Record<string, Block[]> = {};

  for (const block of Object.values(Block).filter(block => !NotPlaceableBlock.has(block))) {
    if (block === nextTitlePoints[titleIndex]) {
      titleIndex++;
    }

    const currentTitle = sectionTitles[titleIndex];
    if (!allBlocks[currentTitle]) {
      allBlocks[currentTitle] = [];
    }
    allBlocks[currentTitle].push(block as Block);
  }
  titleIndex = 0;

  const mod = moderators.get(selectedBlock);

  const moderatorData = mod ? { ...mod, moderation: 1 / mod.inverseModeration } : null;

  return (
    <div className=" bg-neutral-900 w-100 overflow-y-scroll border-r border-neutral-900">
      <div className="bg-neutral-900 bg-linear-to-b from-neutral-800 to-neutral-900 px-6 py-3 sticky top-0 z-20 flex flex-col gap-2 border-b border-neutral-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 shrink-0 border border-white/75">
            <Image
              src={`/assets/blocks/${selectedBlock}.png`}
              alt={selectedBlock}
              sizes="100%"
              fill
              className="object-contain select-none pointer-events-none"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <p className="text-lg font-semibold text-white">{BlockNames.get(selectedBlock)}</p>
        </div>
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <p className="text-neutral-400">Absorption</p>
          <p className="text-white text-right tabular-nums">{(moderatorData && moderatorData.absorption.toFixed(2)) || 'N/A'}</p>
          <p className="text-neutral-400">Heat Efficiency</p>
          <p className="text-white text-right tabular-nums">{(moderatorData && moderatorData.heatEfficiency.toFixed(2)) || 'N/A'}</p>
          <p className="text-neutral-400">Moderation</p>
          <p className="text-white text-right tabular-nums">{(moderatorData && moderatorData.moderation.toFixed(2)) || 'N/A'}</p>
          <p className="text-neutral-400">Heat Conductivity</p>
          <p className="text-white text-right tabular-nums">{(moderatorData && moderatorData.heatConductivity.toFixed(2)) || 'N/A'}</p>
        </div>
        <hr className="border-neutral-700/50 my-1"></hr>
        <input
          placeholder="Search..."
          className="w-full bg-neutral-800 focus:border-neutral-400 focus:bg-neutral-700 text-white p-2 rounded outline-none z-10 border border-neutral-600"
          onChange={e => setSearchTerm(e.target.value)}
        ></input>
        {recentlySelectedBlocks.length > 0 && (
          <div className="flex items-center gap-2 ">
            <div className="flex gap-2 py-1 w-full">
              {recentlySelectedBlocks.map(block => (
                <div
                  key={block}
                  title={BlockNames.get(block)}
                  className={clsx('relative w-8 h-8 cursor-pointer select-none border border-white/75', block === selectedBlock && 'ring-2 ring-blue-400')}
                  onClick={() => setSelectedBlock(block)}
                >
                  <Image src={`/assets/blocks/${block}.png`} alt={block} sizes="100%" fill className="object-contain select-none pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="h-full p-4">
        <div className="grid text-white/90 gap-2 grid-cols-3 pb-16">
          {Object.entries(allBlocks).map(([sectionTitle, blocks]) => (
            <React.Fragment key={sectionTitle}>
              <h2 className={titleClass}>{sectionTitle}</h2>
              {blocks.map(block =>
                !BlockNames.get(block)!.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                  ''
                ) : (
                  <div
                    key={block}
                    title={BlockNames.get(block)}
                    className={clsx(
                      'flex flex-col items-center gap-2 py-3 px-2 rounded cursor-pointer select-none transition-colors h-fit',
                      'bg-neutral-300/10 hover:bg-neutral-700',
                      block === selectedBlock && 'ring-2 ring-blue-400 bg-blue-500/10!',
                    )}
                    onClick={() => {
                      setSelectedBlock(block);
                      setRecentlySelectedBlocks(prev => [block, ...prev.filter(b => b !== block)].slice(0, 9));
                    }}
                  >
                    <div className="relative w-10 h-10 shrink-0 border border-white/75">
                      <Image src={`/assets/blocks/${block}.png`} alt={block} sizes="100%" fill className="object-contain select-none pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div className="w-full text-center">
                      <p className="truncate text-sm">{BlockNames.get(block)}</p>
                    </div>
                  </div>
                ),
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
