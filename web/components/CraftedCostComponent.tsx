import { Block, BasicOrReinforcedBlocks, BlockNames } from '@/lib/blocks';
import { Reactor } from '@/lib/reactor_simulation';
import Image from 'next/image';

export default function CraftedCostComponent({ reactor }: { reactor: Reactor }) {
  return (
    <div>
      {[...reactor.getLayerBlockCounts()]
        .sort((a, b) => b[1] - a[1])
        .filter(val => val[0] !== Block.Air && val[1] !== 0)
        .map(([block, count], index) => {
          const reactorIsLarge = reactor.height > 3 || reactor.width > 3 || reactor.depth > 3;
          let prepend = '';
          const reactorIsReinforced = reactorIsLarge || reactor.getActivelyCooled();
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
