import { Block, BlockNames, NotPlaceableBlock } from '@/lib/blocks';
import React from 'react';
import Image from 'next/image';

export default function BlockPalette({ selectedBlock, setSelectedBlock }: { selectedBlock: Block; setSelectedBlock: React.Dispatch<React.SetStateAction<Block>> }) {
  const nextTitlePoints = [Block.ReactorControlRod, Block.Bronze, Block.RefinedObsidian];
  const sectionTitles = ['Vanilla', 'Extreme Reactors', 'General Metals', 'Other'];
  let titleIndex = 0;

  return (
    <div className="px-8 grid text-white/90 gap-2 grid-cols-2 overflow-y-scroll pb-16 bg-neutral-900 border-r border-black">
      <div className="col-span-2 px-4 py-2 font-semibold bg-neutral-300 text-neutral-900 rounded shadow-md mt-8">Vanilla</div>
      {Object.values(Block).map(block => {
        if (NotPlaceableBlock.has(block)) return;
        let newSection = null;
        if (block === nextTitlePoints[titleIndex]) {
          titleIndex++;
          newSection = <div className="col-span-2 px-4 py-2 font-semibold bg-neutral-300 text-neutral-900 rounded shadow-md mt-8">{sectionTitles[titleIndex]}</div>;
        }

        return (
          <React.Fragment key={block}>
            {newSection}
            <div title={BlockNames.get(block)} className={`${block === selectedBlock && 'bg-neutral-500 hover:bg-neutral-500'} flex items-center gap-2 bg-neutral-300/10 p-1.5 rounded-sm cursor-pointer select-none hover:bg-black/50`} onClick={() => setSelectedBlock(block)}>
              <div className="relative w-8 h-8 shrink-0 border border-white/75">
                <Image src={`/assets/blocks/${block}.png`} alt={block} sizes="100%" fill className="object-contain select-none pointer-events-none" style={{ imageRendering: 'pixelated' }} />
              </div>
              <div className="truncate">{BlockNames.get(block)}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
