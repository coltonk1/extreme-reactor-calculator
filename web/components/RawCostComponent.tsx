import { getCostOfBlock } from '@/lib/blockCosts';
import { Block, BlockNames } from '@/lib/blocks';
import { Material, MaterialNames } from '@/lib/materials';
import { Reactor } from '@/lib/reactor_simulation';
import clsx from 'clsx';
import { useState } from 'react';

export default function RawCostComponent({ reactor }: { reactor: Reactor }) {
  const [steelAvailable, setSteelAvailable] = useState(true);

  const costTotals: Partial<Record<Block | Material, number>> = {};

  const getResourceName = (resource: Block | Material): string => {
    return MaterialNames.get(resource as Material) ?? BlockNames.get(resource as Block) ?? resource;
  };

  [...reactor.getLayerBlockCounts()].forEach(([block, count]) => {
    if (block === Block.Air || count === 0) return;
    const reactorIsLarge = reactor.height > 3 || reactor.width > 3 || reactor.depth > 3;
    const reactorIsReinforced = reactorIsLarge || reactor.getActivelyCooled();

    const cost = getCostOfBlock(block, reactorIsReinforced, steelAvailable);

    const listOfCosts = Object.entries(cost) as [Material | Block, number][];

    listOfCosts.forEach(([material, qty]) => {
      costTotals[material] = (costTotals[material] ?? 0) + qty * count;
    });
  });

  const sortedCostTotals = (Object.entries(costTotals) as [Block | Material, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="flex items-center justify-between py-2 cursor-pointer" onClick={() => setSteelAvailable(v => !v)}>
        <div>
          <p className="text-sm">Steel Ingots</p>
          <p className="text-xs text-neutral-500">Modpack includes steel ingots</p>
        </div>

        <div className={clsx('relative w-10 h-5 rounded-full transition', steelAvailable ? 'bg-blue-500' : 'bg-neutral-600')}>
          <span className={clsx('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition', steelAvailable && 'translate-x-5')} />
        </div>
      </div>
      <div>
        {sortedCostTotals.map(([material, total], index) => (
          <div key={material} className={`grid grid-cols-2 text-sm p-1 rounded ${index % 2 == 0 ? 'bg-neutral-800/75' : ''}`}>
            <p>{getResourceName(material)}</p>
            <p className="text-right">{total}</p>
          </div>
        ))}
      </div>
    </>
  );
}
