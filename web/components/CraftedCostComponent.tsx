import { Block, BasicOrReinforcedBlocks, BlockNames } from '@/lib/blocks';
import { useReactorState } from '@/lib/useReactorState';
import Image from 'next/image';

export default function CraftedCostComponent({ reactorState }: { reactorState: ReturnType<typeof useReactorState> }) {
  return (
    <div>
      {[...reactorState.reactor.blockCounts]
        .sort((a, b) => b[1] - a[1])
        .filter(val => val[0] !== Block.Air && val[1] !== 0)
        .map(([block, count], index) => {
          const reactorIsLarge = reactorState.reactor.height > 3 || reactorState.reactor.width > 3 || reactorState.reactor.depth > 3;
          let prepend = '';
          const reactorIsReinforced = reactorIsLarge || reactorState.reactor.isActivelyCooled || reactorState.reinforcedPreferred;
          if (BasicOrReinforcedBlocks.has(block)) {
            if (reactorIsReinforced) {
              prepend = 'Reinforced ';
            } else {
              prepend = 'Basic ';
            }
          }

          return (
            <div key={block} className={`grid grid-cols-[1.5rem_1fr_auto] text-sm gap-2 p-1 rounded items-center ${index % 2 === 0 ? 'bg-neutral-800/75' : ''}`}>
              <div className="relative w-6 h-6 border border-white/75">
                <Image src={`/assets/blocks/${block}.png`} alt={block} sizes="100%" fill className="object-contain select-none pointer-events-none" style={{ imageRendering: 'pixelated' }} />
              </div>
              <p>{prepend + BlockNames.get(block)}</p>
              <p className="text-right">{count}</p>
            </div>
          );
        })}
    </div>
  );
}
